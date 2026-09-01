import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductService } from '../product/product.service';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '../../common/exceptions/product-not-found.exception';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductService,
  ) {}

  // Foydalanuvchi savatini olish, mavjud bo'lmasa yaratish
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      cart = await this.cartRepository.save(this.cartRepository.create({ userId, cartItems: [] }));
      cart = await this.cartRepository.findOne({ where: { id: cart.id } });
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.toResponse(cart);
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productService.findById(dto.productId);
    if (!product.isActive) {
      throw new ProductNotFoundException(dto.productId);
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = (cart.cartItems || []).find(
      (item) => item.productId === dto.productId,
    );

    const newQuantity = (existingItem?.quantity || 0) + dto.quantity;
    if (product.stock < newQuantity) {
      throw new InsufficientStockException(product.name, product.stock);
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      await this.cartItemRepository.save(
        this.cartItemRepository.create({
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        }),
      );
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = (cart.cartItems || []).find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Savat elementi topilmadi');
    }

    if (item.product.stock < dto.quantity) {
      throw new InsufficientStockException(item.product.name, item.product.stock);
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);
    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = (cart.cartItems || []).find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Savat elementi topilmadi');
    }
    await this.cartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.cartItems?.length) {
      await this.cartItemRepository.remove(cart.cartItems);
    }
    return this.getCart(userId);
  }

  private toResponse(cart: Cart) {
    return {
      id: cart.id,
      userId: cart.userId,
      cartItems: cart.cartItems || [],
      totalPrice: cart.getTotalPrice(),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
