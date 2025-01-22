import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryUsuarioDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'Jperez' })
  @IsOptional()
  @IsString()
  readonly usuario?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  readonly nombre?: string;

  @ApiPropertyOptional({ example: 'Delgadillo' })
  @IsOptional()
  @IsString()
  readonly apellido?: string;

  @ApiPropertyOptional({ example: 'pepito@gmail.com' })
  @IsOptional()
  @IsString()
  readonly correo?: string;

  @ApiPropertyOptional({ example: '7456288' })
  @IsOptional()
  @IsString()
  readonly telefono?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly rolId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly sucursalId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  readonly activo?: boolean;
}
