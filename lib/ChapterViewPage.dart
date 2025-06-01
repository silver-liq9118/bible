import 'package:flutter/material.dart';
import 'bible_data.dart';

class ChapterViewPage extends StatelessWidget {
  final BibleVerse verse;
  final List<BibleVerse> allVerses;
  final Map<String, String> bookNameMap;

  const ChapterViewPage({
    super.key,
    required this.verse,
    required this.allVerses,
    required this.bookNameMap,
  });

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;
    final chapterVerses = allVerses
        .where((v) => v.book == verse.book && v.chapter == verse.chapter)
        .toList();

    final bookKorean = bookNameMap[verse.book] ?? verse.book;

    return Scaffold(
      appBar: AppBar(
        title: Text('$bookKorean ${verse.chapter}장', style: TextStyle(fontSize: w * 0.045)),
      ),
      body: ListView.builder(
        padding: EdgeInsets.all(w * 0.04),
        itemCount: chapterVerses.length,
        itemBuilder: (context, index) {
          final v = chapterVerses[index];
          final isSelected = v.verse == verse.verse;
          return Padding(
            padding: EdgeInsets.only(bottom: h * 0.01),
            child: Text(
              isSelected ? '👉 ${v.verse}. ${v.text}' : '${v.verse}. ${v.text}',
              style: TextStyle(
                fontSize: w * 0.045,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          );
        },
      ),
    );
  }
}
