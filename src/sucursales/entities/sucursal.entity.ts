import { Caja } from 'src/cajas/entities/caja.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Cotizacion } from 'src/cotizaciones/entities/cotizacion.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sucursales')
export class Sucursal {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 150 })
  nombre: string;

  @Column('varchar', { length: 255 })
  direccion: string;

  @Column('varchar', { length: 15 })
  telefono: string;

  @Column('varchar', { length: 255, nullable: true })
  correo?: string;

  @Column('boolean', { default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'", onUpdate: "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaModificacion: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.sucursal)
  usuarios: Usuario[];

  @OneToMany(() => InventarioSucursal, (inventarios) => inventarios.producto)
  inventarios: InventarioSucursal[];

  @OneToMany(() => Venta, (venta) => venta.sucursal)
  ventas: Venta[];

  @OneToMany(() => Compra, (compra) => compra.sucursal)
  compras: Compra[];

  @OneToMany(() => Caja, (caja) => caja.sucursal)
  cajas: Caja[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.sucursal)
  movimientosOrigen: MovimientoInventario[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.sucursal)
  movimientosDestino: MovimientoInventario[];

  @OneToMany(() => Cotizacion, (cotizacion) => cotizacion.sucursal)
  cotizacion: Cotizacion[];
}
