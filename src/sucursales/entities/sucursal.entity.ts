import { Usuario } from 'src/usuarios/entities/usuario.entity';
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

  @Column('varchar', { length: 255 })
  correo: string;

  @Column('boolean', { default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}
