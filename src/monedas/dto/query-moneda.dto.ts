import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryMonedaDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'Bolivianos' })
  @IsOptional()
  @IsString()
  readonly nombre?: string;
}