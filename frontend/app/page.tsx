'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from './components/SplashScreen';
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show splash screen for 3 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setShowLoading(true);
    }, 7000);

    // Show loading spinner for 1 second then redirect to auth
    const redirectTimer = setTimeout(() => {
      setShowLoading(false);
      router.push('/auth');
    }, 7000);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

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