import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

const TestModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const trapRef = useFocusTrap<HTMLDialogElement>({
    isActive: isOpen,
    onClose,
    initialFocusRef: inputRef,
  });

  if (!isOpen) return null;

  return (
    <dialog ref={trapRef} open>
      <input ref={inputRef} data-testid="first-input" />
      <button type="button" data-testid="middle-button">
        Middle
      </button>
      <button type="button" data-testid="last-button">
        Last
      </button>
    </dialog>
  );
};

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('sets initial focus to initialFocusRef and locks body scroll', () => {
    render(<TestModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('first-input')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<TestModal isOpen={true} onClose={handleClose} />);

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus inside the modal on Tab and Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<TestModal isOpen={true} onClose={vi.fn()} />);

    const firstInput = screen.getByTestId('first-input');
    const middleButton = screen.getByTestId('middle-button');
    const lastButton = screen.getByTestId('last-button');

    expect(firstInput).toHaveFocus();

    // Tab forward
    await user.tab();
    expect(middleButton).toHaveFocus();

    await user.tab();
    expect(lastButton).toHaveFocus();

    // Tab from last element wraps to first element
    await user.tab();
    expect(firstInput).toHaveFocus();

    // Shift + Tab from first element wraps to last element
    await user.tab({ shift: true });
    expect(lastButton).toHaveFocus();
  });

  it('restores previous active element focus on unmount', async () => {
    const TestWrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" data-testid="trigger-btn" onClick={() => setOpen(true)}>
            Open
          </button>
          <TestModal isOpen={open} onClose={() => setOpen(false)} />
        </div>
      );
    };

    const user = userEvent.setup();
    render(<TestWrapper />);

    const trigger = screen.getByTestId('trigger-btn');
    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByTestId('first-input')).toHaveFocus();

    await user.keyboard('{Escape}');
    // When closed, body overflow is restored
    expect(document.body.style.overflow).toBe('');
  });
});
