import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Moneda } from './entities/moneda.entity';
import { Repository, DataSource } from 'typeorm';
import { QueryMonedaDto } from './dto/query-moneda.dto';
import {
  ConvertMonedaDto,
  ConvertMonedaResponseDto,
} from './dto/convert-moneda.dto';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Injectable()
export class MonedasService {
  constructor(
    @InjectRepository(Moneda)
    private monedasRepository: Repository<Moneda>,
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
    private dataSource: DataSource,
  ) {}

  async create(createMonedaDto: CreateMonedaDto): Promise<Moneda> {
    const existingMonedaByNombre = await this.monedasRepository.findOne({
      where: { nombre: createMonedaDto.nombre.trim() },
    });

    if (existingMonedaByNombre) {
      throw new ConflictException(
        `Ya existe una moneda con el nombre proporcionado`,
      );
    }

    const existingMonedaByCodigo = await this.monedasRepository.findOne({
      where: { codigo: createMonedaDto.codigo.trim() },
    });

    if (existingMonedaByCodigo) {
      throw new ConflictException(
        `Ya existe una moneda con el código proporcionado`,
      );
    }

    const moneda = this.monedasRepository.create({
      codigo: createMonedaDto.codigo.trim().toUpperCase(),
      nombre: createMonedaDto.nombre.trim(),
      simbolo: createMonedaDto.simbolo.trim(),
      esPrincipal: createMonedaDto.esPrincipal,
      tasaCambioBase: createMonedaDto.tasaCambioBase,
    });

    return this.monedasRepository.save(moneda);
  }

