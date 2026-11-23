import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { selectActiveRemainingSeconds, selectIsActiveRunning } from '../model/timerSelectors';
import { useCookingTimerStore } from '../model/timerStore';
import { useTimerUiStore } from '../model/timerUiStore';
import { CookingTimerWidget } from './CookingTimerWidget';

describe('CookingTimerWidget', () => {
  beforeEach(() => {
    useCookingTimerStore.getState().clearAllTimers();
    useCookingTimerStore.getState().dismissAlarm();
    useTimerUiStore.getState().setOpen(false);
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

    expect(selectActiveRemainingSeconds(useCookingTimerStore.getState())).toBe(450);
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

    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(true);
    expect(selectActiveRemainingSeconds(useCookingTimerStore.getState())).toBe(300);
  });

  it('allows pausing, resuming and resetting timer', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);

    const plus1mBtn = screen.getByRole('button', { name: '+1m' });
    await user.click(plus1mBtn);
    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(true);

    const pauseBtn = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseBtn);
    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(false);

    const resumeBtn = screen.getByRole('button', { name: /resume/i });
    await user.click(resumeBtn);
    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(true);

    const resetBtn = screen.getByRole('button', { name: /reset timer/i });
    await user.click(resetBtn);
    expect(selectActiveRemainingSeconds(useCookingTimerStore.getState())).toBe(0);
    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(false);
  });

  it('displays closest timer and count badge on floating button when multiple timers exist', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    act(() => {
      useCookingTimerStore.getState().addTimer(600, 'Long timer');
      useCookingTimerStore.getState().addTimer(180, 'Short timer');
    });

    const badge = screen.getByTestId('timer-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('2');

    // Closest timer (180s = 03:00) should be displayed
    expect(screen.getByText('03:00')).toBeInTheDocument();

    const triggerBtn = screen.getByRole('button', { name: /toggle cooking timer/i });
    await user.click(triggerBtn);

    // Multi-timer dialog open
    expect(screen.getByTestId('dialog-timers-count')).toHaveTextContent('2');
    expect(screen.getByText('Long timer')).toBeInTheDocument();
    expect(screen.getByText('Short timer')).toBeInTheDocument();
  });

  it('allows individual timer management (pause, delete) in multi-timer dialog', async () => {
    const user = userEvent.setup();
    render(<CookingTimerWidget />);

    let id1 = '';
    let id2 = '';
    act(() => {
      id1 = useCookingTimerStore.getState().addTimer(300, 'Pasta');
      id2 = useCookingTimerStore.getState().addTimer(600, 'Sauce');
      useTimerUiStore.getState().setOpen(true);
    });

    const card1 = screen.getByTestId(`timer-card-${id1}`);
    const card2 = screen.getByTestId(`timer-card-${id2}`);
    expect(card1).toBeInTheDocument();
    expect(card2).toBeInTheDocument();

    // Pause first timer from its specific card
    const pauseBtn1 = within(card1).getByRole('button', { name: /pause/i });
    await user.click(pauseBtn1);

    const timer1 = useCookingTimerStore.getState().timers.find((t) => t.id === id1);
    expect(timer1?.isRunning).toBe(false);

    // Delete second timer from its card
    const deleteBtn2 = within(card2).getByRole('button', { name: /delete timer/i });
    await user.click(deleteBtn2);

    expect(useCookingTimerStore.getState().timers.length).toBe(1);
    expect(useCookingTimerStore.getState().timers[0].id).toBe(id1);
  });
});
