import { Cotizacion } from 'src/cotizaciones/entities/cotizacion.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 25 })
  documento: string;

  @Column('varchar', { length: 50, name: 'tipo_documento' })
  tipoDocumento: string;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', { length: 100 })
  apellido: string;

  @Column('varchar', { length: 255, nullable: true })
  direccion?: string;

  @Column('varchar', { length: 15, nullable: true })
  telefono?: string;

  @Column('varchar', { length: 255, nullable: true })
  correo?: string;

  @Column('varchar', { length: 255, nullable: true, name: 'link_whatsapp' })
  linkWhatsapp?: string;

  @Column('boolean', { default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'", onUpdate: "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaModificacion: Date;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];

  @OneToMany(() => Cotizacion, (cotizacion) => cotizacion.cliente)
  cotizacion: Cotizacion[];
}
