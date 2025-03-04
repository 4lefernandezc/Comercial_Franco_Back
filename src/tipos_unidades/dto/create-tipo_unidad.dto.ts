import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoUnidadDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
  @IsString({ message: 'El campo nombre debe ser de tipo string' })
  @MaxLength(50, {
    message: 'El campo nombre no debe ser mayor a 50 caracteres',
  })
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo abreviatura es obligatorio' })
  @IsString({ message: 'El campo abreviatura debe ser de tipo string' })
  @MaxLength(10, {
    message: 'El campo abreviatura no debe ser mayor a 10 caracteres',
  })
  readonly abreviatura: string;
}