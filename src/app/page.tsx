import { HomePage } from '@/views/home';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground">Loading catalog...</div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
