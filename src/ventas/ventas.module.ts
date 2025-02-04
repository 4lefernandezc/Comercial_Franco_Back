import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle_venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { Caja } from 'src/cajas/entities/caja.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      DetalleVenta,
      Producto,
      Caja
    ])
  ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService]
})
export class VentasModule {}
