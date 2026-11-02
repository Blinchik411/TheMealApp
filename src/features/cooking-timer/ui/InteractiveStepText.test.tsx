import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCookingTimerStore } from '../model/timerStore';
import { InteractiveStepText } from './InteractiveStepText';

describe('InteractiveStepText', () => {
  beforeEach(() => {
    useCookingTimerStore.getState().resetTimer();
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

    expect(useCookingTimerStore.getState().isRunning).toBe(true);
    expect(useCookingTimerStore.getState().remainingSeconds).toBe(900);
    expect(useCookingTimerStore.getState().isOpen).toBe(true);
  });
});
