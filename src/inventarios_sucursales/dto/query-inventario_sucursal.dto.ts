import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryInventarioSucursalDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idProducto?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idSucursal?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  readonly stockActual?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  readonly stockMinimo?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  readonly stockMaximo?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly tipoUnidadId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  readonly seVendeFraccion?: boolean;
}