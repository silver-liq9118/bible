// 파일: lib/info.dart
import 'package:flutter/material.dart';

class InfoPage extends StatelessWidget {
  const InfoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(w * 0.05),
          child: Text(
            '📚 오픈소스 라이브러리',
            style: TextStyle(
              fontSize: w * 0.05,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: w * 0.05),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('• Flutter SDK', style: TextStyle(fontSize: w * 0.04)),
              Text('• google_fonts', style: TextStyle(fontSize: w * 0.04)),
              Text('• json_serializable', style: TextStyle(fontSize: w * 0.04)),
              Text('• 성경 데이터: KorRV.json', style: TextStyle(fontSize: w * 0.04)),
              Text('• 폰트: BookkGothic', style: TextStyle(fontSize: w * 0.04)),
            ],
          ),
        ),
        const Spacer(),
        Center(
          child: Padding(
            padding: EdgeInsets.only(bottom: w * 0.05),
            child: Text(
              'BibleVerseApp v1.0.0\n© 2025',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: w * 0.04),
            ),
          ),
        ),
      ],
    );
  }
}
