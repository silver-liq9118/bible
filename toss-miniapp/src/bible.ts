import names from './book-names.json';

export interface Verse { id: string; book: string; bookName: string; chapter: number; verse: number; text: string }
export interface Bible { verses: Verse[]; byId: Map<string, Verse>; chapters: Map<string, Verse[]> }
const bookNames: Record<string, string> = { ...names, 'Song of Solomon': '아가', 'Revelation of John': '요한계시록' };
export const chapterKey = (v: Pick<Verse, 'book' | 'chapter'>) => `${v.book}:${v.chapter}`;
export const reference = (v: Verse) => `${v.bookName} ${v.chapter}장 ${v.verse}절`;
export const shareMessage = (v: Verse) => `${v.text}\n\n${reference(v)} · 개역성경\n오늘의 성경`;

export function parseBible(input: unknown): Bible {
  if (!input || typeof input !== 'object' || !('books' in input) || !Array.isArray(input.books)) throw new Error('성경 형식을 확인해 주세요.');
  const result: Bible = { verses: [], byId: new Map(), chapters: new Map() };
  for (const book of input.books) {
    if (!book || !bookNames[book.name] || !Array.isArray(book.chapters)) throw new Error('성경 책 정보를 확인해 주세요.');
    for (const ch of book.chapters) {
      if (!Number.isInteger(ch.chapter) || ch.chapter < 1 || !Array.isArray(ch.verses)) throw new Error('장 정보를 확인해 주세요.');
      const chapter: Verse[] = [];
      for (const verse of ch.verses) {
        if (!Number.isInteger(verse.verse) || verse.verse < 1 || typeof verse.text !== 'string') throw new Error('절 정보를 확인해 주세요.');
        const item: Verse = { id: `${book.name}:${ch.chapter}:${verse.verse}`, book: book.name, bookName: bookNames[book.name], chapter: ch.chapter, verse: verse.verse, text: verse.text.trim() };
        if (result.byId.has(item.id)) throw new Error('중복된 성경 구절이에요.');
        result.byId.set(item.id, item); chapter.push(item); result.verses.push(item);
      }
      if (!chapter.length) throw new Error('비어 있는 장이에요.');
      result.chapters.set(chapterKey(chapter[0]), chapter.sort((a, b) => a.verse - b.verse));
    }
  }
  if (!result.verses.length) throw new Error('말씀이 비어 있어요.');
  return result;
}

// Uniformly sample every verse, excluding the current one on another-verse requests.
export function randomVerse(verses: Verse[], currentId?: string, random = Math.random): Verse {
  verses = verses.filter(v => v.text.length > 0);
  if (!verses.length) throw new Error('말씀이 비어 있어요.');
  const current = verses.findIndex(v => v.id === currentId);
  const count = verses.length - (current >= 0 && verses.length > 1 ? 1 : 0);
  let index = Math.min(count - 1, Math.max(0, Math.floor(random() * count)));
  if (count < verses.length && index >= current) index++;
  return verses[index];
}
