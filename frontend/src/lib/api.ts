import { useAuthStore } from '@/store/auth-store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

// Backend'dagi rasm yo'lini to'liq URL'ga aylantiradi
export function imageUrl(path?: string | null): string {
  return path ? `${API_URL}${path}` : '/placeholder.svg';
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown; // JSON sifatida yuboriladi
  formData?: FormData; // fayl yuklash uchun
}

// Barcha so'rovlar uchun yagona funksiya.
// Backend javoblari { success, data } formatida keladi - shu yerda ochiladi.
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.formData ?? (options.body ? JSON.stringify(options.body) : undefined),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    // Token eskirgan bo'lsa - foydalanuvchini chiqarib yuboramiz
    if (res.status === 401 && token) {
      useAuthStore.getState().logout();
    }
    const message = Array.isArray(json?.message)
      ? json.message.join(', ')
      : json?.message ?? 'Xatolik yuz berdi';
    throw new Error(message);
  }

  return json.data as T;
}
