// Backend API bilan mos keladigan tiplar

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description: string;
  imageUrl?: string | null;
  stock: number;
  attributes: Record<string, string | number | boolean | null>;
  categoryId: string;
  category?: Category;
  isActive: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
  totalPrice: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  priceAtPurchase: number;
  productAttributes: Record<string, string | number | boolean | null>;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: 'CARD' | 'CASH';
  orderItems: OrderItem[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
}
