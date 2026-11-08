import { authApi } from '@/entities/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { type BaseSyntheticEvent, useMemo, useState } from 'react';
import { type FieldErrors, type UseFormRegister, useForm } from 'react-hook-form';
import { type AuthFormData, type AuthSchemaMessages, createAuthSchema } from '../model/auth.schema';

export interface UseAuthFormOptions {
  onSuccess?: () => void;
  onClose?: () => void;
  translations?: AuthSchemaMessages;
  defaultErrorMessage?: string;
}

export interface UseAuthFormReturn {
  isSignUp: boolean;
  serverError: string | null;
  isSubmitting: boolean;
  errors: FieldErrors<AuthFormData>;
  register: UseFormRegister<AuthFormData>;
  handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  toggleAuthMode: () => void;
  clearServerError: () => void;
}

export const useAuthForm = (options: UseAuthFormOptions = {}): UseAuthFormReturn => {
  const { onSuccess, onClose, translations, defaultErrorMessage = 'Ошибка входа' } = options;
  const [isSignUp, setIsSignUp] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = useMemo(() => createAuthSchema(translations), [translations]);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const { register, handleSubmit: rhfHandleSubmit, reset, formState } = form;

  const onSubmit = rhfHandleSubmit(async (data: AuthFormData) => {
    setServerError(null);
    try {
      const authAction = isSignUp ? authApi.signUp : authApi.signIn;
      await authAction(data.email.trim(), data.password);
      reset();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : defaultErrorMessage);
    }
  });

  return {
    isSignUp,
    serverError,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
    register,
    handleSubmit: onSubmit,
    toggleAuthMode: () => {
      setIsSignUp((p) => !p);
      setServerError(null);
      reset();
    },
    clearServerError: () => setServerError(null),
  };
};
