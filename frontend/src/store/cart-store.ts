import { create } from 'zustand';
import { api } from '@/lib/api';
import { Cart } from '@/lib/types';

interface CartState {
  cart: Cart | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void; // logout'da lokal holatni tozalash
}

// Savat serverda saqlanadi - har bir amal yangilangan savatni qaytaradi
export const useCartStore = create<CartState>((set) => ({
  cart: null,

  fetchCart: async () => {
    const cart = await api<Cart>('/cart');
    set({ cart });
  },

  addToCart: async (productId, quantity) => {
    const cart = await api<Cart>('/cart/add', {
      method: 'POST',
      body: { productId, quantity },
    });
    set({ cart });
  },

  updateItem: async (itemId, quantity) => {
    const cart = await api<Cart>(`/cart/item/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
    });
    set({ cart });
  },

  removeItem: async (itemId) => {
    const cart = await api<Cart>(`/cart/item/${itemId}`, { method: 'DELETE' });
    set({ cart });
  },

  clearCart: async () => {
    const cart = await api<Cart>('/cart/clear', { method: 'DELETE' });
    set({ cart });
  },

  reset: () => set({ cart: null }),
}));
