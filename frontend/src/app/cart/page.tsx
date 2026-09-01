'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, imageUrl } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { cart, fetchCart, updateItem, removeItem, clearCart, reset } = useCartStore();

  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Buyurtma formasi
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCart().catch((e) => setError(e.message));
  }, [mounted, user, fetchCart, router]);

  async function run(action: () => Promise<void>) {
    try {
      setError('');
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api<Order>('/orders/create', {
        method: 'POST',
        body: { shippingAddress, phoneNumber, paymentMethod },
      });
      reset(); // savat serverda tozalandi - lokal holatni ham tozalaymiz
      router.push('/orders');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !cart) {
    return <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>;
  }

  if (cart.cartItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-4xl">🛒</p>
        <p className="mt-2 text-gray-500">Savat bo&apos;sh</p>
        <Link href="/" className="btn-primary mt-4">
          Xarid qilish
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savat</h1>
        <button className="btn-danger" onClick={() => run(clearCart)}>
          Savatni tozalash
        </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Savat elementlari */}
        <div className="space-y-3 lg:col-span-2">
          {cart.cartItems.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(item.product.imageUrl)}
                alt={item.product.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.product.id}`} className="font-semibold hover:underline">
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">{formatPrice(item.product.price)}</p>
              </div>

              <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
                <button
                  className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer disabled:opacity-50"
                  disabled={item.quantity <= 1}
                  onClick={() => run(() => updateItem(item.id, item.quantity - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => run(() => updateItem(item.id, item.quantity + 1))}
                >
                  +
                </button>
              </div>

              <span className="w-32 text-right font-bold">
                {formatPrice(item.product.price * item.quantity)}
              </span>

              <button
                className="text-red-500 hover:text-red-700 cursor-pointer"
                title="Olib tashlash"
                onClick={() => run(() => removeItem(item.id))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Buyurtma berish formasi */}
        <form onSubmit={handleOrder} className="card h-fit space-y-4 p-5">
          <h2 className="text-lg font-semibold">Buyurtma berish</h2>

          <div className="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <span className="text-gray-500">Jami:</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(cart.totalPrice)}
            </span>
          </div>

          <div>
            <label className="label">Yetkazish manzili</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Toshkent shahar, Chilonzor tumani..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
              minLength={10}
            />
          </div>

          <div>
            <label className="label">Telefon raqam</label>
            <input
              className="input"
              placeholder="+998901234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">To&apos;lov usuli</label>
            <select
              className="input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'CARD' | 'CASH')}
            >
              <option value="CARD">💳 Karta</option>
              <option value="CASH">💵 Naqd</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Yuborilmoqda...' : 'Buyurtma berish'}
          </button>
        </form>
      </div>
    </div>
  );
}
