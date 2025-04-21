// 파일: lib/info.dart
import 'package:flutter/material.dart';
import 'license_page.dart';

class InfoPage extends StatelessWidget {
  const InfoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 앱 아이콘
          Container(
            width: w * 0.25,
            height: w * 0.25,
            decoration: BoxDecoration(
              image: const DecorationImage(
                image: AssetImage('assets/icon/icon.png'),
                fit: BoxFit.cover,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
          ),

          SizedBox(height: h * 0.03),

          // 오픈소스 확인하기 버튼 (그라데이션)
          Container(
            width: w * 0.8,
            height: h * 0.07,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF6A11CB), // 보라색
                  Color(0xFF2575FC), // 파란색
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 8,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const LicensePageCustom()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                '오픈소스 확인하기',
                style: TextStyle(
                  fontSize: w * 0.045,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),

          SizedBox(height: h * 0.04),

          // 앱 정보
          Text(
            "Today's Bible App v1.0.0\n Copyright 2025. Goodtooday Co.\n All right reserved. ",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: w * 0.035,
              color: Colors.grey.shade800,
            ),
          ),
        ],
      ),
    );
  }
}
