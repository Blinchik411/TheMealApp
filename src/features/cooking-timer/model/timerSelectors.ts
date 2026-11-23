import type { CookingTimerState } from './timerStore';
import type { ActiveTimer } from './types';

export const selectActiveTimer = (state: CookingTimerState): ActiveTimer | null => {
  if (state.timers.length === 0) return null;
  return state.timers.find((t) => t.id === state.activeTimerId) ?? state.timers[0] ?? null;
};

export const selectActiveRemainingSeconds = (state: CookingTimerState): number => {
  return selectActiveTimer(state)?.remainingSeconds ?? 0;
};

export const selectActiveTotalSeconds = (state: CookingTimerState): number => {
  return selectActiveTimer(state)?.totalSeconds ?? 0;
};

export const selectIsActiveRunning = (state: CookingTimerState): boolean => {
  return selectActiveTimer(state)?.isRunning ?? false;
};

export const selectIsActiveAlarming = (state: CookingTimerState): boolean => {
  return selectActiveTimer(state)?.isAlarming ?? false;
};

export const selectActiveLabel = (state: CookingTimerState): string => {
  return selectActiveTimer(state)?.label ?? '';
};

export const selectIsAnyRunning = (state: CookingTimerState): boolean => {
  return state.timers.some((t) => t.isRunning);
};

export const selectIsAnyAlarming = (state: CookingTimerState): boolean => {
  return state.timers.some((t) => t.isAlarming);
};

export const selectPrimaryTimer = (state: CookingTimerState): ActiveTimer | null => {
  const { timers } = state;
  if (timers.length === 0) return null;

  const alarming = timers.find((t) => t.isAlarming);
  if (alarming) return alarming;

  const running = timers.filter((t) => t.isRunning);
  if (running.length > 0) {
    return running.reduce((earliest, current) =>
      current.remainingSeconds < earliest.remainingSeconds ? current : earliest,
    );
  }

  const withTime = timers.filter((t) => t.remainingSeconds > 0);
  if (withTime.length > 0) {
    return withTime.reduce((earliest, current) =>
      current.remainingSeconds < earliest.remainingSeconds ? current : earliest,
    );
  }

  return timers[0] ?? null;
};
