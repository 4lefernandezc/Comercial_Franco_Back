import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento_inventario.dto';
import { QueryMovimientoInventarioDto } from './dto/query-movimineto_inventario-dto';
import { MovimientoInventario } from './entities/movimientos_inventario.entity';
import { InventarioSucursal } from '../inventarios_sucursales/entities/inventario_sucursal.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class MovimientosInventariosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(MovimientoInventario)
    private readonly movimientosRepository: Repository<MovimientoInventario>,
    @InjectRepository(InventarioSucursal)
    private readonly inventarioRepository: Repository<InventarioSucursal>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(
    createMovimientoInventarioDto: CreateMovimientoInventarioDto,
  ): Promise<MovimientoInventario> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        idUsuario,
        idProducto,
        idSucursal,
        tipoMovimiento,
        cantidad,
        idSucursalDestino,
      } = createMovimientoInventarioDto;

      // Validate entities existence
      await this.validateEntities(
        idUsuario,
        idProducto,
        idSucursal,
        idSucursalDestino,
      );

      // Validate movement type and required fields
      this.validateMovementType(tipoMovimiento, idSucursalDestino);

      // Generate document reference
      const documentoReferencia =
        await this.generateDocumentReference(tipoMovimiento);

      // Handle different movement types using queryRunner for consistent transactions
      switch (tipoMovimiento) {
        case 'entrada':
          await this.handleEntradaMovement(
            queryRunner,
            idProducto,
            idSucursal,
            cantidad,
          );
          break;
        case 'salida':
          await this.handleSalidaMovement(
            queryRunner,
            idProducto,
            idSucursal,
            cantidad,
          );
          break;
        case 'transferencia':
          await this.handleTransferenciaMovement(
            queryRunner,
            idProducto,
            idSucursal,
            idSucursalDestino,
            cantidad,
          );
          break;
        default:
          throw new BadRequestException(
            'Tipo de movimiento inválido. Solo se admiten los tipos: entrada, salida, transferencia',
          );
      }

      // Create and save movement using queryRunner
      const nuevoMovimiento = this.movimientosRepository.create({
        ...createMovimientoInventarioDto,
        documentoReferencia,
      });

      const savedMovimiento = await queryRunner.manager.save(
        MovimientoInventario,
        nuevoMovimiento,
      );

      await queryRunner.commitTransaction();
      return savedMovimiento;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al crear movimiento de inventario: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async validateEntities(
    idUsuario: number,
    idProducto: number,
    idSucursal: number,
    idSucursalDestino?: number,
  ): Promise<void> {
    // Validate user
    const usuario = await this.usuarioRepository.findOne({
      where: { id: idUsuario },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    // Validate product
    const producto = await this.productoRepository.findOne({
      where: { id: idProducto },
    });
    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${idProducto} no encontrado`,
      );
    }

    // Validate source branch
    const sucursal = await this.sucursalRepository.findOne({
      where: { id: idSucursal },
    });
    if (!sucursal) {
      throw new NotFoundException(
        `Sucursal con ID ${idSucursal} no encontrada`,
      );
    }

    // Validate destination branch if provided
    if (idSucursalDestino) {
      const sucursalDestino = await this.sucursalRepository.findOne({
        where: { id: idSucursalDestino },
      });
      if (!sucursalDestino) {
        throw new NotFoundException(
          `Sucursal destino con ID ${idSucursalDestino} no encontrada`,
        );
      }
    }

    // Validate destination branch and source branch are different
    if (idSucursal === idSucursalDestino) {
      throw new BadRequestException(
        'La sucursal destino debe ser diferente a la sucursal origen',
      );
    }
  }

  private validateMovementType(
    tipoMovimiento: string,
    idSucursalDestino?: number,
  ): void {
    if (tipoMovimiento === 'transferencia' && !idSucursalDestino) {
      throw new BadRequestException(
        'Para transferencias, se requiere id_sucursal_destino',
      );
    }
  }

  private async handleEntradaMovement(
    queryRunner: QueryRunner,
    idProducto: number,
    idSucursal: number,
    cantidad: number,
  ): Promise<void> {
    const inventario = await queryRunner.manager.findOne(InventarioSucursal, {
      where: { idProducto, idSucursal },
    });

    if (!inventario) {
      throw new NotFoundException(
        `Inventario no encontrado para producto ${idProducto} en sucursal ${idSucursal}`,
      );
    }

    if (
      inventario.stockMaximo &&
      inventario.stockActual + cantidad > inventario.stockMaximo
    ) {
      throw new BadRequestException(
        `La cantidad excede el stock máximo permitido de ${inventario.stockMaximo}`,
      );
    }

    await queryRunner.manager.update(
      InventarioSucursal,
      { id: inventario.id },
      { stockActual: inventario.stockActual + cantidad },
    );
  }

  private async handleSalidaMovement(
    queryRunner: QueryRunner,
    idProducto: number,
    idSucursal: number,
    cantidad: number,
  ): Promise<void> {
    const inventario = await queryRunner.manager.findOne(InventarioSucursal, {
      where: { idProducto, idSucursal },
    });

    if (!inventario) {
      throw new NotFoundException(
        `Inventario no encontrado para producto ${idProducto} en sucursal ${idSucursal}`,
      );
    }

    if (inventario.stockActual < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para producto ${idProducto} en sucursal ${idSucursal}`,
      );
    }

    if (inventario.stockActual - cantidad < inventario.stockMinimo) {
      throw new BadRequestException(
        `La salida dejará el stock por debajo del mínimo de ${inventario.stockMinimo}`,
      );
    }

    await queryRunner.manager.update(
      InventarioSucursal,
      { id: inventario.id },
      { stockActual: inventario.stockActual - cantidad },
    );
  }

  private async handleTransferenciaMovement(
    queryRunner: QueryRunner,
    idProducto: number,
    idSucursalOrigen: number,
    idSucursalDestino: number,
    cantidad: number,
  ): Promise<void> {
    const inventarioOrigen = await queryRunner.manager.findOne(
      InventarioSucursal,
      {
        where: { idProducto, idSucursal: idSucursalOrigen },
      },
    );

    if (!inventarioOrigen) {
      throw new NotFoundException(
        `Inventario no encontrado para producto ${idProducto} en sucursal origen ${idSucursalOrigen}`,
      );
    }

    if (inventarioOrigen.stockActual < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para transferencia de producto ${idProducto}`,
      );
    }

    if (
      inventarioOrigen.stockActual - cantidad <
      inventarioOrigen.stockMinimo
    ) {
      throw new BadRequestException(
        `La transferencia dejará el stock origen por debajo del mínimo de ${inventarioOrigen.stockMinimo}`,
      );
    }

    await queryRunner.manager.update(
      InventarioSucursal,
      { id: inventarioOrigen.id },
      { stockActual: inventarioOrigen.stockActual - cantidad },
    );

    let inventarioDestino = await queryRunner.manager.findOne(
      InventarioSucursal,
      {
        where: { idProducto, idSucursal: idSucursalDestino },
      },
    );

    if (!inventarioDestino) {
      inventarioDestino = this.inventarioRepository.create({
        idProducto,
        idSucursal: idSucursalDestino,
        stockActual: 0,
        stockMinimo: 0,
      });
      await queryRunner.manager.save(InventarioSucursal, inventarioDestino);
    }

    if (
      inventarioDestino.stockMaximo &&
      inventarioDestino.stockActual + cantidad > inventarioDestino.stockMaximo
    ) {
      throw new BadRequestException(
        `La transferencia excede el stock máximo permitido de ${inventarioDestino.stockMaximo}`,
      );
    }

    await queryRunner.manager.update(
      InventarioSucursal,
      { id: inventarioDestino.id },
      { stockActual: inventarioDestino.stockActual + cantidad },
    );
  }

  private async generateDocumentReference(
    tipoMovimiento: string,
  ): Promise<string> {
    const prefix = this.getDocumentReferencePrefix(tipoMovimiento);
    const ultimoMovimiento = await this.movimientosRepository.findOne({
      where: { documentoReferencia: Like(`${prefix}-%`) },
      order: { id: 'DESC' },
    });

    const ultimoNumero = ultimoMovimiento
      ? parseInt(ultimoMovimiento.documentoReferencia.split('-')[1])
      : 0;

    return `${prefix}-${ultimoNumero + 1}`;
  }

  private getDocumentReferencePrefix(tipoMovimiento: string): string {
    switch (tipoMovimiento) {
      case 'entrada':
        return 'ENT';
      case 'salida':
        return 'SAL';
      case 'transferencia':
        return 'TRANS';
      default:
        throw new BadRequestException('Tipo de movimiento inválido. Solo se admiten los tipos: entrada, salida, transferencia');
    }
  }

  async findAll(q: QueryMovimientoInventarioDto) {
    const {
      page,
      limit,
      idProducto,
      idSucursal,
      tipoMovimiento,
      estado,
      idUsuario,
      idSucursalDestino,
      sidx,
      sord,
    } = q;

    const query = this.movimientosRepository
      .createQueryBuilder('movimientos_inventarios')
      .select([
        'movimientos_inventarios.id',
        'movimientos_inventarios.documentoReferencia',
        'movimientos_inventarios.idProducto',
        'movimientos_inventarios.idSucursal',
        'movimientos_inventarios.tipoMovimiento',
        'movimientos_inventarios.cantidad',
        'movimientos_inventarios.motivo',
        'movimientos_inventarios.estado',
        'movimientos_inventarios.idUsuario',
        'movimientos_inventarios.idSucursalDestino',
        'movimientos_inventarios.fechaCreacion',
        'movimientos_inventarios.fechaModificacion',
      ])
      .leftJoinAndSelect('movimientos_inventarios.producto', 'producto')
      .leftJoinAndSelect('movimientos_inventarios.sucursal', 'sucursal')
      .leftJoinAndSelect(
        'movimientos_inventarios.sucursalDestino',
        'sucursalDestino',
      )
      .leftJoinAndSelect('movimientos_inventarios.usuario', 'usuario');

    if (idProducto) {
      query.andWhere('movimientos_inventarios.idProducto = :idProducto', {
        idProducto,
      });
    }

    if (idSucursal) {
      query.andWhere('movimientos_inventarios.idSucursal = :idSucursal', {
        idSucursal,
      });
    }

    if (tipoMovimiento) {
      query.andWhere(
        'movimientos_inventarios.tipoMovimiento ILIKE :tipoMovimiento',
        {
          tipoMovimiento: `%${tipoMovimiento}%`,
        },
      );
    }

    if (estado) {
      query.andWhere('movimientos_inventarios.estado ILIKE :estado', {
        estado: `%${estado}%`,
      });
    }

    if (idUsuario) {
      query.andWhere('movimientos_inventarios.idUsuario = :idUsuario', {
        idUsuario,
      });
    }

    if (idSucursalDestino) {
      query.andWhere(
        'movimientos_inventarios.idSucursalDestino = :idSucursalDestino',
        { idSucursalDestino },
      );
    }

    if (sidx) {
      query.orderBy(`movimientos_inventarios.${sidx}`, sord);
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

  async findOne(id: number): Promise<MovimientoInventario> {
    const movimiento = await this.movimientosRepository.findOne({
      where: { id },
      relations: ['producto', 'sucursal', 'sucursalDestino', 'usuario'],
    });
    if (!movimiento) {
      throw new NotFoundException(
        `Movimiento de inventario con ID ${id} no encontrado`,
      );
    }
    return movimiento;
  }

  async remove(
    id: number,
  ): Promise<{ message: string; movimiento: MovimientoInventario }> {
    const movimiento = await this.findOne(id);
    await this.movimientosRepository.remove(movimiento);
    return {
      message: `Movimiento de inventario con ID ${id} eliminado exitosamente`,
      movimiento,
    };
  }

  async cancelMovement(
    id: number,
  ): Promise<{ message: string; movimiento: MovimientoInventario }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const movimiento = await this.findOne(id);
  
      if (movimiento.estado === 'CANCELADO') {
        throw new BadRequestException(`Movimiento ${id} ya está cancelado`);
      }
  
      switch (movimiento.tipoMovimiento) {
        case 'entrada':
          await this.rollbackEntradaMovement(queryRunner, movimiento);
          break;
        case 'salida':
          await this.rollbackSalidaMovement(queryRunner, movimiento);
          break;
        case 'transferencia':
          await this.rollbackTransferenciaMovement(queryRunner, movimiento);
          break;
      }
  
      movimiento.estado = 'CANCELADO';
      const cancelledMovimiento = await queryRunner.manager.save(movimiento);
  
      await queryRunner.commitTransaction();
      return {
        message: `Movimiento de inventario con ID ${id} cancelado exitosamente`,
        movimiento: cancelledMovimiento,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error al cancelar movimiento: ${error.message}`
      );
    } finally {
      await queryRunner.release();
    }
  }
  
  private async rollbackEntradaMovement(
    queryRunner: QueryRunner, 
    movimiento: MovimientoInventario
  ) {
    await this.inventarioRepository.update(
      { idProducto: movimiento.idProducto, idSucursal: movimiento.idSucursal },
      { stockActual: () => `stock_actual - ${movimiento.cantidad}` }
    );
  }
  
  private async rollbackSalidaMovement(
    queryRunner: QueryRunner, 
    movimiento: MovimientoInventario
  ) {
    await this.inventarioRepository.update(
      { idProducto: movimiento.idProducto, idSucursal: movimiento.idSucursal },
      { stockActual: () => `stock_actual + ${movimiento.cantidad}` }
    );
  }
  
  private async rollbackTransferenciaMovement(
    queryRunner: QueryRunner, 
    movimiento: MovimientoInventario
  ) {
    await this.inventarioRepository.update(
      { idProducto: movimiento.idProducto, idSucursal: movimiento.idSucursal },
      { stockActual: () => `stock_actual + ${movimiento.cantidad}` }
    );
  
    if (movimiento.idSucursalDestino) {
      await this.inventarioRepository.update(
        { 
          idProducto: movimiento.idProducto, 
          idSucursal: movimiento.idSucursalDestino 
        },
        { stockActual: () => `stock_actual - ${movimiento.cantidad}` }
      );
    }
  }
}
