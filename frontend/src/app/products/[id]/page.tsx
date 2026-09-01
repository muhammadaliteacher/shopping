'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, imageUrl } from '@/lib/api';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<Product>(`/products/${id}`).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      setAdding(true);
      setError('');
      setMessage('');
      await addToCart(product!.id, quantity);
      setMessage("Savatga qo'shildi ✓");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  if (error && !product) return <p className="py-12 text-center text-red-500">{error}</p>;
  if (!product) return <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>;

  const attributes = Object.entries(product.attributes ?? {});

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(product.imageUrl)}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {product.category?.name} · SKU: {product.sku}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
          {formatPrice(product.price)}
        </p>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{product.description}</p>

        {/* Savatga qo'shish */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <span className="w-10 text-center">{quantity}</span>
            <button
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              +
            </button>
          </div>
          <button
            className="btn-primary flex-1"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
          >
            {product.stock === 0 ? 'Tugagan' : adding ? "Qo'shilmoqda..." : "🛒 Savatga qo'shish"}
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500">Omborda: {product.stock} ta</p>
        {message && <p className="mt-2 text-green-600 dark:text-green-400">{message}</p>}
        {error && <p className="mt-2 text-red-500">{error}</p>}

        {/* Xususiyatlar (JSONB attributes) */}
        {attributes.length > 0 && (
          <div className="card mt-6 p-4">
            <h2 className="mb-3 font-semibold">Xususiyatlar</h2>
            <dl className="space-y-2">
              {attributes.map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-100 pb-2 text-sm last:border-0 dark:border-gray-800">
                  <dt className="text-gray-500 dark:text-gray-400">{key}</dt>
                  <dd className="font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
