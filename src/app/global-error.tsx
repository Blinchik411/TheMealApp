'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import './styles/globals.css';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Unhandled root global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center size-16 rounded-3xl bg-destructive/10 text-destructive mb-2">
            <AlertCircle className="size-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Critical Application Error
          </h1>

          <p className="text-sm text-muted-foreground">
            {error.message ||
              'A critical error occurred while rendering the application. Please try reloading.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95 w-full sm:w-auto"
            >
              <RotateCcw className="size-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-foreground font-medium text-sm transition-all shadow-2xs w-full sm:w-auto"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
