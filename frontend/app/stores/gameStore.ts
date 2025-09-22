// stores/gameStore.ts
import { create } from 'zustand';
import { gameApi } from '../lib/api';
import { Question, GameState } from '../types';
import { SCORE_MULTIPLIERS } from '../utils/constants';

interface GameEnvironment {
  id: string;
  name: string;
  modelUrl: string;
  description: string;
  obstacles: {
    id: string;
    name: string;
    modelUrl: string;
    meshName: string;
  }[];
}

interface GameStore extends GameState {
  currentQuestion: Question | null;
  currentLevel: number;
  score: number;
  highScore: number;
  isLoading: boolean;
  error: string | null;
  isGameOver: boolean;
  selectedEnvironment: GameEnvironment | null;
  isPaused: boolean;
  fetchQuestion: (level: number) => Promise<void>;
  answerQuestion: (answer: string) => Promise<boolean>;
  updateScore: (points: number) => void;
  resetGame: () => void;
  setGameOver: () => void;
  setPaused: (paused: boolean) => void;
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
  selectedEnvironment: null,
  isPaused: false,

  fetchQuestion: async (level: number) => {
    set({ isLoading: true, error: null });
    try {
      const question = await gameApi.getQuestion(level);
      set({ currentQuestion: question, currentLevel: level, isLoading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch question';
      set({ error: message, isLoading: false });
    }
  },

  answerQuestion: async (answer: string) => {
    const { currentQuestion, currentLevel } = get();
    if (!currentQuestion) return false;

    try {
      const isCorrect = await gameApi.submitAnswer(currentQuestion.id, answer);
      if (isCorrect) {
        const difficultyLevel = getDifficultyLevel(currentQuestion.difficulty);
        const multiplier = SCORE_MULTIPLIERS[difficultyLevel];
        const newScore = get().score + 10 * multiplier;

        set((state) => ({
          score: newScore,
          highScore: Math.max(newScore, state.highScore),
        }));

        // fetch next question
        await get().fetchQuestion(currentLevel + 1);
      } else {
        set({ isGameOver: true });
      }
      return isCorrect;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit answer';
      set({ error: message });
      return false;
    }
  },

  updateScore: (points: number) => {
    const { score, currentLevel } = get();
    const newScore = score + points;

    set((state) => ({
      score: newScore,
      highScore: Math.max(newScore, state.highScore),
    }));

    gameApi.updateScore(newScore, currentLevel).catch((error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update score';
      set({ error: message });
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
      isGameOver: false,
      selectedEnvironment: null,
    });
    get().fetchQuestion(1);
  },

  setGameOver: () => set({ isGameOver: true }),
  setPaused: (paused: boolean) => set({ isPaused: paused }),
}));
