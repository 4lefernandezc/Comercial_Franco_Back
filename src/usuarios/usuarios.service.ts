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
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    @InjectRepository(Sucursal)
    private sucursalesRepository: Repository<Sucursal>,
    @InjectRepository(MovimientoInventario)
    private movimientosRepository: Repository<MovimientoInventario>,
    @InjectRepository(Caja)
    private cajasRepository: Repository<Caja>,
    @InjectRepository(Compra)
    private comprasRepository: Repository<Compra>,
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { usuario, nombre, apellido, telefono, correo, activo, rolId, sucursalId } = createUsuarioDto;

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
      telefono: telefono?.trim() || null,
      activo,
      clave: createUsuarioDto.clave,
      rolId,
      sucursalId,
      ultimoLogin: new Date(),
    });

    return this.usuariosRepository.save(nuevoUsuario);
  }

  async findAll(q: QueryUsuarioDto) {
    const { page, limit, rolId, sucursalId, usuario, nombre, apellido, telefono, correo, activo, sidx, sord } = q;
    const query = this.usuariosRepository.createQueryBuilder('usuarios').select([
      'usuarios.id',
      'usuarios.usuario',
      'usuarios.nombre',
      'usuarios.apellido',
      'usuarios.correo',
      'usuarios.telefono',
      'usuarios.activo',
      'usuarios.ultimoLogin',
      'usuarios.rolId',
      'usuarios.sucursalId',
      'usuarios.fechaCreacion',
      'usuarios.fechaModificacion',
    ])
    .leftJoinAndSelect('usuarios.rol', 'rol')
    .leftJoinAndSelect('usuarios.sucursal', 'sucursal');

    if (usuario) {
      query.andWhere('usuarios.usuario ILIKE :usuario', {
        usuario: `%${usuario}%`,
      });
    }
    
    if (nombre) {
      query.andWhere('usuarios.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (apellido) {
      query.andWhere('usuarios.apellido ILIKE :apellido', {
        apellido: `%${apellido}%`,
      });
    }

    if (correo) {
      query.andWhere('usuarios.correo ILIKE :correo', {
        correo: `%${correo}%`,
      });
    }

    if (telefono) {
      query.andWhere('usuarios.telefono ILIKE :telefono', {
        telefono: `%${telefono}%`,
      });
    }

    if (activo !== undefined) {
      query.andWhere('usuarios.activo = :activo', {
        activo,
      });
    }

    if (rolId) {
      query.andWhere('usuarios.rolId = :rolId', {
        rolId,
      });
    }

    if (sucursalId) {
      query.andWhere('usuarios.sucursalId = :sucursalId', {
        sucursalId,
      });
    }

    if (sidx) {
      query.orderBy(`usuarios.${sidx}`, sord);
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

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      select: ['id', 'usuario', 'nombre', 'apellido', 'correo', 'telefono', 'clave', 'activo', 'ultimoLogin', 'rolId', 'sucursalId'],
      relations: ['rol', 'sucursal']
    });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<{ message: string; usuario: Usuario }> {
    const usuario = await this.findOne(id);
  
    if (updateUsuarioDto.usuario) {
      const existe = await this.usuariosRepository.findOne({
        where: { usuario: updateUsuarioDto.usuario.trim() },
      });

      if (existe && existe.id !== id) {
        throw new ConflictException('El usuario ya existe');
      }
    }

    const normalizedUsuarioDto = {
      ...updateUsuarioDto,
      usuario: updateUsuarioDto.usuario?.trim(),
      nombre: updateUsuarioDto.nombre?.trim(),
      apellido: updateUsuarioDto.apellido?.trim(),
      correo: updateUsuarioDto.correo?.trim() || null,
      telefono: updateUsuarioDto.telefono?.trim() || null,
    };
  
    if (normalizedUsuarioDto.rolId) {
      const rol = await this.rolesRepository.findOneBy({ id: normalizedUsuarioDto.rolId });
      if (!rol) throw new NotFoundException('El rol especificado no existe');
      usuario.rol = rol;
    }
  
    if (normalizedUsuarioDto.sucursalId) {
      const sucursal = await this.sucursalesRepository.findOneBy({ id: normalizedUsuarioDto.sucursalId });
      if (!sucursal) throw new NotFoundException('La sucursal especificada no existe');
      usuario.sucursal = sucursal;
    }
  
    Object.assign(usuario, normalizedUsuarioDto);
    const updatedUsuario = await this.usuariosRepository.save(usuario);
  
    return { message: 'Usuario actualizado correctamente', usuario: updatedUsuario };
  }
  
  async remove(id: number): Promise<{ message: string }> {
    const usuario = await this.findOne(id);

    await this.checkRelations(id);

    await this.usuariosRepository.remove(usuario);
    return { message: 'Usuario eliminado correctamente' };
  }

  private async checkRelations(id: number): Promise<void> {
    const relations = [
      { repository: this.comprasRepository, entity: 'Compras', field: 'usuario' },
      { repository: this.ventasRepository, entity: 'Ventas', field: 'usuario' },
      { repository: this.movimientosRepository, entity: 'Movimientos de Inventarios', field: 'usuario' },
      { repository: this.cajasRepository, entity: 'Apertura de Cajas', field: 'usuarioApertura' },
      { repository: this.cajasRepository, entity: 'Cierre de Cajas', field: 'usuarioCierre' },
    ];

    for (const relation of relations) {
      const count = await relation.repository.count({
        where: {
          [relation.field]: { id }
        },
      });

      if (count > 0) {
        throw new ConflictException(
          `No se puede eliminar el usuario porque está relacionado con ${relation.entity}`
        );
      }
    }
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

    delete usuarioOk.clave;
    return usuarioOk;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.usuariosRepository.update(userId, { clave: hashedPassword });
  }
}
