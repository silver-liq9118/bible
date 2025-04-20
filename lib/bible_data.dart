// 📁 lib/bible_data.dart
import 'dart:convert';
import 'package:flutter/services.dart';

class BibleVerse {
  final String book;
  final int chapter;
  final int verse;
  final String text;

  BibleVerse({
    required this.book,
    required this.chapter,
    required this.verse,
    required this.text,
  });

  factory BibleVerse.fromJson(String book, int chapter, Map<String, dynamic> json) {
    return BibleVerse(
      book: book,
      chapter: chapter,
      verse: json['verse'],
      text: json['text'],
    );
  }
}

Future<List<BibleVerse>> loadBibleVersesFromStructuredJson(String path) async {
  final jsonString = await rootBundle.loadString(path);
  final Map<String, dynamic> jsonData = json.decode(jsonString);
  final List<BibleVerse> verses = [];

  for (final book in jsonData['books']) {
    final String bookName = book['name'];
    for (final chapter in book['chapters']) {
      final int chapterNumber = chapter['chapter'];
      for (final Map<String, dynamic> verse in chapter['verses']) {
        verses.add(BibleVerse.fromJson(bookName, chapterNumber, verse));
      }
    }
  }

  return verses;
}
