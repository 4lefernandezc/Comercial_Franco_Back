import { Controller, Post, Body, Param, Get, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CajasService } from './cajas.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { CloseCajaDto } from './dto/close-caja.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryCajaDto } from './dto/query-caja.dto';

@ApiTags('Cajas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cajas')
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Listado de cajas' })
  async obtenerCajas(@Query() query: QueryCajaDto) {
    return this.cajasService.obtenerCajas(query);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Caja abierta exitosamente' })
  async abrirCaja(@Body() createCajaDto: CreateCajaDto) {
    return this.cajasService.abrirCaja(createCajaDto);
  }

  @Post(':id/cerrar')
  @ApiResponse({ status: 200, description: 'Caja cerrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al cerrar la caja' })
  @ApiResponse({ status: 404, description: 'Caja no encontrada' })
  async cerrarCaja(
    @Param('id', ParseIntPipe) id: number,
    @Body() closeCajaDto: CloseCajaDto
  ) {
    return this.cajasService.cerrarCaja(id, closeCajaDto.idUsuarioCierre);
  }

  @Get('sucursal/:idSucursal')
  @ApiResponse({ status: 200, description: 'Caja actual de la sucursal' })
  async obtenerCajaActual(@Param('idSucursal', ParseIntPipe) idSucursal: number) {
    return this.cajasService.obtenerCajaActual(idSucursal);
  }
}