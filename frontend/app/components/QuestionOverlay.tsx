import React from 'react';
import { useGameStore } from '../stores/gameStore';

interface QuestionOverlayProps {
  onAnswer: (answer: string) => void;
}

const QuestionOverlay: React.FC<QuestionOverlayProps> = ({ onAnswer }) => {
  const { currentQuestion } = useGameStore();

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(option)}
              className="w-full p-3 text-left bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionOverlay; 