import { describe, expect, it, vi } from 'vitest';
import { shareText } from './share';
describe('sharing', () => {
  it('uses the SDK first', async () => {
    const nativeShare = vi.fn().mockResolvedValue(undefined); const copy = vi.fn();
    expect(await shareText('말씀', { nativeShare, copy })).toBe('shared');
    expect(nativeShare).toHaveBeenCalledWith('말씀'); expect(copy).not.toHaveBeenCalled();
  });
  it('does not write clipboard after cancellation', async () => {
    const copy = vi.fn(); const webShare = vi.fn().mockRejectedValue({ name: 'AbortError' });
    expect(await shareText('말씀', { webShare, copy })).toBe('cancelled'); expect(copy).not.toHaveBeenCalled();
  });
  it('offers explicit manual copy after undocumented SDK errors', async () => {
    const copy = vi.fn();
    expect(await shareText('말씀', { nativeShare: vi.fn().mockRejectedValue(new Error('unknown')), copy })).toBe('manual');
    expect(copy).not.toHaveBeenCalled();
  });
  it('falls back from unavailable Web Share to clipboard and then selectable text', async () => {
    const webShare = vi.fn().mockRejectedValue(new Error('unsupported')); const copy = vi.fn().mockResolvedValue(undefined);
    expect(await shareText('말씀', { webShare, copy })).toBe('copied'); expect(copy).toHaveBeenCalledWith('말씀');
    expect(await shareText('말씀', { copy: vi.fn().mockRejectedValue(new Error('denied')) })).toBe('manual');
    expect(await shareText('말씀', {})).toBe('manual');
  });
});
