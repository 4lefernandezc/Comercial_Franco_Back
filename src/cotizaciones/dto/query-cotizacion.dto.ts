import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryCotizacionDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'COT-1' })
  @IsOptional()
  @IsString()
  readonly numeroDocumento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly totalVenta?: number;

  @ApiPropertyOptional({ example: 'completada' })
  @IsOptional()
  @IsString()
  readonly estado?: string;
}
