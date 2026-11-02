'use client';

import { Timer } from 'lucide-react';
import { useMemo } from 'react';
import { parseStepWithTimeTokens } from '../lib/parseTimeTokens';
import { useCookingTimerStore } from '../model/timerStore';

export interface InteractiveStepTextProps {
  text: string;
}

export const InteractiveStepText = ({ text }: InteractiveStepTextProps) => {
  const startTimer = useCookingTimerStore((state) => state.startTimer);
  const tokens = useMemo(() => parseStepWithTimeTokens(text), [text]);

  const hasAnyTimeToken = tokens.some((token) => token.isTime);
  if (!hasAnyTimeToken) {
    return <>{text}</>;
  }

  return (
    <>
      {tokens.map((token, index) => {
        if (!token.isTime || !token.seconds) {
          return <span key={`text-${index}-${token.text.slice(0, 8)}`}>{token.text}</span>;
        }

        return (
          <button
            key={`timer-${index}-${token.seconds}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startTimer(token.seconds || 60, token.label);
            }}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs active:scale-95"
            title={`Start kitchen timer for ${token.text}`}
          >
            <Timer className="size-3.5 shrink-0" />
            <span>{token.text}</span>
          </button>
        );
      })}
    </>
  );
};
