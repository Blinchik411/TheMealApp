export interface TimeToken {
  text: string;
  isTime: boolean;
  seconds?: number;
  label?: string;
}

const TIME_REGEX =
  /\b(?:(\d+(?:[.,]\d+)?)\s*(?:-|to)\s*)?(\d+(?:[.,]\d+)?)\s*(hours?|hrs?|hr|minutes?|mins?|min|seconds?|secs?|sec)\b/gi;

export const parseStepWithTimeTokens = (stepText: string): TimeToken[] => {
  if (!stepText) return [];

  const tokens: TimeToken[] = [];
  let lastIndex = 0;
  TIME_REGEX.lastIndex = 0;

  let match = TIME_REGEX.exec(stepText);
  while (match !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    if (matchStart > lastIndex) {
      tokens.push({
        text: stepText.slice(lastIndex, matchStart),
        isTime: false,
      });
    }

    const lowerBoundStr = match[1];
    const upperBoundStr = match[2];
    const unitStr = match[3].toLowerCase();

    const rawNum = upperBoundStr || lowerBoundStr;
    const numValue = Number.parseFloat(rawNum.replace(',', '.'));

    let multiplier = 60; // minutes
    if (unitStr.startsWith('h')) {
      multiplier = 3600; // hours
    } else if (unitStr.startsWith('s')) {
      multiplier = 1; // seconds
    }

    const seconds = Math.round(numValue * multiplier);

    tokens.push({
      text: match[0],
      isTime: true,
      seconds,
      label: match[0],
    });

    lastIndex = matchEnd;
    match = TIME_REGEX.exec(stepText);
  }

  if (lastIndex < stepText.length) {
    tokens.push({
      text: stepText.slice(lastIndex),
      isTime: false,
    });
  }

  return tokens;
};
