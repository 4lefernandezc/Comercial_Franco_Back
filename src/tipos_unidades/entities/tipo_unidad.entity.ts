import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tipos_unidades')
export class TipoUnidad {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50 })
  nombre: string;

  @Column('varchar', { length: 10 })
  abreviatura: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @OneToMany(() => InventarioSucursal, (inventario) => inventario.tipoUnidad)
  inventarios: InventarioSucursal[];
}