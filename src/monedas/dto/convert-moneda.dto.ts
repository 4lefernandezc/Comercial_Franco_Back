import { IsNumber, IsNotEmpty, IsString, Min, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertMonedaDto {
  @ApiProperty({
    description: 'Código de la moneda de destino',
    example: 'BOB',
    minLength: 3,
    maxLength: 3
  })
  @IsString()
  @IsNotEmpty()
  monedaOrigen: string;

  @ApiProperty({
    description: 'Código de la moneda de origen',
    example: 'USD',
    minLength: 3,
    maxLength: 3
  })
  @IsString()
  @IsNotEmpty()
  monedaDestino: string;

  @ApiProperty({
    description: 'Array de montos a convertir',
    example: [100, 200, 1, 50],
    type: [Number],
    minimum: 0.01
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(0.01, { each: true })
  @IsNotEmpty()
  montos: number[];
}

export class ConvertMonedaResponseDto {
  @ApiProperty({
    description: 'Array de montos convertidos a la moneda de destino',
    example: [696.48, 1234.56]
  })
  montosConvertidos: number[];
}