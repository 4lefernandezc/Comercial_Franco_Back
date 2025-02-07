import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe ser vacío' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(150, {
    message: 'El campo nombre no debe ser mayor a 150 caracteres',
  })
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nit no debe ser vacío' })
  @IsString({ message: 'El campo nit debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo nit no debe ser mayor a 50 caracteres',
  })
  readonly nit: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo telefono no debe ser vacío' })
  @IsString({ message: 'El campo telefono debe ser de tipo cadena' })
  @MaxLength(15, {
    message: 'El campo telefono no debe ser mayor a 15 caracteres',
  })
  readonly telefono: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'El campo direccion debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'El campo direccion no debe ser mayor a 255 caracteres',
  })
  readonly direccion?: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'El campo correo debe ser de tipo cadena' })
  @IsEmail(
    {},
    { message: 'El campo correo debe ser un correo electrónico válido' },
  )
  @MaxLength(255, {
    message: 'El campo correo no debe ser mayor a 255 caracteres',
  })
  readonly correo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El campo link whatsapp debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'El campo link whatsapp no debe ser mayor a 255 caracteres',
  })
  readonly linkWhatsapp?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
  @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
  readonly activo: boolean;

  @ApiProperty()
  @IsDefined({ message: 'El campo idMoneda debe estar definido' })
  @IsNumber({}, { message: 'El campo idMoneda debe ser de tipo numérico' })
  readonly idMoneda: number;
}
