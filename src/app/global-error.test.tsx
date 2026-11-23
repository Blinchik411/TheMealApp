import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import GlobalError from './global-error';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('GlobalError Component', () => {
  it('renders error title, message, and action controls', () => {
    const error = new Error('Database connection failed');
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Critical Application Error',
    );
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainBtn).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('triggers reset when Try Again button is clicked', () => {
    const error = new Error('Crash');
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainBtn);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
