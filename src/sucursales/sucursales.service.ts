import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { QuerySucursalDto } from './dto/query-sucursal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Sucursal } from './entities/sucursal.entity';
import { Repository } from 'typeorm';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private sucursalesRepository: Repository<Sucursal>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(InventarioSucursal)
    private inventariosRepository: Repository<InventarioSucursal>,
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    @InjectRepository(Compra)
    private comprasRepository: Repository<Compra>,
    @InjectRepository(Caja)
    private cajasRepository: Repository<Caja>,
    @InjectRepository(MovimientoInventario)
    private movimientosRepository: Repository<MovimientoInventario>,
  ) {}

  async create(createSucursalDto: CreateSucursalDto): Promise<Sucursal> {
    const existingSucursalByName = await this.sucursalesRepository.findOneBy({
      nombre: createSucursalDto.nombre.trim(),
    });
    if (existingSucursalByName) {
      throw new ConflictException(
        `La sucursal con el nombre proporcionado ya existe`,
      );
    }

    const existingSucursalByDireccion =
      await this.sucursalesRepository.findOneBy({
        direccion: createSucursalDto.direccion.trim(),
      });
    if (existingSucursalByDireccion) {
      throw new ConflictException(
        `La sucursal con la dirección proporcionada ya existe`,
      );
    }

    const sucursal = this.sucursalesRepository.create({
      nombre: createSucursalDto.nombre.trim(),
      direccion: createSucursalDto.direccion.trim(),
      telefono: createSucursalDto.telefono,
      correo: createSucursalDto.correo?.trim() || null,
      activo: createSucursalDto.activo,
    });
    return this.sucursalesRepository.save(sucursal);
  }

  async findAll(q: QuerySucursalDto){
    const { page, limit, nombre, telefono, direccion, correo, activo, sidx, sord } = q;
    const query = this.sucursalesRepository.createQueryBuilder('sucursales').select([
      'sucursales.id',
      'sucursales.nombre',
      'sucursales.telefono',
      'sucursales.direccion',
      'sucursales.correo',
      'sucursales.activo',
      'sucursales.fechaCreacion',
      'sucursales.fechaModificacion',
    ]);

    if (nombre) {
      query.andWhere('sucursales.nombre ILIKE :nombre', { 
        nombre: `%${nombre}%`, 
      });
    }

    if (telefono) {
      query.andWhere('sucursales.telefono ILIKE :telefono', { 
        telefono: `%${telefono}%`, 
      });
    }

    if (direccion) {
      query.andWhere('sucursales.direccion ILIKE :direccion', { 
        direccion: `%${direccion}%`, 
      });
    }

    if (correo) {
      query.andWhere('sucursales.correo ILIKE :correo', { 
        correo: `%${correo}%`, 
      });
    }

    if (activo !== undefined) {
      query.andWhere('sucursales.activo = :activo', {
        activo,
      });
    }

    if (sidx) {
      query.orderBy(`sucursales.${sidx}`, sord);
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

  async findOne(id: number): Promise<Sucursal> {
    const sucursal = await this.sucursalesRepository.findOneBy({ id });
    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con el id proporcionado no existe`,
      );
    }
    return sucursal;
  }

  async update(
    id: number,
    updateSucursalDto: UpdateSucursalDto,
  ): Promise<{ message: string; sucursal: Sucursal }> {
    const sucursal = await this.findOne(id);
  
    const normalizedDto = {
      ...updateSucursalDto,
      nombre: updateSucursalDto.nombre?.trim(),
      direccion: updateSucursalDto.direccion?.trim(),
      correo: updateSucursalDto.correo?.trim() || null,
    };
  
    if (normalizedDto.nombre) {
      const existingSucursalByName = await this.sucursalesRepository.findOne({
        where: {
          nombre: normalizedDto.nombre,
        },
      });
  
      if (existingSucursalByName && existingSucursalByName.id !== id) {
        throw new ConflictException(
          'La sucursal con el nombre proporcionado ya existe',
        );
      }
    }
  
    if (normalizedDto.direccion) {
      const existingSucursalByDireccion =
        await this.sucursalesRepository.findOne({
          where: {
            direccion: normalizedDto.direccion,
          },
        });
  
      if (existingSucursalByDireccion && existingSucursalByDireccion.id !== id) {
        throw new ConflictException(
          'La sucursal con la dirección proporcionada ya existe',
        );
      }
    }
  
    const sucursalUpdate = Object.assign(sucursal, normalizedDto);
    const updatedSucursal = await this.sucursalesRepository.save(sucursalUpdate);
  
    return {
      message: 'La sucursal ha sido actualizada exitosamente',
      sucursal: updatedSucursal,
    };
  }  

  async remove(id: number): Promise<{ message: string; sucursal?: Sucursal }> {
    const sucursal = await this.findOne(id);

    await this.checkRelations(id);

    await this.sucursalesRepository.remove(sucursal);

    return {
      message: 'La sucursal ha sido eliminada exitosamente',
      sucursal,
    };
  }

  private async checkRelations(id: number): Promise<void> {
    const relations = [
      // Relaciones con objetos
      { repository: this.ventasRepository, entity: 'ventas', field: 'sucursal', isRelation: true },
      { repository: this.comprasRepository, entity: 'compras', field: 'sucursal', isRelation: true },
      { repository: this.cajasRepository, entity: 'cajas', field: 'sucursal', isRelation: true },
      
      // Campos de ID directo
      { repository: this.usuariosRepository, entity: 'usuarios', field: 'sucursalId', isRelation: false },
      { repository: this.inventariosRepository, entity: 'inventarios', field: 'idSucursal', isRelation: false },
      { repository: this.movimientosRepository, entity: 'movimientos de inventarios', field: 'idSucursal', isRelation: false },
      { repository: this.movimientosRepository, entity: 'movimientos de inventarios', field: 'idSucursalDestino', isRelation: false },
    ];

    for (const relation of relations) {
        const count = await relation.repository.count({
          where: relation.isRelation 
            ? { [relation.field]: { id } }
            : { [relation.field]: id }
        });

        if (count > 0) {
          throw new ConflictException(
            `No se puede eliminar la sucursal porque está relacionada con ${relation.entity}`
          );
        }
      }
  }
}
