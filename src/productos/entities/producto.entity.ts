import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { InventarioSucursal } from 'src/inventarios_sucursales/entities/inventario_sucursal.entity';
import { MovimientoInventario } from 'src/movimientos_inventarios/entities/movimientos_inventario.entity';
import { DetalleVenta } from 'src/ventas/entities/detalle_venta.entity';
import { DetalleCompra } from 'src/compras/entities/detalle_compra.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50 })
  codigo: string;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', { length: 150 })
  presentacion: string;

  @Column('varchar', { length: 50, nullable: true })
  dimensiones?: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_compra' })
  precioCompra: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_venta'})
  precioVenta: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_agranel', nullable: true })
  precioAgranel?: number;

  @Column('integer', { name: 'total_presentacion' , nullable: true })
  totalPresentacion: number;

  @Column('boolean')
  activo: boolean;

  @Column('integer', { name: 'id_categoria' })
  idCategoria: number;

  @Column('integer', { name: 'id_proveedor' })
  idProveedor: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id' })
  categoria: Categoria;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos)
  @JoinColumn({ name: 'id_proveedor', referencedColumnName: 'id' })
  proveedor: Proveedor;

  @OneToMany(
    () => InventarioSucursal,
    (inventarioSucursal) => inventarioSucursal.producto,
  )
  inventarios: InventarioSucursal[];

  @OneToMany(() => DetalleVenta, (detalleventa) => detalleventa.producto)
  detalles: DetalleVenta[];

  @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.producto)
  detallesCompra: DetalleCompra[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.usuario)
  movimientos: MovimientoInventario[];
}
