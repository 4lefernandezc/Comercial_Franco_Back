import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Venta])],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
