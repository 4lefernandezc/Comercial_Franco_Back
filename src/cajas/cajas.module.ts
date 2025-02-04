import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { Caja } from './entities/caja.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

@Module({
  imports:[TypeOrmModule.forFeature([
    Caja,
    Venta,
    Compra,
    Usuario,
    Sucursal
  ])],
  controllers: [CajasController],
  providers: [CajasService],
})
export class CajasModule {}
