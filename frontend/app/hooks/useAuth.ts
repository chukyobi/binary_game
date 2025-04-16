import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { ERROR_MESSAGES } from '../utils/constants';

export const useAuth = () => {
  const router = useRouter();
  const { setUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status on mount
    const checkAuth = async () => {
      try {
        const response = await authApi.checkAuth();
        if (response.user) {
          setUser(response.user);
        }
      } catch (error) {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, clearAuth]);

  const login = async (username: string) => {
    try {
      const { user } = await authApi.login(username);
      setUser(user);
      router.push('/level-select');
    } catch (error) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  };

  const register = async (username: string) => {
    try {
      const { user } = await authApi.register(username);
      setUser(user);
      router.push('/level-select');
    } catch (error) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      router.push('/auth');
    } catch (error) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading,
  };
}; 