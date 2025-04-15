'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import Game from '../components/Game';

export default function GamePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentLevel, score, fetchQuestion, answerQuestion } = useGameStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Game />
    </div>
  );
} 