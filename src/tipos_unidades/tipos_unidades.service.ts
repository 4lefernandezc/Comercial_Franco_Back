import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateTipoUnidadDto } from './dto/create-tipo_unidad.dto';
import { UpdateTipoUnidadDto } from './dto/update-tipo_unidad.dto';
import { QueryTipoUnidadDto } from './dto/query-tipo_unidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoUnidad } from './entities/tipo_unidad.entity';
import { Repository } from 'typeorm';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';

@Injectable()
export class TiposUnidadesService {
  constructor(
    @InjectRepository(TipoUnidad)
    private tipoUnidadRepository: Repository<TipoUnidad>,
    @InjectRepository(InventarioSucursal)
    private inventariosRepository: Repository<InventarioSucursal>,
  ) {}

  async create(createTipoUnidadDto: CreateTipoUnidadDto): Promise<TipoUnidad> {
    const tipoUnidad = await this.tipoUnidadRepository.findOne({
      where: {
        nombre: createTipoUnidadDto.nombre.toLowerCase(),
      },
    });
    if (tipoUnidad)
      throw new BadRequestException(
        'Ya existe un tipo de unidad con ese nombre',
      );
    const newTipoUnidad = this.tipoUnidadRepository.create({
      ...createTipoUnidadDto,
      nombre: createTipoUnidadDto.nombre.toLowerCase().trim(),
      abreviatura: createTipoUnidadDto.abreviatura?.trim() || null,
    });
    return this.tipoUnidadRepository.save(newTipoUnidad);
  }

  async findAll(q: QueryTipoUnidadDto) {
    const { page, limit, nombre, abreviatura, sidx, sord } = q;
    const query = this.tipoUnidadRepository
      .createQueryBuilder('tipos_unidades')
      .select([
        'tipos_unidades.id',
        'tipos_unidades.nombre',
        'tipos_unidades.abreviatura',
        'tipos_unidades.fechaCreacion',
        'tipos_unidades.fechaModificacion',
      ]);

    if (nombre) {
      query.andWhere('tipos_unidades.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (abreviatura) {
      query.andWhere('tipos_unidades.abreviatura ILIKE :abreviatura', {
        abreviatura: `%${abreviatura}%`,
      });
    }

    if (sidx) {
      query.orderBy(`tipos_unidades.${sidx}`, sord);
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

  async findOne(id: number): Promise<TipoUnidad> {
   const tipoUnidad = await this.tipoUnidadRepository.findOneBy({ id });
    if (!tipoUnidad)
      throw new BadRequestException('No existe un tipo de unidad con ese ID');
    return tipoUnidad;
  }

  async update(
    id: number,
    updateTipoUnidadDto: UpdateTipoUnidadDto,
  ): Promise<{ message: string; tipoUnidad: TipoUnidad }> {
    const tipoUnidad = await this.findOne(id);

    let updatedData = { ...updateTipoUnidadDto };

    if (updateTipoUnidadDto.nombre) {
      const existingTipoUnidad = await this.tipoUnidadRepository.findOne({
        where: {
          nombre: updateTipoUnidadDto.nombre.toLowerCase().trim(),
        },
      });

      if (existingTipoUnidad && existingTipoUnidad.id !== id) {
        throw new BadRequestException('Ya existe un tipo de unidad con ese nombre');
      }

      updatedData = {
        ...updatedData,
        nombre: updateTipoUnidadDto.nombre.toLowerCase().trim(),
      };
    }

    updatedData = {
      ...updatedData,
      abreviatura: updateTipoUnidadDto.abreviatura?.trim() || null,
    };

    const tipoUnidadUpdate = Object.assign(tipoUnidad, updatedData);
    const updatedTipoUnidad = await this.tipoUnidadRepository.save(tipoUnidadUpdate);

    return {
      message: 'El tipo de unidad ha sido actualizado exitosamente',
      tipoUnidad: updatedTipoUnidad,
    };
  }

  async remove(id: number): Promise<{ message: string; tipoUnidad: TipoUnidad }> {
    const tipoUnidad = await this.findOne(id);

    // Verificamos si hay inventarios relacionados al tipo de unidad
    const relatedInventariosCount = await this.inventariosRepository.count({
      where: {
        tipoUnidad: { id }
      }
    });

    if (relatedInventariosCount > 0) {
      throw new ConflictException('No se puede eliminar el tipo de unidad porque porque está relacionado con uno o más inventarios');
    }

    await this.tipoUnidadRepository.remove(tipoUnidad);
    return {
      message: 'El tipo de unidad ha sido eliminado exitosamente',
      tipoUnidad,
    };
  }
}