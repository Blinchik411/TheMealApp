'use client';

import { create } from 'zustand';
import { playTimerAlarm } from '../lib/timerAudio';

export interface CookingTimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isAlarming: boolean;
  isOpen: boolean;
  label: string;

  startTimer: (seconds: number, label?: string) => void;
  setTime: (seconds: number, label?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  addSeconds: (seconds: number) => void;
  dismissAlarm: () => void;
  setOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
}

export const formatTimerTime = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

let timerInterval: ReturnType<typeof setInterval> | null = null;
let targetEndTime = 0;

const clearTimerInterval = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

export const useCookingTimerStore = create<CookingTimerState>()((set, get) => ({
  totalSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,
  isAlarming: false,
  isOpen: false,
  label: '',

  startTimer: (seconds: number, label?: string) => {
    if (seconds <= 0) return;

    clearTimerInterval();
    targetEndTime = Date.now() + seconds * 1000;

    const timerLabel = label || `${Math.ceil(seconds / 60)} min timer`;

    set({
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      isAlarming: false,
      isOpen: true,
      label: timerLabel,
    });

    timerInterval = setInterval(() => {
      const left = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
      if (left <= 0) {
        clearTimerInterval();
        set({ remainingSeconds: 0, isRunning: false, isAlarming: true, isOpen: true });
        playTimerAlarm();
      } else {
        set({ remainingSeconds: left });
      }
    }, 500);
  },

  setTime: (seconds: number, label?: string) => {
    clearTimerInterval();
    const safeSeconds = Math.max(0, Math.floor(seconds));

    set({
      totalSeconds: safeSeconds,
      remainingSeconds: safeSeconds,
      isRunning: false,
      isAlarming: false,
      label: label || '',
    });
  },

  pauseTimer: () => {
    clearTimerInterval();
    set({ isRunning: false });
  },

  resumeTimer: () => {
    const { remainingSeconds, isRunning } = get();
    if (remainingSeconds <= 0 || isRunning) return;

    clearTimerInterval();
    targetEndTime = Date.now() + remainingSeconds * 1000;

    set({ isRunning: true, isAlarming: false });

    timerInterval = setInterval(() => {
      const left = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
      if (left <= 0) {
        clearTimerInterval();
        set({ remainingSeconds: 0, isRunning: false, isAlarming: true, isOpen: true });
        playTimerAlarm();
      } else {
        set({ remainingSeconds: left });
      }
    }, 500);
  },

  resetTimer: () => {
    clearTimerInterval();
    set({
      remainingSeconds: 0,
      totalSeconds: 0,
      isRunning: false,
      isAlarming: false,
      label: '',
    });
  },

  addSeconds: (secondsToAdd: number) => {
    const { remainingSeconds, totalSeconds, isRunning } = get();
    const newRemaining = remainingSeconds + secondsToAdd;
    const newTotal = Math.max(totalSeconds + secondsToAdd, newRemaining);

    if (isRunning) {
      targetEndTime += secondsToAdd * 1000;
    }

    set({
      remainingSeconds: newRemaining,
      totalSeconds: newTotal,
      isAlarming: false,
    });
  },

  dismissAlarm: () => {
    clearTimerInterval();
    set({
      isAlarming: false,
      remainingSeconds: 0,
      totalSeconds: 0,
      isRunning: false,
    });
  },

  setOpen: (isOpen: boolean) => set({ isOpen }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
