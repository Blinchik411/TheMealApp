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

  it('detects phrases with "more" like "1-2 more minutes"', () => {
    const text = 'Cook for 1-2 more minutes until cheese is melted.';
    const tokens = parseStepWithTimeTokens(text);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ text: 'Cook for ', isTime: false });
    expect(tokens[1]).toEqual({
      text: '1-2 more minutes',
      isTime: true,
      seconds: 120,
      label: '1-2 more minutes',
    });
    expect(tokens[2]).toEqual({ text: ' until cheese is melted.', isTime: false });
  });

  it('detects "2 more minutes" and "1 more hour"', () => {
    const text1 = 'Simmer for 2 more minutes.';
    const tokens1 = parseStepWithTimeTokens(text1);
    expect(tokens1[1]).toEqual({
      text: '2 more minutes',
      isTime: true,
      seconds: 120,
      label: '2 more minutes',
    });

    const text2 = 'Bake for 1 more hour.';
    const tokens2 = parseStepWithTimeTokens(text2);
    expect(tokens2[1]).toEqual({
      text: '1 more hour',
      isTime: true,
      seconds: 3600,
      label: '1 more hour',
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

  describe('Russian language time tokens support', () => {
    it('detects Russian minutes correctly in various cases', () => {
      const text = 'Варите картофель 20 минут до мягкости.';
      const tokens = parseStepWithTimeTokens(text);

      expect(tokens).toHaveLength(3);
      expect(tokens[1]).toEqual({
        text: '20 минут',
        isTime: true,
        seconds: 1200,
        label: '20 минут',
      });
    });

    it('detects Russian ranges with hyphen and "до"', () => {
      const text1 = 'Обжаривайте лук 10-15 мин на среднем огне.';
      const tokens1 = parseStepWithTimeTokens(text1);
      expect(tokens1[1]).toEqual({
        text: '10-15 мин',
        isTime: true,
        seconds: 900,
        label: '10-15 мин',
      });

      const text2 = 'Выпекать от 30 до 40 минут.';
      const tokens2 = parseStepWithTimeTokens(text2);
      expect(tokens2[1]).toEqual({
        text: '30 до 40 минут',
        isTime: true,
        seconds: 2400,
        label: '30 до 40 минут',
      });
    });

    it('detects Russian hours correctly in various grammatical cases', () => {
      const text1 = 'Оставить мариноваться на 1 час.';
      const tokens1 = parseStepWithTimeTokens(text1);
      expect(tokens1[1]).toEqual({
        text: '1 час',
        isTime: true,
        seconds: 3600,
        label: '1 час',
      });

      const text2 = 'Тушить мясо 2 часа на медленном огне.';
      const tokens2 = parseStepWithTimeTokens(text2);
      expect(tokens2[1]).toEqual({
        text: '2 часа',
        isTime: true,
        seconds: 7200,
        label: '2 часа',
      });

      const text3 = 'Томить бульон 5 часов.';
      const tokens3 = parseStepWithTimeTokens(text3);
      expect(tokens3[1]).toEqual({
        text: '5 часов',
        isTime: true,
        seconds: 18000,
        label: '5 часов',
      });
    });

    it('detects Russian decimal fractions of hours', () => {
      const text = 'Выпекать 1,5 часа до готовности.';
      const tokens = parseStepWithTimeTokens(text);

      expect(tokens[1]).toEqual({
        text: '1,5 часа',
        isTime: true,
        seconds: 5400,
        label: '1,5 часа',
      });
    });

    it('detects Russian seconds correctly', () => {
      const text = 'Взбивайте желтки 30 секунд.';
      const tokens = parseStepWithTimeTokens(text);

      expect(tokens[1]).toEqual({
        text: '30 секунд',
        isTime: true,
        seconds: 30,
        label: '30 секунд',
      });
    });

    it('does not falsely match "ч. л." (чайная ложка) as hours', () => {
      const text = 'Добавьте 2 ч. л. соли и варите 10 минут.';
      const tokens = parseStepWithTimeTokens(text);

      // Should ONLY match "10 минут", not "2 ч. л."
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ text: 'Добавьте 2 ч. л. соли и варите ', isTime: false });
      expect(tokens[1]).toEqual({
        text: '10 минут',
        isTime: true,
        seconds: 600,
        label: '10 минут',
      });
      expect(tokens[2]).toEqual({ text: '.', isTime: false });
    });
  });
});
