import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeSwitcher } from './ThemeSwitcher';

const mockSetTheme = vi.fn();
let mockTheme = 'system';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      toggleTheme: 'Toggle theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    };
    return translations[key] ?? key;
  },
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'system';
  });

  it('renders trigger button with correct accessibility attributes', () => {
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens dropdown menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /toggle theme/i })).toBeInTheDocument();

    expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
  });

  it('selects light theme, closes menu and restores trigger focus on click', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);

    const lightOption = screen.getByRole('menuitem', { name: /light/i });
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('selects dark theme, closes menu and restores trigger focus on click', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);

    const darkOption = screen.getByRole('menuitem', { name: /dark/i });
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes dropdown and restores trigger focus when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes dropdown when Tab key is pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <ThemeSwitcher />
      </div>,
    );

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('navigates menuitems via ArrowDown and ArrowUp keys', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);

    const lightOption = screen.getByRole('menuitem', { name: /light/i });
    const darkOption = screen.getByRole('menuitem', { name: /dark/i });
    const systemOption = screen.getByRole('menuitem', { name: /system/i });

    lightOption.focus();
    expect(lightOption).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(darkOption).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(systemOption).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(darkOption).toHaveFocus();
  });
});
