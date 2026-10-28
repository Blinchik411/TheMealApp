// Letters with guaranteed recipe availability in TheMealDB (excluding u, x, z, etc.)
const RECIPE_LETTERS = [
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'm',
  'p',
  'r',
  's',
  't',
  'v',
  'w',
] as const;

export const getRandomLetter = (): string => {
  const randomIndex = Math.floor(Math.random() * RECIPE_LETTERS.length);
  return RECIPE_LETTERS[randomIndex];
};
