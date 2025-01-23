import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ClientesModule } from './clientes/clientes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { ProductosModule } from './productos/productos.module';
import { InventariosSucursalesModule } from './inventarios_sucursales/inventarios_sucursales.module';
import { VentasModule } from './ventas/ventas.module';
import { ComprasModule } from './compras/compras.module';
import { CajasModule } from './cajas/cajas.module';
import { MovimientosInventariosModule } from './movimientos_inventarios/movimientos_inventarios.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entities/*.{ts|js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    RolesModule,
    CategoriasModule,
    ProveedoresModule,
    ClientesModule,
    UsuariosModule,
    AuthModule,
    SucursalesModule,
    ProductosModule,
    InventariosSucursalesModule,
    VentasModule,
    ComprasModule,
    CajasModule,
    MovimientosInventariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
