'use client';

import { memo } from 'react';
import { selectActiveTimer } from '../model/timerSelectors';
import { useCookingTimerStore } from '../model/timerStore';

const PRESETS = [
  { label: '+1m', sec: 60 },
  { label: '+5m', sec: 300 },
  { label: '+10m', sec: 600 },
  { label: '+30m', sec: 1800 },
] as const;

export const TimerPresets = memo(() => {
  const handleClick = (sec: number, label: string) => {
    const store = useCookingTimerStore.getState();
    const active = selectActiveTimer(store);

    if (!active || (active.remainingSeconds === 0 && !active.isRunning)) {
      store.addTimer(sec, label);
    } else {
      store.addSeconds(active.id, sec);
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
