'use client';

import { useTranslations } from 'next-intl';
import type { RefObject, SubmitEvent } from 'react';
import { formatTimerTime, useCookingTimerStore } from '../model/timerStore';

export interface TimerDisplayProps {
  isEditingTime: boolean;
  minutesInput: string;
  secondsInput: string;
  minutesInputRef: RefObject<HTMLInputElement | null>;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onApplyTime: (e?: SubmitEvent<HTMLFormElement>) => void;
  onChangeMinutes: (value: string) => void;
  onChangeSeconds: (value: string) => void;
}

export const TimerDisplay = ({
  isEditingTime,
  minutesInput,
  secondsInput,
  minutesInputRef,
  onStartEditing,
  onCancelEditing,
  onApplyTime,
  onChangeMinutes,
  onChangeSeconds,
}: TimerDisplayProps) => {
  const t = useTranslations('CookingTimer');
  // Точечная подписка на секунды — только этот компонент ререндерится при тике таймера!
  const remainingSeconds = useCookingTimerStore((state) => state.remainingSeconds);

  if (isEditingTime) {
    return (
      <form onSubmit={onApplyTime} className="py-2 flex flex-col items-center">
        <div className="flex items-center justify-center gap-1.5 font-mono text-4xl sm:text-5xl font-extrabold text-foreground">
          <div className="flex flex-col items-center">
            <input
              ref={minutesInputRef}
              onFocus={(e) => e.target.select()}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={minutesInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                onChangeMinutes(val.slice(0, 3));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  onCancelEditing();
                }
              }}
              aria-label={t('minutesAria')}
              className="w-20 text-center rounded-2xl bg-muted/80 border border-primary/50 text-foreground py-1 px-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <span className="text-[11px] font-sans font-medium text-muted-foreground mt-0.5">
              {t('min')}
            </span>
          </div>

          <span className="text-muted-foreground/60 pb-5">:</span>

          <div className="flex flex-col items-center">
            <input
              onFocus={(e) => e.target.select()}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={secondsInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                onChangeSeconds(val.slice(0, 2));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  onCancelEditing();
                }
              }}
              aria-label={t('secondsAria')}
              className="w-20 text-center rounded-2xl bg-muted/80 border border-primary/50 text-foreground py-1 px-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <span className="text-[11px] font-sans font-medium text-muted-foreground mt-0.5">
              {t('sec')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {t('setTime')}
          </button>
          <button
            type="button"
            onClick={onCancelEditing}
            className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="text-center py-2">
      <button
        type="button"
        onClick={onStartEditing}
        title={t('clickToSetTime')}
        aria-label={t('clickToEditAria', { time: formatTimerTime(remainingSeconds) })}
        className="group relative inline-flex flex-col items-center px-4 py-1.5 rounded-2xl hover:bg-muted/60 border border-transparent hover:border-border/60 transition-all cursor-pointer"
      >
        <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-foreground select-none group-hover:text-primary transition-colors">
          {formatTimerTime(remainingSeconds)}
        </div>
        <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
          {t('clickToSetTime')}
        </span>
      </button>
    </div>
  );
};
