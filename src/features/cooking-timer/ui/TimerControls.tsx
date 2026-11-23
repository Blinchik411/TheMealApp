'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import {
  selectActiveRemainingSeconds,
  selectIsActiveAlarming,
  selectIsActiveRunning,
} from '../model/timerSelectors';
import { useCookingTimerStore } from '../model/timerStore';

export interface TimerControlsProps {
  hasStarted: boolean;
  onReset: () => void;
}

export const TimerControls = memo(({ hasStarted, onReset }: TimerControlsProps) => {
  const t = useTranslations('CookingTimer');

  const isRunning = useCookingTimerStore(selectIsActiveRunning);
  const hasTime = useCookingTimerStore((state) => selectActiveRemainingSeconds(state) > 0);
  const isAlarming = useCookingTimerStore(selectIsActiveAlarming);

  const pauseActiveTimer = useCookingTimerStore((state) => state.pauseActiveTimer);
  const resumeActiveTimer = useCookingTimerStore((state) => state.resumeActiveTimer);
  const addTimer = useCookingTimerStore((state) => state.addTimer);

  return (
    <div className="flex items-center gap-2 pt-1">
      {isRunning ? (
        <button
          type="button"
          onClick={pauseActiveTimer}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95"
        >
          <Pause className="size-4" />
          <span>{t('pause')}</span>
        </button>
      ) : hasTime ? (
        <button
          type="button"
          onClick={resumeActiveTimer}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <Play className="size-4" />
          <span>{hasStarted ? t('resume') : t('start')}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => addTimer(300, '5 min timer')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <Play className="size-4" />
          <span>{t('start5m')}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onReset}
        disabled={!hasTime && !isAlarming}
        className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        title={t('resetTimer')}
        aria-label={t('resetTimer')}
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
});
TimerControls.displayName = 'TimerControls';
