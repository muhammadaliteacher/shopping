'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  // Forma: editingId bo'sh bo'lsa - yangi yaratish, aks holda tahrirlash
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setCategories(await api<Category[]>('/categories'));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? '');
  }

  function resetForm() {
    setEditingId('');
    setName('');
    setDescription('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const body = { name, description: description || undefined };
      if (editingId) {
        await api(`/admin/categories/${editingId}`, { method: 'PATCH', body });
      } else {
        await api('/admin/categories', { method: 'POST', body });
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Kategoriyani o'chirmoqchimisiz?")) return;
    try {
      setError('');
      await api(`/admin/categories/${id}`, { method: 'DELETE' });
      await loadCategories();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Yaratish / tahrirlash formasi */}
      <form onSubmit={handleSubmit} className="card h-fit space-y-4 p-5">
        <h2 className="font-semibold">
          {editingId ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        </h2>

        <div>
          <label className="label">Nomi</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="label">Tavsif (ixtiyoriy)</label>
          <textarea
            className="input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? 'Saqlanmoqda...' : editingId ? 'Saqlash' : 'Yaratish'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Bekor
            </button>
          )}
        </div>
      </form>

      {/* Ro'yxat */}
      <div className="space-y-3 lg:col-span-2">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Kategoriyalar yo&apos;q</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{category.name}</p>
                <p className="truncate text-sm text-gray-500">
                  /{category.slug}
                  {category.description && ` · ${category.description}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="btn-secondary" onClick={() => startEdit(category)}>
                  Tahrirlash
                </button>
                <button className="btn-danger" onClick={() => handleDelete(category.id)}>
                  O&apos;chirish
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
