import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse, User } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

// Login holati localStorage'da saqlanadi ('auth' kaliti ostida)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (auth) => set({ user: auth.user, accessToken: auth.accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth' },
  ),
);
