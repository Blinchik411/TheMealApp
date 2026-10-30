'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface HomePaginationProps {
  currentPage: number;
  totalPages: number;
}

export const HomePagination = ({ currentPage, totalPages }: HomePaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-4 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
      >
        ← Previous
      </button>

      <span className="text-xs font-medium text-muted-foreground px-2">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-4 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
      >
        Next →
      </button>
    </div>
  );
};
