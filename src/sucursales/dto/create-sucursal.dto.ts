import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSucursalDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe ser vacío' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(150, {
    message: 'El campo nombre no debe ser mayor a 150 caracteres',
  })
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo direccion no debe ser vacío' })
  @IsString({ message: 'El campo direccion debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'El campo direccion no debe ser mayor a 255 caracteres',
  })
  readonly direccion: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo telefono no debe ser vacío' })
  @IsString({ message: 'El campo telefono debe ser de tipo cadena' })
  @MaxLength(15, {
    message: 'El campo telefono no debe ser mayor a 15 caracteres',
  })
  readonly telefono: string;

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

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
  @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
  readonly activo: boolean;
}
