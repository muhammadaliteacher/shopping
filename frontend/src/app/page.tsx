'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Category, Paginated, Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';

export default function HomePage() {
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  // Filtrlar
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (categoryId) params.set('categoryId', categoryId);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    try {
      setError('');
      setData(await api<Paginated<Product>>(`/products?${params}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [page, categoryId, search, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mahsulotlar</h1>

      {/* Filtrlar paneli */}
      <div className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-end gap-2 min-w-55">
          <div className="flex-1">
            <label className="label">Qidiruv</label>
            <input
              className="input"
              placeholder="Mahsulot nomi..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Qidirish
          </button>
        </form>

        <div>
          <label className="label">Kategoriya</label>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => {
              setPage(1);
              setCategoryId(e.target.value);
            }}
          >
            <option value="">Barchasi</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="label">Narx (dan)</label>
          <input
            type="number"
            className="input"
            placeholder="0"
            value={minPrice}
            onChange={(e) => {
              setPage(1);
              setMinPrice(e.target.value);
            }}
          />
        </div>

        <div className="w-32">
          <label className="label">Narx (gacha)</label>
          <input
            type="number"
            className="input"
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => {
              setPage(1);
              setMaxPrice(e.target.value);
            }}
          />
        </div>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {!data ? (
        <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>
      ) : data.items.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Mahsulot topilmadi</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
