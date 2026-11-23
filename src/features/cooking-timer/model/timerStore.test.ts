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

  it('sets custom time without starting immediately', () => {
    const store = useCookingTimerStore.getState();
    store.setTime(450, 'Custom Boil');

    expect(useCookingTimerStore.getState().isRunning).toBe(false);
    expect(useCookingTimerStore.getState().totalSeconds).toBe(450);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(450);
    expect(useCookingTimerStore.getState().label).toBe('Custom Boil');
  });

  it('has empty label initially and after reset', () => {
    expect(useCookingTimerStore.getState().label).toBe('');

    useCookingTimerStore.getState().startTimer(60, 'Custom');
    expect(useCookingTimerStore.getState().label).toBe('Custom');

    useCookingTimerStore.getState().resetTimer();
    expect(useCookingTimerStore.getState().label).toBe('');
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

  describe('Multi-Timer Parallel Support', () => {
    it('manages multiple timers ticking in parallel with unified master interval', () => {
      const store = useCookingTimerStore.getState();

      const timerId1 = store.addTimer(10, 'Pasta');
      const timerId2 = store.addTimer(20, 'Sauce');

      const state1 = useCookingTimerStore.getState();
      expect(state1.timers).toHaveLength(2);
      expect(state1.timers[0].label).toBe('Sauce');
      expect(state1.timers[1].label).toBe('Pasta');

      // Advance by 5 seconds
      vi.advanceTimersByTime(5000);

      const state2 = useCookingTimerStore.getState();
      const pasta = state2.timers.find((t) => t.id === timerId1);
      const sauce = state2.timers.find((t) => t.id === timerId2);

      expect(pasta?.remainingSeconds).toBe(5);
      expect(sauce?.remainingSeconds).toBe(15);
      expect(pasta?.isRunning).toBe(true);
      expect(sauce?.isRunning).toBe(true);

      // Advance by another 5 seconds -> Pasta should finish (0s, alarming), Sauce should have 10s left
      vi.advanceTimersByTime(5000);

      const state3 = useCookingTimerStore.getState();
      const pastaFinished = state3.timers.find((t) => t.id === timerId1);
      const sauceRunning = state3.timers.find((t) => t.id === timerId2);

      expect(pastaFinished?.remainingSeconds).toBe(0);
      expect(pastaFinished?.isRunning).toBe(false);
      expect(pastaFinished?.isAlarming).toBe(true);

      expect(sauceRunning?.remainingSeconds).toBe(10);
      expect(sauceRunning?.isRunning).toBe(true);
      expect(sauceRunning?.isAlarming).toBe(false);
    });

    it('pauses and resumes a specific timer while leaving other running', () => {
      const store = useCookingTimerStore.getState();

      const timerId1 = store.addTimer(30, 'Soup');
      const timerId2 = store.addTimer(30, 'Bread');

      vi.advanceTimersByTime(10000);

      // Pause Soup only
      store.pauseTimer(timerId1);

      expect(useCookingTimerStore.getState().timers.find((t) => t.id === timerId1)?.isRunning).toBe(
        false,
      );
      expect(useCookingTimerStore.getState().timers.find((t) => t.id === timerId2)?.isRunning).toBe(
        true,
      );

      vi.advanceTimersByTime(5000);

      // Soup should stay at 20s, Bread should tick down to 15s
      const stateAfter = useCookingTimerStore.getState();
      expect(stateAfter.timers.find((t) => t.id === timerId1)?.remainingSeconds).toBe(20);
      expect(stateAfter.timers.find((t) => t.id === timerId2)?.remainingSeconds).toBe(15);

      // Resume Soup
      store.resumeTimer(timerId1);
      expect(useCookingTimerStore.getState().timers.find((t) => t.id === timerId1)?.isRunning).toBe(
        true,
      );
    });

    it('removes a timer by id cleanly', () => {
      const store = useCookingTimerStore.getState();

      const id1 = store.addTimer(10, 'One');
      const id2 = store.addTimer(20, 'Two');

      expect(useCookingTimerStore.getState().timers).toHaveLength(2);

      store.removeTimer(id1);

      const current = useCookingTimerStore.getState();
      expect(current.timers).toHaveLength(1);
      expect(current.timers[0].id).toBe(id2);
    });
  });
});
