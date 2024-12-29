import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductoDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo codigo es obligatorio' })
  @IsString({ message: 'El campo codigo debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo codigo no debe ser mayor a 50 caracteres',
  })
  readonly codigo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El campo nombre no debe ser mayor a 100 caracteres',
  })
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo descripcion es obligatorio' })
  @IsString({ message: 'El campo descripcion debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'El campo descripcion no debe ser mayor a 255 caracteres',
  })
  readonly descripcion: string;

  @ApiProperty()
  @IsDefined({ message: 'El campo id_categoria debe estar definido' })
  @IsNumber({}, { message: 'El campo id_categoria debe ser de tipo numérico' })
  readonly idCategoria: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo precio_compra es obligatorio' })
  @IsNumber({}, { message: 'El campo precio_compra debe ser un numero' })
  readonly precioCompra: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo precio_venta es obligatorio' })
  @IsNumber({}, { message: 'El campo precio_venta debe ser de tipo numero' })
  readonly precioVenta: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
  @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
  readonly activo: boolean;

  @ApiProperty()
  @IsDefined({ message: 'El campo id_proveedor debe estar definido' })
  @IsNumber({}, { message: 'El campo id_proveedor debe ser de tipo numérico' })
  readonly idProveedor: number;
}