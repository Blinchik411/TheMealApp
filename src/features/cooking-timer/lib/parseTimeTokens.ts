export interface TimeToken {
  text: string;
  isTime: boolean;
  seconds?: number;
  label?: string;
}

const TIME_REGEX =
  /(?<![\p{L}\p{N}])(?:(\d+(?:[.,]\d+)?)\s*(?:[-–—]|to|до)\s*)?(\d+(?:[.,]\d+)?)\s*(?:(?:more|extra)\s+)?(hours?|hrs?|hr|минут(?:[аыуе]|ами|ах)?|минут|мин\.?|minutes?|mins?|min|секунд(?:[аыуе]|ами|ах)?|секунд|сек\.?|seconds?|secs?|sec|час(?:ов|[аеу]|ом|ами)?)(?![\p{L}\p{N}])/giu;

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

    let multiplier = 60; // minutes (мин / минут / min / minutes)
    if (unitStr.startsWith('h') || unitStr.startsWith('ч')) {
      multiplier = 3600; // hours (час / часа / часов / hours / hr)
    } else if (unitStr.startsWith('s') || unitStr.startsWith('с')) {
      multiplier = 1; // seconds (сек / секунд / seconds / sec)
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
