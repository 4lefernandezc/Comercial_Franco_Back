import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Rol } from 'src/roles/entities/rol.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    @InjectRepository(Sucursal)
    private sucursalesRepository: Repository<Sucursal>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { usuario, nombre, apellido, correo, activo, rolId, sucursalId } = createUsuarioDto;

    const existe = await this.usuariosRepository.findOneBy({
      usuario: usuario.trim(),
    });
    if (existe) throw new ConflictException('El usuario ya existe');

    const rol = await this.rolesRepository.findOneBy({ id: rolId });
    if (!rol) throw new NotFoundException('El rol especificado no existe');

    const sucursal = await this.sucursalesRepository.findOneBy({ id: sucursalId });
    if (!sucursal) throw new NotFoundException('La sucursal especificada no existe');

    const nuevoUsuario = this.usuariosRepository.create({
      usuario: usuario.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo?.trim() || null,
      activo,
      clave: createUsuarioDto.clave,
      // clave: process.env.DEFAULT_PASSWORD, // Clave por defecto
      rolId,
      sucursalId,
      ultimoLogin: new Date(),
    });

    return this.usuariosRepository.save(nuevoUsuario);
  }

  async findAll(q: QueryUsuarioDto){
    const { page, limit } = q;
    const query = this.usuariosRepository.createQueryBuilder('usuarios').select([
      'usuarios.id',
      'usuarios.usuario',
      'usuarios.nombre',
      'usuarios.apellido',
      'usuarios.correo',
      'usuarios.activo',
      'usuarios.ultimoLogin',
      'usuarios.rolId',
      'usuarios.sucursalId',
      'usuarios.fechaCreacion',
      'usuarios.fechaModificacion',
    ])
    .innerJoin('usuarios.rol', 'rol')
    .innerJoin('usuarios.sucursal', 'sucursal')

    if (q.usuario) {
      query.andWhere('usuarios.usuario ILIKE :usuario', {
        usuario: `%${q.usuario}%`,
      });
    }
    
    if (q.nombre) {
      query.andWhere('usuarios.nombre ILIKE :nombre', {
        nombre: `%${q.nombre}%`,
      });
    }

    if (q.apellido) {
      query.andWhere('usuarios.apellido ILIKE :apellido', {
        apellido: `%${q.apellido}%`,
      });
    }

    if (q.activo !== undefined) {
      query.andWhere('usuarios.activo = :activo', {
        activo: q.activo,
      });
    }

    if (q.sidx) {
      query.orderBy(`usuarios.id`, q.sord);
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

  async findByRol(idRol: number): Promise<Usuario[]> {
    return this.usuariosRepository.find({ where: { rolId: idRol } });
  }

  async findBySucursal(idSucursal: number): Promise<Usuario[]> {
    return this.usuariosRepository.find({ where: { sucursalId: idSucursal } });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<{ message: string; usuario: Usuario }> {
    const usuario = await this.findOne(id);

    // Verifica si se incluye la clave y sobrescribe solo si es proporcionada
    if (updateUsuarioDto.clave) {
      usuario.clave = updateUsuarioDto.clave;
    }

    // Verifica rol y sucursal si fueron proporcionados
    if (updateUsuarioDto.rolId) {
      const rol = await this.rolesRepository.findOneBy({ id: updateUsuarioDto.rolId });
      if (!rol) throw new NotFoundException('El rol especificado no existe');
      usuario.rol = rol;
    }

    if (updateUsuarioDto.sucursalId) {
      const sucursal = await this.sucursalesRepository.findOneBy({ id: updateUsuarioDto.sucursalId });
      if (!sucursal) throw new NotFoundException('La sucursal especificada no existe');
      usuario.sucursal = sucursal;
    }

    Object.assign(usuario, updateUsuarioDto);
    const updatedUsuario = await this.usuariosRepository.save(usuario);
    return { message: 'Usuario actualizado correctamente', usuario: updatedUsuario };
  }

  async remove(id: number): Promise<{ message: string }> {
    const usuario = await this.findOne(id);
    await this.usuariosRepository.remove(usuario);
    return { message: 'Usuario eliminado correctamente' };
  }

  async validate(usuario: string, clave: string): Promise<Usuario> {
    const usuarioOk = await this.usuariosRepository.findOne({
      where: { usuario },
      select: ['id', 'usuario', 'nombre', 'correo', 'clave', 'activo', 'ultimoLogin'],
    });

    if (!usuarioOk) throw new NotFoundException('Usuario inexistente');
    if (!usuarioOk.activo) throw new UnauthorizedException('Usuario inactivo');

    const claveValida = await usuarioOk.validatePassword(clave);
    if (!claveValida) throw new UnauthorizedException('Clave incorrecta');

    usuarioOk.ultimoLogin = new Date();
    await this.usuariosRepository.save(usuarioOk);

    // Elimina la clave antes de devolver el usuario
    delete usuarioOk.clave;
    return usuarioOk;
  }
}
