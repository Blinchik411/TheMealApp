import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';
import enMessages from './messages/en.json';

// Global mock for next-intl in test environment
vi.mock('next-intl', () => {
  return {
    useTranslations: (namespace?: string) => {
      const messages =
        namespace && namespace in enMessages
          ? (enMessages as Record<string, Record<string, string>>)[namespace]
          : enMessages;

      return (key: string, values?: Record<string, unknown>) => {
        let text = (messages && (messages as Record<string, string>)[key]) || key;
        if (values) {
          for (const [k, v] of Object.entries(values)) {
            text = text.replace(`{${k}}`, String(v));
          }
        }
        return text;
      };
    },
    useLocale: () => 'en',
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Global mock for localized navigation in test environment
vi.mock('@/shared/config/i18n', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname: string };
    children: React.ReactNode;
  }) => {
    const targetHref = typeof href === 'object' ? href.pathname : href;
    return React.createElement('a', { href: targetHref, ...props }, children);
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Global mock for next/cache in test environment
vi.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

