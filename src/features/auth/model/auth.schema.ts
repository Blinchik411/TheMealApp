import { z } from 'zod';

export interface AuthSchemaMessages {
  emailRequired?: string;
  emailInvalid?: string;
  passwordMin?: string;
}

const DEFAULT_AUTH_MESSAGES: Required<AuthSchemaMessages> = {
  emailRequired: 'Введите адрес электронной почты',
  emailInvalid: 'Пожалуйста, введите корректный email',
  passwordMin: 'Пароль должен содержать не менее 6 символов',
};

export const createAuthSchema = (messages?: AuthSchemaMessages) => {
  const resolved = { ...DEFAULT_AUTH_MESSAGES, ...messages };

  return z.object({
    email: z.string().trim().min(1, resolved.emailRequired).email(resolved.emailInvalid),
    password: z.string().min(6, resolved.passwordMin),
  });
};

export const authSchema = createAuthSchema();

export type AuthFormData = z.infer<typeof authSchema>;
