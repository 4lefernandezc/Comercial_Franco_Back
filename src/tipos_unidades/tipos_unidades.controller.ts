import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TiposUnidadesService } from './tipos_unidades.service';
import { CreateTipoUnidadDto } from './dto/create-tipo_unidad.dto';
import { UpdateTipoUnidadDto } from './dto/update-tipo_unidad.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryTipoUnidadDto } from './dto/query-tipo_unidad.dto';

@ApiTags('Tipos_Unidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tipos-unidades')
export class TiposUnidadesController {
  constructor(private readonly tiposUnidadesService: TiposUnidadesService) {}

  @Post()
  create(@Body() createTipoUnidadDto: CreateTipoUnidadDto) {
    return this.tiposUnidadesService.create(createTipoUnidadDto);
  }

  @Get()
  findAll(@Query() query: QueryTipoUnidadDto) {
    return this.tiposUnidadesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposUnidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoUnidadDto: UpdateTipoUnidadDto) {
    return this.tiposUnidadesService.update(+id, updateTipoUnidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposUnidadesService.remove(+id);
  }
}