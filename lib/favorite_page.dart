import 'package:flutter/material.dart';
import 'bible_data.dart'; // BibleVerse 클래스와 JSON 로딩 함수 필요

class FavoritePage extends StatefulWidget {
  final Set<String> favorites;
  const FavoritePage({super.key, required this.favorites});

  @override
  State<FavoritePage> createState() => _FavoritePageState();
}

class _FavoritePageState extends State<FavoritePage> {
  List<BibleVerse> allVerses = [];
  final Map<String, String> bookNameMap = {
    'Genesis': '창세기', 'Exodus': '출애굽기', 'Leviticus': '레위기',
    'Numbers': '민수기', 'Deuteronomy': '신명기', 'Joshua': '여호수아',
    'Judges': '사사기', 'Ruth': '룻기', '1 Samuel': '사무엘상',
    '2 Samuel': '사무엘하', '1 Kings': '열왕기상', '2 Kings': '열왕기하',
    '1 Chronicles': '역대상', '2 Chronicles': '역대하', 'Ezra': '에스라',
    'Nehemiah': '느헤미야', 'Esther': '에스더', 'Job': '욥기',
    'Psalms': '시편', 'Proverbs': '잠언', 'Ecclesiastes': '전도서',
    'Song of Songs': '아가', 'Isaiah': '이사야', 'Jeremiah': '예레미야',
    'Lamentations': '예레미야 애가', 'Ezekiel': '에스겔', 'Daniel': '다니엘',
    'Hosea': '호세아', 'Joel': '요엘', 'Amos': '아모스', 'Obadiah': '오바댜',
    'Jonah': '요나', 'Micah': '미가', 'Nahum': '나훔', 'Habakkuk': '하박국',
    'Zephaniah': '스바냐', 'Haggai': '학개', 'Zechariah': '스가랴',
    'Malachi': '말라기', 'Matthew': '마태복음', 'Mark': '마가복음',
    'Luke': '누가복음', 'John': '요한복음', 'Acts': '사도행전',
    'Romans': '로마서', '1 Corinthians': '고린도전서', '2 Corinthians': '고린도후서',
    'Galatians': '갈라디아서', 'Ephesians': '에베소서', 'Philippians': '빌립보서',
    'Colossians': '골로새서', '1 Thessalonians': '데살로니가전서',
    '2 Thessalonians': '데살로니가후서', '1 Timothy': '디모데전서',
    '2 Timothy': '디모데후서', 'Titus': '디도서', 'Philemon': '빌레몬서',
    'Hebrews': '히브리서', 'James': '야고보서', '1 Peter': '베드로전서',
    '2 Peter': '베드로후서', '1 John': '요한일서', '2 John': '요한이서',
    '3 John': '요한삼서', 'Jude': '유다서', 'Revelation': '요한계시록',
  };

  @override
  void initState() {
    super.initState();
    loadBibleVersesFromStructuredJson('assets/KorRV.json').then((verses) {
      setState(() {
        allVerses = verses;
      });
    });
  }

  void showFullChapterPopup(BuildContext context, String verseText) {
    // ex) "요한복음 3:16 하나님이 세상을 이처럼..."
    final regex = RegExp(r'^(.+?) (\d+):(\d+)');
    final match = regex.firstMatch(verseText);
    if (match == null) return;

    final book = match.group(1)!;
    final chapter = int.parse(match.group(2)!);
    final verseNumber = int.parse(match.group(3)!);

    final englishBook = bookNameMap.entries
        .firstWhere((e) => e.value == book, orElse: () => MapEntry(book, book))
        .key;

    final chapterVerses = allVerses.where(
          (v) => v.book == englishBook && v.chapter == chapter,
    ).toList();

    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          child: Container(
            padding: const EdgeInsets.all(16),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6),
            child: Column(
              children: [
                Text('$book $chapter장 전체 보기', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: chapterVerses.map((v) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Text(
                          v.verse == verseNumber
                              ? '👉 ${v.verse}. ${v.text}'
                              : '${v.verse}. ${v.text}',
                          style: TextStyle(
                            fontWeight: v.verse == verseNumber ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      )).toList(),
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('닫기'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;

    final padding = w * 0.04;
    final margin = w * 0.03;
    final fontSize = w * 0.045;

    return Scaffold(
      appBar: AppBar(
        title: Text('즐겨찾기', style: TextStyle(fontSize: w * 0.05)),
      ),
      body: widget.favorites.isEmpty
          ? Center(child: Text('즐겨찾기한 말씀이 없습니다.', style: TextStyle(fontSize: fontSize)))
          : ListView(
        children: widget.favorites.map((verseText) {
          return Card(
            margin: EdgeInsets.all(margin),
            child: Padding(
              padding: EdgeInsets.all(padding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(verseText, style: TextStyle(fontSize: fontSize)),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => showFullChapterPopup(context, verseText),
                      child: Text('전체 보기', style: TextStyle(fontSize: w * 0.035)),
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
