import { create } from 'zustand';
import api from '../utils/api';

interface Character {
  id: string;
  name: string;
  description: string;
  textureUrl: string;
  isUnlocked: boolean;
  unlockCost: number;
  modelUrl: string;
  animationUrls: string[];
}

interface Environment {
  id: string;
  name: string;
  modelUrl: string;
  thumbnailUrl: string;
}

interface AssetStore {
  characters: Character[];
  environments: Environment[];
  selectedCharacter: Character | null;
  selectedEnvironment: Environment | null;
  isLoading: boolean;
  error: string | null;
  fetchAssets: () => Promise<void>;
  selectCharacter: (characterId: string) => void;
  selectEnvironment: (environmentId: string) => void;
  unlockCharacter: (characterId: string) => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  characters: [],
  environments: [],
  selectedCharacter: null,
  selectedEnvironment: null,
  isLoading: false,
  error: null,

  fetchAssets: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/game/assets');
      set({ 
        characters: response.data.characters.map((char: any) => ({
          ...char,
          description: char.name // Use name as description since it's not in the backend model
        })), 
        environments: response.data.environments,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch characters', isLoading: false });
    }
  },

  selectCharacter: (characterId: string) => {
    const character = get().characters.find(c => c.id === characterId);
    if (character) {
      set({ selectedCharacter: character });
    }
  },

  selectEnvironment: (environmentId: string) => {
    const environment = get().environments.find(e => e.id === environmentId);
    if (environment) {
      set({ selectedEnvironment: environment });
    }
  },

  unlockCharacter: async (characterId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/game/assets/characters/${characterId}/unlock`);
      const response = await api.get('/game/assets');
      set({ 
        characters: response.data.characters.map((char: any) => ({
          ...char,
          description: char.name
        })), 
        environments: response.data.environments,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to unlock character', isLoading: false });
    }
  },
})); 