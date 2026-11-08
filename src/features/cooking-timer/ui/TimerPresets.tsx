'use client';

import { memo } from 'react';
import { useCookingTimerStore } from '../model/timerStore';

const PRESETS = [
  { label: '+1m', sec: 60 },
  { label: '+5m', sec: 300 },
  { label: '+10m', sec: 600 },
  { label: '+30m', sec: 1800 },
] as const;

export const TimerPresets = memo(() => {
  const handleClick = (sec: number, label: string) => {
    // Императивное чтение текущего состояния без подписки на секунды в рендере
    const { remainingSeconds, isRunning, startTimer, addSeconds } = useCookingTimerStore.getState();

    if (remainingSeconds === 0 && !isRunning) {
      startTimer(sec, label);
    } else {
      addSeconds(sec);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => handleClick(preset.sec, preset.label)}
          className="py-1.5 px-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer text-center active:scale-95"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
});
TimerPresets.displayName = 'TimerPresets';
