import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

interface Level {
  level: number;
  name: string;
  description: string;
  difficulty: string;
  unlocked: boolean;
}

const LevelSelect: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchQuestion } = useGameStore();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await axios.get('/api/game/levels');
        const levelsData = response.data.map((level: number) => ({
          level,
          name: `Level ${level}`,
          description: `Convert ${level * 2}-bit binary numbers`,
          difficulty: level <= 3 ? 'Easy' : level <= 6 ? 'Medium' : 'Hard',
          unlocked: (user?.currentLevel ?? 0) >= level
        }));
        setLevels(levelsData);
      } catch (error) {
        console.error('Failed to fetch levels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, [user?.currentLevel]);

  const handleLevelSelect = async (level: number) => {
    if (!levels.find(l => l.level === level)?.unlocked) return;
    setSelectedLevel(level);
    setShowTutorial(true);
  };

  const handleStartGame = async () => {
    if (selectedLevel) {
      await fetchQuestion(selectedLevel);
      router.push('/game');
    }
  };

  const tutorialContent = {
    1: {
      title: '2-Bit Binary Conversion',
      steps: [
        'Each position in binary represents a power of 2',
        'Rightmost position is 2^0 (1)',
        'Next position is 2^1 (2)',
        'Add the values where there is a 1',
      ],
      example: 'Example: 10 in binary = 1×2 + 0×1 = 2 in decimal',
    },
    2: {
      title: '4-Bit Binary Conversion',
      steps: [
        'Same as 2-bit but with more positions',
        'Positions from right: 1, 2, 4, 8',
        'Add values where there is a 1',
        'Maximum value is 15 (1111)',
      ],
      example: 'Example: 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10',
    },
    3: {
      title: '8-Bit Binary Conversion',
      steps: [
        'Positions from right: 1, 2, 4, 8, 16, 32, 64, 128',
        'Add values where there is a 1',
        'Maximum value is 255 (11111111)',
        'Practice makes perfect!',
      ],
      example: 'Example: 11001010 = 128 + 64 + 8 + 2 = 202',
    },
  };

  const gameRules = [
    'Convert binary numbers to decimal as fast as you can',
    'Each correct answer gives you 10 gems',
    'Use gems to unlock hints when stuck',
    'Complete levels to unlock new characters',
    'Try to beat your high score!',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Loading levels...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {!showTutorial ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white">Select Level</h1>
              <p className="mt-2 text-xl text-gray-300">
                Choose your challenge level
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((level) => (
                <div
                  key={level.level}
                  className={`relative rounded-lg border p-6 cursor-pointer transition-all ${
                    level.unlocked
                      ? 'border-indigo-500 bg-gray-800 hover:bg-gray-700'
                      : 'border-gray-700 bg-gray-800 opacity-50'
                  }`}
                  onClick={() => handleLevelSelect(level.level)}
                >
                  {!level.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">{level.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        level.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800'
                          : level.difficulty === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {level.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">{level.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {tutorialContent[selectedLevel as keyof typeof tutorialContent].title}
              </h2>
              
              <div className="space-y-4">
                {tutorialContent[selectedLevel as keyof typeof tutorialContent].steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white mr-3">
                      {index + 1}
                    </span>
                    <p className="text-gray-300">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                <p className="text-white font-medium">Example:</p>
                <p className="text-gray-300 mt-2">
                  {tutorialContent[selectedLevel as keyof typeof tutorialContent].example}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Game Rules</h3>
                <ul className="space-y-2">
                  {gameRules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-400 mr-2">•</span>
                      <span className="text-gray-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="mr-4 px-4 py-2 text-gray-300 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Start Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelSelect; 