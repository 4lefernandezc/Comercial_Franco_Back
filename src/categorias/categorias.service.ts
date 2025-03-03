import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { QueryCategoriaDto } from './dto/query-categoria.dto';
import { Producto } from 'src/productos/entities/producto.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const existingCategoria = await this.categoriasRepository.findOneBy({ nombre: createCategoriaDto.nombre.trim() });
    if (existingCategoria) {
      throw new ConflictException(`La categoria con el nombre proporcionado ya existe`);
    }

    const categoria = this.categoriasRepository.create({
      nombre: createCategoriaDto.nombre.trim(),
      descripcion: createCategoriaDto.descripcion?.trim() || null,
      activo: createCategoriaDto.activo
    });
    return this.categoriasRepository.save(categoria);
  }

  async findAll(q: QueryCategoriaDto) {
    const { page, limit, nombre, descripcion, activo, sidx, sord } = q;
    const query = this.categoriasRepository.createQueryBuilder('categorias').select([
      'categorias.id',
      'categorias.nombre',
      'categorias.descripcion',
      'categorias.activo',
      'categorias.fechaCreacion',
      'categorias.fechaModificacion',
    ]);

    if (nombre) {
      query.andWhere('categorias.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (descripcion) {
      query.andWhere('categorias.descripcion ILIKE :descripcion', {
        descripcion: `%${descripcion}%`,
      });
    }

    if (activo !== undefined) {
      query.andWhere('categorias.activo = :activo', {
        activo,
      });
    }

    if (sidx) {
      query.orderBy(`categorias.${sidx}`, sord);
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

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOneBy({ id });
    if (!categoria) { throw new NotFoundException(`La categoria con el id proporcionado no existe`)}
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<{ message: string; categoria: Categoria }> {
    const categoria = await this.findOne(id);
  
    if (updateCategoriaDto.nombre) {
      const existingCategoria = await this.categoriasRepository.findOneBy({
        nombre: updateCategoriaDto.nombre.trim(),
      });
  
      if (existingCategoria && existingCategoria.id !== id) {
        throw new ConflictException(`La categoria con el nombre proporcionado ya existe`);
      }
    }
  
    const categoriaUpdate = Object.assign(categoria, {
      ...updateCategoriaDto,
      nombre: updateCategoriaDto.nombre?.trim(),
      descripcion: updateCategoriaDto.descripcion?.trim(),
    });
  
    const updatedCategoria = await this.categoriasRepository.save(categoriaUpdate);
  
    return {
      message: 'La categoria ha sido actualizada exitosamente',
      categoria: updatedCategoria,
    };
  }
  
  async remove(id: number): Promise<{ message: string; categoria?: Categoria }> {
    const categoria = await this.findOne(id);

    // Verificamos si hay productos relacionados a la categoria
    const productosCount = await this.productosRepository.count({
      where: {
        categoria: { id }
      }
    });

    if (productosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la categoria porque está relacionada con uno o más productos',
      );
    }

    await this.categoriasRepository.remove(categoria);
    return {
      message: 'La categoria ha sido eliminada exitosamente',
      categoria: categoria,
    };
  }
}
