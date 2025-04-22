import { create } from 'zustand';
import { gameApi } from '../lib/api';

interface Character {
  id: string;
  name: string;
  modelUrl: string;
}

interface Obstacle {
  id: string;
  name: string;
  modelUrl: string;
  meshName: string;
}

interface Environment {
  id: string;
  name: string;
  modelUrl: string;
  description: string;
  obstacles: Obstacle[];
}

interface AssetStore {
  character: Character | null;
  environment: Environment | null;
  isLoading: boolean;
  error: string | null;
  fetchAssets: () => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set) => ({
  character: null,
  environment: null,
  isLoading: false,
  error: null,

  fetchAssets: async () => {
    set({ isLoading: true, error: null });

    console.log('[AssetStore] Fetching assets...');

    try {
      const { character = null, environment = null } = await gameApi.getAssets();

      console.log('[AssetStore] Character:', character);
      console.log('[AssetStore] Environment:', environment);

      set({
        character,
        environment,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to fetch game assets';

        console.error('[AssetStore] Error fetching assets:', message, error);

      set({
        character: null,
        environment: null,
        isLoading: false,
        error: message,
      });
    }
  },
}));
