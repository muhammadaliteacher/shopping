'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

const TABS = [
  { href: '/admin', label: '📊 Statistika' },
  { href: '/admin/products', label: '📱 Mahsulotlar' },
  { href: '/admin/categories', label: '🏷️ Kategoriyalar' },
  { href: '/admin/orders', label: '📦 Buyurtmalar' },
];

// Barcha /admin sahifalarini himoya qiladi: faqat ADMIN roli kira oladi
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [mounted, user, router]);

  if (!mounted || user?.role !== 'ADMIN') {
    return <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Admin panel</h1>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={pathname === tab.href ? 'btn-primary' : 'btn-secondary'}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
