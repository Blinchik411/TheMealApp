'use client';

import { useFocusTrap } from '@/shared/lib';
import { BellRing, Timer, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useCookingTimerStore } from '../model/timerStore';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';
import { TimerPresets } from './TimerPresets';

export interface TimerDialogProps {
  onClose: () => void;
}

export const TimerDialog = ({ onClose }: TimerDialogProps) => {
  const t = useTranslations('CookingTimer');

  const isAlarming = useCookingTimerStore((state) => state.isAlarming);
  const isRunning = useCookingTimerStore((state) => state.isRunning);
  const label = useCookingTimerStore((state) => state.label);

  const setTime = useCookingTimerStore((state) => state.setTime);
  const resetTimer = useCookingTimerStore((state) => state.resetTimer);
  const dismissAlarm = useCookingTimerStore((state) => state.dismissAlarm);

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [minutesInput, setMinutesInput] = useState('00');
  const [secondsInput, setSecondsInput] = useState('00');
  const minutesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRunning) {
      setHasStarted(true);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isEditingTime) {
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    }
  }, [isEditingTime]);

  const modalRef = useFocusTrap<HTMLDialogElement>({
    isActive: true,
    onClose,
  });

  const handleStartEditing = useCallback(() => {
    setIsEditingTime(true);
    // Считываем секунды только в момент клика для заполнения инпутов формы
    const currentSeconds = useCookingTimerStore.getState().remainingSeconds;
    const m = Math.floor(currentSeconds / 60);
    const s = currentSeconds % 60;
    setMinutesInput(m.toString().padStart(2, '0'));
    setSecondsInput(s.toString().padStart(2, '0'));
  }, []);

  const handleCancelEditing = useCallback(() => {
    setIsEditingTime(false);
  }, []);

  const handleApplyTime = useCallback(
    (e?: SubmitEvent<HTMLFormElement>) => {
      e?.preventDefault();
      const mins = Math.max(0, Number.parseInt(minutesInput, 10) || 0);
      const secs = Math.max(0, Math.min(59, Number.parseInt(secondsInput, 10) || 0));
      const total = mins * 60 + secs;

      if (total > 0) {
        setTime(total);
        setHasStarted(false);
      } else {
        resetTimer();
        setHasStarted(false);
      }
      setIsEditingTime(false);
    },
    [minutesInput, secondsInput, setTime, resetTimer],
  );

  const handleReset = useCallback(() => {
    resetTimer();
    setHasStarted(false);
  }, [resetTimer]);

  return (
    <dialog
      open
      ref={modalRef}
      aria-modal="true"
      aria-labelledby="cooking-timer-title"
      className="relative mb-3 w-[calc(100vw-3rem)] max-w-xs sm:w-88 bg-card/95 backdrop-blur-md border border-border rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 m-0 text-foreground"
    >
      {/* Шапка карточки */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Timer className="size-4 text-primary" />
          <h2 id="cooking-timer-title" className="font-bold text-sm text-foreground">
            {t('title')}
          </h2>
          {label && label.toLowerCase() !== 'timer' && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">• {label}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label={t('closeAria')}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Оповещение об окончании времени */}
      {isAlarming && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-between gap-2 animate-bounce"
        >
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <BellRing className="size-5 shrink-0" />
            <span>{t('timeIsUp')}</span>
          </div>
          <button
            type="button"
            onClick={dismissAlarm}
            className="px-3 py-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {t('stop')}
          </button>
        </div>
      )}

      {/* Цифровой циферблат и форма ручного ввода времени */}
      <TimerDisplay
        isEditingTime={isEditingTime}
        minutesInput={minutesInput}
        secondsInput={secondsInput}
        minutesInputRef={minutesInputRef}
        onStartEditing={handleStartEditing}
        onCancelEditing={handleCancelEditing}
        onApplyTime={handleApplyTime}
        onChangeMinutes={setMinutesInput}
        onChangeSeconds={setSecondsInput}
      />

      {/* Пресеты быстрого добавления времени */}
      <TimerPresets />

      {/* Основные кнопки управления */}
      <TimerControls hasStarted={hasStarted} onReset={handleReset} />
    </dialog>
  );
};
