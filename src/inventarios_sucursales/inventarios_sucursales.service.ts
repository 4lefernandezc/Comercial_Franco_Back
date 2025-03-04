import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventarioSucursalDto } from './dto/create-inventario_sucursal.dto';
import { UpdateInventarioSucursalDto } from './dto/update-inventario_sucursal.dto';
import { InventarioSucursal } from './entities/inventario_sucursal.entity';
import { QueryInventarioSucursalDto } from './dto/query-inventario_sucursal.dto';

@Injectable()
export class InventariosSucursalesService {
  constructor(
    @InjectRepository(InventarioSucursal)
    private readonly inventariosRepository: Repository<InventarioSucursal>,
  ) {}

  async create(
    createInventarioSucursalDto: CreateInventarioSucursalDto,
  ): Promise<InventarioSucursal> {
    const { idProducto, idSucursal } = createInventarioSucursalDto;

    const existingInventario = await this.inventariosRepository.findOne({
      where: { idProducto, idSucursal },
    });

    if (existingInventario) {
      throw new ConflictException(
        `El producto seleccionado ya existe en la sucursal seleccionada`,
      );
    }

    const nuevoInventario = this.inventariosRepository.create(
      createInventarioSucursalDto,
    );
    return this.inventariosRepository.save(nuevoInventario);
  }

  async findAll(q: QueryInventarioSucursalDto) {
    const {
      page,
      limit,
      idProducto,
      idSucursal,
      stockActual,
      stockMinimo,
      stockMaximo,
      tipoUnidadId,
      seVendeFraccion,
      sidx,
      sord,
    } = q;

    const query = this.inventariosRepository.createQueryBuilder('inventarios_sucursales').select([
      'inventarios_sucursales.id',
      'inventarios_sucursales.idProducto',
      'inventarios_sucursales.idSucursal',
      'inventarios_sucursales.stockActual',
      'inventarios_sucursales.stockMinimo',
      'inventarios_sucursales.stockMaximo',
      'inventarios_sucursales.tipoUnidadId',
      'inventarios_sucursales.seVendeFraccion',
      'inventarios_sucursales.fechaCreacion',
      'inventarios_sucursales.fechaModificacion',
    ])
    .leftJoinAndSelect('inventarios_sucursales.producto', 'producto')
    .leftJoinAndSelect('inventarios_sucursales.sucursal', 'sucursal')
    .leftJoinAndSelect('inventarios_sucursales.tipoUnidad', 'tipoUnidad');

    if (idProducto) {
      query.andWhere('inventarios_sucursales.idProducto = :idProducto', {
        idProducto,
      });
    }

    if (idSucursal) {
      query.andWhere('inventarios_sucursales.idSucursal = :idSucursal', {
        idSucursal,
      });
    }

    if (stockActual) {
      query.andWhere('inventarios_sucursales.stockActual = :stockActual', {
        stockActual,
      });
    }

    if (stockMinimo) {
      query.andWhere('inventarios_sucursales.stockMinimo = :stockMinimo', {
        stockMinimo,
      });
    }

    if (stockMaximo) {
      query.andWhere('inventarios_sucursales.stockMaximo = :stockMaximo', {
        stockMaximo,
      });
    }

    if (tipoUnidadId) {
      query.andWhere('inventarios_sucursales.tipoUnidadId = :tipoUnidadId', {
        tipoUnidadId: tipoUnidadId,
      });
    }

    if (seVendeFraccion !== undefined) {
      query.andWhere('inventarios_sucursales.seVendeFraccion = :seVendeFraccion', {
      seVendeFraccion,
      });
    }

    if (sidx) {
      query.orderBy(`inventarios_sucursales.${sidx}`, sord);
    }

    const [result, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const parsedResult = result.map(inventario => this.parseFloatFields(inventario));

    return {
      data: parsedResult,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<InventarioSucursal> {
    const inventario = await this.inventariosRepository.findOne({
      where: { id },
      relations: ['producto', 'sucursal'],
    });
    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }
    return inventario;
  }

  async update(
    id: number,
    updateInventarioSucursalDto: UpdateInventarioSucursalDto,
  ): Promise<{ message: string; inventario: InventarioSucursal }> {
    const inventario = await this.findOne(id);
    const { idProducto, idSucursal } = updateInventarioSucursalDto;

    if (idProducto && idSucursal) {
      const existingInventario = await this.inventariosRepository.findOne({
        where: { idProducto, idSucursal },
      });

      if (existingInventario && existingInventario.id !== id) {
        throw new ConflictException(
          `El producto seleccionado ya existe en la sucursal seleccionada`,
        );
      }
    }

    Object.assign(inventario, updateInventarioSucursalDto);
    const updatedInventario = await this.inventariosRepository.save(inventario);
    return {
      message: `Inventario con ID ${id} actualizado exitosamente`,
      inventario: updatedInventario,
    };
  }

  async remove(id: number): Promise<{ message: string; inventario: InventarioSucursal }> {
    const inventario = await this.findOne(id);
    await this.inventariosRepository.remove(inventario);
    return {
      message: `Inventario con ID ${id} eliminado exitosamente`,
      inventario,
    };
  }

  // PARSEADO DE DATOS
  private parseFloatFields(inventario: InventarioSucursal): InventarioSucursal {
    return {
      ...inventario,
      stockActual: inventario.stockActual ? parseFloat(inventario.stockActual.toString()) : null,
      stockMinimo: inventario.stockMinimo ? parseFloat(inventario.stockMinimo.toString()) : null,
      stockMaximo: inventario.stockMaximo ? parseFloat(inventario.stockMaximo.toString()) : null,
    };
  }   
}
