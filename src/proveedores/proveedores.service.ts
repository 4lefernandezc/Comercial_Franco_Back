import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedore.dto';
import { QueryProveedorDto } from './dto/query-proveedor.dto';
import { Producto } from 'src/productos/entities/producto.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Proveedor } from './entities/proveedor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Moneda } from 'src/monedas/entities/moneda.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(Compra)
    private comprasRepository: Repository<Compra>,
  ) {}

  async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    const existingProveedorByName = await this.proveedoresRepository.findOneBy({
      nombre: createProveedorDto.nombre.trim(),
    });
    if (existingProveedorByName) {
      throw new ConflictException(
        `El proveedor con el nombre proporcionado ya existe`,
      );
    }

    const existingProveedorByNit = await this.proveedoresRepository.findOneBy({
      nit: createProveedorDto.nit.trim(),
    });
    if (existingProveedorByNit) {
      throw new ConflictException(
        `El proveedor con el NIT proporcionado ya existe`,
      );
    }

    const linkWhatsApp = createProveedorDto.telefono
      ? `https://wa.me/${createProveedorDto.telefono.trim()}`
      : null;

    const proveedor = this.proveedoresRepository.create({
      nombre: createProveedorDto.nombre.trim(),
      nit: createProveedorDto.nit.trim(),
      telefono: createProveedorDto.telefono,
      direccion: createProveedorDto.direccion?.trim() || null,
      correo: createProveedorDto.correo?.trim() || null,
      activo: createProveedorDto.activo,
      idMoneda: createProveedorDto.idMoneda,
      linkWhatsapp: linkWhatsApp,
    });
    return this.proveedoresRepository.save(proveedor);
  }

  async findAll(q: QueryProveedorDto) {
    const {
      page,
      limit,
      nombre,
      nit,
      telefono,
      direccion,
      correo,
      activo,
      idMoneda,
      sidx,
      sord,
    } = q;
    const query = this.proveedoresRepository
      .createQueryBuilder('proveedores')
      .select([
        'proveedores.id',
        'proveedores.nombre',
        'proveedores.nit',
        'proveedores.telefono',
        'proveedores.direccion',
        'proveedores.correo',
        'proveedores.activo',
        'proveedores.linkWhatsapp',
        'proveedores.idMoneda',
        'proveedores.fechaCreacion',
        'proveedores.fechaModificacion',
      ])
      .innerJoinAndSelect('proveedores.moneda', 'moneda');

    if (nombre) {
      query.andWhere('proveedores.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (nit) {
      query.andWhere('proveedores.nit ILIKE :nit', {
        nit: `%${nit}%`,
      });
    }

    if (telefono) {
      query.andWhere('proveedores.telefono ILIKE :telefono', {
        telefono: `%${telefono}%`,
      });
    }

    if (direccion) {
      query.andWhere('proveedores.direccion ILIKE :direccion', {
        direccion: `%${direccion}%`,
      });
    }

    if (correo) {
      query.andWhere('proveedores.correo ILIKE :correo', {
        correo: `%${correo}%`,
      });
    }

    if (idMoneda) {
      query.andWhere('proveedores.idMoneda = :idMoneda', {
        idMoneda,
      });
    }

    if (activo !== undefined) {
      query.andWhere('proveedores.activo = :activo', {
        activo,
      });
    }

    if (sidx) {
      query.orderBy(`proveedores.${sidx}`, sord);
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

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedoresRepository.findOneBy({ id });
    if (!proveedor) {
      throw new NotFoundException(
        `El proveedor con el id proporcionado no existe`,
      );
    }
    return proveedor;
  }

  async update(
    id: number,
    updateProveedorDto: UpdateProveedorDto,
  ): Promise<{ message: string; proveedor: Proveedor }> {
    const proveedor = await this.findOne(id);

    if (updateProveedorDto.nombre) {
      const existingProveedorByName =
        await this.proveedoresRepository.findOneBy({
          nombre: updateProveedorDto.nombre.trim(),
        });

      if (existingProveedorByName && existingProveedorByName.id !== id) {
        throw new ConflictException(
          `El proveedor con el nombre proporcionado ya existe`,
        );
      }
    }

    if (updateProveedorDto.nit) {
      const existingProveedorByNit = await this.proveedoresRepository.findOneBy(
        {
          nit: updateProveedorDto.nit.trim(),
        },
      );

      if (existingProveedorByNit && existingProveedorByNit.id !== id) {
        throw new ConflictException(
          `El proveedor con el NIT proporcionado ya existe`,
        );
      }
    }

    if (updateProveedorDto.idMoneda) {
      proveedor.moneda = { id: updateProveedorDto.idMoneda } as Moneda;
    }

    if (updateProveedorDto.telefono) {
      proveedor.linkWhatsapp = `https://wa.me/${updateProveedorDto.telefono.trim()}`;
    }

    const proveedorUpdate = Object.assign(proveedor, {
      ...updateProveedorDto,
      nombre: updateProveedorDto.nombre?.trim(),
      nit: updateProveedorDto.nit?.trim(),
      direccion: updateProveedorDto.direccion?.trim(),
      correo: updateProveedorDto.correo?.trim(),
      linkWhatsapp: updateProveedorDto.telefono
        ? `https://wa.me/${updateProveedorDto.telefono.trim()}`
        : proveedor.linkWhatsapp,
    });

    await this.proveedoresRepository.save(proveedorUpdate);

    return {
      message: 'El proveedor ha sido actualizado exitosamente',
      proveedor: proveedorUpdate,
    };
  }

  async remove(id: number): Promise<{ message: string; proveedor?: Proveedor }> {
    const proveedor = await this.findOne(id);

    // Verificamos si hay relaciones con productos o compras
    await this.checkRelations(id);

    await this.proveedoresRepository.remove(proveedor);
    return {
      message: 'El proveedor ha sido eliminado exitosamente',
      proveedor: proveedor,
    };
  }

  private async checkRelations(id: number): Promise<void> {
    const productosCount = await this.productosRepository.count({
      where: {
        proveedor: { id }
      }
    });

    if (productosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el proveedor porque está relacionado con uno o más productos',
      );
    }

    const comprasCount = await this.comprasRepository.count({
      where: {
        proveedor: { id }
      }
    });

    if (comprasCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el proveedor porque está relacionado con una o más compras',
      );
    }
  }
}
