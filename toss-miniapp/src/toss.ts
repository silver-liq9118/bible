import { Environment, graniteEvent, SafeArea, Share } from '@apps-in-toss/web-framework';
import { verseIdFromScheme, verseSharePath } from './share';
export function isToss(): boolean {
  try { return ['toss', 'sandbox'].includes(Environment.environment); } catch { return false; }
}
export const nativeShare = (message: string) => Share.sendMessage({ message });
export const createVerseShareLink = (verseId: string) => Share.createLink({ path: verseSharePath(verseId) });
export function initialSharedVerseId(): string | undefined {
  if (!isToss()) return undefined;
  try { return verseIdFromScheme(Environment.initialURL); } catch { return undefined; }
}
export function listenBack(onBack: () => void) {
  if (!isToss()) return () => {};
  return graniteEvent.addEventListener('backEvent', { onEvent: onBack, onError: () => {} });
}
export function listenSafeArea() {
  if (!isToss()) return () => {};
  const setBottom = (insets: { bottom: number }) => document.documentElement.style.setProperty('--toss-safe-bottom', `${Math.max(0, insets.bottom)}px`);
  try {
    setBottom(SafeArea.get());
    return SafeArea.subscribe({ onEvent: setBottom });
  } catch { return () => {}; }
}
