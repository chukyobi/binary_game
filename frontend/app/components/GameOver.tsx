import React from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../stores/gameStore';

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  const router = useRouter();
  const { score, highScore } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
        <div className="mb-6">
          <p className="text-xl mb-2">Final Score: {score}</p>
          <p className="text-lg text-gray-600">High Score: {highScore}</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver; 