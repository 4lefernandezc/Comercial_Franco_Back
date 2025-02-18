import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Min,
  MaxLength,
  IsDefined,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateInventarioSucursalDto {
  @ApiProperty()
  @IsDefined({ message: 'El campo id_producto debe estar definido' })
  @IsNumber({}, { message: 'El campo id_producto debe ser de tipo numérico' })
  readonly idProducto: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo id_sucursal debe estar definido' })
  @IsNumber({}, { message: 'El campo id_sucursal debe ser de tipo numérico' })
  readonly idSucursal: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo stock actual es obligatorio' })
  @IsNumber({}, { message: 'El campo stock actual debe ser de tipo numero' })
  @Min(0, { message: 'El stock actual no puede ser negativo.' })
  readonly stockActual: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo stock minimo es obligatorio' })
  @IsNumber({}, { message: 'El campo stock minimo debe ser de tipo numero' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo.' })
  readonly stockMinimo: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'El campo stock maximo debe ser de tipo numero' })
  @Min(0, { message: 'El stock máximo no puede ser negativo.' })
  readonly stockMaximo?: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo tipo_unidad_id debe estar definido' })
  @IsNumber({}, { message: 'El campo tipo_unidad_id debe ser de tipo numérico' })
  readonly tipoUnidadId: number;

  @ApiProperty({ 
    description: 'Indica si el producto se puede vender en fracciones', 
    default: false 
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo se_vende_fraccion debe ser un valor booleano' })
  readonly seVendeFraccion?: boolean;
}
