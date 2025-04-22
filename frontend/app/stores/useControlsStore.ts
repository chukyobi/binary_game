import { create } from 'zustand';

type ControlsState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  isRunning: boolean;
  setControl: (control: Partial<ControlsState>) => void;
  resetControls: () => void;
};

export const useControlsStore = create<ControlsState>((set) => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
  isRunning: false,
  setControl: (control) => set((state) => ({ ...state, ...control })),
  resetControls: () =>
    set({
      forward: false,
      backward: false,
      left: false,
      right: false,
      isRunning: false,
    }),
}));
