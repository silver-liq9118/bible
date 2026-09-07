import { describe, expect, it } from 'vitest';
import { clearPreferences, defaults, readPreferences, STORAGE_KEY, writePreferences } from './storage';
const ids = new Set(['Genesis:1:1', 'Genesis:1:2']);
function memory(raw: string | null = null) {
  const values = new Map(raw === null ? [] : [[STORAGE_KEY, raw]]);
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
describe('local preferences', () => {
  it('round trips favorites and font size across restarts', () => {
    const store = memory(); const value = { ...defaults(), favorites: [...ids], fontSize: 32 };
    expect(writePreferences(store, value)).toBe(true);
    expect(readPreferences(store, ids).value).toEqual(value);
  });
  it('deduplicates and ignores unknown IDs and invalid sizes', () => {
    const store = memory(JSON.stringify({ version: 1, favorites: ['Genesis:1:1', 'Genesis:1:1', 'bad', 2], fontSize: -100 }));
    expect(readPreferences(store, ids).value).toEqual({ ...defaults(), favorites: ['Genesis:1:1'] });
  });
  it('preserves corrupt/future raw data on read and returns a warning', () => {
    for (const raw of ['{bad', '{"version":2,"favorites":[]}']) {
      const store = memory(raw); expect(readPreferences(store, ids).warning).toBeTruthy();
      expect(store.getItem(STORAGE_KEY)).toBe(raw);
    }
  });
  it('contains blocked storage and quota errors', () => {
    const fail = () => { throw new Error('QuotaExceededError'); };
    const store = { getItem: fail, setItem: fail, removeItem: fail };
    expect(readPreferences(store, ids).value).toEqual(defaults());
    expect(writePreferences(store, defaults())).toBe(false);
    expect(clearPreferences(store)).toBe(false);
  });
  it('deletes only the app key', () => {
    const store = memory('{}'); store.setItem('another-app', 'keep');
    expect(clearPreferences(store)).toBe(true);
    expect(store.getItem(STORAGE_KEY)).toBeNull();
    expect(store.getItem('another-app')).toBe('keep');
  });
});
