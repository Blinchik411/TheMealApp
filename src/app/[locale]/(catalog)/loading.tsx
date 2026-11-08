export default function Loading() {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero section skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <div className="h-6 w-36 mx-auto bg-muted rounded-full animate-pulse" />
        <div className="h-9 sm:h-10 w-3/4 max-w-md mx-auto bg-muted rounded-xl animate-pulse" />
        <div className="h-4 w-5/6 max-w-lg mx-auto bg-muted rounded-md animate-pulse" />
        <div className="pt-1">
          <div className="h-9 w-36 mx-auto bg-muted rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="space-y-4">
        <div className="h-11 w-full bg-card border border-border rounded-xl animate-pulse" />
        <div className="flex gap-2 overflow-hidden py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`cat-skel-${i + 1}`}
              className="h-8 w-20 shrink-0 bg-muted rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Meal grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`meal-grid-skel-${i + 1}`}
            className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border animate-pulse"
          >
            <div className="w-full aspect-square bg-muted" />
            <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 flex-1">
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-muted rounded-full" />
                <div className="h-4 w-14 bg-muted rounded-full" />
              </div>
              <div className="h-4 bg-muted rounded-md w-3/4" />
              <div className="mt-auto h-8 sm:h-9 bg-muted rounded-lg sm:rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
