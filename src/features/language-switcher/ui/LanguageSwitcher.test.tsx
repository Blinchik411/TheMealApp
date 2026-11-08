import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';

const mockReplace = vi.fn();
let mockLocale = 'en';
let mockPathname = '/meal/52772';

vi.mock('next-intl', () => ({
  useLocale: () => mockLocale,
}));

vi.mock('@/shared/config/i18n', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale = 'en';
    mockPathname = '/meal/52772';
    window.history.replaceState(null, '', '/meal/52772?category=Beef');
  });

  it('renders both language buttons with correct active state', () => {
    render(<LanguageSwitcher />);

    const enButton = screen.getByRole('button', { name: /switch to english/i });
    const ruButton = screen.getByRole('button', { name: /переключить на русский/i });

    expect(enButton).toBeInTheDocument();
    expect(ruButton).toBeInTheDocument();
    expect(enButton).toHaveAttribute('aria-pressed', 'true');
    expect(ruButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls router.replace with new locale and preserves query parameters', () => {
    render(<LanguageSwitcher />);

    const ruButton = screen.getByRole('button', { name: /переключить на русский/i });
    fireEvent.click(ruButton);

    expect(mockReplace).toHaveBeenCalledWith('/meal/52772?category=Beef', { locale: 'ru' });
  });

  it('does not trigger navigation if current locale is clicked', () => {
    render(<LanguageSwitcher />);

    const enButton = screen.getByRole('button', { name: /switch to english/i });
    fireEvent.click(enButton);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
