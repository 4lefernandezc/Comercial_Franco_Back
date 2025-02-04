import { Module } from '@nestjs/common';
import { TiposUnidadesService } from './tipos_unidades.service';
import { TiposUnidadesController } from './tipos_unidades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoUnidad } from './entities/tipo_unidad.entity';

@Module({
   imports: [TypeOrmModule.forFeature([TipoUnidad])],
  controllers: [TiposUnidadesController],
  providers: [TiposUnidadesService],
})
export class TiposUnidadesModule {}