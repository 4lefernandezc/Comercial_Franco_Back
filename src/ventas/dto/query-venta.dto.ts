import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryVentaDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'VEN-1' })
  @IsOptional()
  @IsString()
  readonly numeroDocumento?: string;

  @ApiPropertyOptional({ example: 'tarjeta' })
  @IsOptional()
  @IsString()
  readonly metodoPago?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly totalVenta?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly descuentoTotal?: number;

  @ApiPropertyOptional({ example: 'completada' })
  @IsOptional()
  @IsString()
  readonly estado?: string;
}
