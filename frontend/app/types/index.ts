export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  gems: number;
  highScore: number;
  currentLevel: number;
}

export interface Level {
  id: string;
  number: number;
  name: string;
  description: string;
  difficulty: number;
  requiredScore: number;
  isUnlocked: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  type: 'binary' | 'multiple';
  difficulty: number;
  level: number;
  answer: string;
}

export interface GameState {
  score: number;
  currentQuestion: Question | null;
  isGameOver: boolean;
  isLoading: boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  textureUrl: string;
  modelUrl: string;
  animationUrls: string[];
  isUnlocked: boolean;
  unlockCost: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
} 