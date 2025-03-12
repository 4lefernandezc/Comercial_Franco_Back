import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';
import { Rol } from 'src/roles/entities/rol.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cotizacion } from 'src/cotizaciones/entities/cotizacion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 20, unique: true })
  usuario: string;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', { length: 100 })
  apellido: string;

  @Column('varchar', { length: 255, nullable: true })
  correo?: string;

  @Column('varchar', { length: 20, nullable: true })
  telefono?: string;

  @Column('varchar', { length: 255, select: false })
  clave: string;

  @Column('boolean', { default: true })
  activo: boolean;

  @Column({ name: 'ultimo_login', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  ultimoLogin: Date;

  @Column('number', { name: 'rol_id' })
  rolId: number;

  @Column('number', { name: 'sucursal_id' })
  sucursalId: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'", onUpdate: "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaModificacion: Date;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.usuarios, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];

  @OneToMany(() => Cotizacion, (cotizacion) => cotizacion.usuario)
  cotizacion: Cotizacion[];

  @OneToMany(() => Compra, (compra) => compra.usuario)
  compras: Compra[];

  @OneToMany(() => Caja, (caja) => caja.usuarioApertura)
  cajasApertura: Caja[];

  @OneToMany(() => Caja, (caja) => caja.usuarioCierre)
  cajasCierre: Caja[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.usuario)
  movimientos: MovimientoInventario[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.clave && !this.clave.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt();
      this.clave = await bcrypt.hash(this.clave, salt);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.clave);
  }
}