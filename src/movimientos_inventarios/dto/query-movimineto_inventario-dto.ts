import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryMovimientoInventarioDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'documentoReferencia' })
  @IsOptional()
  @IsString()
  readonly documentoReferencia?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idProducto?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idSucursal?: number;

  @ApiPropertyOptional({ example: 'ENTRADA' })
  @IsOptional()
  @IsString()
  readonly tipoMovimiento?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idUsuario?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idSucursalDestino?: number;
}