import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCotizacionDto } from './create-cotizacion.dto';

export class UpdateCotizacionDto extends PartialType(CreateCotizacionDto) {
  @ApiProperty({ description: 'Estado de la cotización', example: 'pendiente', enum: ['completada', 'anulada', 'pendiente'] })
  @IsString()
  @IsOptional()
  @IsEnum(['completada', 'anulada', 'pendiente'])
  estado?: string;
}