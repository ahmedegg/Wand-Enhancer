import { describe, expect, it } from 'vitest';
import {
  formatNumber,
  formatInputNumber,
  numericValue,
  stripNumberGrouping,
} from './format-number';

describe('format-number', () => {
  describe('formatNumber', () => {
    it('rounds the value when step is >= 1', () => {
      expect(formatNumber(1.4, 1)).toBe('1');
      expect(formatNumber(1.5, 1)).toBe('2');
      expect(formatNumber(10.5, 5)).toBe('11');
      expect(formatNumber(-1.5, 1)).toBe('-1');
    });

    it('formats with fixed decimals based on step fraction length when step < 1', () => {
      expect(formatNumber(1.555, 0.1)).toBe('1.6');
      // JS toFixed() behavior on 1.555 with 2 decimals produces "1.55" due to floating point representation
      expect(formatNumber(1.555, 0.01)).toBe('1.55');
      expect(formatNumber(1.555, 0.001)).toBe('1.555');
    });

    it('defaults to 1 decimal if step < 1 but has no decimals in toString', () => {
      // e.g., 1e-7 toString() is "1e-7" which has no '.'
      expect(formatNumber(1.55, 1e-7)).toBe('1.6');
    });
  });

  describe('formatInputNumber', () => {
    it('returns empty string for null, undefined, or empty string', () => {
      expect(formatInputNumber(null)).toBe('');
      expect(formatInputNumber(undefined)).toBe('');
      expect(formatInputNumber('')).toBe('');
    });

    it('formats valid numbers using groupedNumberFormat', () => {
      expect(formatInputNumber(1000)).toBe('1,000');
      expect(formatInputNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatInputNumber(0)).toBe('0');
      expect(formatInputNumber(-1000)).toBe('-1,000');
    });

    it('formats valid numeric strings by stripping grouping and formatting', () => {
      expect(formatInputNumber('1,000')).toBe('1,000');
      expect(formatInputNumber('1 000')).toBe('1,000');
      expect(formatInputNumber('1,234,567.89')).toBe('1,234,567.89');
    });

    it('returns the stringified value if it cannot be parsed as a finite number', () => {
      expect(formatInputNumber('abc')).toBe('abc');
      expect(formatInputNumber(Number.NaN)).toBe('NaN');
      expect(formatInputNumber(Number.POSITIVE_INFINITY)).toBe('Infinity');
      expect(formatInputNumber({})).toBe('[object Object]');
    });
  });

  describe('numericValue', () => {
    it('returns the number if it is a finite number', () => {
      expect(numericValue(42, 0)).toBe(42);
      expect(numericValue(0, 10)).toBe(0);
      expect(numericValue(-100.5, 0)).toBe(-100.5);
    });

    it('returns fallback for non-finite numbers', () => {
      expect(numericValue(Number.NaN, 42)).toBe(42);
      expect(numericValue(Number.POSITIVE_INFINITY, 42)).toBe(42);
      expect(numericValue(Number.NEGATIVE_INFINITY, 42)).toBe(42);
    });

    it('returns fallback for non-string, non-number types', () => {
      expect(numericValue(null, 42)).toBe(42);
      expect(numericValue(undefined, 42)).toBe(42);
      expect(numericValue({}, 42)).toBe(42);
      expect(numericValue([], 42)).toBe(42);
    });

    it('parses valid numeric strings and ignores grouping separators', () => {
      expect(numericValue('42', 0)).toBe(42);
      expect(numericValue('1,000', 0)).toBe(1000);
      expect(numericValue('1 000 000', 0)).toBe(1000000);
      expect(numericValue('-1,234.56', 0)).toBe(-1234.56);
    });

    it('returns fallback for invalid numeric strings', () => {
      expect(numericValue('abc', 42)).toBe(42);
      expect(numericValue('1,000abc', 42)).toBe(42);
    });
  });

  describe('stripNumberGrouping', () => {
    it('removes commas and spaces from a string', () => {
      expect(stripNumberGrouping('1,000')).toBe('1000');
      expect(stripNumberGrouping('1 000 000')).toBe('1000000');
      expect(stripNumberGrouping('1,234 567')).toBe('1234567');
      expect(stripNumberGrouping('123')).toBe('123');
      expect(stripNumberGrouping('')).toBe('');
      expect(stripNumberGrouping('a,b c')).toBe('abc');
    });
  });
});
