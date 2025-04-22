'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from './stores/authStore';
import LoadingSpinner from './components/LoadingSpinner';

export function Providers({ children }: { children: React.ReactNode }) {
  const { user, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Define public routes that don’t need auth
  const publicRoutes = ['/', '/auth', '/login', '/signup'];

  useEffect(() => {
    const initialize = async () => {
      if (!publicRoutes.includes(pathname)) {
        await checkAuth(); 
      }
      setIsInitialized(true);
    };

    initialize();
  }, [pathname]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
