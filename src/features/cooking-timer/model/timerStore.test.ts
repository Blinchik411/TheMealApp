import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatTimerTime, useCookingTimerStore } from './timerStore';

describe('timerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useCookingTimerStore.getState().resetTimer();
    useCookingTimerStore.getState().dismissAlarm();
    useCookingTimerStore.getState().setOpen(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('formats time correctly', () => {
    expect(formatTimerTime(0)).toBe('00:00');
    expect(formatTimerTime(65)).toBe('01:05');
    expect(formatTimerTime(1500)).toBe('25:00');
    expect(formatTimerTime(3665)).toBe('01:01:05');
  });

  it('starts timer and counts down with time progression', () => {
    const store = useCookingTimerStore.getState();
    store.startTimer(10, 'Bake');

    expect(useCookingTimerStore.getState().isRunning).toBe(true);
    expect(useCookingTimerStore.getState().totalSeconds).toBe(10);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(10);
    expect(useCookingTimerStore.getState().isOpen).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(7);

    vi.advanceTimersByTime(7000);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(0);
    expect(useCookingTimerStore.getState().isRunning).toBe(false);
    expect(useCookingTimerStore.getState().isAlarming).toBe(true);
  });

  it('pauses and resumes timer', () => {
    const store = useCookingTimerStore.getState();
    store.startTimer(10, 'Simmer');

    vi.advanceTimersByTime(4000);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(6);

    useCookingTimerStore.getState().pauseTimer();
    expect(useCookingTimerStore.getState().isRunning).toBe(false);

    vi.advanceTimersByTime(3000);
    // While paused, remaining seconds shouldn't change
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(6);

    useCookingTimerStore.getState().resumeTimer();
    expect(useCookingTimerStore.getState().isRunning).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(4);
  });

  it('adds seconds to timer', () => {
    const store = useCookingTimerStore.getState();
    store.startTimer(10);

    store.addSeconds(60);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(70);
    expect(useCookingTimerStore.getState().totalSeconds).toBe(70);
  });

  it('dismisses alarm', () => {
    const store = useCookingTimerStore.getState();
    store.startTimer(1);

    vi.advanceTimersByTime(1500);
    expect(useCookingTimerStore.getState().isAlarming).toBe(true);

    useCookingTimerStore.getState().dismissAlarm();
    expect(useCookingTimerStore.getState().isAlarming).toBe(false);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(0);
  });
});
