import { Module } from '@nestjs/common';
import { MonedasService } from './monedas.service';
import { MonedasController } from './monedas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Moneda } from './entities/moneda.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Moneda, Proveedor])],
  controllers: [MonedasController],
  providers: [MonedasService],
})
export class MonedasModule {}
