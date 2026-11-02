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
    expect(triggerBtn).toHaveClass('justify-center');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(triggerBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Does not render redundant "• Timer" text
    expect(screen.queryByText(/• timer/i)).not.toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close timer panel/i });
    await user.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('allows clicking time to enter custom time and applies it', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);

    const timeBtn = screen.getByRole('button', { name: /click to edit time/i });
    expect(timeBtn).toBeInTheDocument();
    await user.click(timeBtn);

    const minutesInput = screen.getByLabelText(/minutes/i);
    const secondsInput = screen.getByLabelText(/seconds/i);
    expect(minutesInput).toBeInTheDocument();
    expect(secondsInput).toBeInTheDocument();

    await user.clear(minutesInput);
    await user.type(minutesInput, '7');
    await user.clear(secondsInput);
    await user.type(secondsInput, '30');

    const setTimeBtn = screen.getByRole('button', { name: /^set time$/i });
    await user.click(setTimeBtn);

    expect(useCookingTimerStore.getState().remainingSeconds).toBe(450);
    expect(screen.getAllByText('07:30').length).toBeGreaterThanOrEqual(1);
  });

  it('closes modal on Escape key press', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal on backdrop click outside the dialog', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const backdrop = screen.getByTestId('timer-modal-backdrop');
    await user.click(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has accessible dialog role and aria attributes', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'cooking-timer-title');
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
