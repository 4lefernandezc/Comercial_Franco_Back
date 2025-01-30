import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalesService } from './sucursales.service';
import { SucursalesController } from './sucursales.controller';
import { Sucursal } from './entities/sucursal.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal, Usuario])],
  controllers: [SucursalesController],
  providers: [SucursalesService],
})
export class SucursalesModule {}
