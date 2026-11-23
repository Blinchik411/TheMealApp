let tickerInterval: ReturnType<typeof setInterval> | null = null;

export const ensureTicker = (tickFn: () => void, intervalMs = 500): void => {
  if (typeof window === 'undefined') return;
  if (tickerInterval !== null) return;
  tickerInterval = setInterval(tickFn, intervalMs);
};

export const stopTicker = (): void => {
  if (tickerInterval !== null) {
    clearInterval(tickerInterval);
    tickerInterval = null;
  }
};

export const isTickerRunning = (): boolean => {
  return tickerInterval !== null;
};
