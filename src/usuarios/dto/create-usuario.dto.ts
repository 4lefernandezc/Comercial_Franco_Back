import { ApiProperty } from '@nestjs/swagger';
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

export class CreateUsuarioDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo usuario es obligatorio' })
  @IsString({ message: 'El campo usuario debe ser tipo cadena' })
  @MaxLength(20, {
    message: 'El campo usuario no debe ser mayor a 20 caracteres',
  })
  readonly usuario: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
  @IsString({ message: 'El campo nombre debe ser tipo cadena' })
  @MaxLength(100, {
    message: 'El campo nombre no debe ser mayor a 100 caracteres',
  })
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo apellido es obligatorio' })
  @IsString({ message: 'El campo apellido debe ser tipo cadena' })
  @MaxLength(100, {
    message: 'El campo apellido no debe ser mayor a 100 caracteres',
  })
  readonly apellido: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'El campo correo debe ser de tipo cadena' })
  @IsEmail( {}, { message: 'El campo correo debe ser un correo electrónico válido' },
  )
  @MaxLength(255, {
    message: 'El campo correo no debe ser mayor a 255 caracteres',
  })
  readonly correo?: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'El campo teléfono debe ser de tipo cadena' })
  @MaxLength(20, {
    message: 'El campo teléfono no debe ser mayor a 20 caracteres',
  })
  readonly telefono?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo clave es obligatorio' })
  @IsString({ message: 'El campo clave debe ser tipo cadena' })
  @MaxLength(255, {
    message: 'El campo clave no debe ser mayor a 255 caracteres',
  })
  readonly clave: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
  @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
  readonly activo: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo rol_id es obligatorio' })
  @IsDefined({ message: 'El campo rol_id debe estar definido' })
  @IsNumber({}, { message: 'El campo rol_id debe ser de tipo numérico' })
  readonly rolId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo sucursal_id es obligatorio' })
  @IsDefined({ message: 'El campo sucursal_id debe estar definido' })
  @IsNumber({}, { message: 'El campo sucursal_id debe ser de tipo numérico' })
  readonly sucursalId: number;
}
