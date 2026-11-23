'use client';

import { BellRing, Pause, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { formatTimerTime, selectPrimaryTimer, useCookingTimerStore } from '../model/timerStore';

export const TimerFloatingButton = memo(() => {
  const t = useTranslations('CookingTimer');

  const timers = useCookingTimerStore((state) => state.timers);
  const toggleOpen = useCookingTimerStore((state) => state.toggleOpen);

  const primaryTimer = selectPrimaryTimer(timers);
  const count = timers.length;
  const isAlarming = timers.some((t) => t.isAlarming);
  const isRunning = primaryTimer?.isRunning ?? false;
  const hasTime = (primaryTimer?.remainingSeconds ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={toggleOpen}
      aria-label={t('toggleAria')}
      className={`group flex items-center justify-center gap-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
        isAlarming
          ? 'bg-destructive text-destructive-foreground px-4 py-3 animate-bounce ring-4 ring-destructive/30'
          : isRunning
            ? 'bg-primary text-primary-foreground px-4 py-3 ring-2 ring-primary/20'
            : hasTime
              ? 'bg-amber-500 text-white px-4 py-3'
              : 'size-12 p-3 bg-card border border-border text-foreground hover:bg-muted hover:border-primary/40'
      }`}
    >
      {isAlarming ? (
        <>
          <BellRing className="size-5 shrink-0" />
          <span className="font-bold text-xs uppercase tracking-wider">{t('alarm')}</span>
          {count > 1 && (
            <span
              data-testid="timer-count-badge"
              className="ml-1 inline-flex items-center justify-center rounded-full bg-white/25 px-1.5 py-0.5 text-xs font-bold leading-none"
            >
              {count}
            </span>
          )}
        </>
      ) : isRunning && primaryTimer ? (
        <>
          <span className="relative flex size-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-white" />
          </span>
          <span className="font-mono font-bold text-sm tracking-tight">
            {formatTimerTime(primaryTimer.remainingSeconds)}
          </span>
          {count > 1 && (
            <span
              data-testid="timer-count-badge"
              className="ml-1 inline-flex items-center justify-center rounded-full bg-primary-foreground/25 px-1.5 py-0.5 text-xs font-bold leading-none"
            >
              {count}
            </span>
          )}
        </>
      ) : hasTime && primaryTimer ? (
        <>
          <Pause className="size-4 shrink-0" />
          <span className="font-mono font-bold text-sm tracking-tight">
            {formatTimerTime(primaryTimer.remainingSeconds)}
          </span>
          {count > 1 && (
            <span
              data-testid="timer-count-badge"
              className="ml-1 inline-flex items-center justify-center rounded-full bg-white/25 px-1.5 py-0.5 text-xs font-bold leading-none"
            >
              {count}
            </span>
          )}
        </>
      ) : (
        <Timer className="size-5 transition-transform group-hover:scale-110" />
      )}
    </button>
  );
});
TimerFloatingButton.displayName = 'TimerFloatingButton';
