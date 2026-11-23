import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { selectActiveRemainingSeconds, selectIsActiveRunning } from '../model/timerSelectors';
import { useCookingTimerStore } from '../model/timerStore';
import { useTimerUiStore } from '../model/timerUiStore';
import { InteractiveStepText } from './InteractiveStepText';

describe('InteractiveStepText', () => {
  beforeEach(() => {
    useCookingTimerStore.getState().clearAllTimers();
    useTimerUiStore.getState().setOpen(false);
  });

  it('renders plain text when no time intervals are present', () => {
    const text = 'Mix flour and eggs in a large bowl.';
    render(<InteractiveStepText text={text} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('detects and renders timer button for time intervals', async () => {
    const user = userEvent.setup();
    const text = 'Simmer soup for 15 minutes until vegetables are tender.';
    render(<InteractiveStepText text={text} />);

    const timerBtn = screen.getByRole('button', { name: /15 minutes/i });
    expect(timerBtn).toBeInTheDocument();

    await user.click(timerBtn);

    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(true);
    expect(selectActiveRemainingSeconds(useCookingTimerStore.getState())).toBe(900);
    expect(useTimerUiStore.getState().isOpen).toBe(true);
  });

  it('detects and renders timer button for Russian phrases and starts timer on click', async () => {
    const user = userEvent.setup();
    const text = 'Томите суп 20 минут на медленном огне.';
    render(<InteractiveStepText text={text} />);

    const timerBtn = screen.getByRole('button', { name: /20 минут/i });
    expect(timerBtn).toBeInTheDocument();

    await user.click(timerBtn);

    expect(selectIsActiveRunning(useCookingTimerStore.getState())).toBe(true);
    expect(selectActiveRemainingSeconds(useCookingTimerStore.getState())).toBe(1200);
    expect(useTimerUiStore.getState().isOpen).toBe(true);
  });
});
