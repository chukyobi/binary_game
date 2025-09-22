import { create } from 'zustand';
import { authApi } from '../lib/api';

interface User {
  id: string;
  username: string;
  currentLevel: number;
  gems: number;
  highScore: number;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: () => boolean; 
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  isAuthenticated: () => get().user !== null,

  setUser: (user: User | null) => set({ user }),
  clearAuth: () => set({ user: null, error: null }),

  login: async (username: string) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(username);
      set({ user: response.user, isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (username: string) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(username);
      set({ user: response.user, isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
      set({ user: null, isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Logout failed. Please try again.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  checkAuth: async () => {
    const { user, isLoading } = get();
    if (user || isLoading) return;

    console.log('[checkAuth] Authenticating...');
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.checkAuth();
      if (response.user) {
        console.log('[checkAuth] User authenticated:', response.user.username);
        set({ user: response.user });
      } else {
        console.log('[checkAuth] No user found');
        set({ user: null });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Authentication check failed.';
      console.error('[checkAuth] Failed:', message);
      set({ user: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
