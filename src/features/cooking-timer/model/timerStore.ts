'use client';

import { create } from 'zustand';
import { playTimerAlarm } from '../lib/timerAudio';

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  targetEndTime: number;
  isRunning: boolean;
  isAlarming: boolean;
  createdAt: number;
}

export interface CookingTimerState {
  // Multi-timer collections
  timers: ActiveTimer[];
  activeTimerId: string | null;

  // Global / backward-compatible view of active timer
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isAlarming: boolean;
  isOpen: boolean;
  label: string;

  // Multi-timer actions
  addTimer: (seconds: number, label?: string, openDialog?: boolean) => string;
  removeTimer: (id: string) => void;
  setActiveTimerId: (id: string | null) => void;

  // General controls (support optional id for target timer or fallback to active)
  startTimer: (seconds: number, label?: string) => void;
  setTime: (seconds: number, label?: string) => void;
  pauseTimer: (id?: string) => void;
  resumeTimer: (id?: string) => void;
  resetTimer: (id?: string) => void;
  addSeconds: (seconds: number, id?: string) => void;
  dismissAlarm: (id?: string) => void;
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

let masterInterval: ReturnType<typeof setInterval> | null = null;

const stopMasterInterval = () => {
  if (masterInterval) {
    clearInterval(masterInterval);
    masterInterval = null;
  }
};

const tickTimers = () => {
  const state = useCookingTimerStore.getState();
  const { timers } = state;
  const hasRunning = timers.some((t) => t.isRunning);

  if (!hasRunning) {
    stopMasterInterval();
    return;
  }

  const now = Date.now();
  let alarmedAny = false;
  let changed = false;

  const updatedTimers = timers.map((timer) => {
    if (!timer.isRunning) return timer;

    const remaining = Math.max(0, Math.ceil((timer.targetEndTime - now) / 1000));
    if (remaining <= 0) {
      if (!timer.isAlarming) {
        alarmedAny = true;
      }
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

  if (alarmedAny) {
    playTimerAlarm();
  }

  if (changed || alarmedAny) {
    const active = updatedTimers.find((t) => t.id === state.activeTimerId) || updatedTimers[0];
    useCookingTimerStore.setState({
      timers: updatedTimers,
      remainingSeconds: active ? active.remainingSeconds : 0,
      totalSeconds: active ? active.totalSeconds : 0,
      isRunning: active ? active.isRunning : false,
      isAlarming: updatedTimers.some((t) => t.isAlarming),
      label: active ? active.label : '',
      isOpen: alarmedAny ? true : state.isOpen,
    });
  }
};

const ensureMasterInterval = () => {
  if (masterInterval) return;
  masterInterval = setInterval(tickTimers, 500);
};

export const useCookingTimerStore = create<CookingTimerState>()((set, get) => ({
  timers: [],
  activeTimerId: null,
  totalSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,
  isAlarming: false,
  isOpen: false,
  label: '',

  addTimer: (seconds: number, label?: string, openDialog = true) => {
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

    const nextTimers = [newTimer, ...get().timers];

    set((state) => ({
      timers: nextTimers,
      activeTimerId: id,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      isAlarming: false,
      label: timerLabel,
      isOpen: openDialog ? true : state.isOpen,
    }));

    ensureMasterInterval();
    return id;
  },

  removeTimer: (id: string) => {
    const updated = get().timers.filter((t) => t.id !== id);
    const nextActive = updated[0]?.id || null;
    const active = updated[0];

    set({
      timers: updated,
      activeTimerId: nextActive,
      totalSeconds: active ? active.totalSeconds : 0,
      remainingSeconds: active ? active.remainingSeconds : 0,
      isRunning: active ? active.isRunning : false,
      isAlarming: updated.some((t) => t.isAlarming),
      label: active ? active.label : '',
    });

    if (!updated.some((t) => t.isRunning)) {
      stopMasterInterval();
    }
  },

  setActiveTimerId: (id: string | null) => {
    const active = get().timers.find((t) => t.id === id);
    if (!active) {
      set({ activeTimerId: null });
      return;
    }
    set({
      activeTimerId: id,
      totalSeconds: active.totalSeconds,
      remainingSeconds: active.remainingSeconds,
      isRunning: active.isRunning,
      label: active.label,
    });
  },

  startTimer: (seconds: number, label?: string) => {
    get().addTimer(seconds, label, true);
  },

  setTime: (seconds: number, label?: string) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const activeId = get().activeTimerId;
    const timerLabel = label || '';

    if (activeId && get().timers.some((t) => t.id === activeId)) {
      const updated = get().timers.map((t) =>
        t.id === activeId
          ? {
              ...t,
              totalSeconds: safeSeconds,
              remainingSeconds: safeSeconds,
              targetEndTime: Date.now() + safeSeconds * 1000,
              isRunning: false,
              isAlarming: false,
              label: timerLabel || t.label,
            }
          : t,
      );
      set({
        timers: updated,
        totalSeconds: safeSeconds,
        remainingSeconds: safeSeconds,
        isRunning: false,
        isAlarming: false,
        label: timerLabel,
      });
    } else {
      const id = `timer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newTimer: ActiveTimer = {
        id,
        label: timerLabel,
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
        totalSeconds: safeSeconds,
        remainingSeconds: safeSeconds,
        isRunning: false,
        isAlarming: false,
        label: timerLabel,
      });
    }
  },

  pauseTimer: (id?: string) => {
    const targetId =
      typeof id === 'string' && id.trim()
        ? id.trim()
        : get().activeTimerId || get().timers.find((t) => t.isRunning)?.id;
    if (!targetId) {
      set({ isRunning: false });
      return;
    }

    const updated = get().timers.map((t) => {
      if (t.id === targetId) {
        const left = Math.max(0, Math.ceil((t.targetEndTime - Date.now()) / 1000));
        return {
          ...t,
          isRunning: false,
          remainingSeconds: left,
        };
      }
      return t;
    });

    const active = updated.find((t) => t.id === get().activeTimerId) || updated[0];
    set({
      timers: updated,
      isRunning: active ? active.isRunning : false,
      remainingSeconds: active ? active.remainingSeconds : 0,
    });

    if (!updated.some((t) => t.isRunning)) {
      stopMasterInterval();
    }
  },

  resumeTimer: (id?: string) => {
    const targetId =
      typeof id === 'string' && id.trim()
        ? id.trim()
        : get().activeTimerId ||
          get().timers.find((t) => !t.isRunning && t.remainingSeconds > 0)?.id;
    if (!targetId) return;

    const updated = get().timers.map((t) => {
      if (t.id === targetId && t.remainingSeconds > 0) {
        return {
          ...t,
          isRunning: true,
          isAlarming: false,
          targetEndTime: Date.now() + t.remainingSeconds * 1000,
        };
      }
      return t;
    });

    const active = updated.find((t) => t.id === get().activeTimerId) || updated[0];
    set({
      timers: updated,
      isRunning: active ? active.isRunning : false,
      isAlarming: updated.some((t) => t.isAlarming),
    });

    ensureMasterInterval();
  },

  resetTimer: (id?: string) => {
    if (typeof id === 'string' && id.trim()) {
      get().removeTimer(id.trim());
      return;
    }

    stopMasterInterval();
    set({
      timers: [],
      activeTimerId: null,
      totalSeconds: 0,
      remainingSeconds: 0,
      isRunning: false,
      isAlarming: false,
      label: '',
    });
  },

  addSeconds: (secondsToAdd: number, id?: string) => {
    const targetId =
      typeof id === 'string' && id.trim() ? id.trim() : get().activeTimerId || get().timers[0]?.id;
    if (!targetId) {
      const { remainingSeconds, totalSeconds } = get();
      const newRem = remainingSeconds + secondsToAdd;
      set({
        remainingSeconds: newRem,
        totalSeconds: Math.max(totalSeconds + secondsToAdd, newRem),
        isAlarming: false,
      });
      return;
    }

    const updated = get().timers.map((t) => {
      if (t.id === targetId) {
        const newRem = t.remainingSeconds + secondsToAdd;
        const newTot = Math.max(t.totalSeconds + secondsToAdd, newRem);
        return {
          ...t,
          remainingSeconds: newRem,
          totalSeconds: newTot,
          targetEndTime: t.targetEndTime + secondsToAdd * 1000,
          isAlarming: false,
        };
      }
      return t;
    });

    const active = updated.find((t) => t.id === get().activeTimerId) || updated[0];
    set({
      timers: updated,
      remainingSeconds: active ? active.remainingSeconds : 0,
      totalSeconds: active ? active.totalSeconds : 0,
      isAlarming: updated.some((t) => t.isAlarming),
    });
  },

  dismissAlarm: (id?: string) => {
    const timerId = typeof id === 'string' && id.trim() ? id.trim() : null;
    const updated = get().timers.map((t) => {
      if (!timerId || t.id === timerId) {
        return {
          ...t,
          isAlarming: false,
        };
      }
      return t;
    });

    set({
      timers: updated,
      isAlarming: updated.some((t) => t.isAlarming),
    });
  },

  setOpen: (isOpen: boolean) => set({ isOpen }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