  async findAll(q: QueryMonedaDto) {
    const { page, limit, codigo, nombre, simbolo, sidx, sord } = q;
    const query = this.monedasRepository
      .createQueryBuilder('monedas')
      .select([
        'monedas.id',
        'monedas.codigo',
        'monedas.nombre',
        'monedas.simbolo',
        'monedas.esPrincipal',
        'monedas.tasaCambioBase',
        'monedas.fechaCreacion',
        'monedas.fechaModificacion',
      ]);

    if (codigo) {
      query.andWhere('monedas.codigo ILIKE :codigo', {
        codigo: `%${codigo}%`,
      });
    }

    if (nombre) {
      query.andWhere('monedas.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (simbolo) {
      query.andWhere('monedas.simbolo ILIKE :simbolo', {
        simbolo: `%${simbolo}%`,
      });
    }

    if (sidx) {
      query.orderBy(`monedas.${sidx}`, sord);
    }

    const [result, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const parsedResult = result.map((moneda) => this.parseFloatMoneda(moneda));

    return {
      data: parsedResult,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Moneda> {
    const moneda = await this.monedasRepository.findOneBy({ id });
    if (!moneda) {
      throw new NotFoundException(`La moneda con ID ${id} no existe`);
    }
    return moneda;
  }

  async update(
    id: number,
    updateMonedaDto: UpdateMonedaDto,
  ): Promise<{ message: string; moneda: Moneda }> {
    const moneda = await this.findOne(id);

    if (updateMonedaDto.nombre) {
      const existingMonedaByNombre = await this.monedasRepository.findOne({
        where: { nombre: updateMonedaDto.nombre.trim() },
      });

      if (existingMonedaByNombre && existingMonedaByNombre.id !== id) {
        throw new ConflictException(
          `Ya existe una moneda con el nombre proporcionado`,
        );
      }
    }

    if (updateMonedaDto.codigo) {
      const existingMonedaByCodigo = await this.monedasRepository.findOne({
        where: { codigo: updateMonedaDto.codigo.trim() },
      });

      if (existingMonedaByCodigo && existingMonedaByCodigo.id !== id) {
        throw new ConflictException(
          `Ya existe una moneda con el código proporcionado`,
        );
      }
    }

    const monedaUpdate = Object.assign(moneda, {
      ...updateMonedaDto,
      codigo: updateMonedaDto.codigo?.trim().toUpperCase(),
      nombre: updateMonedaDto.nombre?.trim(),
      simbolo: updateMonedaDto.simbolo?.trim(),
    });

    await this.monedasRepository.save(monedaUpdate);

    return {
      message: 'La moneda ha sido actualizada exitosamente',
      moneda: monedaUpdate,
    };
  }

  async remove(id: number): Promise<{ message: string; moneda: Moneda }> {
    const moneda = await this.findOne(id);

    // Verificamos si hay proveedores relacionados a la moneda
    const proveedoresCount = await this.proveedoresRepository.count({
      where: {
        moneda: { id },
      },
    });

    if (proveedoresCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la moneda porque está relacionada con uno o más proveedores',
      );
    }

    await this.monedasRepository.remove(moneda);

    return {
      message: 'La moneda ha sido eliminada exitosamente',
      moneda,
    };
  }

  async convertirMoneda({
    montos,
    monedaOrigen,
    monedaDestino,
  }: ConvertMonedaDto): Promise<ConvertMonedaResponseDto> {
    try {
      // Si las monedas son iguales, retornar los mismos montos
      if (monedaOrigen.toUpperCase() === monedaDestino.toUpperCase()) {
        return {
          montosConvertidos: montos.map((monto) => Number(monto.toFixed(2))),
          tasaConversion: 1,
          detalleConversion: {
            monedaOrigen: monedaOrigen.toUpperCase(),
            monedaDestino: monedaDestino.toUpperCase(),
            tasaOrigen: 1,
            tasaDestino: 1,
          },
        };
      }

      // Buscar las monedas usando el repositorio
      const [monedaOrig, monedaDest] = await Promise.all([
        this.monedasRepository.findOneBy({
          codigo: monedaOrigen.toUpperCase(),
        }),
        this.monedasRepository.findOneBy({
          codigo: monedaDestino.toUpperCase(),
        }),
      ]);

      // Validar que existan ambas monedas
      if (!monedaOrig) {
        throw new NotFoundException(
          `No se encontró la moneda de origen con código ${monedaOrigen}`,
        );
      }
      if (!monedaDest) {
        throw new NotFoundException(
          `No se encontró la moneda de destino con código ${monedaDestino}`,
        );
      }

      // Validar tasas de cambio
      if (
        monedaOrig.tasaCambioBase === null ||
        monedaOrig.tasaCambioBase <= 0
      ) {
        throw new ConflictException(
          `La moneda ${monedaOrig.codigo} no tiene una tasa de cambio válida`,
        );
      }
      if (
        monedaDest.tasaCambioBase === null ||
        monedaDest.tasaCambioBase <= 0
      ) {
        throw new ConflictException(
          `La moneda ${monedaDest.codigo} no tiene una tasa de cambio válida`,
        );
      }

      const tasaOrigen = Number(monedaOrig.tasaCambioBase);
      const tasaDestino = Number(monedaDest.tasaCambioBase);

      // Realizar la conversión:
      const montosConvertidos = montos.map((monto) => {
        const montoEnBase = monto * tasaOrigen;
        const montoFinal = montoEnBase / tasaDestino;
        return Number(montoFinal.toFixed(2));
      });

      return {
        montosConvertidos,
        tasaConversion: Number((tasaOrigen / tasaDestino).toFixed(2)),
        detalleConversion: {
          monedaOrigen: monedaOrig.codigo,
          monedaDestino: monedaDest.codigo,
          tasaOrigen,
          tasaDestino,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error en la conversión de moneda:', error);
      throw new ConflictException(
        'Ocurrió un error al realizar la conversión de moneda',
      );
    }
  }

  private parseFloatMoneda(moneda: Moneda): Moneda {
    return {
      ...moneda,
      tasaCambioBase: moneda.tasaCambioBase
        ? parseFloat(moneda.tasaCambioBase.toString())
        : null,
    };
  }
}
