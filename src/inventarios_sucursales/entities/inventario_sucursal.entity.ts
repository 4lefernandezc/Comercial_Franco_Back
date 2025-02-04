import { Producto } from 'src/productos/entities/producto.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { TipoUnidad } from 'src/tipos_unidades/entities/tipo_unidad.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventarios_sucursales')
export class InventarioSucursal {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_producto' })
  idProducto: number;

  @Column('integer', { name: 'id_sucursal' })
  idSucursal: number;

  @Column('decimal', { name: 'stock_actual', precision: 10, scale: 2 })
  stockActual: number;

  @Column('decimal', { name: 'stock_minimo', precision: 10, scale: 2 })
  stockMinimo: number;

  @Column('decimal', { name: 'stock_maximo', nullable: true, precision: 10, scale: 2 })
  stockMaximo?: number;

  @Column('integer', { name: 'tipo_unidad_id' })
  tipoUnidadId: number;

  @Column('boolean', { 
    name: 'se_vende_fraccion', 
    default: false, 
    comment: 'Indica si el producto se puede vender en fracciones' 
  })
  seVendeFraccion: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @ManyToOne(() => Producto, (producto) => producto.inventarios)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id' })
  producto: Producto;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.inventarios)
  @JoinColumn({ name: 'id_sucursal', referencedColumnName: 'id' })
  sucursal: Sucursal;

  @ManyToOne(() => TipoUnidad, (tipoUnidad) => tipoUnidad.inventarios)
  @JoinColumn({ name: 'tipo_unidad_id', referencedColumnName: 'id' })
  tipoUnidad: TipoUnidad;
}
