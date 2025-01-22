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

  async findAll(q: QueryProductoDto) {
    const {
      page,
      limit,
      codigo,
      nombre,
      descripcion,
      precioCompra,
      precioVenta,
      idCategoria,
      idProveedor,
      activo,
      sidx,
      sord,
    } = q;

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

    if (codigo) {
      query.andWhere('productos.codigo ILIKE :codigo', {
        codigo: `%${codigo}%`,
      });
    }

    if (nombre) {
      query.andWhere('productos.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (descripcion) {
      query.andWhere('productos.descripcion ILIKE :descripcion', {
        descripcion: `%${descripcion}%`,
      });
    } 

    if (precioCompra) {
      query.andWhere('productos.precioCompra = :precioCompra', {
        precioCompra,
      });
    }

    if (precioVenta) {
      query.andWhere('productos.precioVenta = :precioVenta', {
        precioVenta,
      });
    }

    if (idCategoria) {
      query.andWhere('productos.idCategoria = :idCategoria', {
        idCategoria,
      });
    }

    if (idProveedor) {
      query.andWhere('productos.idProveedor = :idProveedor', {
        idProveedor,
      });
    }

    if (activo !== undefined) {
      query.andWhere('productos.activo = :activo', {
        activo,
      });
    }

    if (sidx) {
      query.orderBy(`productos.${sidx}`, sord);
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
  
    if (updateProductoDto.codigo) {
      const codigoExiste = await this.productosRepository.findOneBy({
        codigo: updateProductoDto.codigo.trim(),
      });
  
      if (codigoExiste && codigoExiste.id !== id) {
        throw new ConflictException('El producto con ese código ya existe');
      }
    }
  
    if (updateProductoDto.nombre) {
      const nombreExiste = await this.productosRepository.findOneBy({
        nombre: updateProductoDto.nombre.trim(),
      });
  
      if (nombreExiste && nombreExiste.id !== id) {
        throw new ConflictException('El producto con ese nombre ya existe');
      }
    }
  
    if (updateProductoDto.idCategoria) {
      producto.categoria = { id: updateProductoDto.idCategoria } as Categoria;
    }
  
    if (updateProductoDto.idProveedor) {
      producto.proveedor = { id: updateProductoDto.idProveedor } as Proveedor;
    }
  
    const updatedProducto = Object.assign(producto, {
      ...updateProductoDto,
      codigo: updateProductoDto.codigo?.trim(),
      nombre: updateProductoDto.nombre?.trim(),
      descripcion: updateProductoDto.descripcion?.trim(),
    });
  
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
