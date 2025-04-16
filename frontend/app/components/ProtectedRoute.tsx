'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: Component mounted');
    
    const verifyAuth = async () => {
      console.log('ProtectedRoute: Starting auth verification');
      try {
        await checkAuth();
        console.log('ProtectedRoute: Auth verification successful');
      } catch (error) {
        console.error('ProtectedRoute: Auth verification failed:', error);
        router.push('/auth');
      } finally {
        console.log('ProtectedRoute: Setting loading to false');
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuth, router]); // Removed user from dependencies

  if (isLoading) {
    console.log('ProtectedRoute: Rendering loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, should redirect to auth');
    return null;
  }

  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute; 