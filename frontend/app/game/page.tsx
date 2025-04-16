'use client';

import { useGameStore } from '../stores/gameStore';
import Game from '../components/Game';
import ProtectedRoute from '../components/ProtectedRoute';

export default function GamePage() {
  const { currentLevel, score, fetchQuestion, answerQuestion } = useGameStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white">
        <Game />
      </div>
    </ProtectedRoute>
  );
} 