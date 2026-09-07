export const STORAGE_KEY = 'todays-bible:preferences:v1';
export const FONT_SIZES = [18, 21, 24, 28, 32] as const;
export interface Preferences { version: 1; favorites: string[]; fontSize: number }
export const defaults = (): Preferences => ({ version: 1, favorites: [], fontSize: 24 });
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function readPreferences(store: Store, validIds: ReadonlySet<string>): { value: Preferences; warning?: string } {
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (raw === null) return { value: defaults() };
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Array.isArray(value.favorites)) throw new Error('invalid');
    return { value: { version: 1,
      favorites: [...new Set<string>(value.favorites.filter((id: unknown): id is string => typeof id === 'string' && validIds.has(id)))],
      fontSize: FONT_SIZES.includes(value.fontSize) ? value.fontSize : 24,
    } };
  } catch { return { value: defaults(), warning: '저장한 설정을 읽지 못했어요. 이번 이용에는 기본 설정을 적용해요.' }; }
}
export function writePreferences(store: Store, value: Preferences): boolean {
  try { store.setItem(STORAGE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}
export function clearPreferences(store: Store): boolean {
  try { store.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
// Access to window.localStorage itself can throw SecurityError.
export function browserStorage(): Store {
  try { return window.localStorage; } catch {
    const unavailable = () => { throw new Error('Storage unavailable'); };
    return { getItem: unavailable, setItem: unavailable, removeItem: unavailable };
  }
}
