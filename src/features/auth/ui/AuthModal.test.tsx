import { authApi } from '@/entities/user';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthModal } from './AuthModal';

vi.mock('@/entities/user', () => ({
  authApi: {
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates invalid email and short password on submit without calling api', async () => {
    const user = userEvent.setup();
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, '123');
    await user.click(submitBtn);

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument();
    expect(authApi.signIn).not.toHaveBeenCalled();
  });

  it('calls authApi.signIn with valid credentials', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(<AuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />);

    await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
    await user.type(screen.getByLabelText(/password/i), 'securepassword123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(authApi.signIn).toHaveBeenCalledWith('chef@example.com', 'securepassword123');
    expect(handleSuccess).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<AuthModal isOpen={true} onClose={handleClose} />);

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<AuthModal isOpen={true} onClose={handleClose} />);

    const backdrop = screen.getByTestId('auth-modal-backdrop');
    await user.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('has accessible dialog role and aria attributes', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title');
  });
});
