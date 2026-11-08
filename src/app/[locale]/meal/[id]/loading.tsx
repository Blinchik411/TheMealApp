export default function MealLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button skeleton */}
      <div className="h-9 w-24 bg-muted rounded-xl animate-pulse" />

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-9 sm:h-10 w-3/4 max-w-lg bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl animate-pulse shrink-0" />
      </div>

      {/* 2-column layout: photo + quick actions and ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="w-full aspect-[4/3] md:aspect-square rounded-2xl sm:rounded-3xl bg-muted border border-border animate-pulse" />
          <div className="h-28 w-full bg-card border border-border rounded-2xl p-4 animate-pulse" />
        </div>

        {/* Right Column: Ingredients */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 bg-muted rounded-md animate-pulse" />
            <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
          <div className="space-y-2.5 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={`ing-skel-${i + 1}`}
                className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 animate-pulse"
              >
                <div className="size-4.5 rounded-md bg-muted shrink-0" />
                <div className="h-4 w-36 bg-muted rounded" />
                <div className="ml-auto h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions skeleton */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="h-6 w-44 bg-muted rounded-md animate-pulse" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`step-skel-${i + 1}`}
              className="h-16 w-full rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
