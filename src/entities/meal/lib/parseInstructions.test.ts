import { describe, expect, it } from 'vitest';
import { parseInstructions } from './parseInstructions';

describe('parseInstructions', () => {
  it('returns an empty array for undefined or empty input', () => {
    expect(parseInstructions(undefined)).toEqual([]);
    expect(parseInstructions('')).toEqual([]);
    expect(parseInstructions('   ')).toEqual([]);
  });

  it('splits instructions by different newline delimiters (\\r\\n, \\n, \\r)', () => {
    const raw = 'Preheat oven.\r\nChop onions.\nMelt butter.\rBake for 20 minutes.';
    expect(parseInstructions(raw)).toEqual([
      'Preheat oven.',
      'Chop onions.',
      'Melt butter.',
      'Bake for 20 minutes.',
    ]);
  });

  it('strips leading numbers, dots, and closing parentheses', () => {
    const raw = '1. Boil water\n2) Add pasta\n3 - Stir well';
    expect(parseInstructions(raw)).toEqual(['Boil water', 'Add pasta', 'Stir well']);
  });

  it('filters out step headers, bare numbers, and empty lines', () => {
    const raw = `
      STEP 1
      1
      
      Mix flour and eggs
      Step 2
      Pour into pan
    `;
    expect(parseInstructions(raw)).toEqual(['Mix flour and eggs', 'Pour into pan']);
  });

  it('filters out common keywords like preparation, cooking, serving regardless of casing', () => {
    const raw = `
      PREPARATION
      Chop vegetables
      COOKING
      Simmer for 10 minutes
      Serving
      Garnish with parsley
    `;
    expect(parseInstructions(raw)).toEqual([
      'Chop vegetables',
      'Simmer for 10 minutes',
      'Garnish with parsley',
    ]);
  });
});
