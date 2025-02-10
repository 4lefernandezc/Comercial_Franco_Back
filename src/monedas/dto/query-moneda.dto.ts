import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryMonedaDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'BOB' })
  @IsOptional()
  @IsString()
  readonly codigo?: string;
  
  @ApiPropertyOptional({ example: 'Bolivianos' })
  @IsOptional()
  @IsString()
  readonly nombre?: string;

  @ApiPropertyOptional({ example: 'Bs' })
  @IsOptional()
  @IsString()
  readonly simbolo?: string;
}