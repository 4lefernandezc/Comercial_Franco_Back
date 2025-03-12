import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'monto_inicial', type: 'numeric', precision: 10, scale: 2 })
  montoInicial: number;

  @Column({
    name: 'monto_final',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  montoFinal: number;

  @Column({
    name: 'total_ingresos',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalIngresos: number;

  @Column({
    name: 'total_egresos',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalEgresos: number;

  @Column({ name: 'fecha_apertura', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaApertura: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true, default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCierre: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'abierta',
    enum: ['abierta', 'cerrada'],
  })
  estado: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaModificacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.cajasApertura)
  usuarioApertura: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.cajasCierre, {
    nullable: true,
  })
  usuarioCierre: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.cajas)
  sucursal: Sucursal;

  @OneToMany(() => Venta, (venta) => venta.caja)
  ventas: Venta[];

  @OneToMany(() => Compra, (compra) => compra.caja)
  compras: Compra[];
}
