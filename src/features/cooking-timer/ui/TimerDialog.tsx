'use client';

import { useFocusTrap } from '@/shared/lib';
import { BellRing, Pause, Play, Plus, Timer, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useCallback, useEffect, useRef, useState } from 'react';
import { formatTimerTime, useCookingTimerStore } from '../model/timerStore';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';
import { TimerPresets } from './TimerPresets';

export interface TimerDialogProps {
  onClose: () => void;
}

export const TimerDialog = ({ onClose }: TimerDialogProps) => {
  const t = useTranslations('CookingTimer');

  const timers = useCookingTimerStore((state) => state.timers);
  const isAlarming = useCookingTimerStore((state) => state.isAlarming);
  const isRunning = useCookingTimerStore((state) => state.isRunning);
  const label = useCookingTimerStore((state) => state.label);

  const addTimer = useCookingTimerStore((state) => state.addTimer);
  const removeTimer = useCookingTimerStore((state) => state.removeTimer);
  const pauseTimer = useCookingTimerStore((state) => state.pauseTimer);
  const resumeTimer = useCookingTimerStore((state) => state.resumeTimer);
  const addSeconds = useCookingTimerStore((state) => state.addSeconds);
  const setTime = useCookingTimerStore((state) => state.setTime);
  const resetTimer = useCookingTimerStore((state) => state.resetTimer);
  const dismissAlarm = useCookingTimerStore((state) => state.dismissAlarm);

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [minutesInput, setMinutesInput] = useState('00');
  const [secondsInput, setSecondsInput] = useState('00');
  const [isAddingNew, setIsAddingNew] = useState(false);
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

  const handleAddQuickTimer = (seconds: number, presetLabel: string) => {
    addTimer(seconds, presetLabel, false);
    setIsAddingNew(false);
  };

  const isMultiTimerView = timers.length > 1;

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
          {isMultiTimerView ? (
            <span
              data-testid="dialog-timers-count"
              className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold"
            >
              {timers.length}
            </span>
          ) : label && label.toLowerCase() !== 'timer' ? (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">• {label}</span>
          ) : null}
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

      {isMultiTimerView ? (
        /* Список нескольких таймеров */
        <div className="space-y-3">
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {timers.map((timer) => (
              <div
                key={timer.id}
                data-testid={`timer-card-${timer.id}`}
                className={`p-3.5 rounded-2xl border transition-all ${
                  timer.isAlarming
                    ? 'bg-destructive/15 border-destructive/40 shadow-xs'
                    : timer.isRunning
                      ? 'bg-card border-border shadow-xs'
                      : 'bg-muted/40 border-border/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {timer.isAlarming ? (
                      <BellRing className="size-4 text-destructive shrink-0 animate-bounce" />
                    ) : timer.isRunning ? (
                      <span className="relative flex size-2 shrink-0">
                        <span className="animate-ping absolute inline-flex size-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full size-2 bg-primary" />
                      </span>
                    ) : (
                      <Pause className="size-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-foreground truncate">
                      {timer.label || t('title')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTimer(timer.id)}
                    aria-label={t('deleteTimer')}
                    className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-2xl tracking-tight text-foreground">
                    {formatTimerTime(timer.remainingSeconds)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {timer.isAlarming ? (
                      <button
                        type="button"
                        onClick={() => dismissAlarm(timer.id)}
                        className="px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        {t('stop')}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => addSeconds(60, timer.id)}
                          className="px-2 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer"
                        >
                          +1m
                        </button>
                        {timer.isRunning ? (
                          <button
                            type="button"
                            onClick={() => pauseTimer(timer.id)}
                            aria-label={t('pause')}
                            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all cursor-pointer"
                          >
                            <Pause className="size-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => resumeTimer(timer.id)}
                            aria-label={t('resume')}
                            className="p-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer"
                          >
                            <Play className="size-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Быстрое добавление еще одного таймера в параллель */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">{t('addTimer')}</span>
              <button
                type="button"
                onClick={() => resetTimer()}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>{t('resetTimer')}</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '+1m', sec: 60 },
                { label: '+5m', sec: 300 },
                { label: '+10m', sec: 600 },
                { label: '+15m', sec: 900 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleAddQuickTimer(p.sec, `${p.label} timer`)}
                  className="py-1.5 px-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer text-center active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Одиночный таймер (классический детальный вид) */
        <>
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
                onClick={() => dismissAlarm()}
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

          {/* Опция добавления второго таймера, если один уже запущен */}
          {timers.length === 1 && (
            <div className="pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>{t('addTimer')}</span>
              </button>

              {isAddingNew && (
                <div className="grid grid-cols-4 gap-1.5 mt-2 animate-in fade-in duration-150">
                  {[
                    { label: '+1m', sec: 60 },
                    { label: '+5m', sec: 300 },
                    { label: '+10m', sec: 600 },
                    { label: '+15m', sec: 900 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleAddQuickTimer(p.sec, `${p.label} timer`)}
                      className="py-1 px-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer text-center"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </dialog>
  );
};
