import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class DetalleCotizacionDto {
  @ApiProperty({ description: 'ID del producto', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  idProducto: number;

  @ApiProperty({ description: 'Cantidad del producto', example: 2.5 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La cantidad debe ser un número con máximo 2 decimales' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  @Max(1000000, { message: 'Cantidad demasiado grande' })
  cantidad: number;

  @ApiProperty({ description: 'Descuento aplicado al producto', example: 10.0, nullable: true })
  @IsNumber()
  @IsOptional()
  descuento?: number;
}

export class CreateCotizacionDto {
  @ApiProperty({ description: 'ID del cliente asociado a la venta', example: 1, nullable: true })
  @IsNumber()
  @IsOptional()
  idCliente?: number;

  @ApiProperty({ description: 'Método de pago utilizado', example: 'efectivo' })
  @IsString()
  @IsNotEmpty()
  metodoPago: string;

  @ApiProperty({ description: 'ID del usuario que realiza la venta', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  idUsuario: number;

  @ApiProperty({ description: 'ID de la sucursal donde se realiza la venta', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  idSucursal: number;


  @ApiProperty({
    description: 'Detalles de los productos cotizados',
    type: [DetalleCotizacionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCotizacionDto)
  detalles: DetalleCotizacionDto[];

  @ApiProperty({ description: 'Tipo de documento', example: 'COT', enum: ['COT', 'FAC'] })
  @IsString()
  @IsNotEmpty()
  tipoDocumento: string;

  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Perez', nullable: true })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ description: 'Documento del cliente', example: '12345678', nullable: true })
  @IsString()
  @IsOptional()
  documento?: string;
}