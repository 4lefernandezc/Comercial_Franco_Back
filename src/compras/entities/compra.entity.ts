import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { DetalleCompra } from './detalle_compra.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

    @Column({ name: 'numero_documento', type: 'varchar', length: 200, unique: true })
  numeroDocumento: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'total_compra', type: 'numeric', precision: 10, scale: 2 })
  totalCompra: number;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 50,
    default: 'efectivo',
    enum: ['efectivo', 'tarjeta', 'transferencia', 'credito'],
  })
  metodoPago: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'completada',
    enum: ['completada', 'anulada', 'pendiente'],
  })
  estado: string;

  @Column({ name: 'fecha_anulacion', type: 'timestamptz', nullable: true })
  fechaAnulacion: Date;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'", onUpdate: "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaModificacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.compras)
  usuario: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.compras)
  sucursal: Sucursal;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.compras, { nullable: false })
  proveedor: Proveedor;

  @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.compra, {
    cascade: true,
  })
  detalles: DetalleCompra[];

  @ManyToOne(() => Caja, (caja) => caja.compras)
  caja: Caja;
}