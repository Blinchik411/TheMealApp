'use client';

import { authApi } from '@/entities/user';
import { cn, useFocusTrap } from '@/shared/lib';
import { Lock, Mail, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type SubmitEvent, useMemo, useRef, useState } from 'react';
import { z } from 'zod';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const t = useTranslations('Auth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authSchema = useMemo(
    () =>
      z.object({
        email: z.string().trim().min(1, t('emailRequired')).email(t('emailInvalid')),
        password: z.string().min(6, t('passwordMin')),
      }),
    [t],
  );

  const emailInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useFocusTrap<HTMLDialogElement>({
    isActive: isOpen,
    onClose,
    initialFocusRef: emailInputRef,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const validationResult = authSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const issues = validationResult.error.format();
      setFieldErrors({
        email: issues.email?._errors[0],
        password: issues.password?._errors[0],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await authApi.signUp(email.trim(), password);
      } else {
        await authApi.signIn(email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('authFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        data-testid="auth-modal-backdrop"
        onClick={onClose}
        aria-label={t('closeOverlay')}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-default border-none outline-none"
      />
      <dialog
        open
        ref={modalRef}
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl z-10 m-0 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label={t('closeModal')}
        >
          <X className="size-5" />
        </button>

        <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-foreground mb-1">
          {isSignUp ? t('createAccount') : t('welcomeBack')}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {isSignUp ? t('signUpSubtitle') : t('signInSubtitle')}
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                ref={emailInputRef}
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder={t('emailPlaceholder')}
                className={cn(
                  'w-full rounded-xl border bg-muted/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all',
                  fieldErrors.email
                    ? 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-border focus:ring-primary/20 focus:border-primary',
                )}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1.5">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder={t('passwordPlaceholder')}
                className={cn(
                  'w-full rounded-xl border bg-muted/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all',
                  fieldErrors.password
                    ? 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-border focus:ring-primary/20 focus:border-primary',
                )}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1.5">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? t('loading') : isSignUp ? t('signUpButton') : t('signInButton')}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setFieldErrors({});
            }}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            {isSignUp ? t('signInButton') : t('signUpButton')}
          </button>
        </div>
      </dialog>
    </div>
  );
};
