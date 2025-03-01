import { Caja } from "src/cajas/entities/caja.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Sucursal } from "src/sucursales/entities/sucursal.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DetalleCotizacion } from "./detalle_cotizacion.entity";

@Entity('cotizacion')
export class Cotizacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name:'numero_documento', type: 'varchar', length: 200, unique: true })
  numeroDocumento: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'total_venta', type: 'numeric', precision: 10, scale: 2 })
  totalVenta: number;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 50,
    default: 'efectivo',
    enum: ['efectivo', 'tarjeta', 'transferencia', 'cotización', 'otro'],
  })
  metodoPago: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'completada',
    enum: ['completada', 'anulada', 'pendiente'],
  })
  estado: string;

  @Column({ name: 'nombre_cliente', type: 'varchar', nullable: true, default: null })
  nombre?: string;

  @Column({ name: 'documento_cliente', type: 'varchar', nullable: true, default: null })
  documento?: string;

  @Column({ name: 'fecha_anulacion', type: 'timestamp', nullable: true })
  fechaAnulacion: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.cotizacion)
  usuario: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.cotizacion)
  sucursal: Sucursal;

  @ManyToOne(() => Cliente, (cliente) => cliente.cotizacion, { nullable: true })
  cliente?: Cliente;

  @OneToMany(() => DetalleCotizacion, (detalleCotizacion) => detalleCotizacion.cotizacion, {
    cascade: true,
  })
  detalles: DetalleCotizacion[];
}
