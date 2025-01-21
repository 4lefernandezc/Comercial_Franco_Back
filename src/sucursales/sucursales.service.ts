import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sucursal } from './entities/sucursal.entity';
import { Repository } from 'typeorm';
import { QuerySucursalDto } from './dto/query-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private sucursalesRepository: Repository<Sucursal>,
  ) {}

  async create(createSucursalDto: CreateSucursalDto): Promise<Sucursal> {
    const existingSucursalByName = await this.sucursalesRepository.findOneBy({
      nombre: createSucursalDto.nombre.trim(),
    });
    if (existingSucursalByName) {
      throw new BadRequestException(
        `La sucursal con el nombre proporcionado ya existe`,
      );
    }

    const existingSucursalByDireccion =
      await this.sucursalesRepository.findOneBy({
        direccion: createSucursalDto.direccion.trim(),
      });
    if (existingSucursalByDireccion) {
      throw new BadRequestException(
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

    if (activo) {
      query.andWhere('sucursales.activo = :activo', {
        activo: activo,
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
    const sucursalUpdate = Object.assign(sucursal, updateSucursalDto);
    const updatedSucursal =
      await this.sucursalesRepository.save(sucursalUpdate);
    return {
      message: 'La sucursal ha sido actualizada exitosamente',
      sucursal: updatedSucursal,
    };
  }

  async remove(id: number): Promise<{ message: string; sucursal?: Sucursal }> {
    const sucursal = await this.findOne(id);
  
    const usuariosAsociados = await this.sucursalesRepository
      .createQueryBuilder('sucursal')
      .leftJoinAndSelect('sucursal.usuarios', 'usuario')
      .where('sucursal.id = :id', { id })
      .getCount();
  
    if (usuariosAsociados > 0) {
      throw new BadRequestException(
        `La sucursal con ID ${id} no puede ser eliminada porque tiene usuarios asociados.`,
      );
    }
  
    await this.sucursalesRepository.remove(sucursal);
    return {
      message: 'La sucursal ha sido eliminada exitosamente',
      sucursal,
    };
  }
}
