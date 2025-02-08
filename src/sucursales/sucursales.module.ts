import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalesService } from './sucursales.service';
import { SucursalesController } from './sucursales.controller';
import { Sucursal } from './entities/sucursal.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal, Usuario, InventarioSucursal, Venta, Compra, Caja, MovimientoInventario])],
  controllers: [SucursalesController],
  providers: [SucursalesService],
})
export class SucursalesModule {}
