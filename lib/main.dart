// 파일: lib/main.dart
import 'package:flutter/material.dart';
import 'dart:math';
import 'package:share_plus/share_plus.dart';
import 'bible_data.dart';
import 'info.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MobileAds.instance.initialize();
  runApp(const BibleApp());
}

class BibleApp extends StatelessWidget {
  const BibleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bible Verse App',
      theme: ThemeData.light().copyWith(
        scaffoldBackgroundColor: Colors.white,
        textTheme: ThemeData.light().textTheme.apply(
          fontFamily: 'BookkGothic',
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: Colors.black,
          unselectedItemColor: Colors.grey,
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
  List<BibleVerse> allVerses = [];
  BibleVerse? _currentVerse;
  final Set<BibleVerse> favorites = {};
  int _selectedIndex = 0;
  bool _showFullChapter = false;
  BannerAd? _bannerAd;

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
    'I Samuel': '사무엘상', 'II Samuel': '사무엘하',
    'I Kings': '열왕기상', 'II Kings': '열왕기하',
    'I Chronicles': '역대상', 'II Chronicles': '역대하',
    'I Corinthians': '고린도전서', 'II Corinthians': '고린도후서',
    'I Thessalonians': '데살로니가전서', 'II Thessalonians': '데살로니가후서',
    'I Timothy': '디모데전서', 'II Timothy': '디모데후서',
    'I Peter': '베드로전서', 'II Peter': '베드로후서',
    'I John': '요한일서', 'II John': '요한이서', 'III John': '요한삼서',
    'Revelation of John': '요한계시록'
  };

  @override
  void initState() {
    super.initState();
    _loadBannerAd();
    loadBibleVersesFromStructuredJson('assets/KorRV.json').then((verses) {
      setState(() {
        allVerses = verses;
        _currentVerse = verses.isNotEmpty ? verses[Random().nextInt(verses.length)] : null;
      });
    });
  }

  void _loadBannerAd() {
    _bannerAd = BannerAd(
      adUnitId: 'ca-app-pub-3940256099942544/6300978111',
      size: AdSize.banner,
      request: const AdRequest(),
      listener: const BannerAdListener(),
    )..load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  void refreshVerse() {
    setState(() {
      if (allVerses.isNotEmpty) {
        _showFullChapter = false;
        _currentVerse = allVerses[Random().nextInt(allVerses.length)];
      }
    });
  }

  List<BibleVerse> getCurrentChapterVerses() {
    if (_currentVerse == null) return [];
    return allVerses.where((v) => v.book == _currentVerse!.book && v.chapter == _currentVerse!.chapter).toList();
  }

  void toggleFavorite([BibleVerse? verse]) {
    setState(() {
      final target = verse ?? _currentVerse;
      if (target != null) {
        if (favorites.contains(target)) {
          favorites.remove(target);
        } else {
          favorites.add(target);
        }
      }
    });
  }

  void shareVerse(BibleVerse verse) {
    final bookKorean = bookNameMap[verse.book] ?? verse.book;
    final message = '오늘의 성경\n'
        '"$bookKorean ${verse.chapter}:${verse.verse} ${verse.text}" 을(를) 공유합니다.\n'
        '아멘 🙏\n'
        '오늘의성경읽기 = https://your-appstore-link.com';
    Share.share(message);
  }

  @override
  Widget build(BuildContext context) {
    final double w = MediaQuery.of(context).size.width;
    final double h = MediaQuery.of(context).size.height;
    final BibleVerse? verse = _currentVerse;

    Widget body;
    if (_selectedIndex == 0 && verse != null) {
      final chapterVerses = getCurrentChapterVerses();
      body = Column(
        children: [
          SizedBox(height: w * 0.15),
          if (_bannerAd != null)
            SizedBox(
              width: _bannerAd!.size.width.toDouble(),
              height: _bannerAd!.size.height.toDouble(),
              child: AdWidget(ad: _bannerAd!),
            ),
          Expanded(
            child: Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: w * 0.06),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(w * 0.03),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        offset: Offset(0, 0),
                        blurRadius: w * 0.08,
                        spreadRadius: w * 0.03,
                      )
                    ],
                  ),
                  padding: EdgeInsets.symmetric(horizontal: w * 0.04, vertical: h * 0.015),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${bookNameMap[verse.book] ?? verse.book} ${verse.chapter}:${verse.verse}',
                            style: TextStyle(
                              fontSize: w * 0.06,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              favorites.contains(verse) ? Icons.favorite : Icons.favorite_border,
                              color: Color(0xFFF6909D),
                              size: w * 0.065,
                            ),
                            onPressed: () => toggleFavorite(),
                          ),
                        ],
                      ),
                      Padding(
                        padding: EdgeInsets.only(bottom: h * 0.015),
                        child: _showFullChapter
                            ? SizedBox(
                          height: h * 0.3, // 카드 내부에서만 스크롤되도록 높이 고정
                          child: Scrollbar(
                            thumbVisibility: true,
                            child: SingleChildScrollView(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: chapterVerses.map((v) => Padding(
                                  padding: EdgeInsets.only(bottom: h * 0.006),
                                  child: Text(
                                    v.verse == verse.verse
                                        ? '👉 ${v.verse}. ${v.text}'
                                        : '${v.verse}. ${v.text}',
                                    style: TextStyle(
                                      fontSize: w * 0.045,
                                      fontWeight: v.verse == verse.verse
                                          ? FontWeight.bold
                                          : FontWeight.w300,
                                    ),
                                  ),
                                )).toList(),
                              ),
                            ),
                          ),
                        )
                            : Text(
                          verse.text,
                          style: TextStyle(
                            fontSize: w * 0.05,
                            fontWeight: FontWeight.w300,
                          ),
                          textAlign: TextAlign.left,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _showFullChapter = !_showFullChapter;
                          });
                        },
                        child: Text(
                          _showFullChapter ? '간략히 보기' : '${verse.chapter}장 전체 보기',
                          style: TextStyle(fontSize: w * 0.035, color: Colors.blueGrey),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: Icon(Icons.refresh, size: w * 0.065),
                            onPressed: refreshVerse,
                          ),
                          IconButton(
                            icon: Icon(Icons.share, size: w * 0.065),
                            onPressed: () => shareVerse(verse),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],

      );
    }
    else if (_selectedIndex == 1) {
      body = Scaffold(
        appBar: AppBar(
            title: Text('즐겨찾기',
                style: TextStyle(fontSize: w * 0.05, fontWeight: FontWeight.bold))),
        body: favorites.isEmpty
            ? Center(child: Text('즐겨찾기한 말씀이 없습니다.', style: TextStyle(fontSize: w * 0.045)))
            : ListView(
          padding: EdgeInsets.all(w * 0.04),
          children: favorites.map((v) {
            return Container(
              margin: EdgeInsets.only(bottom: h * 0.02),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(w * 0.03),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.shade200,
                    offset: Offset(0, 0),
                    blurRadius: w * 0.05,
                    spreadRadius: w * 0.01,
                  )
                ],
              ),
              padding: EdgeInsets.all(w * 0.05),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${bookNameMap[v.book] ?? v.book} ${v.chapter}:${v.verse}',
                        style: TextStyle(
                          fontSize: w * 0.05,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Icon(Icons.favorite, color: Color(0xFFF6909D), size: w * 0.06),
                    ],
                  ),
                  SizedBox(height: h * 0.01),
                  Text(v.text, style: TextStyle(fontSize: w * 0.045)),
                ],
              ),
            );
          }).toList(),
        ),
      );
    }
    else {
      body = const InfoPage();
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFE4F1F6), Color(0xFFFDFDFD)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: body,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        selectedFontSize: w * 0.03,
        unselectedFontSize: w * 0.03,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: '즐겨찾기'),
          BottomNavigationBarItem(icon: Icon(Icons.info), label: '정보'),
        ],
      ),
    );
  }
}