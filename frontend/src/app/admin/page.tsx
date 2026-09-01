'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Stats } from '@/lib/types';
import { formatPrice, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/format';
import { OrderStatus } from '@/lib/types';

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Stats>('/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Jami buyurtmalar</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Jami tushum (bekor qilinganlarsiz)</p>
          <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(stats.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="card mt-4 p-6">
        <h2 className="mb-4 font-semibold">Buyurtmalar holati bo&apos;yicha</h2>
        {Object.keys(stats.ordersByStatus).length === 0 ? (
          <p className="text-gray-500">Hozircha buyurtma yo&apos;q</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${ORDER_STATUS_COLORS[status as OrderStatus] ?? ''}`}
              >
                {ORDER_STATUS_LABELS[status as OrderStatus] ?? status}: {count} ta
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
