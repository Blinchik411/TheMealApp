import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCookingTimerStore } from '../model/timerStore';
import { CookingTimerWidget } from './CookingTimerWidget';

describe('CookingTimerWidget', () => {
  beforeEach(() => {
    useCookingTimerStore.getState().resetTimer();
    useCookingTimerStore.getState().dismissAlarm();
    useCookingTimerStore.getState().setOpen(false);
  });

  it('renders trigger button and toggles open state', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    expect(triggerBtn).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /kitchen timer/i })).not.toBeInTheDocument();

    await user.click(triggerBtn);
    expect(screen.getByRole('region', { name: /kitchen timer/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close timer panel/i });
    await user.click(closeBtn);
    expect(screen.queryByRole('region', { name: /kitchen timer/i })).not.toBeInTheDocument();
  });

  it('allows starting timer from preset buttons', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);

    const plus5mBtn = screen.getByRole('button', { name: '+5m' });
    await user.click(plus5mBtn);

    expect(useCookingTimerStore.getState().isRunning).toBe(true);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(300);
  });

  it('allows pausing, resuming and resetting timer', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);

    const plus1mBtn = screen.getByRole('button', { name: '+1m' });
    await user.click(plus1mBtn);
    expect(useCookingTimerStore.getState().isRunning).toBe(true);

    const pauseBtn = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseBtn);
    expect(useCookingTimerStore.getState().isRunning).toBe(false);

    const resumeBtn = screen.getByRole('button', { name: /resume/i });
    await user.click(resumeBtn);
    expect(useCookingTimerStore.getState().isRunning).toBe(true);

    const resetBtn = screen.getByRole('button', { name: /reset timer/i });
    await user.click(resetBtn);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(0);
    expect(useCookingTimerStore.getState().isRunning).toBe(false);
  });
});
