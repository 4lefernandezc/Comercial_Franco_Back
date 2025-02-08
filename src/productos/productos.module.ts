import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { DetalleVenta } from 'src/ventas/entities/detalle_venta.entity';
import { DetalleCompra } from 'src/compras/entities/detalle_compra.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria, Proveedor, DetalleVenta, DetalleCompra, InventarioSucursal, MovimientoInventario])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [TypeOrmModule.forFeature([Producto])],
})
export class ProductosModule {}
