import { authApi } from '@/entities/user';
import { useAuthForm } from '@/features/auth/lib/useAuthForm';
import { authSchema, createAuthSchema } from '@/features/auth/model/auth.schema';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthModal } from './AuthModal';

const RUSSIAN_DEFAULT_MESSAGES = {
  emailRequired: 'Введите адрес электронной почты',
  emailInvalid: 'Пожалуйста, введите корректный email',
  passwordMin: 'Пароль должен содержать не менее 6 символов',
};

vi.mock('@/entities/user', () => ({
  authApi: {
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Milestone M2 Adversarial Challenge Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Validation Schema Stress Testing (auth.schema.ts)', () => {
    it('rejects empty and whitespace-only email with emailRequired message', () => {
      const emptyRes = authSchema.safeParse({ email: '', password: 'password123' });
      expect(emptyRes.success).toBe(false);
      if (!emptyRes.success) {
        expect(emptyRes.error.issues[0].message).toBe(RUSSIAN_DEFAULT_MESSAGES.emailRequired);
      }

      const spacesRes = authSchema.safeParse({ email: '     ', password: 'password123' });
      expect(spacesRes.success).toBe(false);
      if (!spacesRes.success) {
        expect(spacesRes.error.issues[0].message).toBe(RUSSIAN_DEFAULT_MESSAGES.emailRequired);
      }

      const tabNewlineRes = authSchema.safeParse({ email: '\t\n\r  ', password: 'password123' });
      expect(tabNewlineRes.success).toBe(false);
      if (!tabNewlineRes.success) {
        expect(tabNewlineRes.error.issues[0].message).toBe(RUSSIAN_DEFAULT_MESSAGES.emailRequired);
      }
    });

    it('rejects various malformed email inputs with emailInvalid message', () => {
      const malformedEmails = [
        'plainaddress',
        '#@%^%#$@#$@#.com',
        '@example.com',
        'Joe Smith <email@example.com>',
        'email.example.com',
        'email@example@example.com',
        '.email@example.com',
        'email.@example.com',
        'email@example..com',
        'email@example',
        'email@-example.com',
        'email@111.222.333.44444',
      ];

      for (const email of malformedEmails) {
        const res = authSchema.safeParse({ email, password: 'password123' });
        expect(res.success, `Expected email "${email}" to fail validation`).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe(RUSSIAN_DEFAULT_MESSAGES.emailInvalid);
        }
      }
    });

    it('accepts valid email variants and trims surrounding whitespace', () => {
      const validEmails = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'other.email-with-hyphen@example.com',
        'fully-qualified-domain@example.com',
        'user.name+tag+sorting@example.com',
        'x@example.com',
        'example-indeed@strange-example.com',
        'customer.support@sub.example.com',
      ];

      for (const email of validEmails) {
        const res = authSchema.safeParse({ email, password: 'password123' });
        expect(res.success, `Expected email "${email}" to pass validation`).toBe(true);
      }

      const padded = authSchema.safeParse({
        email: '   user@example.com   ',
        password: 'password123',
      });
      expect(padded.success).toBe(true);
      if (padded.success) {
        expect(padded.data.email).toBe('user@example.com');
      }
    });

    it('rejects passwords shorter than 6 characters and empty password', () => {
      const shortPasswords = ['', '1', '12', '123', '1234', '12345', '     '];

      for (const password of shortPasswords) {
        const res = authSchema.safeParse({ email: 'test@example.com', password });
        expect(res.success, `Expected password "${password}" to fail min(6)`).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe(RUSSIAN_DEFAULT_MESSAGES.passwordMin);
        }
      }
    });

    it('handles boundary and stress passwords (6 chars, 10,000 chars, unicode, emojis, symbols)', () => {
      const boundaryPasswords = [
        '123456',
        'abcdef',
        '      ', // 6 spaces
        'P@$$w0rd!#%^&*()',
        '🔑🔒🛡️СуперСекретныйПароль123!',
        'line1\nline2\tline3',
        'a'.repeat(10000), // 10,000 chars stress test
      ];

      for (const password of boundaryPasswords) {
        const start = performance.now();
        const res = authSchema.safeParse({ email: 'test@example.com', password });
        const elapsed = performance.now() - start;

        expect(res.success).toBe(true);
        expect(elapsed).toBeLessThan(100); // Must be fast, no catastrophic backtracking
      }
    });

    it('honors custom localized error messages through createAuthSchema', () => {
      const customSchema = createAuthSchema({
        emailRequired: 'CUSTOM_EMAIL_REQUIRED',
        emailInvalid: 'CUSTOM_EMAIL_INVALID',
        passwordMin: 'CUSTOM_PASSWORD_MIN',
      });

      const emptyRes = customSchema.safeParse({ email: '', password: '123' });
      expect(emptyRes.success).toBe(false);
      if (!emptyRes.success) {
        const messages = emptyRes.error.issues.map((i) => i.message);
        expect(messages).toContain('CUSTOM_EMAIL_REQUIRED');
        expect(messages).toContain('CUSTOM_PASSWORD_MIN');
      }

      const invalidEmailRes = customSchema.safeParse({ email: 'invalid', password: 'password123' });
      expect(invalidEmailRes.success).toBe(false);
      if (!invalidEmailRes.success) {
        expect(invalidEmailRes.error.issues[0].message).toBe('CUSTOM_EMAIL_INVALID');
      }
    });
  });

  describe('2. Mode Toggle State Transitions & Form Reset', () => {
    it('toggles between Sign In and Sign Up modes with proper headings, buttons, and subtitles', async () => {
      const user = userEvent.setup();
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      // Initial: Sign In mode
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByText(/sign in to access your saved recipes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();

      // Switch to Sign Up mode
      const toggleToSignUpBtn = screen.getByRole('button', { name: /^sign up$/i });
      await user.click(toggleToSignUpBtn);

      // Now: Sign Up mode
      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
      expect(
        screen.getByText(/sign up to sync your favorites across all devices/i),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();

      // Switch back to Sign In mode
      const toggleToSignInBtn = screen.getByRole('button', { name: /^sign in$/i });
      await user.click(toggleToSignInBtn);

      // Back to: Sign In mode
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    it('resets input fields and clears validation error messages when mode is toggled', async () => {
      const user = userEvent.setup();
      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

      // Enter invalid data and trigger validation errors
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, '123');
      await user.click(submitBtn);

      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument();

      // Click toggle mode to switch to Sign Up
      const toggleBtn = screen.getByRole('button', { name: /^sign up$/i });
      await user.click(toggleBtn);

      // Inputs should now be empty
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');

      // Validation error messages should be cleared
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters long/i),
      ).not.toBeInTheDocument();
    });

    it('clears displayed server error when mode is toggled', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error('User does not exist in database'));

      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'validPassword123');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      // Server error is visible
      expect(await screen.findByText('User does not exist in database')).toBeInTheDocument();

      // Toggle mode to Sign Up
      const toggleBtn = screen.getByRole('button', { name: /^sign up$/i });
      await user.click(toggleBtn);

      // Server error must be removed
      expect(screen.queryByText('User does not exist in database')).not.toBeInTheDocument();
    });
  });

  describe('3. Server Error Handling & Resilience', () => {
    it('displays error message from rejected Error object without closing modal or calling onSuccess', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const handleSuccess = vi.fn();
      vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error('Invalid password provided'));

      render(<AuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongPassword');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      expect(await screen.findByText('Invalid password provided')).toBeInTheDocument();
      expect(handleClose).not.toHaveBeenCalled();
      expect(handleSuccess).not.toHaveBeenCalled();

      // Input values should NOT be wiped out so user can correct them
      expect(screen.getByLabelText(/email/i)).toHaveValue('chef@example.com');
      expect(screen.getByLabelText(/password/i)).toHaveValue('wrongPassword');
    });

    it('handles signUp server error correctly in Sign Up mode', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const handleSuccess = vi.fn();
      vi.mocked(authApi.signUp).mockRejectedValueOnce(new Error('Email already registered'));

      render(<AuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />);

      // Switch to Sign Up
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));

      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'securePassword123');
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));

      expect(authApi.signUp).toHaveBeenCalledWith('existing@example.com', 'securePassword123');
      expect(authApi.signIn).not.toHaveBeenCalled();
      expect(await screen.findByText('Email already registered')).toBeInTheDocument();
      expect(handleClose).not.toHaveBeenCalled();
      expect(handleSuccess).not.toHaveBeenCalled();
    });

    it('handles non-Error rejected exceptions gracefully with fallback error message', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.signIn).mockRejectedValueOnce('Raw string network failure');

      render(<AuthModal isOpen={true} onClose={vi.fn()} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      // Should show the fallback message (defaultErrorMessage = t('authFailed') -> "Authentication failed")
      expect(await screen.findByText(/authentication failed/i)).toBeInTheDocument();
    });

    it('disables submit button and shows loading state while API call is in-flight', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const handleSuccess = vi.fn();

      let resolveApi!: () => void;
      const pendingPromise = new Promise<null>((res) => {
        resolveApi = () => res(null);
      });
      vi.mocked(authApi.signIn).mockReturnValueOnce(pendingPromise);

      render(<AuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });
      await user.click(submitBtn);

      // Button should now be disabled and show loading state
      await waitFor(() => {
        expect(submitBtn).toBeDisabled();
        expect(submitBtn).toHaveTextContent(/loading/i);
      });

      // Resolve the pending promise
      resolveApi();

      // Once resolved, callbacks should be called and submitting ends
      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalledTimes(1);
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('clears server error on subsequent successful submission', async () => {
      const user = userEvent.setup();
      const handleSuccess = vi.fn();
      const handleClose = vi.fn();

      // First submit: fails
      vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error('Temporary service unavailable'));
      render(<AuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'chef@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      expect(await screen.findByText('Temporary service unavailable')).toBeInTheDocument();

      // Second submit: succeeds
      vi.mocked(authApi.signIn).mockResolvedValueOnce(null);
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.queryByText('Temporary service unavailable')).not.toBeInTheDocument();
        expect(handleSuccess).toHaveBeenCalledTimes(1);
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('4. Direct useAuthForm Hook Stress Testing', () => {
    it('supports clearServerError explicitly and works with empty options', async () => {
      vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error('Fatal hook error'));
      const { result } = renderHook(() => useAuthForm());

      expect(result.current.isSignUp).toBe(false);
      expect(result.current.serverError).toBeNull();

      // Register and submit valid data
      await act(async () => {
        result.current.register('email').onChange({
          target: { name: 'email', value: 'chef@example.com' },
          type: 'change',
        });
        result.current.register('password').onChange({
          target: { name: 'password', value: 'secret123' },
          type: 'change',
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.serverError).toBe('Fatal hook error');

      // Clear server error directly
      act(() => {
        result.current.clearServerError();
      });

      expect(result.current.serverError).toBeNull();
    });

    it('falls back to defaultErrorMessage "Ошибка входа" when options omitted and non-Error is thrown', async () => {
      vi.mocked(authApi.signIn).mockRejectedValueOnce(404);
      const { result } = renderHook(() => useAuthForm());

      await act(async () => {
        result.current.register('email').onChange({
          target: { name: 'email', value: 'chef@example.com' },
          type: 'change',
        });
        result.current.register('password').onChange({
          target: { name: 'password', value: 'secret123' },
          type: 'change',
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.serverError).toBe('Ошибка входа');
    });
  });
});
