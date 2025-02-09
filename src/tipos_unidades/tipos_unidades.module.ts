import { Module } from '@nestjs/common';
import { TiposUnidadesService } from './tipos_unidades.service';
import { TiposUnidadesController } from './tipos_unidades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoUnidad } from './entities/tipo_unidad.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';

@Module({
   imports: [TypeOrmModule.forFeature([TipoUnidad, InventarioSucursal])],
  controllers: [TiposUnidadesController],
  providers: [TiposUnidadesService],
})
export class TiposUnidadesModule {}