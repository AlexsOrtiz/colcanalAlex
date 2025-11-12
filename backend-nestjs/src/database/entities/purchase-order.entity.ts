import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Requisition } from './requisition.entity';
import { Supplier } from './supplier.entity';
import { User } from './user.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn({ name: 'purchase_order_id' })
  purchaseOrderId: number;

  @Column({ name: 'purchase_order_number', type: 'varchar', length: 50, unique: true })
  purchaseOrderNumber: string;

  @Column({ name: 'requisition_id' })
  requisitionId: number;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ name: 'total_iva', type: 'decimal', precision: 15, scale: 2 })
  totalIva: number;

  @Column({ name: 'total_discount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDiscount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Requisition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisition_id' })
  requisition: Requisition;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder)
  items: PurchaseOrderItem[];
}
