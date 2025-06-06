import 'package:flutter/material.dart';
import 'bible_data.dart';
import 'ChapterViewPage.dart';

class FavoritePage extends StatelessWidget {
  final Set<String> favorites;
  final List<BibleVerse> allBibleVerses;
  final Map<String, String> bookNameMap;
  final void Function(String verseKey) onRemoveFavorite;

  const FavoritePage({
    super.key,
    required this.favorites,
    required this.allBibleVerses,
    required this.bookNameMap,
    required this.onRemoveFavorite,
  });

  @override
  Widget build(BuildContext context) {
    double w = MediaQuery.of(context).size.width;
    double h = MediaQuery.of(context).size.height;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFE4F1F6), Color(0xFFFDFDFD)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: Text(
            '즐겨찾기',
            style: TextStyle(fontSize: w * 0.05, fontWeight: FontWeight.bold),
          ),
        ),
        body: favorites.isEmpty
            ? Center(
          child: Text(
            '즐겨찾기한 말씀이 없습니다.',
            style: TextStyle(fontSize: w * 0.045),
          ),
        )
            : ListView(
          padding: EdgeInsets.all(w * 0.04),
          children: favorites.map((v) {
            final parts = v.split(' ');
            if (parts.length < 2) return const SizedBox.shrink();
            final reference = parts[0];
            final verseText = parts.sublist(1).join(' ');

            final match = RegExp(r'(.+?)(\d+):(\d+)').firstMatch(reference);
            if (match == null) return const SizedBox.shrink();
            final book = match.group(1)!;
            final chapter = int.parse(match.group(2)!);
            final verse = int.parse(match.group(3)!);

            final chapterVerses = allBibleVerses
                .where((v) => v.book == book && v.chapter == chapter)
                .toList();

            return Container(
              margin: EdgeInsets.only(bottom: h * 0.02),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(w * 0.03),
                border: Border.all(color: Colors.grey.shade300),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    spreadRadius: 1,
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // 구절 내용 클릭 가능 영역
                  Expanded(
                    child: InkWell(
                      borderRadius: BorderRadius.circular(w * 0.03),
                      onTap: () {
                        if (chapterVerses.isNotEmpty) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChapterViewPage(
                                verseReference: reference,
                                chapterVerses: chapterVerses,
                                bookNameMap: bookNameMap,
                              ),
                            ),
                          );
                        }
                      },
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                            vertical: h * 0.018, horizontal: w * 0.04),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              reference,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: w * 0.045,
                              ),
                            ),
                            SizedBox(height: h * 0.005),
                            Text(
                              verseText,
                              style: TextStyle(fontSize: w * 0.042),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // 하트 버튼 (삭제)
                  IconButton(
                    icon: const Icon(Icons.favorite,
                        color: Color(0xFFF6909D)),
                    onPressed: () {
                      onRemoveFavorite(v);
                    },
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
