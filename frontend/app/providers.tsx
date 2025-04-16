'use client';

import React, { useEffect, useState } from 'react';
import { useAssetStore } from './stores/assetStore';
import LoadingSpinner from './components/LoadingSpinner';

export function Providers({ children }: { children: React.ReactNode }) {
  const { fetchAssets } = useAssetStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchAssets();
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []); // Only run once on mount

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
} 