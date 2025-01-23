import { PartialType } from '@nestjs/swagger';
import { CreateMovimientoInventarioDto } from './create-movimiento_inventario.dto';

export class UpdateMovimientoInventarioDto extends PartialType(CreateMovimientoInventarioDto) {}
