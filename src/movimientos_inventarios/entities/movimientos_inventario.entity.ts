import { Producto } from 'src/productos/entities/producto.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('movimientos_inventarios')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 50,
    name: 'documento_referencia',
    nullable: true,
  })
  documentoReferencia?: string;

  @Column('integer', { name: 'id_producto' })
  idProducto: number;

  @Column('integer', { name: 'id_sucursal' })
  idSucursal: number;

  @Column('varchar', { length: 50, name: 'tipo_movimiento' })
  tipoMovimiento: string;

  @Column('integer', { name: 'cantidad' })
  cantidad: number;

  @Column('varchar', { length: 50, name: 'motivo' })
  motivo: string;

  @Column('varchar', { length: 20, name: 'estado', default: 'REALIZADO' })
  estado: string;

  @Column('integer', { name: 'id_usuario' })
  idUsuario: number;

  @Column('integer', { name: 'id_sucursal_destino', nullable: true })
  idSucursalDestino?: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @ManyToOne(() => Producto, (producto) => producto.movimientos)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id' })
  producto: Producto;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.movimientosOrigen)
  @JoinColumn({ name: 'id_sucursal', referencedColumnName: 'id' })
  sucursal: Sucursal;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.movimientosDestino, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_sucursal_destino', referencedColumnName: 'id' })
  sucursalDestino?: Sucursal;

  @ManyToOne(() => Usuario, (usuario) => usuario.movimientos)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;
}
