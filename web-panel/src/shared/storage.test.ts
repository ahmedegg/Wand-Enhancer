import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadJson, loadStringSet, saveJson, saveStringSet } from './storage';

describe('json serialization', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('revives valid json', () => {
    localStorage.setItem('data', JSON.stringify({ a: 1, b: 'two' }));
    expect(loadJson('data', (raw) => raw, { fallback: true })).toEqual({ a: 1, b: 'two' });
  });

  it('returns fallback if key is null', () => {
    expect(loadJson(null, (raw) => raw, { fallback: true })).toEqual({ fallback: true });
  });

  it('returns fallback if storage is empty', () => {
    expect(loadJson('missing', (raw) => raw, { fallback: true })).toEqual({ fallback: true });
  });

  it('returns fallback if json is invalid', () => {
    localStorage.setItem('data', '{ invalid json');
    expect(loadJson('data', (raw) => raw, { fallback: true })).toEqual({ fallback: true });
  });

  it('returns fallback if reviver returns null', () => {
    localStorage.setItem('data', JSON.stringify({ a: 1 }));
    expect(loadJson('data', () => null, { fallback: true })).toEqual({ fallback: true });
  });

  it('handles browsers that block access to local storage', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Storage disabled', 'SecurityError');
    });

    expect(loadJson('data', (raw) => raw, { fallback: true })).toEqual({ fallback: true });
  });

  it('writes valid json', () => {
    expect(saveJson('data', { a: 1 }, () => false)).toBe(true);
    expect(localStorage.getItem('data')).toBe(JSON.stringify({ a: 1 }));
  });

  it('removes item if empty', () => {
    localStorage.setItem('data', 'something');
    expect(saveJson('data', {}, () => true)).toBe(true);
    expect(localStorage.getItem('data')).toBeNull();
  });

  it('reports a failed browser storage write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage disabled', 'SecurityError');
    });

    expect(saveJson('data', { a: 1 }, () => false)).toBe(false);
  });

  it('handles null key when saving', () => {
    expect(saveJson(null, { a: 1 }, () => false)).toBe(false);
  });
});

describe('storage revival', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('revives only valid string ids', () => {
    localStorage.setItem('pins', JSON.stringify(['one', '', 2, 'two']));
    expect(loadStringSet('pins')).toEqual({ one: true, two: true });
  });

  it('removes empty sets', () => {
    expect(saveStringSet('pins', { one: true })).toBe(true);
    expect(localStorage.getItem('pins')).toBe(JSON.stringify(['one']));
    expect(saveStringSet('pins', {})).toBe(true);
    expect(localStorage.getItem('pins')).toBeNull();
  });

  it('reports a failed browser storage write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage disabled', 'SecurityError');
    });

    expect(saveStringSet('pins', { one: true })).toBe(false);
  });

  it('handles browsers that block access to local storage', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Storage disabled', 'SecurityError');
    });

    expect(saveStringSet('pins', { one: true })).toBe(false);
    expect(loadStringSet('pins')).toEqual({});
  });
});
