export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const GAME_SETTINGS = {
  SOUND_ENABLED: 'soundEnabled',
  MUSIC_ENABLED: 'musicEnabled',
  DIFFICULTY: 'difficulty',
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const GAME_STATES = {
  MENU: 'menu',
  LEVEL_SELECT: 'level-select',
  GAME: 'game',
  GAME_OVER: 'game-over',
} as const;

export const SCORE_MULTIPLIERS = {
  [DIFFICULTY_LEVELS.EASY]: 1,
  [DIFFICULTY_LEVELS.MEDIUM]: 1.5,
  [DIFFICULTY_LEVELS.HARD]: 2,
} as const;

export const GEM_REWARDS = {
  CORRECT_ANSWER: 10,
  LEVEL_COMPLETION: 50,
  ACHIEVEMENT: 100,
} as const;

export const CHARACTER_COSTS = {
  DEFAULT: 0,
  RARE: 500,
  EPIC: 1000,
  LEGENDARY: 2000,
} as const;

export const ACHIEVEMENTS = {
  FIRST_WIN: 'First Win',
  PERFECT_SCORE: 'Perfect Score',
  LEVEL_MASTER: 'Level Master',
  GEM_COLLECTOR: 'Gem Collector',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
} as const; 