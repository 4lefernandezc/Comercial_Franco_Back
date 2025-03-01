import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { DetalleCotizacion } from './entities/detalle_cotizacion.entity';
import { InventarioSucursal } from '../inventarios_sucursales/entities/inventario_sucursal.entity';
import { QueryCotizacionDto } from './dto/query-cotizacion.dto';
import { Caja } from 'src/cajas/entities/caja.entity';

@Injectable()
export class CotizacionesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cotizacion)
    private readonly cotizacionesRepository: Repository<Cotizacion>,
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
  ) {}

  async crearCotizacion(createCotizacionDto: CreateCotizacionDto): Promise<Cotizacion> {
    console.log('Iniciando creación de cotización con DTO:', createCotizacionDto);
    const { idSucursal } = createCotizacionDto;

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
      } = createCotizacionDto;
      
      let subtotalCotizacion = 0;

      // Verificar disponibilidad de productos y calcular precios
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

          // Verificar stock disponible (solo para informar, no afecta la creación de la cotización)
          if (inventario.stockActual < detalle.cantidad) {
            console.warn(
              `Stock insuficiente para el producto ${inventario.producto.nombre}. Stock actual: ${inventario.stockActual}`,
            );
            // No lanzamos excepción porque es una cotización
          }

          let subtotalDetalle = 0;

          // Cálculo del precio similar a ventas
          if (
            inventario.producto.precioAgranel &&
            inventario.producto.totalPresentacion
          ) {
            const wholeUnits = Math.floor(detalle.cantidad);
            const fraction = detalle.cantidad - wholeUnits;

            const wholeUnitsPrice = wholeUnits * inventario.producto.precioVenta;
            console.log(`Precio por unidades enteras (${wholeUnits}): ${wholeUnitsPrice}`);

            const bulkQuantity = fraction * inventario.producto.totalPresentacion;
            const fractionPrice = bulkQuantity * inventario.producto.precioAgranel;
            console.log(`Precio por fracción (${bulkQuantity}): ${fractionPrice}`);

            subtotalDetalle = wholeUnitsPrice + fractionPrice;
          } else {
            subtotalDetalle = inventario.producto.precioVenta * detalle.cantidad;
          }

          subtotalDetalle -= detalle.descuento || 0;
          subtotalCotizacion += subtotalDetalle;

          return {
            ...detalle,
            precio_unitario: inventario.producto.precioVenta,
            subtotal: subtotalDetalle,
          };
        }),
      );

      // Generar número de documento
      const numeroDocumento = await this.generarNumeroDocumento(tipoDocumento);

      // Crear la cotización
      const cotizacion = queryRunner.manager.create(Cotizacion, {
        numeroDocumento: numeroDocumento,
        subtotal: subtotalCotizacion,
        totalVenta: subtotalCotizacion,
        metodoPago: createCotizacionDto.metodoPago,
        estado: 'completada',
        nombre: createCotizacionDto.nombre,
        documento: createCotizacionDto.documento,
        cliente: idCliente ? { id: idCliente } : null,
        usuario: { id: idUsuario },
        sucursal: { id: idSucursal },
      });

      const cotizacionGuardada = await queryRunner.manager.save(cotizacion);
      console.log('Cotización guardada:', cotizacionGuardada);

      // Guardar detalles de la cotización
      const detallesCotizacion = detallesConPrecios.map((detalle) =>
        queryRunner.manager.create(DetalleCotizacion, {
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precio_unitario,
          descuento: detalle.descuento || 0,
          subtotal: detalle.subtotal,
          producto: { id: detalle.idProducto },
          cotizacion: cotizacionGuardada,
        }),
      );

      await queryRunner.manager.save(detallesCotizacion);
      console.log('Detalles de cotización guardados:', detallesCotizacion);

      await queryRunner.commitTransaction();
      console.log('Transacción de cotización completada');

      return this.obtenerCotizacionPorId(cotizacionGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en la creación de cotización:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generarNumeroDocumento(tipo: string): Promise<string> {
    // Cambiar el prefijo a COT para cotizaciones
    const tipoDocumento = 'COT';
    
    const ultimaCotizacion = await this.cotizacionesRepository.findOne({
      where: {
        numeroDocumento: Like(`${tipoDocumento}-%`),
      },
      order: {
        id: 'DESC',
      },
    });

    if (!ultimaCotizacion) {
      return `${tipoDocumento}-1`;
    }

    const ultimoNumero = parseInt(ultimaCotizacion.numeroDocumento.split('-')[1]);
    return `${tipoDocumento}-${ultimoNumero + 1}`;
  }

  async obtenerCotizacionPorId(id: number): Promise<Cotizacion> {
    const cotizacion = await this.cotizacionesRepository.findOne({
      where: { id },
      relations: {
        detalles: {
          producto: true,
        },
        cliente: true,
        usuario: true,
      },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización con ID ${id} no encontrada`);
    }

    return this.parseFloatCotizacion(cotizacion);
  }

  async obtenerCotizaciones(q: QueryCotizacionDto) {
    const {
      page = 1,
      limit = 10,
      numeroDocumento,
      totalVenta,
      estado,
      sidx,
      sord = 'ASC',
    } = q;
    
    const query = this.cotizacionesRepository
      .createQueryBuilder('cotizaciones')
      .select([
        'cotizaciones.id',
        'cotizaciones.numeroDocumento',
        'cotizaciones.subtotal',
        'cotizaciones.totalVenta',
        'cotizaciones.metodoPago',
        'cotizaciones.estado',
        'cotizaciones.fechaCreacion',
        'cotizaciones.fechaModificacion',
        'cotizaciones.fechaAnulacion',
      ])
      .leftJoinAndSelect('cotizaciones.cliente', 'cliente')
      .leftJoinAndSelect('cotizaciones.usuario', 'usuario')
      .leftJoinAndSelect('cotizaciones.sucursal', 'sucursal')
      .leftJoinAndSelect('cotizaciones.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto');

    if (numeroDocumento) {
      query.andWhere('cotizaciones.numeroDocumento ILIKE :numeroDocumento', {
        numeroDocumento: `%${numeroDocumento}%`,
      });
    }

    if (totalVenta) {
      query.andWhere('cotizaciones.totalVenta = :totalVenta', {
        totalVenta,
      });
    }

    if (estado) {
      query.andWhere('cotizaciones.estado ILIKE :estado', {
        estado: `%${estado}%`,
      });
    }

    if (sidx) {
      query.orderBy(`cotizaciones.${sidx}`, sord === 'DESC' ? 'DESC' : 'ASC');
    } else {
      query.orderBy('cotizaciones.fechaCreacion', 'DESC');
    }

    const [result, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const parsedResult = result.map((cotizacion) => this.parseFloatCotizacion(cotizacion));

    return {
      data: parsedResult,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async eliminarCotizacion(id: number): Promise<Cotizacion> {
    const cotizacion = await this.obtenerCotizacionPorId(id);
    
    if (!cotizacion) {
      throw new NotFoundException(`Cotización con ID ${id} no encontrada`);
    }

    // Marcar como anulada en lugar de eliminar físicamente
    cotizacion.estado = 'anulada';
    cotizacion.fechaAnulacion = new Date();
    
    await this.cotizacionesRepository.save(cotizacion);
    
    return this.obtenerCotizacionPorId(id);
  }

  // Método para convertir cotización a venta (opcional)
  async convertirAVenta(id: number) {
    // Aquí implementarías la lógica para convertir una cotización en venta
    // Utilizando el servicio de ventas para crear una venta basada en esta cotización
    throw new Error('Método no implementado');
  }

  private parseFloatDetalleCotizacion(detalle: DetalleCotizacion): DetalleCotizacion {
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

  private parseFloatCotizacion(cotizacion: Cotizacion): Cotizacion {
    const parsedCotizacion = {
      ...cotizacion,
      subtotal: cotizacion.subtotal ? parseFloat(cotizacion.subtotal.toString()) : null,
      totalVenta: cotizacion.totalVenta
        ? parseFloat(cotizacion.totalVenta.toString())
        : null,
    };

    if (cotizacion.detalles && Array.isArray(cotizacion.detalles)) {
      parsedCotizacion.detalles = cotizacion.detalles.map((detalle) =>
        this.parseFloatDetalleCotizacion(detalle),
      );
    }

    return parsedCotizacion;
  }
}