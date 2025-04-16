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
  isAuthenticated: boolean;
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
  get isAuthenticated() {
    return get().user !== null;
  },

  setUser: (user: User | null) => set({ user }),
  clearAuth: () => set({ user: null, error: null }),

  login: async (username: string) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(username);
      set({ user: response.user, isLoading: false });
    } catch (error) {
      set({ error: 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (username: string) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(username);
      set({ user: response.user, isLoading: false });
    } catch (error) {
      set({ error: 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ error: 'Logout failed', isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      console.log('Checking authentication status...');
      const response = await authApi.checkAuth();
      console.log('Auth check successful:', response.user ? 'User authenticated' : 'No user found');
      set({ user: response.user, isLoading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, error: 'Authentication check failed', isLoading: false });
    }
  },
})); 