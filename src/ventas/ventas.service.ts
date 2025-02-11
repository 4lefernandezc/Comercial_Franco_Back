import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { DetalleVenta } from './entities/detalle_venta.entity';
import { InventarioSucursal } from '../inventarios_sucursales/entities/inventario_sucursal.entity';
import { QueryVentaDto } from './dto/query-venta.dto';
import { Caja } from 'src/cajas/entities/caja.entity';

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Venta)
    private readonly ventasRepository: Repository<Venta>,
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
  ) {}

  async crearVenta(createVentaDto: CreateVentaDto): Promise<Venta> {
    const { idSucursal } = createVentaDto;
    const cajaActual = await this.cajaRepository.findOne({
      where: {
        sucursal: { id: idSucursal },
        estado: 'abierta',
      },
    });

    if (!cajaActual) {
      throw new BadRequestException(
        'No hay una caja abierta para realizar ventas',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        detalles,
        idSucursal,
        idCliente,
        idUsuario,
        tipoDocumento,
        montoPagado,
      } = createVentaDto;
      let subtotalVenta = 0;

      for (const detalle of detalles) {
        const inventario = await queryRunner.manager.findOne(
          InventarioSucursal,
          {
            where: {
              idProducto: detalle.idProducto,
              idSucursal: idSucursal,
            },
            relations: ['producto'],
          },
        );

        if (!inventario) {
          throw new BadRequestException(
            `No se encontró inventario para el producto ${detalle.idProducto} en la sucursal ${idSucursal}`,
          );
        }

        if (
          !inventario.seVendeFraccion &&
          !Number.isInteger(detalle.cantidad)
        ) {
          throw new BadRequestException(
            `El producto ${inventario.producto.nombre} no permite ventas fraccionadas`,
          );
        }

        if (inventario.stockActual < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${inventario.producto.nombre}. Stock actual: ${inventario.stockActual}`,
          );
        }

        if (inventario.stockMinimo !== null) {
          const nuevoStock = inventario.stockActual - detalle.cantidad;
          if (nuevoStock < inventario.stockMinimo) {
            throw new BadRequestException(
              `La venta reduce el stock por debajo del mínimo permitido para el producto ${inventario.producto.nombre}. ` +
                `Stock actual: ${inventario.stockActual}, Stock mínimo: ${inventario.stockMinimo}, ` +
                `Cantidad a vender: ${detalle.cantidad}`,
            );
          }
        }

        const detallesConPrecios = await Promise.all(
          detalles.map(async (detalle) => {
            const inventario = await queryRunner.manager.findOne(
              InventarioSucursal,
              {
                where: {
                  idProducto: detalle.idProducto,
                  idSucursal: idSucursal,
                },
                relations: ['producto'],
              },
            );

            const nuevoStock = Number(
              (inventario.stockActual - detalle.cantidad).toFixed(3),
            );

            await queryRunner.manager.update(
              InventarioSucursal,
              { id: inventario.id },
              { stockActual: nuevoStock },
            );

            const precioUnitario = inventario.producto.precioVenta;
            const subtotalDetalle =
              precioUnitario * detalle.cantidad - (detalle.descuento || 0);
            subtotalVenta += subtotalDetalle;

            return {
              ...detalle,
              precio_unitario: precioUnitario,
              subtotal: subtotalDetalle,
            };
          }),
        );

        if (montoPagado < subtotalVenta) {
          throw new BadRequestException(
            `El monto pagado (${montoPagado}) no cubre el total de la venta (${subtotalVenta})`,
          );
        }

        const cambio = montoPagado - subtotalVenta;
        const numeroDocumento =
          await this.generarNumeroDocumento(tipoDocumento);

        const venta = queryRunner.manager.create(Venta, {
          numeroDocumento: numeroDocumento,
          subtotal: subtotalVenta,
          totalVenta: subtotalVenta,
          metodoPago: createVentaDto.metodoPago,
          estado: 'completada',
          caja: cajaActual,
          montoPagado: montoPagado,
          cambio: cambio,
          cliente: idCliente ? { id: idCliente } : null,
          usuario: { id: idUsuario },
          sucursal: { id: idSucursal },
        });

        const ventaGuardada = await queryRunner.manager.save(venta);

        const detallesVenta = detallesConPrecios.map((detalle) =>
          queryRunner.manager.create(DetalleVenta, {
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precio_unitario,
            descuento: detalle.descuento || 0,
            subtotal: detalle.subtotal,
            producto: { id: detalle.idProducto },
            venta: ventaGuardada,
          }),
        );

        await queryRunner.manager.save(detallesVenta);

        await queryRunner.commitTransaction();

        return this.obtenerVentaPorId(ventaGuardada.id);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en la creación de venta:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generarNumeroDocumento(tipo: string): Promise<string> {
    const ultimaVenta = await this.ventasRepository.findOne({
      where: {
        numeroDocumento: Like(`${tipo}-%`),
      },
      order: {
        id: 'DESC',
      },
    });

    if (!ultimaVenta) {
      return `${tipo}-1`;
    }

    const ultimoNumero = parseInt(ultimaVenta.numeroDocumento.split('-')[1]);
    return `${tipo}-${ultimoNumero + 1}`;
  }

  async obtenerVentaPorId(id: number): Promise<Venta> {
    const venta = await this.ventasRepository.findOne({
      where: { id },
      relations: {
        detalles: {
          producto: true,
        },
        cliente: true,
        usuario: true,
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async obtenerVentas(q: QueryVentaDto) {
    const {
      page,
      limit,
      numeroDocumento,
      metodoPago,
      totalVenta,
      estado,
      sidx,
      sord,
    } = q;
    const query = this.ventasRepository
      .createQueryBuilder('ventas')
      .select([
        'ventas.id',
        'ventas.numeroDocumento',
        'ventas.subtotal',
        'ventas.totalVenta',
        'ventas.metodoPago',
        'ventas.estado',
        'ventas.fechaCreacion',
        'ventas.fechaModificacion',
        'ventas.fechaAnulacion',
      ])
      .leftJoinAndSelect('ventas.cliente', 'cliente')
      .leftJoinAndSelect('ventas.usuario', 'usuario')
      .leftJoinAndSelect('ventas.sucursal', 'sucursal')
      .leftJoinAndSelect('ventas.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto');

    if (numeroDocumento) {
      query.andWhere('ventas.numeroDocumento ILIKE :numeroDocumento', {
        numeroDocumento: `%${numeroDocumento}%`,
      });
    }

    if (metodoPago) {
      query.andWhere('ventas.metodoPago ILIKE :metodoPago', {
        metodoPago: `%${metodoPago}%`,
      });
    }

    if (totalVenta) {
      query.andWhere('ventas.totalVenta = :totalVenta', {
        totalVenta,
      });
    }

    if (estado) {
      query.andWhere('ventas.estado ILIKE :estado', {
        estado: `%${estado}%`,
      });
    }

    if (sidx) {
      query.orderBy(`ventas.${sidx}`, sord);
    }

    const [result, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: result,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async anularVenta(id: number): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await queryRunner.manager.findOne(Venta, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }

      if (venta.estado === 'anulada') {
        throw new BadRequestException('Esta venta ya está anulada');
      }

      const ventaConDetalles = await queryRunner.manager
        .createQueryBuilder(Venta, 'venta')
        .leftJoinAndSelect('venta.detalles', 'detalles')
        .innerJoinAndSelect('detalles.producto', 'producto')
        .innerJoinAndSelect('venta.sucursal', 'sucursal')
        .where('venta.id = :id', { id })
        .getOne();

      if (!ventaConDetalles) {
        throw new NotFoundException(
          `No se encontraron los detalles de la venta ${id}`,
        );
      }

      for (const detalle of ventaConDetalles.detalles) {
        const inventario = await queryRunner.manager.findOne(
          InventarioSucursal,
          {
            where: {
              idProducto: detalle.producto.id,
              idSucursal: ventaConDetalles.sucursal.id,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!inventario) {
          throw new NotFoundException(
            `No se encontró el inventario para el producto ${detalle.producto.id} en la sucursal ${ventaConDetalles.sucursal.id}`,
          );
        }

        const nuevoStock = Number(
          (inventario.stockActual + detalle.cantidad).toFixed(3),
        );
        await queryRunner.manager.update(
          InventarioSucursal,
          { id: inventario.id },
          {
            stockActual: nuevoStock,
            fechaModificacion: new Date(),
          },
        );
      }

      venta.estado = 'anulada';
      venta.fechaAnulacion = new Date();
      await queryRunner.manager.save(Venta, venta);

      await queryRunner.commitTransaction();

      return this.obtenerVentaPorId(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al procesar la anulación de la venta',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
