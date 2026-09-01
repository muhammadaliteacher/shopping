import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
import { generateOrderNumber } from '../../utils/helpers';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) {}

  // Savatdan buyurtma yaratish - transaction ichida stock kamaytiriladi
  async createFromCart(userId: string, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getOrCreateCart(userId);

    if (!cart.cartItems?.length) {
      throw new BadRequestException("Savat bo'sh, buyurtma yaratib bo'lmaydi");
    }

    // Mahsulotlar doim bir xil tartibda qulflanadi - parallel buyurtmalarda deadlock oldini oladi
    const sortedItems = [...cart.cartItems].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );

    const order = await this.dataSource.transaction(async (manager) => {
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of sortedItems) {
        // Stockni race-condition'siz tekshirish uchun qatorni qulflab o'qiymiz.
        // Eager relation (category) o'chiriladi - FOR UPDATE outer join bilan ishlamaydi
        const product = await manager.findOne(Product, {
          where: { id: cartItem.productId },
          lock: { mode: 'pessimistic_write' },
          loadEagerRelations: false,
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Mahsulot endi mavjud emas: ${cartItem.product?.name || cartItem.productId}`,
          );
        }
        if (product.stock < cartItem.quantity) {
          throw new InsufficientStockException(product.name, product.stock);
        }

        // Stock kamaytirish
        product.stock -= cartItem.quantity;
        await manager.save(product);

        const orderItem = manager.create(OrderItem, {
          productId: product.id,
          quantity: cartItem.quantity,
          priceAtPurchase: Number(product.price),
          productAttributes: product.attributes || {},
        });
        orderItems.push(orderItem);
        totalPrice += Number(product.price) * cartItem.quantity;
      }

      const newOrder = manager.create(Order, {
        orderNumber: generateOrderNumber(),
        userId,
        totalPrice,
        status: 'PENDING',
        shippingAddress: dto.shippingAddress,
        phoneNumber: dto.phoneNumber,
        paymentMethod: dto.paymentMethod,
        orderItems,
      });
      return manager.save(newOrder);
    });

    // Buyurtma yaratilgach savatni tozalash
    await this.cartService.clearCart(userId);

    return this.findByIdForUser(order.id, userId);
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdForUser(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }
    return order;
  }

  // Mijoz o'z buyurtmasini bekor qilishi (faqat PENDING holatda)
  async cancelByUser(id: string, userId: string): Promise<Order> {
    const order = await this.findByIdForUser(id, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Faqat PENDING holatdagi buyurtmani bekor qilish mumkin. Hozirgi holat: ${order.status}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      await this.restoreStock(manager, order);
      order.status = 'CANCELLED';
      return manager.save(order);
    });
  }

  // ============ ADMIN ============

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id);

    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new BadRequestException(
        `${order.status} holatdagi buyurtma statusini o'zgartirib bo'lmaydi`,
      );
    }

    // Admin bekor qilsa - stock qaytariladi
    if (status === OrderStatus.CANCELLED) {
      return this.dataSource.transaction(async (manager) => {
        await this.restoreStock(manager, order);
        order.status = status;
        return manager.save(order);
      });
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async getStats() {
    const [statusCountsRaw, revenueRaw] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany(),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalPrice), 0)', 'revenue')
        .where('order.status != :cancelled', { cancelled: 'CANCELLED' })
        .getRawOne(),
    ]);

    const ordersByStatus = statusCountsRaw.reduce(
      (acc, row) => ({ ...acc, [row.status]: parseInt(row.count, 10) }),
      {} as Record<string, number>,
    );

    return {
      totalOrders: statusCountsRaw.reduce((sum, row) => sum + parseInt(row.count, 10), 0),
      totalRevenue: parseFloat(revenueRaw.revenue),
      ordersByStatus,
    };
  }

  private async restoreStock(manager: EntityManager, order: Order): Promise<void> {
    // Deadlock oldini olish uchun createFromCart bilan bir xil qulflash tartibi
    const sortedItems = [...(order.orderItems || [])].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );
    for (const item of sortedItems) {
      const product = await manager.findOne(Product, {
        where: { id: item.productId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      if (product) {
        product.stock += item.quantity;
        await manager.save(product);
      }
    }
  }
}
