import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  // Buyurtma ro'yxatlarida mahsulot nomi/rasmi kerak bo'lgani uchun eager
  @ManyToOne(() => Product, (product) => product.orderItems, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  // Buyurtma paytidagi narx (keyin narx o'zgarsa ham tarix saqlanadi)
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  priceAtPurchase: number;

  // Buyurtma paytidagi mahsulot attributes nusxasi
  @Column('jsonb', { default: {} })
  productAttributes: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
