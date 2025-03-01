import { Module } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { CotizacionesController } from './cotizaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { DetalleCotizacion } from './entities/detalle_cotizacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cotizacion,
      DetalleCotizacion,
      Producto,
      Caja
    ])
  ],
  controllers: [CotizacionesController],
  providers: [CotizacionesService],
  exports: [CotizacionesService]
})
export class CotizacionesModule {}
