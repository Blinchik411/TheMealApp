'use client';

import { create } from 'zustand';

export interface TimerUiState {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
}

export const useTimerUiStore = create<TimerUiState>()((set) => ({
  isOpen: false,
  setOpen: (isOpen: boolean) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
