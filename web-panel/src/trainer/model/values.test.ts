import { describe, expect, it } from 'vitest';
import { ECheatType, type CheatSchema } from '../../../protocol/messages';
import { normalizeCheatValue } from './values';

describe('normalizeCheatValue', () => {
  it('coerces Toggle cheat values to boolean', () => {
    const cheat = { type: ECheatType.Toggle } as CheatSchema;

    expect(normalizeCheatValue(cheat, true)).toBe(true);
    expect(normalizeCheatValue(cheat, false)).toBe(false);
    expect(normalizeCheatValue(cheat, 1)).toBe(true);
    expect(normalizeCheatValue(cheat, 0)).toBe(false);
    expect(normalizeCheatValue(cheat, 'true')).toBe(true); // Boolean('true') is true
    expect(normalizeCheatValue(cheat, '')).toBe(false);    // Boolean('') is false
    expect(normalizeCheatValue(cheat, null)).toBe(false);
    expect(normalizeCheatValue(cheat, undefined)).toBe(false);
  });

  it('returns value untouched for unrelated cheat types', () => {
    const cheatButton = { type: ECheatType.Button } as CheatSchema;
    const cheatSelection = { type: ECheatType.Selection } as CheatSchema;

    expect(normalizeCheatValue(cheatButton, 'some-value')).toBe('some-value');
    expect(normalizeCheatValue(cheatButton, 123)).toBe(123);
    expect(normalizeCheatValue(cheatSelection, 'selected')).toBe('selected');
  });

  describe('Slider and Number cheat types', () => {
    const cheatSlider = { type: ECheatType.Slider } as CheatSchema;
    const cheatNumber = { type: ECheatType.Number } as CheatSchema;

    it('returns non-string values untouched', () => {
      expect(normalizeCheatValue(cheatSlider, 123)).toBe(123);
      expect(normalizeCheatValue(cheatNumber, 456)).toBe(456);
      expect(normalizeCheatValue(cheatSlider, null)).toBe(null);
      expect(normalizeCheatValue(cheatNumber, undefined)).toBe(undefined);
    });

    it('returns empty or whitespace-only strings untouched', () => {
      expect(normalizeCheatValue(cheatSlider, '')).toBe('');
      expect(normalizeCheatValue(cheatNumber, '   ')).toBe('   ');
    });

    it('normalizes valid number strings by removing commas and spaces', () => {
      expect(normalizeCheatValue(cheatSlider, '123')).toBe(123);
      expect(normalizeCheatValue(cheatNumber, '456.78')).toBe(456.78);

      expect(normalizeCheatValue(cheatSlider, '1,234')).toBe(1234);
      expect(normalizeCheatValue(cheatNumber, '1,234,567.89')).toBe(1234567.89);

      expect(normalizeCheatValue(cheatSlider, '1 234')).toBe(1234);
      expect(normalizeCheatValue(cheatNumber, '1 234 567.89')).toBe(1234567.89);

      expect(normalizeCheatValue(cheatSlider, '  1,234  ')).toBe(1234);
      expect(normalizeCheatValue(cheatNumber, ' -1,234.5 ')).toBe(-1234.5);
    });
  });
});
