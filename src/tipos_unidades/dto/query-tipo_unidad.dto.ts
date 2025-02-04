import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryTipoUnidadDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'Kilogramo' })
  @IsOptional()
  @IsString()
  readonly nombre?: string;
  
  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  readonly abreviatura: string;
}