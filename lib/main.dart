// 📁 lib/main.dart
import 'package:flutter/material.dart';
import 'dart:math';
import 'bible_data.dart';
import 'favorite_page.dart';

void main() => runApp(const BibleApp());

class BibleApp extends StatelessWidget {
  const BibleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bible Verse App',
      theme: ThemeData.light().copyWith(
        scaffoldBackgroundColor: Colors.white,
        textTheme: ThemeData.light().textTheme.copyWith(
          bodyLarge: const TextStyle(fontFamily: 'BookkGothic', fontWeight: FontWeight.w700),
          bodyMedium: const TextStyle(fontFamily: 'BookkGothic', fontWeight: FontWeight.w700),
          labelLarge: const TextStyle(fontFamily: 'BookkGothic', fontWeight: FontWeight.w700),
          titleLarge: const TextStyle(fontFamily: 'BookkGothic', fontWeight: FontWeight.w700),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          titleTextStyle: TextStyle(
            fontFamily: 'BookkGothic',
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: Colors.black,
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: Colors.black,
          unselectedItemColor: Colors.grey,
          selectedLabelStyle: TextStyle(
            fontFamily: 'BookkGothic',
            fontWeight: FontWeight.w700,
          ),
          unselectedLabelStyle: TextStyle(
            fontFamily: 'BookkGothic',
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late String currentVerse;
  Set<String> favorites = {};

  @override
  void initState() {
    super.initState();
    currentVerse = getVerseForTime();
  }

  String getVerseForTime() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return bibleVerses['morning']!.elementAt(Random().nextInt(bibleVerses['morning']!.length));
    } else if (hour < 18) {
      return bibleVerses['afternoon']!.elementAt(Random().nextInt(bibleVerses['afternoon']!.length));
    } else {
      return bibleVerses['evening']!.elementAt(Random().nextInt(bibleVerses['evening']!.length));
    }
  }

  void refreshVerse() {
    setState(() => currentVerse = getVerseForTime());
  }

  void toggleFavorite() {
    setState(() {
      if (favorites.contains(currentVerse)) {
        favorites.remove(currentVerse);
      } else {
        favorites.add(currentVerse);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('오늘의 성경 말씀'),
      ),
      body: Center(
        child: Card(
          color: Colors.white,
          elevation: 4,
          shadowColor: Colors.black12,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide.none,
          ),
          margin: const EdgeInsets.all(24),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  currentVerse,
                  style: const TextStyle(
                    fontSize: 20,
                    color: Colors.black,
                    fontFamily: 'BookkMyungjo',
                    fontWeight: FontWeight.w300,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.refresh, color: Colors.grey),
                      onPressed: refreshVerse,
                    ),
                    IconButton(
                      icon: Icon(
                        favorites.contains(currentVerse) ? Icons.favorite : Icons.favorite_border,
                        color: Colors.grey,
                      ),
                      onPressed: toggleFavorite,
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: '즐겨찾기'),
          BottomNavigationBarItem(icon: Icon(Icons.info), label: '정보')
        ],
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => FavoritePage(favorites: favorites),
              ),
            );
          } else if (index == 2) {
            showAboutDialog(
              context: context,
              applicationName: 'BibleVerseApp',
              applicationVersion: '1.0.0',
              children: [const Text('매일 세 번 말씀을 전해드립니다.')],
            );
          }
        },
      ),
    );
  }
}