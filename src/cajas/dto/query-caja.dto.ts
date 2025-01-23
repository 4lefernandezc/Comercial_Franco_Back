import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryCajaDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  readonly montoInicial?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  readonly montoFinal?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  readonly totalIngresos?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  readonly totalEgresos?: number;

  @ApiPropertyOptional({ example: '2025-01-19' })
  @IsOptional()
  @IsDateString()
  readonly fechaApertura?: Date;

  @ApiPropertyOptional({ example: '2025-01-19' })
  @IsOptional()
  @IsDateString()
  readonly fechaCierre?: Date;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  readonly fechaAperturaInicio?: Date;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  readonly fechaAperturaFin?: Date;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  readonly fechaCierreInicio?: Date;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  readonly fechaCierreFin?: Date;

  @ApiPropertyOptional({ example: 'cerrada' })
  @IsOptional()
  @IsString()
  readonly estado?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly usuarioAperturaId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly usuarioCierreId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly sucursalId?: number;
}
