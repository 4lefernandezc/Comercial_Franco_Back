import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { DetalleCompra } from './entities/detalle_compra.entity';
import { InventarioSucursal } from '../inventarios_sucursales/entities/inventario_sucursal.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { QueryCompraDto } from './dto/query-compra.dto';
import { Caja } from 'src/cajas/entities/caja.entity';

@Injectable()
export class ComprasService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
    @InjectRepository(DetalleCompra)
    private readonly detalleCompraRepository: Repository<DetalleCompra>,
    @InjectRepository(InventarioSucursal)
    private readonly inventarioRepository: Repository<InventarioSucursal>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
  ) {}

  async crearCompra(createCompraDto: CreateCompraDto): Promise<Compra> {
    const { idSucursal } = createCompraDto;
    const cajaActual = await this.cajaRepository.findOne({
      where: {
        sucursal: { id: idSucursal },
        estado: 'abierta',
      },
    });
    
    if (!cajaActual) {
      throw new BadRequestException('No hay una caja abierta para realizar compras');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { detalles, idSucursal, idProveedor, idUsuario, tipoDocumento } = createCompraDto;

      for (const detalle of detalles) {
        const producto = await this.productoRepository.findOne({
          where: { id: detalle.idProducto },
          relations: ['inventarios']
        });

        if (!producto) {
          throw new BadRequestException(`Producto con ID ${detalle.idProducto} no encontrado`);
        }

        const inventario = producto.inventarios.find(
          inv => inv.idSucursal === idSucursal
        );

        if (inventario && !inventario.seVendeFraccion && !Number.isInteger(detalle.cantidad)) {
          throw new BadRequestException(
            `El producto ${producto.nombre} no permite compras fraccionadas`
          );
        }

        if (inventario && inventario.stockMaximo !== null) {
          console.log('Stock actual:', inventario.stockActual);
          console.log('Cantidad:', detalle.cantidad);
          const stockActual = Number(inventario.stockActual || 0);
          const nuevoStock = Number((stockActual + detalle.cantidad).toFixed(3));
          console.log('Nuevo stock:', nuevoStock);
          
          if (nuevoStock > inventario.stockMaximo) {
            throw new BadRequestException(
              `La compra excede el stock máximo permitido para el producto ${producto.nombre}. ` +
              `Stock actual: ${stockActual}, Stock máximo: ${inventario.stockMaximo}, ` +
              `Cantidad a comprar: ${detalle.cantidad}`
            );
          }
        }
      }

      const productosIds = detalles.map(detalle => detalle.idProducto);
      const productos = await this.productoRepository.findByIds(productosIds);
      const productosMap = new Map(productos.map(producto => [producto.id, producto]));

      let subtotalCompra = 0;
      const detallesCompra = detalles.map(detalle => {
        const producto = productosMap.get(detalle.idProducto);
        if (!producto) {
          throw new BadRequestException(`Producto con ID ${detalle.idProducto} no encontrado`);
        }

        const precioUnitario = producto.precioCompra;
        const subtotalDetalle = (precioUnitario * detalle.cantidad) - (detalle.descuento || 0);
        subtotalCompra += subtotalDetalle;

        return {
          ...detalle,
          precioUnitario,
          subtotal: subtotalDetalle
        };
      });

      const numeroDocumento = await this.generarNumeroDocumento(tipoDocumento);

      const compra = this.comprasRepository.create({
        numeroDocumento: numeroDocumento,
        subtotal: subtotalCompra,
        totalCompra: subtotalCompra,
        metodoPago: createCompraDto.metodoPago,
        estado: 'completada',
        caja: cajaActual,
        proveedor: { id: idProveedor },
        usuario: { id: idUsuario },
        sucursal: { id: idSucursal }
      });

      const compraGuardada = await this.comprasRepository.save(compra);

      const detallesGuardados = await Promise.all(
        detallesCompra.map(async (detalle) => {
          const inventario = await this.inventarioRepository.findOne({
            where: {
              idProducto: detalle.idProducto,
              idSucursal: idSucursal
            }
          });
      
          const stockActual = Number(inventario?.stockActual || 0);
          const nuevoStock = Number((stockActual + detalle.cantidad).toFixed(3));
      
          if (inventario) {
            await this.inventarioRepository.update(
              { id: inventario.id },
              { 
                stockActual: nuevoStock,
                fechaModificacion: new Date()
              }
            );
          } else {
            await this.inventarioRepository.save({
              idProducto: detalle.idProducto,
              idSucursal: idSucursal,
              stockActual: detalle.cantidad,
              stockMinimo: 0,
              stockMaximo: null,
              seVendeFraccion: true,
              fechaCreacion: new Date(),
              fechaModificacion: new Date()
            });
          }
      
          return this.detalleCompraRepository.save(
            this.detalleCompraRepository.create({
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              descuento: detalle.descuento || 0,
              subtotal: detalle.subtotal,
              producto: { id: detalle.idProducto },
              compra: compraGuardada
            })
          );
        })
      );

      await queryRunner.commitTransaction();
      return this.obtenerCompraPorId(compraGuardada.id);
    } catch (error) {
      console.error('Error en la creación de compra:', error);
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        'Error al procesar la compra',
        error.message
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async generarNumeroDocumento(tipo: string): Promise<string> {
    const ultimaCompra = await this.comprasRepository.findOne({
      where: {
        numeroDocumento: Like(`${tipo}-%`),
      },
      order: {
        id: 'DESC',
      },
    });

    if (!ultimaCompra) {
      return `${tipo}-1`;
    }

    const ultimoNumero = parseInt(ultimaCompra.numeroDocumento.split('-')[1]);
    return `${tipo}-${ultimoNumero + 1}`;
  }
  
  async obtenerCompraPorId(id: number): Promise<Compra> {
    const compra = await this.comprasRepository.findOne({
      where: { id },
      relations: {
        detalles: {
          producto: true
        },
        proveedor: true,
        usuario: true,
      }
    });

    if (!compra) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }

    return compra;
  }

  async obtenerCompras(q: QueryCompraDto) {
    const {
      page,
      limit,
      numeroDocumento,
      metodoPago,
      totalCompra,
      estado,
      sidx,
      sord,
    } = q;
    const query = this.comprasRepository
      .createQueryBuilder('compras')
      .select([
        'compras.id',
        'compras.numeroDocumento',
        'compras.subtotal',
        'compras.totalCompra',
        'compras.metodoPago',
        'compras.estado',
        'compras.fechaCreacion',
        'compras.fechaModificacion',
        'compras.fechaAnulacion',
      ])
      .leftJoinAndSelect('compras.proveedor', 'proveedor')
      .leftJoinAndSelect('compras.usuario', 'usuario')
      .leftJoinAndSelect('compras.sucursal', 'sucursal')
      .leftJoinAndSelect('compras.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto');

      if (numeroDocumento) {
        query.andWhere('compras.numeroDocumento ILIKE :numeroDocumento', {
          numeroDocumento: `%${numeroDocumento}%`,
        });
      }
  
      if (metodoPago) {
        query.andWhere('compras.metodoPago ILIKE :metodoPago', {
          metodoPago: `%${metodoPago}%`,
        });
      }
  
      if (totalCompra) {
        query.andWhere('compras.totalCompra = :totalCompra', {
          totalCompra,
        });
      }
  
      if (estado) {
        query.andWhere('compras.estado ILIKE :estado', {
          estado: `%${estado}%`,
        });
      }
  
      if (sidx) {
        query.orderBy(`compras.${sidx}`, sord);
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

  async anularCompra(id: number): Promise<Compra> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const compra = await queryRunner.manager.findOne(Compra, {
        where: { id },
        lock: { mode: 'pessimistic_write' }
      });

      if (!compra) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      if (compra.estado === 'anulada') {
        throw new BadRequestException('Esta compra ya está anulada');
      }

      const compraConDetalles = await queryRunner.manager
        .createQueryBuilder(Compra, 'compra')
        .leftJoinAndSelect('compra.detalles', 'detalles')
        .innerJoinAndSelect('detalles.producto', 'producto')
        .innerJoinAndSelect('compra.sucursal', 'sucursal')
        .where('compra.id = :id', { id })
        .getOne();

      if (!compraConDetalles) {
        throw new NotFoundException(`No se encontraron los detalles de la compra ${id}`);
      }

      for (const detalle of compraConDetalles.detalles) {
        const inventario = await queryRunner.manager.findOne(InventarioSucursal, {
          where: {
            idProducto: detalle.producto.id,
            idSucursal: compraConDetalles.sucursal.id
          },
          lock: { mode: 'pessimistic_write' }
        });
  
        if (inventario.stockActual < detalle.cantidad) {
          throw new BadRequestException(
            `No se puede anular la compra. El stock actual (${inventario.stockActual}) 
            es menor que la cantidad a devolver (${detalle.cantidad}) para el producto ${detalle.producto.nombre}`
          );
        }

        if (!inventario) {
          throw new NotFoundException(
            `No se encontró el inventario para el producto ${detalle.producto.id}`
          );
        }

        await queryRunner.manager.update(
          InventarioSucursal,
          { id: inventario.id },
          { 
            stockActual: inventario.stockActual - detalle.cantidad,
            fechaModificacion: new Date()
          }
        );
      }

      compra.estado = 'anulada';
      compra.fechaAnulacion = new Date();
      await queryRunner.manager.save(Compra, compra);

      await queryRunner.commitTransaction();
      return this.obtenerCompraPorId(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        'Error al procesar la anulación de la compra',
        error.message
      );
    } finally {
      await queryRunner.release();
    }
  }
}