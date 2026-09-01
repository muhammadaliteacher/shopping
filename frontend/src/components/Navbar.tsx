'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { cart, fetchCart, reset } = useCartStore();

  // localStorage'dan o'qiladigan holat server renderda bo'lmaydi -
  // hydration xatosining oldini olish uchun mount'dan keyin ko'rsatamiz
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Login bo'lganda savatni yuklab olamiz
  useEffect(() => {
    if (mounted && user) {
      fetchCart().catch(() => {});
    }
  }, [mounted, user, fetchCart]);

  const itemCount = cart?.cartItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  function handleLogout() {
    logout();
    reset();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          🛍️ E-Shop
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {mounted && user ? (
            <>
              <Link href="/cart" className="btn-secondary relative">
                🛒 Savat
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="btn-secondary">
                📦 <span className="hidden sm:inline">Buyurtmalarim</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="btn-secondary">
                  ⚙️ <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button onClick={handleLogout} className="btn-secondary" title={user.email}>
                Chiqish
              </button>
            </>
          ) : (
            mounted && (
              <>
                <Link href="/login" className="btn-secondary">
                  Kirish
                </Link>
                <Link href="/register" className="btn-primary">
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </>
            )
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
