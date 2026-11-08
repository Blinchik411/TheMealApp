import { authApi } from '@/entities/user';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthModal } from './AuthModal';

vi.mock('@/entities/user', () => ({
  authApi: {
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Milestone M2 Adversarial A11y & Focus Challenge Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Modal Open/Close Lifecycle & DOM Cleanup', () => {
    it('renders absolutely nothing in DOM when isOpen is false', () => {
      const { container } = render(<AuthModal isOpen={false} onClose={vi.fn()} />);

      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-modal-backdrop')).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    });

    it('mounts dialog, backdrop, and form controls when isOpen is true', () => {
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('open');
      expect(screen.getByTestId('auth-modal-backdrop')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('locks body scroll when opened and restores body scroll when closed', async () => {
      const user = userEvent.setup();
      const originalOverflow = document.body.style.overflow;

      const TestHarness = () => {
        const [open, setOpen] = useState(false);
        return (
          <div>
            <button type="button" onClick={() => setOpen((prev) => !prev)}>
              Toggle
            </button>
            <AuthModal isOpen={open} onClose={() => setOpen(false)} />
          </div>
        );
      };

      render(<TestHarness />);
      const toggleBtn = screen.getByRole('button', { name: /toggle/i });

      // Initially closed: overflow is original
      expect(document.body.style.overflow).toBe(originalOverflow);

      // Open modal: body overflow locked to 'hidden'
      await user.click(toggleBtn);
      expect(document.body.style.overflow).toBe('hidden');

      // Close modal: body overflow restored to original
      await user.click(toggleBtn);
      expect(document.body.style.overflow).toBe(originalOverflow);
    });

    it('survives rapid open/close toggle stress test (30 cycles) without errors or lingering elements', () => {
      const TestStressHarness = () => {
        const [open, setOpen] = useState(false);
        return (
          <div>
            <button type="button" data-testid="stress-toggle" onClick={() => setOpen((p) => !p)}>
              Toggle
            </button>
            <AuthModal isOpen={open} onClose={() => setOpen(false)} />
          </div>
        );
      };

      render(<TestStressHarness />);
      const toggleBtn = screen.getByTestId('stress-toggle');

      act(() => {
        for (let i = 0; i < 30; i++) {
          toggleBtn.click();
        }
      });

      // 30 clicks starting from false -> ended at false (even number of toggles)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('2. Dismissal Mechanisms', () => {
    it('closes on Close button (X) click', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={handleClose} />);

      const closeBtn = screen.getByRole('button', { name: /^close modal$/i });
      expect(closeBtn).toBeInTheDocument();

      await user.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on backdrop overlay click', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={handleClose} />);

      const backdrop = screen.getByTestId('auth-modal-backdrop');
      expect(backdrop).toHaveAttribute('tabindex', '-1');

      await user.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press when focused inside email input', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={handleClose} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      expect(emailInput).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press when focused inside password input', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={handleClose} />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.click(passwordInput);
      expect(passwordInput).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClose on non-Escape keys (Enter, Space, Tab)', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={handleClose} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Space}');
      await user.keyboard('{Tab}');

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('3. Focus Trapping, Initial Focus & Keyboard Navigation', () => {
    it('automatically positions initial focus onto the email input', () => {
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();
    });

    it('cycles focus through all interactive elements in DOM sequence via Tab', async () => {
      const user = userEvent.setup();
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByRole('button', { name: /^close modal$/i });
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });
      const switchModeBtn = screen.getByRole('button', { name: /^sign up$/i });

      // Initial focus is on email input
      expect(emailInput).toHaveFocus();

      // Tab -> Password input
      await user.tab();
      expect(passwordInput).toHaveFocus();

      // Tab -> Submit button
      await user.tab();
      expect(submitBtn).toHaveFocus();

      // Tab -> Switch mode button (last focusable element)
      await user.tab();
      expect(switchModeBtn).toHaveFocus();

      // Tab from last element -> Traps and wraps around to Close button (first focusable element in dialog)
      await user.tab();
      expect(closeBtn).toHaveFocus();

      // Tab from Close button -> Email input
      await user.tab();
      expect(emailInput).toHaveFocus();
    });

    it('cycles focus backwards through all interactive elements via Shift+Tab', async () => {
      const user = userEvent.setup();
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByRole('button', { name: /^close modal$/i });
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });
      const switchModeBtn = screen.getByRole('button', { name: /^sign up$/i });

      // From email input, Shift+Tab goes to Close button
      expect(emailInput).toHaveFocus();
      await user.tab({ shift: true });
      expect(closeBtn).toHaveFocus();

      // From Close button (first focusable element), Shift+Tab traps and wraps to switchModeBtn (last focusable)
      await user.tab({ shift: true });
      expect(switchModeBtn).toHaveFocus();

      // Shift+Tab -> Submit button
      await user.tab({ shift: true });
      expect(submitBtn).toHaveFocus();

      // Shift+Tab -> Password input
      await user.tab({ shift: true });
      expect(passwordInput).toHaveFocus();

      // Shift+Tab -> Email input
      await user.tab({ shift: true });
      expect(emailInput).toHaveFocus();
    });

    it('intercepts focus escape and traps focus back inside dialog when document.body is active', async () => {
      const user = userEvent.setup();
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByRole('button', { name: /^close modal$/i });
      const switchModeBtn = screen.getByRole('button', { name: /^sign up$/i });

      // Create and focus a button outside the modal container to simulate focus escaping
      const outsideBtn = document.createElement('button');
      document.body.appendChild(outsideBtn);
      outsideBtn.focus();
      expect(outsideBtn).toHaveFocus();

      // Tab while outside: focus trap intercepts and redirects focus to first focusable element (closeBtn)
      await user.tab();
      expect(closeBtn).toHaveFocus();

      // Focus outside again
      outsideBtn.focus();
      expect(outsideBtn).toHaveFocus();

      // Shift+Tab while outside: focus trap intercepts and redirects focus to last focusable element (switchModeBtn)
      await user.tab({ shift: true });
      expect(switchModeBtn).toHaveFocus();

      document.body.removeChild(outsideBtn);
    });

    it('restores focus to the trigger element when the modal is closed', async () => {
      const user = userEvent.setup();
      const TestFocusRestoreHarness = () => {
        const [open, setOpen] = useState(false);
        return (
          <div>
            <button type="button" data-testid="trigger-btn" onClick={() => setOpen(true)}>
              Open Auth
            </button>
            <AuthModal isOpen={open} onClose={() => setOpen(false)} />
          </div>
        );
      };

      render(<TestFocusRestoreHarness />);
      const triggerBtn = screen.getByTestId('trigger-btn');

      // Focus the trigger button and open modal
      triggerBtn.focus();
      expect(triggerBtn).toHaveFocus();

      await user.click(triggerBtn);

      // Modal is open, focus has moved to email input
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();

      // Trigger close via Close modal button
      const closeBtn = screen.getByRole('button', { name: /^close modal$/i });
      await user.click(closeBtn);

      // Modal unmounted, focus is restored back to the trigger button
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(triggerBtn).toHaveFocus();
    });
  });

  describe('4. Double Submit Prevention & Async Form Submission', () => {
    it('disables submit button and shows loading state while API call is in-flight', async () => {
      const user = userEvent.setup();
      let resolveApi!: () => void;
      const apiPromise = new Promise<null>((res) => {
        resolveApi = () => res(null);
      });
      vi.mocked(authApi.signIn).mockReturnValueOnce(apiPromise);

      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'securePassword123');

      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeDisabled();
        expect(submitBtn).toHaveTextContent(/loading/i);
      });

      resolveApi();
    });

    it('prevents double submission when user rapidly clicks submit button multiple times', async () => {
      const user = userEvent.setup();
      let resolveApi!: () => void;
      const apiPromise = new Promise<null>((res) => {
        resolveApi = () => res(null);
      });
      vi.mocked(authApi.signIn).mockReturnValueOnce(apiPromise);

      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'securePassword123');

      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

      // First click triggers submission
      await user.click(submitBtn);

      // Verify submit button is immediately disabled
      await waitFor(() => {
        expect(submitBtn).toBeDisabled();
      });

      // Subsequent 4 rapid clicks on the disabled submit button
      await user.click(submitBtn);
      await user.click(submitBtn);
      await user.click(submitBtn);
      await user.click(submitBtn);

      // Verify authApi.signIn was called EXACTLY ONCE
      expect(authApi.signIn).toHaveBeenCalledTimes(1);
      expect(authApi.signIn).toHaveBeenCalledWith('chef@example.com', 'securePassword123');

      resolveApi();
    });

    it('prevents double submission via Enter keypress while in-flight', async () => {
      const user = userEvent.setup();
      let resolveApi!: () => void;
      const apiPromise = new Promise<null>((res) => {
        resolveApi = () => res(null);
      });
      vi.mocked(authApi.signIn).mockReturnValueOnce(apiPromise);

      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(passwordInput, 'securePassword123');

      // Submit via Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
      });

      // Try pressing Enter again while in flight
      await user.keyboard('{Enter}');
      await user.keyboard('{Enter}');

      expect(authApi.signIn).toHaveBeenCalledTimes(1);

      resolveApi();
    });

    it('re-enables submit button after API rejection so user can retry', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error('Invalid credentials'));

      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongPassword');

      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });
      await user.click(submitBtn);

      // Wait for server error to appear
      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();

      // Submit button must be re-enabled and show 'Sign In'
      expect(submitBtn).not.toBeDisabled();
      expect(submitBtn).toHaveTextContent(/sign in/i);

      // Subsequent retry succeeds
      vi.mocked(authApi.signIn).mockResolvedValueOnce(null);
      await user.click(submitBtn);

      expect(authApi.signIn).toHaveBeenCalledTimes(2);
    });
  });

  describe('5. Semantic Accessibility & ARIA Compliance', () => {
    it('satisfies WAI-ARIA Dialog (Modal) pattern requirements', () => {
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title');

      const title = screen.getByText(/welcome back/i);
      expect(title).toHaveAttribute('id', 'auth-modal-title');
    });

    it('associates form labels with input controls correctly via id and htmlFor', () => {
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('id', 'auth-email');
      expect(emailInput).toHaveAttribute('type', 'email');

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('id', 'auth-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('ensures all icon-only buttons have accessible aria-labels', () => {
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByRole('button', { name: /^close modal$/i });
      expect(closeBtn).toHaveAttribute('aria-label');
      expect(closeBtn.getAttribute('aria-label')).toBeTruthy();

      const backdrop = screen.getByTestId('auth-modal-backdrop');
      expect(backdrop).toHaveAttribute('aria-label');
      expect(backdrop.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
