import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryProveedorDto extends GetPaginationSortParamsDto {
  @ApiPropertyOptional({ example: 'Coca Cola' })
  @IsOptional()
  @IsString()
  readonly nombre?: string;
  
  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  readonly nit?: string;

  @ApiPropertyOptional({ example: '7892345' })
  @IsOptional()
  @IsString()
  readonly telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Bolivar #45' })
  @IsOptional()
  @IsString()
  readonly direccion?: string;

  @ApiPropertyOptional({ example: 'prueba@gmail.com' })
  @IsOptional()
  @IsString()
  readonly correo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  readonly activo?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  readonly idMoneda?: number;
}