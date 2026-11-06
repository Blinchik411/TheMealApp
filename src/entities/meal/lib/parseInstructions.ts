const stepRegex = /^(step|шаг|этап)\s*\d+[:.]?$/i;
const servesRegex = /^(serves|обслуживает|порции|порций|порций:)\s*\d+.*$/i;
const onlyNumbersRegex = /^\d+[:.]?$/;
const skipKeywords = [
  'preparation',
  'cooking',
  'serving',
  'приготовление',
  'подготовка',
  'подача',
  'варка',
  'жарка',
];
const leadingNumberRegex = /^((step|шаг|этап)\s*\d+[:.]?\s*|[\d\s)..-]+)/i;

export const parseInstructions = (rawInstructions: string | null | undefined): string[] => {
  if (!rawInstructions) return [];

  return rawInstructions
    .split(/\r\n|\n|\r/)
    .map((instruction) => instruction.trim().replace(leadingNumberRegex, '').trim())
    .filter((instruction) => {
      if (instruction.length === 0) return false;
      if (stepRegex.test(instruction)) return false;
      if (servesRegex.test(instruction)) return false;
      if (onlyNumbersRegex.test(instruction)) return false;
      if (skipKeywords.includes(instruction.toLowerCase())) return false;
      return true;
    });
};
