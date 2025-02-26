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
    console.log('Iniciando creación de venta con DTO:', createVentaDto);
    const { idSucursal } = createVentaDto;
    const cajaActual = await this.cajaRepository.findOne({
      where: {
        sucursal: { id: idSucursal },
        estado: 'abierta',
      },
    });

    if (!cajaActual) {
      console.error('No hay una caja abierta para realizar ventas');
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
        nombre,
        documento,
        tipoDocumento,
        montoPagado,
      } = createVentaDto;
      let subtotalVenta = 0;

      for (const detalle of detalles) {
        console.log('Procesando detalle de venta:', detalle);
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
          console.error(
            `No se encontró inventario para el producto ${detalle.idProducto} en la sucursal ${idSucursal}`,
          );
          throw new BadRequestException(
            `No se encontró inventario para el producto ${detalle.idProducto} en la sucursal ${idSucursal}`,
          );
        }

        if (
          !inventario.seVendeFraccion &&
          !Number.isInteger(detalle.cantidad)
        ) {
          console.error(
            `El producto ${inventario.producto.nombre} no permite ventas fraccionadas`,
          );
          throw new BadRequestException(
            `El producto ${inventario.producto.nombre} no permite ventas fraccionadas`,
          );
        }

        if (inventario.stockActual < detalle.cantidad) {
          console.error(
            `Stock insuficiente para el producto ${inventario.producto.nombre}. Stock actual: ${inventario.stockActual}`,
          );
          throw new BadRequestException(
            `Stock insuficiente para el producto ${inventario.producto.nombre}. Stock actual: ${inventario.stockActual}`,
          );
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
              (inventario.stockActual - detalle.cantidad).toFixed(2),
            );

            await queryRunner.manager.update(
              InventarioSucursal,
              { id: inventario.id },
              { stockActual: nuevoStock },
            );

            let subtotalDetalle = 0;

            if (
              inventario.producto.precioAgranel &&
              inventario.producto.totalPresentacion
            ) {
              const wholeUnits = Math.floor(detalle.cantidad);
              const fraction = detalle.cantidad - wholeUnits;

              const wholeUnitsPrice =
          wholeUnits * inventario.producto.precioVenta;
              console.log(`Precio por unidades enteras (${wholeUnits}): ${wholeUnitsPrice}`);

              const bulkQuantity =
          fraction * inventario.producto.totalPresentacion;
              const fractionPrice =
          bulkQuantity * inventario.producto.precioAgranel;
              console.log(`Precio por fracción (${bulkQuantity}): ${fractionPrice}`);

              subtotalDetalle = wholeUnitsPrice + fractionPrice;
            } else {
              subtotalDetalle =
          inventario.producto.precioVenta * detalle.cantidad;
            }

            subtotalDetalle -= detalle.descuento || 0;
            subtotalVenta += subtotalDetalle;

            return {
              ...detalle,
              precio_unitario: inventario.producto.precioVenta,
              subtotal: subtotalDetalle,
            };
          }),
        );

        if (montoPagado < subtotalVenta) {
          console.error(
            `El monto pagado (${montoPagado}) no cubre el total de la venta (${subtotalVenta})`,
          );
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
          nombre: createVentaDto.nombre,
          documento: createVentaDto.documento,
          cliente: idCliente ? { id: idCliente } : null,
          usuario: { id: idUsuario },
          sucursal: { id: idSucursal },
        });

        const ventaGuardada = await queryRunner.manager.save(venta);
        console.log('Venta guardada:', ventaGuardada);

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
        console.log('Detalles de venta guardados:', detallesVenta);

        await queryRunner.commitTransaction();
        console.log('Transacción de venta completada');

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
        'ventas.montoPagado',
        'ventas.cambio',
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

    const parsedResult = result.map((venta) => this.parseFloatVenta(venta));

    return {
      data: parsedResult,
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
          (inventario.stockActual + detalle.cantidad).toFixed(2),
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

  private parseFloatDetalleVenta(detalle: DetalleVenta): DetalleVenta {
    return {
      ...detalle,
      cantidad: detalle.cantidad
        ? parseFloat(detalle.cantidad.toString())
        : null,
      precioUnitario: detalle.precioUnitario
        ? parseFloat(detalle.precioUnitario.toString())
        : null,
      descuento: detalle.descuento
        ? parseFloat(detalle.descuento.toString())
        : null,
      subtotal: detalle.subtotal
        ? parseFloat(detalle.subtotal.toString())
        : null,
    };
  }

  private parseFloatVenta(venta: Venta): Venta {
    const parsedVenta = {
      ...venta,
      subtotal: venta.subtotal ? parseFloat(venta.subtotal.toString()) : null,
      totalVenta: venta.totalVenta
        ? parseFloat(venta.totalVenta.toString())
        : null,
      montoPagado: venta.montoPagado
        ? parseFloat(venta.montoPagado.toString())
        : null,
      cambio: venta.cambio ? parseFloat(venta.cambio.toString()) : null,
    };

    if (venta.detalles && Array.isArray(venta.detalles)) {
      parsedVenta.detalles = venta.detalles.map((detalle) =>
        this.parseFloatDetalleVenta(detalle),
      );
    }

    return parsedVenta;
  }
}
