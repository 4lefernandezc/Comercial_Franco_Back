import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventariosService } from './movimientos_inventarios.service';
import { MovimientosInventariosController } from './movimientos_inventarios.controller';
import { MovimientoInventario } from './entities/movimientos_inventario.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoInventario, InventarioSucursal]),
  ],
  controllers: [MovimientosInventariosController],
  providers: [MovimientosInventariosService],
})
export class MovimientosInventariosModule {}
