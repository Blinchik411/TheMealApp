'use client';

import { create } from 'zustand';
import { selectActiveTimer } from './timerSelectors';
import { ensureTicker, stopTicker } from './timerTickerService';
import type { ActiveTimer } from './types';

export interface CookingTimerState {
  timers: ActiveTimer[];
  activeTimerId: string | null;

  // Multi-timer actions
  addTimer: (seconds: number, label?: string) => string;
  removeTimer: (id: string) => void;
  clearAllTimers: () => void;
  setActiveTimerId: (id: string | null) => void;

  // Specific timer controls (strictly typed, required id)
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  addSeconds: (id: string, seconds: number) => void;
  dismissAlarm: (id?: string) => void;

  // Active / single timer actions
  pauseActiveTimer: () => void;
  resumeActiveTimer: () => void;
  resetActiveTimer: () => void;
  addSecondsToActive: (seconds: number) => void;
  setTimeForActive: (seconds: number, label?: string) => void;
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

const tickTimers = (): void => {
  const { timers } = useCookingTimerStore.getState();
  const hasRunning = timers.some((t) => t.isRunning);

  if (!hasRunning) {
    stopTicker();
    return;
  }

  const now = Date.now();
  let changed = false;

  const updatedTimers = timers.map((timer) => {
    if (!timer.isRunning) return timer;

    const remaining = Math.max(0, Math.ceil((timer.targetEndTime - now) / 1000));
    if (remaining <= 0) {
      changed = true;
      return {
        ...timer,
        remainingSeconds: 0,
        isRunning: false,
        isAlarming: true,
      };
    }

    if (timer.remainingSeconds !== remaining) {
      changed = true;
      return {
        ...timer,
        remainingSeconds: remaining,
      };
    }

    return timer;
  });

  if (changed) {
    useCookingTimerStore.setState({ timers: updatedTimers });
  }
};

export const useCookingTimerStore = create<CookingTimerState>()((set, get) => ({
  timers: [],
  activeTimerId: null,

  addTimer: (seconds: number, label?: string): string => {
    if (seconds <= 0) return '';

    const id = `timer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timerLabel = label || `${Math.ceil(seconds / 60)} min timer`;
    const targetEndTime = Date.now() + seconds * 1000;

    const newTimer: ActiveTimer = {
      id,
      label: timerLabel,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      targetEndTime,
      isRunning: true,
      isAlarming: false,
      createdAt: Date.now(),
    };

    set((state) => ({
      timers: [newTimer, ...state.timers],
      activeTimerId: id,
    }));

    ensureTicker(tickTimers);
    return id;
  },

  removeTimer: (id: string): void => {
    const updated = get().timers.filter((t) => t.id !== id);
    const nextActiveId =
      get().activeTimerId === id ? (updated[0]?.id ?? null) : get().activeTimerId;

    set({
      timers: updated,
      activeTimerId: nextActiveId,
    });

    if (!updated.some((t) => t.isRunning)) {
      stopTicker();
    }
  },

  clearAllTimers: (): void => {
    stopTicker();
    set({
      timers: [],
      activeTimerId: null,
    });
  },

  setActiveTimerId: (id: string | null): void => {
    if (!id || get().timers.some((t) => t.id === id)) {
      set({ activeTimerId: id });
    }
  },

  pauseTimer: (id: string): void => {
    const updated = get().timers.map((t) => {
      if (t.id === id) {
        const left = Math.max(0, Math.ceil((t.targetEndTime - Date.now()) / 1000));
        return {
          ...t,
          isRunning: false,
          remainingSeconds: left,
        };
      }
      return t;
    });

    set({ timers: updated });

    if (!updated.some((t) => t.isRunning)) {
      stopTicker();
    }
  },

  resumeTimer: (id: string): void => {
    const updated = get().timers.map((t) => {
      if (t.id === id && t.remainingSeconds > 0) {
        return {
          ...t,
          isRunning: true,
          isAlarming: false,
          targetEndTime: Date.now() + t.remainingSeconds * 1000,
        };
      }
      return t;
    });

    set({ timers: updated });
    ensureTicker(tickTimers);
  },

  addSeconds: (id: string, seconds: number): void => {
    const updated = get().timers.map((t) => {
      if (t.id === id) {
        const newRem = t.remainingSeconds + seconds;
        const newTotal = Math.max(t.totalSeconds + seconds, newRem);
        return {
          ...t,
          remainingSeconds: newRem,
          totalSeconds: newTotal,
          targetEndTime: t.targetEndTime + seconds * 1000,
          isAlarming: false,
        };
      }
      return t;
    });

    set({ timers: updated });
  },

  dismissAlarm: (id?: string): void => {
    const updated = get().timers.map((t) => {
      if (!id || t.id === id) {
        return {
          ...t,
          isAlarming: false,
        };
      }
      return t;
    });

    set({ timers: updated });
  },

  pauseActiveTimer: (): void => {
    const active = selectActiveTimer(get());
    if (active) {
      get().pauseTimer(active.id);
    }
  },

  resumeActiveTimer: (): void => {
    const active = selectActiveTimer(get());
    if (active) {
      get().resumeTimer(active.id);
    }
  },

  resetActiveTimer: (): void => {
    const active = selectActiveTimer(get());
    if (active) {
      get().removeTimer(active.id);
    }
  },

  addSecondsToActive: (seconds: number): void => {
    const active = selectActiveTimer(get());
    if (active) {
      get().addSeconds(active.id, seconds);
    } else {
      get().addTimer(seconds, `${Math.ceil(seconds / 60)} min timer`);
    }
  },

  setTimeForActive: (seconds: number, label?: string): void => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const active = selectActiveTimer(get());

    if (active) {
      const updated = get().timers.map((t) =>
        t.id === active.id
          ? {
              ...t,
              totalSeconds: safeSeconds,
              remainingSeconds: safeSeconds,
              targetEndTime: Date.now() + safeSeconds * 1000,
              isRunning: false,
              isAlarming: false,
              label: label || t.label,
            }
          : t,
      );
      set({ timers: updated });
    } else {
      const id = `timer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newTimer: ActiveTimer = {
        id,
        label: label || '',
        totalSeconds: safeSeconds,
        remainingSeconds: safeSeconds,
        targetEndTime: Date.now() + safeSeconds * 1000,
        isRunning: false,
        isAlarming: false,
        createdAt: Date.now(),
      };
      set({
        timers: [newTimer],
        activeTimerId: id,
      });
    }
  },
}));
