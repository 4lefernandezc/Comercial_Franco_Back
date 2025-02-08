import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { QueryRolDto } from './dto/query-rol.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const rol = await this.rolesRepository.findOne({
      where: {
        nombre: createRolDto.nombre.toLowerCase(),
      },
    });
    if (rol) throw new BadRequestException('Ya existe un rol con ese nombre');
    const newRol = this.rolesRepository.create({
      ...createRolDto,
      nombre: createRolDto.nombre.toLowerCase().trim(),
      descripcion: createRolDto.descripcion?.trim() || null,
    });
    return this.rolesRepository.save(newRol);
  }

  async findAll(q: QueryRolDto) {
    const { page, limit, nombre, descripcion, sidx, sord } = q;
    const query = this.rolesRepository.createQueryBuilder('roles').select([
      'roles.id',
      'roles.nombre',
      'roles.descripcion',
      'roles.fechaCreacion',
      'roles.fechaModificacion',
    ]);

    if (nombre) {
      query.andWhere('roles.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (descripcion) {
      query.andWhere('roles.descripcion ILIKE :descripcion', {
        descripcion: `%${descripcion}%`,
      });
    }

    if (sidx) {
      query.orderBy(`roles.${sidx}`, sord);
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

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolesRepository.findOneBy({ id });
    if (!rol)
      throw new NotFoundException('El rol con el id proporcionado no existe');
    return rol;
  }

  async update(
    id: number,
    updateRolDto: UpdateRolDto,
  ): Promise<{ message: string; rol: Rol }> {
    const rol = await this.findOne(id);
  
    let updatedData = { ...updateRolDto };

    if (updateRolDto.nombre) {
      const existingRol = await this.rolesRepository.findOne({
        where: {
          nombre: updateRolDto.nombre.toLowerCase().trim(),
        },
      });
  
      if (existingRol && existingRol.id !== id) {
        throw new BadRequestException('Ya existe un rol con ese nombre');
      }
  
      updatedData = {
        ...updatedData,
        nombre: updateRolDto.nombre.toLowerCase().trim(),
      };
    }
  
    updatedData = {
      ...updatedData,
      descripcion: updateRolDto.descripcion?.trim() || null,
    };
  
    const rolUpdate = Object.assign(rol, updatedData);
    const updatedRol = await this.rolesRepository.save(rolUpdate);
  
    return {
      message: 'El rol ha sido actualizado exitosamente',
      rol: updatedRol,
    };
  }
  
  async remove(id: number): Promise<{ message: string; rol?: Rol }> {
    const rol = await this.findOne(id);

    // Verificamos si hay usuarios relacionados al rol
    const usuariosCount = await this.usuariosRepository.count({
      where: {
        rol: { id }
      }
    });

    if (usuariosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el rol porque está relacionado con uno o más usuarios',
      );
    }

    await this.rolesRepository.remove(rol);
    return {
      message: 'El rol ha sido eliminado exitosamente',
      rol: rol,
    };
  }
}
