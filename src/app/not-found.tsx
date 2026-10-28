import { Utensils } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-center size-16 rounded-3xl bg-muted text-muted-foreground mb-2">
        <Utensils className="size-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        404 — Recipe Not Found
      </h1>
      <p className="text-sm text-muted-foreground">
        This recipe may have been removed or the URL address is incorrect.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-xs"
      >
        Back to Recipe Catalog
      </Link>
    </div>
  );
}
