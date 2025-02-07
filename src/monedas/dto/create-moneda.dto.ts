import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMonedaDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo código no debe ser vacío' })
  @IsString({ message: 'El campo código debe ser de tipo cadena' })
  @MaxLength(3, {
    message: 'El campo código no debe ser mayor a 3 caracteres',
  })
  readonly codigo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe ser vacío' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo nombre no debe ser mayor a 50 caracteres',
  })
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo símbolo no debe ser vacío' })
  @IsString({ message: 'El campo símbolo debe ser de tipo cadena' })
  @MaxLength(5, {
    message: 'El campo símbolo no debe ser mayor a 5 caracteres',
  })
  readonly simbolo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo es_principal no debe ser vacío' })
  @IsBoolean({ message: 'El campo es_principal debe ser de tipo booleano' })
  readonly esPrincipal: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo tasaCambioBase no debe ser vacío' })
  @IsNumber({}, { message: 'El campo tasaCambioBase debe ser de tipo numérico' })
  readonly tasaCambioBase?: number;
}
