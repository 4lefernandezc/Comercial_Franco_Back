import { Producto } from '../../productos/entities/producto.entity';
import { Cotizacion } from './cotizacion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('detalle_cotizaciones')
export class DetalleCotizacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ name:'precio_unitario', type: 'numeric', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
  subtotal: number;

  @CreateDateColumn({name: 'fecha_creacion'})
  fechaCreacion: Date;

  @ManyToOne(() => Cotizacion, (cotizacion) => cotizacion.detalles)
  cotizacion: Cotizacion;

  @ManyToOne(() => Producto, (producto) => producto.detalles)
  producto: Producto;
}