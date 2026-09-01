'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatPrice, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/format';
import { useAuthStore } from '@/store/auth-store';

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/login');
      return;
    }
    api<Order[]>('/orders').then(setOrders).catch((e) => setError(e.message));
  }, [mounted, user, router]);

  async function handleCancel(orderId: string) {
    if (!confirm('Buyurtmani bekor qilmoqchimisiz?')) return;
    try {
      setError('');
      const updated = await api<Order>(`/orders/${orderId}/cancel`, { method: 'PATCH' });
      setOrders((prev) => prev!.map((o) => (o.id === orderId ? updated : o)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!mounted || !orders) {
    return <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Buyurtmalarim</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {orders.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Hozircha buyurtma yo&apos;q</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                  <span className="ml-3 text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  {order.status === 'PENDING' && (
                    <button className="btn-danger !px-3 !py-1 text-xs" onClick={() => handleCancel(order.id)}>
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.product?.name ?? 'Mahsulot'} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                <span className="text-sm text-gray-500">
                  📍 {order.shippingAddress} · 📞 {order.phoneNumber} ·{' '}
                  {order.paymentMethod === 'CARD' ? '💳 Karta' : '💵 Naqd'}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
