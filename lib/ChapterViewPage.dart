import 'package:flutter/material.dart';
import 'bible_data.dart';

class ChapterViewPage extends StatelessWidget {
  final String verseReference;
  final List<BibleVerse> chapterVerses;
  final Map<String, String> bookNameMap;

  const ChapterViewPage({
    super.key,
    required this.verseReference,
    required this.chapterVerses,
    required this.bookNameMap,
  });

  @override
  Widget build(BuildContext context) {
    final match = RegExp(r'(.+?)\s?(\d+):(\d+)').firstMatch(verseReference);
    final book = match?.group(1) ?? '';
    final chapter = match?.group(2) ?? '';
    final verse = match?.group(3) ?? '';
    final targetVerse = int.tryParse(verse);
    final koreanBook = bookNameMap[book] ?? book;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFFFF7C5), Color(0xFFFFFBEF)], // ✅ 노란색 계열 그라데이션
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent, // ✅ 반드시 있어야 그라데이션 보임
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text('$koreanBook $chapter:$verse'),
        ),
        body: ListView.builder(
          itemCount: chapterVerses.length,
          itemBuilder: (context, index) {
            final v = chapterVerses[index];
            final isTarget = v.verse == targetVerse;

            return Container(
              color: isTarget ? Colors.yellow.shade100 : null,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Text(
                '${v.verse}. ${v.text}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isTarget ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
