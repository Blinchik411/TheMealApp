'use client';

import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors to an error reporting service if needed
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-center size-16 rounded-3xl bg-destructive/10 text-destructive mb-2">
        <AlertCircle className="size-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        Something Went Wrong
      </h1>

      <p className="text-sm text-muted-foreground">
        {error.message ||
          'Failed to load recipe data from the server. Please check your internet connection and try again.'}
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
          <Home className="size-4 text-muted-foreground" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
