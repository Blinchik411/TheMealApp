'use client';

import { playTimerAlarm } from '../lib/timerAudio';
import { useCookingTimerStore } from './timerStore';
import { useTimerUiStore } from './timerUiStore';

export const initTimerEffects = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  return useCookingTimerStore.subscribe((state, prevState) => {
    const prevAlarmingIds = new Set(prevState.timers.filter((t) => t.isAlarming).map((t) => t.id));
    const hasNewAlarm = state.timers.some((t) => t.isAlarming && !prevAlarmingIds.has(t.id));

    if (hasNewAlarm) {
      playTimerAlarm();
      useTimerUiStore.getState().setOpen(true);
    }
  });
};
