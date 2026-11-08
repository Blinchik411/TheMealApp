'use client';

import { BellRing, Pause, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { formatTimerTime, useCookingTimerStore } from '../model/timerStore';

// Изолированный индикатор времени внутри плавающей кнопки
const TimerFabTime = memo(() => {
  const remainingSeconds = useCookingTimerStore((state) => state.remainingSeconds);
  return (
    <span className="font-mono font-bold text-sm tracking-tight">
      {formatTimerTime(remainingSeconds)}
    </span>
  );
});
TimerFabTime.displayName = 'TimerFabTime';

export const TimerFloatingButton = memo(() => {
  const t = useTranslations('CookingTimer');

  const isAlarming = useCookingTimerStore((state) => state.isAlarming);
  const isRunning = useCookingTimerStore((state) => state.isRunning);
  const hasTime = useCookingTimerStore((state) => state.remainingSeconds > 0);
  const toggleOpen = useCookingTimerStore((state) => state.toggleOpen);

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
        </>
      ) : isRunning ? (
        <>
          <span className="relative flex size-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-white" />
          </span>
          <TimerFabTime />
        </>
      ) : hasTime ? (
        <>
          <Pause className="size-4 shrink-0" />
          <TimerFabTime />
        </>
      ) : (
        <Timer className="size-5 transition-transform group-hover:scale-110" />
      )}
    </button>
  );
});
TimerFloatingButton.displayName = 'TimerFloatingButton';
