import { PartialType } from '@nestjs/swagger';
import { CreateTipoUnidadDto } from './create-tipo_unidad.dto';

export class UpdateTipoUnidadDto extends PartialType(CreateTipoUnidadDto) {}