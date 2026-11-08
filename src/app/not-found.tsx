import { Utensils } from 'lucide-react';
import Link from 'next/link';
import './styles/globals.css';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center size-16 rounded-3xl bg-muted text-muted-foreground mb-2">
            <Utensils className="size-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            404 — Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
