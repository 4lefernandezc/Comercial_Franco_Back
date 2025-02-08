import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { Proveedor } from './entities/proveedor.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Compra } from 'src/compras/entities/compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor, Producto, Compra])],
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
})
export class ProveedoresModule {}
