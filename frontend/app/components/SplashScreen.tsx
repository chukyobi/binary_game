'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SplashScreen: React.FC = () => {
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show logo after 2 seconds
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 2000);

    // Start fade out after 4 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Navigate to auth page after 4.5 seconds
    const navigateTimer = setTimeout(() => {
      router.push('/auth');
    }, 4500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-gray-900 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <div className={`transition-all duration-1000 transform ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-6xl font-bold text-white mb-4">Binary Game</h1>
          <p className="text-xl text-gray-300">Learn binary numbers through gameplay</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 