import { Environment, graniteEvent, SafeArea, Share } from '@apps-in-toss/web-framework';
export function isToss(): boolean {
  try { return ['toss', 'sandbox'].includes(Environment.environment); } catch { return false; }
}
export const nativeShare = (message: string) => Share.sendMessage({ message });
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
