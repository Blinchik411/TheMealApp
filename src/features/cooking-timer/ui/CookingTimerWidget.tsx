'use client';

import { BellRing, Minus, Pause, Play, Plus, RotateCcw, Timer, X } from 'lucide-react';
import { formatTimerTime, useCookingTimerStore } from '../model/timerStore';

export const CookingTimerWidget = () => {
  const totalSeconds = useCookingTimerStore((state) => state.totalSeconds);
  const remainingSeconds = useCookingTimerStore((state) => state.remainingSeconds);
  const isRunning = useCookingTimerStore((state) => state.isRunning);
  const isAlarming = useCookingTimerStore((state) => state.isAlarming);
  const isOpen = useCookingTimerStore((state) => state.isOpen);
  const label = useCookingTimerStore((state) => state.label);

  const startTimer = useCookingTimerStore((state) => state.startTimer);
  const pauseTimer = useCookingTimerStore((state) => state.pauseTimer);
  const resumeTimer = useCookingTimerStore((state) => state.resumeTimer);
  const resetTimer = useCookingTimerStore((state) => state.resetTimer);
  const addSeconds = useCookingTimerStore((state) => state.addSeconds);
  const dismissAlarm = useCookingTimerStore((state) => state.dismissAlarm);
  const setOpen = useCookingTimerStore((state) => state.setOpen);
  const toggleOpen = useCookingTimerStore((state) => state.toggleOpen);

  const progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end">
      {/* Раскрытая карточка таймера */}
      {isOpen && (
        <section
          aria-label="Kitchen timer"
          className="mb-3 w-80 sm:w-88 bg-card/95 backdrop-blur-md border border-border rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Шапка карточки */}
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-primary" />
              <span className="font-bold text-sm text-foreground">Kitchen Timer</span>
              {label && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  • {label}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close timer panel"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Оповещение об окончании времени */}
          {isAlarming && (
            <div className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-between gap-2 animate-bounce">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <BellRing className="size-5 shrink-0" />
                <span>Time is up!</span>
              </div>
              <button
                type="button"
                onClick={dismissAlarm}
                className="px-3 py-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Stop
              </button>
            </div>
          )}

          {/* Цифровой циферблат */}
          <div className="text-center py-2">
            <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-foreground select-none">
              {formatTimerTime(remainingSeconds)}
            </div>

            {totalSeconds > 0 && (
              <div className="mt-3 space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{progressPercent}% elapsed</span>
                  <span>Total: {formatTimerTime(totalSeconds)}</span>
                </div>
              </div>
            )}
          </div>

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
                <span>Pause</span>
              </button>
            ) : remainingSeconds > 0 ? (
              <button
                type="button"
                onClick={resumeTimer}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Play className="size-4" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startTimer(300, '5 min timer')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Play className="size-4" />
                <span>Start 5m</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetTimer}
              disabled={remainingSeconds === 0 && !isAlarming}
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </section>
      )}

      {/* Плавающая кнопка-триггер (FAB) */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Toggle cooking timer"
        className={`group flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
          isAlarming
            ? 'bg-destructive text-destructive-foreground px-4 py-3 animate-bounce ring-4 ring-destructive/30'
            : isRunning
              ? 'bg-primary text-primary-foreground px-4 py-3 ring-2 ring-primary/20'
              : remainingSeconds > 0
                ? 'bg-amber-500 text-white px-4 py-3'
                : 'size-13 p-3.5 bg-card border border-border text-foreground hover:bg-muted hover:border-primary/40'
        }`}
      >
        {isAlarming ? (
          <>
            <BellRing className="size-5 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider">Alarm!</span>
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
  );
};
