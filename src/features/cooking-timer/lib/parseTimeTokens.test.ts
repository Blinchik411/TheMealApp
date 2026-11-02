import { describe, expect, it } from 'vitest';
import { parseStepWithTimeTokens } from './parseTimeTokens';

describe('parseStepWithTimeTokens', () => {
  it('returns empty array when text is empty', () => {
    expect(parseStepWithTimeTokens('')).toEqual([]);
  });

  it('returns single non-time token when text has no times', () => {
    const text = 'Chop onions and garlic finely.';
    expect(parseStepWithTimeTokens(text)).toEqual([{ text, isTime: false }]);
  });

  it('detects minutes correctly', () => {
    const text = 'Bake in oven for 25 minutes until golden brown.';
    const tokens = parseStepWithTimeTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ text: 'Bake in oven for ', isTime: false });
    expect(tokens[1]).toEqual({
      text: '25 minutes',
      isTime: true,
      seconds: 1500,
      label: '25 minutes',
    });
    expect(tokens[2]).toEqual({ text: ' until golden brown.', isTime: false });
  });

  it('detects ranges like 10-15 mins using upper bound', () => {
    const text = 'Simmer for 10-15 mins on low heat.';
    const tokens = parseStepWithTimeTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[1]).toEqual({
      text: '10-15 mins',
      isTime: true,
      seconds: 900,
      label: '10-15 mins',
    });
  });

  it('detects hours correctly', () => {
    const text = 'Marinate chicken for 1.5 hours in the fridge.';
    const tokens = parseStepWithTimeTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[1]).toEqual({
      text: '1.5 hours',
      isTime: true,
      seconds: 5400,
      label: '1.5 hours',
    });
  });

  it('detects seconds correctly', () => {
    const text = 'Sear on high heat for 45 seconds per side.';
    const tokens = parseStepWithTimeTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[1]).toEqual({
      text: '45 seconds',
      isTime: true,
      seconds: 45,
      label: '45 seconds',
    });
  });
});
