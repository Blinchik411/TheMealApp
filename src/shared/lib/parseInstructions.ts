const stepRegex = /^step\s*\d+$/i;
const onlyNumbersRegex = /^\d+$/;
const skipKeywords = ['preparation', 'cooking', 'serving'];
const leadingNumberRegex = /^[\d\s)..-]+/;

export const parseInstructions = (rawInstructions: string | null | undefined): string[] => {
  if (!rawInstructions) return [];

  return rawInstructions
    .split(/\r\n|\n|\r/)
    .map((instruction) => instruction.trim().replace(leadingNumberRegex, '').trim())
    .filter((instruction) => {
      if (instruction.length === 0) return false;
      if (stepRegex.test(instruction)) return false;
      if (onlyNumbersRegex.test(instruction)) return false;
      if (skipKeywords.includes(instruction.toLowerCase())) return false;
      return true;
    });
};
