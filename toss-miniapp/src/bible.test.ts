import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { chapterKey, parseBible, randomVerse, reference, shareMessage } from './bible';
const source = JSON.parse(readFileSync(new URL('../../assets/KorRV.json', import.meta.url), 'utf8'));
const bible = parseBible(source);
describe('the actual KorRV asset', () => {
  it('indexes all 66 books, chapters and verses without changing text', () => {
    expect(source.books).toHaveLength(66);
    const count = source.books.reduce((sum: number, b: { chapters: { verses: unknown[] }[] }) => sum + b.chapters.reduce((s, c) => s + c.verses.length, 0), 0);
    expect(bible.verses).toHaveLength(count);
    expect(bible.byId.size).toBe(count);
    expect(bible.chapters.size).toBe(1189);
    expect(bible.verses.every(v => /[가-힣]/.test(v.bookName))).toBe(true);
    expect(bible.verses[0].text).toBe(source.books[0].chapters[0].verses[0].text.trim());
  });
  it('returns the complete chapter in numeric order', () => {
    const chapter = bible.chapters.get(chapterKey(bible.verses[0]))!;
    expect(chapter).toHaveLength(31);
    expect(chapter.map(v => v.verse)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
    expect(chapter.every(v => v.book === 'Genesis' && v.chapter === 1)).toBe(true);
  });
  it('samples both ends and avoids immediately repeating the current verse', () => {
    const verses = bible.verses.slice(0, 3);
    expect(randomVerse(verses, undefined, () => 0)).toBe(verses[0]);
    expect(randomVerse(verses, undefined, () => .999)).toBe(verses[2]);
    expect(randomVerse(verses, verses[0].id, () => 0)).toBe(verses[1]);
    expect(randomVerse(verses, verses[1].id, () => .999)).toBe(verses[2]);
    expect(randomVerse([verses[0]], verses[0].id)).toBe(verses[0]);
    expect(() => randomVerse([])).toThrow();
  });
  it('shares Korean reference and does not leak private URLs', () => {
    expect(reference(bible.verses[0])).toBe('창세기 1장 1절');
    expect(shareMessage(bible.verses[0])).toContain('태초에 하나님');
    expect(shareMessage(bible.verses[0])).not.toMatch(/https?:|intoss-private:/);
    expect(shareMessage(bible.verses[0], 'https://example.com/share')).toContain('https://example.com/share');
  });
  it('rejects invalid data instead of rendering broken content', () => {
    expect(() => parseBible({ books: [] })).toThrow();
    expect(() => parseBible({ books: [{ name: 'Unknown', chapters: [] }] })).toThrow();
  });
  it('preserves the 20 empty source verses in chapters but never samples them', () => {
    const empty = bible.verses.filter(v => !v.text);
    expect(empty).toHaveLength(20);
    expect(bible.chapters.get(chapterKey(empty[0]))).toContain(empty[0]);
    expect(randomVerse([empty[0], bible.verses[0]], undefined, () => 0)).toBe(bible.verses[0]);
    expect(() => randomVerse(empty)).toThrow();
  });
});
