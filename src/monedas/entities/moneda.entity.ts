import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsNotEmpty, Length, IsBoolean, Min } from 'class-validator';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Entity('monedas')
export class Moneda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 3 })
  @Index()
  @IsNotEmpty()
  @Length(1, 3)
  codigo: string;

  @Column('varchar', { length: 50 })
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;

  @Column({ length: 5 })
  @IsNotEmpty()
  @Length(1, 5)
  simbolo: string;

  @Column({ name: 'es_principal', default: false })
  @IsBoolean()
  esPrincipal: boolean;

  @Column( {
    name: 'tasa_cambio_base',
    precision: 10,
    scale: 2,
    nullable: true,
    type: 'decimal',
  })
  @Min(0)
  tasaCambioBase: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz', default: () => "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'", onUpdate: "CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'" })
  fechaModificacion: Date;

  @OneToMany(() => Proveedor, (proveedor) => proveedor.moneda)
  proveedores: Proveedor[];
}