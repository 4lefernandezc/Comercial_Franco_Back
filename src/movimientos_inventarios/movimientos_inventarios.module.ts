import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventariosService } from './movimientos_inventarios.service';
import { MovimientosInventariosController } from './movimientos_inventarios.controller';
import { MovimientoInventario } from './entities/movimientos_inventario.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      InventarioSucursal,
      Sucursal,
      Usuario,
      Producto,
    ]),
  ],
  controllers: [MovimientosInventariosController],
  providers: [MovimientosInventariosService],
})
export class MovimientosInventariosModule {}
