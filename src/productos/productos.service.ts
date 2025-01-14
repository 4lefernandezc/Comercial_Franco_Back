import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { QueryProductoDto } from './dto/query-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const codigoExiste = await this.productosRepository.findOneBy({
      codigo: createProductoDto.codigo.trim(),
    });

    if (codigoExiste) {
      throw new ConflictException('El producto con ese código ya existe');
    }

    const nombreExiste = await this.productosRepository.findOneBy({
      nombre: createProductoDto.nombre.trim(),
    });

    if (nombreExiste) {
      throw new ConflictException('El producto con ese nombre ya existe');
    }

    const producto = new Producto();
    producto.codigo = createProductoDto.codigo.trim();
    producto.nombre = createProductoDto.nombre.trim();
    producto.descripcion = createProductoDto.descripcion?.trim() || null;
    producto.precioCompra = createProductoDto.precioCompra;
    producto.precioVenta = createProductoDto.precioVenta;
    producto.activo = createProductoDto.activo;
    producto.categoria = { id: createProductoDto.idCategoria } as Categoria;
    producto.proveedor = { id: createProductoDto.idProveedor } as Proveedor;
    return this.productosRepository.save(producto);
  }

  async findAll(q: QueryProductoDto){
    const { page, limit } = q;
    const query = this.productosRepository.createQueryBuilder('productos').select([
      'productos.id',
      'productos.codigo',
      'productos.nombre',
      'productos.descripcion',
      'productos.precioCompra',
      'productos.precioVenta',
      'productos.activo',
      'productos.idCategoria',
      'productos.idProveedor',
      'productos.fechaCreacion',
      'productos.fechaModificacion',
    ])
    .leftJoinAndSelect('productos.categoria', 'categoria')
    .leftJoinAndSelect('productos.proveedor', 'proveedor');

    if (q.nombre) {
      query.andWhere('productos.nombre ILIKE :nombre', {
        nombre: `%${q.nombre}%`,
      });
    }

    if (q.activo !== undefined) {
      query.andWhere('productos.activo = :activo', {
        activo: q.activo,
      });
    }

    if (q.codigo) {
      query.andWhere('productos.codigo ILIKE :codigo', {
        codigo: `%${q.codigo}%`,
      });
    }
    if (q.sidx) {
      query.orderBy(`productos.id`, q.sord);
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

  async findByCategoria(idCategoria: number): Promise<Producto[]> {
    return this.productosRepository
      .createQueryBuilder('productos')
      .innerJoin('productos.categoria', 'categoria')
      .where('categoria.id = :idCategoria', { idCategoria })
      .getMany();
  }

  async findByProveedor(idProveedor: number): Promise<Producto[]> {
    return this.productosRepository
      .createQueryBuilder('productos')
      .innerJoin('productos.proveedor', 'proveedor')
      .where('proveedor.id = :idProveedor', { idProveedor })
      .getMany();
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: ['categoria', 'proveedor'],
    });
    if (!producto) {
      throw new NotFoundException(
        `El Productocon el id #${id} no se encuentra`,
      );
    }
    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<{ message: string; producto: Producto }> {
    const producto = await this.findOne(id);
    const updatedProducto = Object.assign(producto, updateProductoDto);
    await this.productosRepository.save(updatedProducto);
    return {
      message: 'Producto actualizado exitosamente',
      producto: updatedProducto,
    };
  }

  async remove(id: number): Promise<{ message: string; producto: Producto }> {
    const producto = await this.findOne(id);
    await this.productosRepository.remove(producto);
    return {
      message: 'Producto eliminado exitosamente',
      producto,
    };
  }
}
