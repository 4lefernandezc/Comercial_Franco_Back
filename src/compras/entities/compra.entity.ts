import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    UpdateDateColumn,
  } from 'typeorm';
  import { Proveedor } from '../../proveedores/entities/proveedor.entity';
  import { Usuario } from '../../usuarios/entities/usuario.entity';
  import { Sucursal } from '../../sucursales/entities/sucursal.entity';
  import { DetalleCompra } from './detalle_compra.entity';
  
  @Entity('compras')
  export class Compra {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'numero_documento', type: 'varchar', length: 200, unique: true })
    numeroDocumento: string;
  
    @Column({ type: 'numeric', precision: 10, scale: 2 })
    subtotal: number;
  
    @Column({ name: 'total_compra', type: 'numeric', precision: 10, scale: 2 })
    totalCompra: number;
  
    @Column({
      name: 'metodo_pago',
      type: 'varchar',
      length: 50,
      default: 'efectivo',
      enum: ['efectivo', 'tarjeta', 'transferencia', 'credito'],
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
  
    @ManyToOne(() => Usuario, (usuario) => usuario.compras)
    usuario: Usuario;
  
    @ManyToOne(() => Sucursal, (sucursal) => sucursal.compras)
    sucursal: Sucursal;
  
    @ManyToOne(() => Proveedor, (proveedor) => proveedor.compras, { nullable: false })
    proveedor: Proveedor;
  
    @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.compra, {
      cascade: true,
    })
    detalles: DetalleCompra[];
  }