import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MovimientosInventariosService } from './movimientos_inventarios.service';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento_inventario.dto';
import { UpdateMovimientoInventarioDto } from './dto/update-movimiento_inventario.dto';
import { QueryMovimientoInventarioDto } from './dto/query-movimineto_inventario-dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Movimientos_Inventarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movimientos-inventarios')
export class MovimientosInventariosController {
  constructor(private readonly movimientosInventariosService: MovimientosInventariosService) {}

  @Post()
  create(@Body() createMovimientoInventarioDto: CreateMovimientoInventarioDto) {
    return this.movimientosInventariosService.create(createMovimientoInventarioDto);
  }

  @Get()
  findAll(@Query() query: QueryMovimientoInventarioDto) {
    return this.movimientosInventariosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosInventariosService.findOne(+id);
  }

  @Patch(':id/cancelar')
  cancelMovement(@Param('id') id: string) {
    return this.movimientosInventariosService.cancelMovement(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosInventariosService.remove(+id);
  }
}