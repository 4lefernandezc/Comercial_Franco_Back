import { Controller, Get, Post, Param, Body, Delete, ParseIntPipe, UseGuards, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';
import { Cotizacion } from './entities/cotizacion.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryCotizacionDto } from './dto/query-cotizacion.dto';

@ApiTags('Cotizaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Lista de todas las cotizaciones' })
  async obtenerCotizaciones(@Query() query: QueryCotizacionDto) {
    return this.cotizacionesService.obtenerCotizaciones(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Detalle de una cotización específica' })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  async obtenerCotizacionPorId(@Param('id', ParseIntPipe) id: number): Promise<Cotizacion> {
    return this.cotizacionesService.obtenerCotizacionPorId(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Cotización creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearCotizacion(@Body() createCotizacionDto: CreateCotizacionDto): Promise<Cotizacion> {
    return this.cotizacionesService.crearCotizacion(createCotizacionDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Cotización eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  async eliminarCotizacion(@Param('id', ParseIntPipe) id: number): Promise<Cotizacion> {
    return this.cotizacionesService.eliminarCotizacion(id);
  }
}
