'use client';

import { useFocusTrap } from '@/shared/lib';
import { BellRing, Pause, Play, RotateCcw, Timer, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useCallback, useEffect, useRef, useState } from 'react';
import { formatTimerTime, useCookingTimerStore } from '../model/timerStore';

export const CookingTimerWidget = () => {
  const t = useTranslations('CookingTimer');
  const remainingSeconds = useCookingTimerStore((state) => state.remainingSeconds);
  const isRunning = useCookingTimerStore((state) => state.isRunning);
  const isAlarming = useCookingTimerStore((state) => state.isAlarming);
  const isOpen = useCookingTimerStore((state) => state.isOpen);
  const label = useCookingTimerStore((state) => state.label);

  const startTimer = useCookingTimerStore((state) => state.startTimer);
  const setTime = useCookingTimerStore((state) => state.setTime);
  const pauseTimer = useCookingTimerStore((state) => state.pauseTimer);
  const resumeTimer = useCookingTimerStore((state) => state.resumeTimer);
  const resetTimer = useCookingTimerStore((state) => state.resetTimer);
  const addSeconds = useCookingTimerStore((state) => state.addSeconds);
  const dismissAlarm = useCookingTimerStore((state) => state.dismissAlarm);
  const setOpen = useCookingTimerStore((state) => state.setOpen);
  const toggleOpen = useCookingTimerStore((state) => state.toggleOpen);

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

  const handleClose = useCallback(() => {
    setIsEditingTime(false);
    setOpen(false);
  }, [setOpen]);

  const modalRef = useFocusTrap<HTMLDialogElement>({
    isActive: isOpen,
    onClose: handleClose,
  });

  const handleStartEditing = () => {
    setIsEditingTime(true);
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    setMinutesInput(m.toString().padStart(2, '0'));
    setSecondsInput(s.toString().padStart(2, '0'));
  };

  const handleApplyTime = (e?: SubmitEvent<HTMLFormElement>) => {
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
  };

  const handleReset = () => {
    resetTimer();
    setHasStarted(false);
  };

  return (
    <>
      {/* Оверлей-бекдроп для закрытия по клику вне модального окна */}
      {isOpen && (
        <button
          type="button"
          tabIndex={-1}
          data-testid="timer-modal-backdrop"
          onClick={handleClose}
          aria-label={t('overlayAria')}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none z-40"
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end">
        {/* Раскрытая модальная карточка таймера */}
        {isOpen && (
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
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    • {label}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
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
            {isEditingTime ? (
              <form onSubmit={handleApplyTime} className="py-2 flex flex-col items-center">
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
                        setMinutesInput(val.slice(0, 3));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setIsEditingTime(false);
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
                        setSecondsInput(val.slice(0, 2));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setIsEditingTime(false);
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
                    onClick={() => setIsEditingTime(false)}
                    className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-2">
                <button
                  type="button"
                  onClick={handleStartEditing}
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
            )}

            {/* Пресеты быстрого добавления времени */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '+1m', sec: 60 },
                { label: '+5m', sec: 300 },
                { label: '+10m', sec: 600 },
                { label: '+30m', sec: 1800 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (remainingSeconds === 0 && !isRunning) {
                      startTimer(preset.sec, preset.label);
                    } else {
                      addSeconds(preset.sec);
                    }
                  }}
                  className="py-1.5 px-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer text-center active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Основные кнопки управления */}
            <div className="flex items-center gap-2 pt-1">
              {isRunning ? (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Pause className="size-4" />
                  <span>{t('pause')}</span>
                </button>
              ) : remainingSeconds > 0 ? (
                <button
                  type="button"
                  onClick={resumeTimer}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Play className="size-4" />
                  <span>{hasStarted ? t('resume') : t('start')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startTimer(300, '5 min timer')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Play className="size-4" />
                  <span>{t('start5m')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                disabled={remainingSeconds === 0 && !isAlarming}
                className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={t('resetTimer')}
                aria-label={t('resetTimer')}
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </dialog>
        )}

        {/* Плавающая кнопка-триггер (FAB) */}
        <button
          type="button"
          onClick={toggleOpen}
          aria-label={t('toggleAria')}
          className={`group flex items-center justify-center gap-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
            isAlarming
              ? 'bg-destructive text-destructive-foreground px-4 py-3 animate-bounce ring-4 ring-destructive/30'
              : isRunning
                ? 'bg-primary text-primary-foreground px-4 py-3 ring-2 ring-primary/20'
                : remainingSeconds > 0
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
              <span className="font-mono font-bold text-sm tracking-tight">
                {formatTimerTime(remainingSeconds)}
              </span>
            </>
          ) : remainingSeconds > 0 ? (
            <>
              <Pause className="size-4 shrink-0" />
              <span className="font-mono font-bold text-sm tracking-tight">
                {formatTimerTime(remainingSeconds)}
              </span>
            </>
          ) : (
            <Timer className="size-5 transition-transform group-hover:scale-110" />
          )}
        </button>
      </div>
    </>
  );
};
