import { Cliente } from '../../clientes/entities/cliente.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { DetalleVenta } from './detalle_venta.entity';
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

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name:'numero_documento', type: 'varchar', length: 200, unique: true })
  numeroDocumento: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'total_venta', type: 'numeric', precision: 10, scale: 2 })
  totalVenta: number;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 50,
    default: 'efectivo',
    enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
  })
  metodoPago: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'completada',
    enum: ['completada', 'anulada', 'pendiente'],
  })
  estado: string;

  @Column({ name: 'fecha_anulacion', type: 'timestamp', nullable: true })
  fechaAnulacion: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  usuario: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.ventas)
  sucursal: Sucursal;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas, { nullable: true })
  cliente: Cliente;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta, {
    cascade: true,
  })
  detalles: DetalleVenta[];

  @ManyToOne(() => Caja, (caja) => caja.ventas)
  caja: Caja;
}
