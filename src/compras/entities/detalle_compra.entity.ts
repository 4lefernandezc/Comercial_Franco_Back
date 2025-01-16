import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Compra } from './compra.entity';
  import { Producto } from '../../productos/entities/producto.entity';
  
  @Entity('detalle_compras')
  export class DetalleCompra {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    cantidad: number;
  
    @Column({ name: 'precio_unitario', type: 'numeric', precision: 10, scale: 2 })
    precioUnitario: number;
  
    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    descuento: number;
  
    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
    subtotal: number;
  
    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;
  
    @ManyToOne(() => Compra, (compra) => compra.detalles)
    compra: Compra;
  
    @ManyToOne(() => Producto, (producto) => producto.detallesCompra)
    producto: Producto;
  }