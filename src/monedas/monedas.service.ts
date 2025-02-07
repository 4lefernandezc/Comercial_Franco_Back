import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Moneda } from './entities/moneda.entity';
import { Repository, DataSource } from 'typeorm';
import { QueryMonedaDto } from './dto/query-moneda.dto';
import { ConvertMonedaDto, ConvertMonedaResponseDto } from './dto/convert-moneda.dto';

@Injectable()
export class MonedasService {
  constructor(
    @InjectRepository(Moneda)
    private monedasRepository: Repository<Moneda>,
    private dataSource: DataSource,
  ) {}

  async create(createMonedaDto: CreateMonedaDto): Promise<Moneda> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingMoneda = await this.monedasRepository.findOne({
        where: [
          { nombre: createMonedaDto.nombre.trim() },
          { codigo: createMonedaDto.codigo.trim() },
        ],
      });

      if (existingMoneda) {
        throw new BadRequestException(
          `Ya existe una moneda con el nombre o código proporcionado`,
        );
      }

      const moneda = this.monedasRepository.create({
        codigo: createMonedaDto.codigo.trim().toUpperCase(),
        nombre: createMonedaDto.nombre.trim(),
        simbolo: createMonedaDto.simbolo.trim(),
        esPrincipal: createMonedaDto.esPrincipal,
        tasaCambioBase: createMonedaDto.tasaCambioBase,
      });

      await queryRunner.manager.save(moneda);
      await queryRunner.commitTransaction();
      return moneda;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la moneda');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(q: QueryMonedaDto) {
    try {
      const { page = 1, limit = 10, nombre, sidx = 'id', sord = 'ASC' } = q;
      const query = this.monedasRepository
        .createQueryBuilder('monedas')
        .select();

      if (nombre) {
        query.andWhere('monedas.nombre ILIKE :nombre', {
          nombre: `%${nombre}%`,
        });
      }

      const [result, total] = await query
        .orderBy(`monedas.${sidx}`, sord)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: result,
        total,
        page,
        pageCount: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las monedas');
    }
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const moneda = await this.findOne(id);

      if (updateMonedaDto.nombre || updateMonedaDto.codigo) {
        const existingMoneda = await this.monedasRepository.findOne({
          where: [
            { nombre: updateMonedaDto.nombre?.trim() },
            { codigo: updateMonedaDto.codigo?.trim() },
          ],
        });

        if (existingMoneda && existingMoneda.id !== id) {
          throw new BadRequestException(
            `Ya existe una moneda con el nombre o código proporcionado`,
          );
        }
      }

      const monedaUpdate = Object.assign(moneda, {
        ...updateMonedaDto,
        codigo: updateMonedaDto.codigo?.trim().toUpperCase(),
        nombre: updateMonedaDto.nombre?.trim(),
        simbolo: updateMonedaDto.simbolo?.trim(),
      });

      await queryRunner.manager.save(monedaUpdate);
      await queryRunner.commitTransaction();

      return {
        message: 'La moneda ha sido actualizada exitosamente',
        moneda: monedaUpdate,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la moneda');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<{ message: string; moneda: Moneda }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const moneda = await this.findOne(id);
      await queryRunner.manager.remove(moneda);
      await queryRunner.commitTransaction();

      return {
        message: 'La moneda ha sido eliminada exitosamente',
        moneda,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al eliminar la moneda');
    } finally {
      await queryRunner.release();
    }
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
          montosConvertidos: montos.map(monto => Number(monto.toFixed(4))),
          tasaConversion: 1,
          detalleConversion: {
            monedaOrigen: monedaOrigen.toUpperCase(),
            monedaDestino: monedaDestino.toUpperCase(),
            tasaOrigen: 1,
            tasaDestino: 1
          }
        };
      }

      // Buscar las monedas usando el repositorio
      const [monedaOrig, monedaDest] = await Promise.all([
        this.monedasRepository.findOneBy({ 
          codigo: monedaOrigen.toUpperCase() 
        }),
        this.monedasRepository.findOneBy({ 
          codigo: monedaDestino.toUpperCase() 
        })
      ]);

      // Validar que existan ambas monedas
      if (!monedaOrig) {
        throw new NotFoundException(
          `No se encontró la moneda de origen con código ${monedaOrigen}`
        );
      }
      if (!monedaDest) {
        throw new NotFoundException(
          `No se encontró la moneda de destino con código ${monedaDestino}`
        );
      }

      // Validar tasas de cambio
      if (monedaOrig.tasaCambioBase === null || monedaOrig.tasaCambioBase <= 0) {
        throw new BadRequestException(
          `La moneda ${monedaOrig.codigo} no tiene una tasa de cambio válida`
        );
      }
      if (monedaDest.tasaCambioBase === null || monedaDest.tasaCambioBase <= 0) {
        throw new BadRequestException(
          `La moneda ${monedaDest.codigo} no tiene una tasa de cambio válida`
        );
      }

      const tasaOrigen = Number(monedaOrig.tasaCambioBase);
      const tasaDestino = Number(monedaDest.tasaCambioBase);

      // Realizar la conversión:
      const montosConvertidos = montos.map(monto => {
        const montoEnBase = monto * tasaOrigen;
        const montoFinal = montoEnBase / tasaDestino;
        return Number(montoFinal.toFixed(4));
      });

      return { 
        montosConvertidos,
        tasaConversion: Number((tasaOrigen / tasaDestino).toFixed(4)),
        detalleConversion: {
          monedaOrigen: monedaOrig.codigo,
          monedaDestino: monedaDest.codigo,
          tasaOrigen,
          tasaDestino
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error en la conversión de moneda:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error al realizar la conversión de moneda'
      );
    }
  }
}