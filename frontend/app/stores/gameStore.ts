import { create } from 'zustand';
import { gameApi } from '../lib/api';
import { Question, GameState } from '../types';
import { GEM_REWARDS, SCORE_MULTIPLIERS } from '../utils/constants';

interface GameStore extends GameState {
  currentQuestion: Question | null;
  currentLevel: number;
  score: number;
  highScore: number;
  isLoading: boolean;
  error: string | null;
  isGameOver: boolean;
  fetchQuestion: (level: number) => Promise<void>;
  answerQuestion: (answer: string) => Promise<boolean>;
  updateScore: (points: number) => void;
  resetGame: () => void;
}

const getDifficultyLevel = (difficulty: number): 'easy' | 'medium' | 'hard' => {
  if (difficulty <= 3) return 'easy';
  if (difficulty <= 6) return 'medium';
  return 'hard';
};

export const useGameStore = create<GameStore>((set, get) => ({
  currentQuestion: null,
  currentLevel: 1,
  score: 0,
  highScore: 0,
  isLoading: false,
  error: null,
  isGameOver: false,

  fetchQuestion: async (level: number) => {
    console.log('gameStore: fetchQuestion called with level:', level);
    set({ isLoading: true, error: null });
    try {
      console.log('gameStore: calling gameApi.getQuestion');
      const question = await gameApi.getQuestion(level);
      console.log('gameStore: question received:', question);
      set({ currentQuestion: question, currentLevel: level, isLoading: false });
    } catch (error) {
      console.error('gameStore: error fetching question:', error);
      set({ error: 'Failed to fetch question', isLoading: false });
    }
  },

  answerQuestion: async (answer: string) => {
    const { currentQuestion } = get();
    if (!currentQuestion) return false;

    try {
      const isCorrect = await gameApi.answerQuestion(currentQuestion.id, answer);
      if (isCorrect) {
        const { score } = get();
        const difficultyLevel = getDifficultyLevel(currentQuestion.difficulty);
        const multiplier = SCORE_MULTIPLIERS[difficultyLevel];
        const newScore = score + 10 * multiplier;
        set((state) => ({ score: newScore, highScore: Math.max(newScore, state.highScore) }));
      }
      set({ currentQuestion: null });
      return isCorrect;
    } catch (error) {
      set({ error: 'Failed to submit answer' });
      return false;
    }
  },

  updateScore: (points: number) => {
    const { score, currentLevel } = get();
    const newScore = score + points;
    set((state) => ({ score: newScore, highScore: Math.max(newScore, state.highScore) }));
    gameApi.updateScore(newScore, currentLevel).catch(error => {
      set({ error: 'Failed to update score' });
    });
  },

  resetGame: () => {
    set({
      currentQuestion: null,
      currentLevel: 1,
      score: 0,
      highScore: 0,
      isLoading: false,
      error: null,
      isGameOver: false
    });
  },
})); 