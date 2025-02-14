import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryProductoDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'P-001' })
  @IsOptional()
  @IsString()
  readonly codigo?: string;

  @ApiPropertyOptional({ example: 'Taladro' })
  @IsOptional()
  @IsString()
  readonly nombre?: string;

  @ApiPropertyOptional({ example: 'Caja' })
  @IsOptional()
  @IsString()
  readonly presentacion?: string;

  @ApiPropertyOptional({ example: '10x10x10' })
  @IsOptional()
  @IsString()
  readonly dimensiones?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  readonly precioCompra?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  readonly precioVenta?: number;

  @ApiPropertyOptional({ example: 10.50})
  @IsOptional()
  readonly precioAgranel?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  readonly totalPresentacion?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idCategoria?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idProveedor?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  readonly activo?: boolean;
}
