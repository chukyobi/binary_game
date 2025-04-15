import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import GameOver from './GameOver';
import LoadingSpinner from './LoadingSpinner';

const GameFlowManager: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    currentQuestion, 
    isGameOver, 
    isLoading, 
    fetchQuestion, 
    answerQuestion, 
    updateScore 
  } = useGameStore();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const initializeGame = async () => {
      try {
        await fetchQuestion(user.currentLevel);
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initializeGame();
  }, [user, router, fetchQuestion]);

  const handleAnswer = async (answer: string) => {
    try {
      const isCorrect = await answerQuestion(answer);
      if (isCorrect) {
        updateScore(10);
      }
    } catch (error) {
      console.error('Failed to process answer:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (isGameOver) {
    return <GameOver onRestart={() => fetchQuestion(user?.currentLevel || 1)} />;
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Question {currentQuestion.id}
          </h2>
          <p className="text-gray-300 mb-6">{currentQuestion.question}</p>
          
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameFlowManager; 