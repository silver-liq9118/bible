export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'manual';
export const APP_NAME = 'todaysbible';
export const verseSharePath = (verseId: string) => `intoss://${APP_NAME}/verse?verseId=${encodeURIComponent(verseId)}`;
export function verseIdFromScheme(scheme: string): string | undefined {
  try {
    const url = new URL(scheme);
    if (url.protocol !== 'intoss:' || url.hostname !== APP_NAME || url.pathname !== '/verse') return undefined;
    const verseId = url.searchParams.get('verseId')?.trim();
    return verseId || undefined;
  } catch { return undefined; }
}
export interface ShareAdapters {
  nativeShare?: (message: string) => Promise<void>;
  webShare?: (data: ShareData) => Promise<void>;
  copy?: (text: string) => Promise<void>;
}
export async function shareText(message: string, adapters: ShareAdapters): Promise<ShareResult> {
  // Cancellation must never trigger an unexpected clipboard write or another sheet.
  for (const action of [adapters.nativeShare && (() => adapters.nativeShare!(message)), adapters.webShare && (() => adapters.webShare!({ text: message }))]) {
    if (!action) continue;
    try { await action(); return 'shared'; } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return 'cancelled';
      // The SDK does not document a cancellation error code. Do not guess:
      // a native failure offers a separate, explicit copy action in the UI.
      if (adapters.nativeShare) return 'manual';
    }
  }
  if (adapters.copy) { try { await adapters.copy(message); return 'copied'; } catch { /* Offer selectable text. */ } }
  return 'manual';
}
