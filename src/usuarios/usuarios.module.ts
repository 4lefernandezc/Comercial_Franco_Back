import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { Rol } from 'src/roles/entities/rol.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario,Rol,Sucursal,Venta,Caja,Compra,MovimientoInventario])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
