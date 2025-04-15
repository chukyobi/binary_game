'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from './components/SplashScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuthStore } from './stores/authStore';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // Show splash screen for 4.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setShowLoading(true);
    }, 4500);

    // Check auth status after splash screen and loading
    const authTimer = setTimeout(() => {
      setShowLoading(false);
      if (user) {
        router.push('/menu');
      } else {
        router.push('/auth');
      }
    }, 7000); // Increased to 7 seconds total

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(authTimer);
    };
  }, [user, router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return null;
} 