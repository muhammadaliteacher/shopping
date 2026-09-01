'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, imageUrl } from '@/lib/api';
import { Category, Paginated, Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Pagination } from '@/components/Pagination';

// Attributes JSONB uchun kalit-qiymat qatori
interface AttrRow {
  key: string;
  value: string;
}

const EMPTY_FORM = {
  name: '',
  sku: '',
  price: '',
  stock: '',
  description: '',
  categoryId: '',
};

export default function AdminProductsPage() {
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  // Forma holati
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [attrRows, setAttrRows] = useState<AttrRow[]>([{ key: '', value: '' }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setData(await api<Paginated<Product>>(`/products?page=${page}&limit=10`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => {});
  }, []);

  function setField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateForm() {
    setEditingId('');
    setForm(EMPTY_FORM);
    setAttrRows([{ key: '', value: '' }]);
    setImageFile(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      categoryId: product.categoryId,
    });
    const rows = Object.entries(product.attributes ?? {}).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setAttrRows(rows.length ? rows : [{ key: '', value: '' }]);
    setImageFile(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      // Kalit-qiymat qatorlarini JSON obyektga aylantiramiz
      const attributes: Record<string, string> = {};
      for (const row of attrRows) {
        if (row.key.trim()) attributes[row.key.trim()] = row.value;
      }

      // Rasm fayl bo'lgani uchun multipart/form-data yuboriladi
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('sku', form.sku);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('description', form.description);
      formData.append('categoryId', form.categoryId);
      formData.append('attributes', JSON.stringify(attributes));
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await api(`/admin/products/${editingId}`, { method: 'PATCH', formData });
      } else {
        await api('/admin/products', { method: 'POST', formData });
      }

      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return;
    try {
      setError('');
      await api(`/admin/products/${id}`, { method: 'DELETE' });
      await loadProducts();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mahsulotlar {data && `(${data.total} ta)`}</h2>
        <button className="btn-primary" onClick={openCreateForm}>
          + Yangi mahsulot
        </button>
      </div>

      {error && !showForm && <p className="mb-4 text-red-500">{error}</p>}

      {/* Yaratish / tahrirlash formasi */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">{editingId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nomi</label>
              <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required minLength={3} />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku} onChange={(e) => setField('sku', e.target.value)} required />
            </div>
            <div>
              <label className="label">Narx (so&apos;m)</label>
              <input type="number" className="input" value={form.price} onChange={(e) => setField('price', e.target.value)} required min={1} />
            </div>
            <div>
              <label className="label">Ombordagi soni</label>
              <input type="number" className="input" value={form.stock} onChange={(e) => setField('stock', e.target.value)} required min={0} />
            </div>
            <div>
              <label className="label">Kategoriya</label>
              <select className="input" value={form.categoryId} onChange={(e) => setField('categoryId', e.target.value)} required>
                <option value="">Tanlang...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Rasm {editingId && '(yangi tanlasangiz almashtiriladi)'}</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="input"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div>
            <label className="label">Tavsif</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} required minLength={10} />
          </div>

          {/* Attributes (JSONB) - har bir mahsulot turiga qarab erkin maydonlar */}
          <div>
            <label className="label">Xususiyatlar (masalan: brand → Samsung, ram → 8GB)</label>
            <div className="space-y-2">
              {attrRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    placeholder="Kalit (brand)"
                    value={row.key}
                    onChange={(e) =>
                      setAttrRows((rows) => rows.map((r, j) => (j === i ? { ...r, key: e.target.value } : r)))
                    }
                  />
                  <input
                    className="input"
                    placeholder="Qiymat (Samsung)"
                    value={row.value}
                    onChange={(e) =>
                      setAttrRows((rows) => rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))
                    }
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setAttrRows((rows) => rows.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary mt-2"
              onClick={() => setAttrRows((rows) => [...rows, { key: '', value: '' }])}
            >
              + Xususiyat qo&apos;shish
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saqlanmoqda...' : editingId ? 'Saqlash' : 'Yaratish'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Bekor
            </button>
          </div>
        </form>
      )}

      {/* Mahsulotlar ro'yxati */}
      {!data ? (
        <p className="py-12 text-center text-gray-500">Yuklanmoqda...</p>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((product) => (
              <div key={product.id} className="card flex items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {product.sku} · {product.category?.name} · Omborda: {product.stock} ta
                  </p>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.price)}
                </span>
                <div className="flex shrink-0 gap-2">
                  <button className="btn-secondary" onClick={() => openEditForm(product)}>
                    Tahrirlash
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(product.id)}>
                    O&apos;chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
