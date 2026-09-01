import Link from 'next/link';
import { Product } from '@/lib/types';
import { imageUrl } from '@/lib/api';
import { formatPrice } from '@/lib/format';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="card group overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(product.imageUrl)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 dark:text-green-400">{product.stock} ta bor</span>
          ) : (
            <span className="text-xs text-red-500">Tugagan</span>
          )}
        </div>
      </div>
    </Link>
  );
}
