import 'package:flutter/material.dart';
import 'license_detail_page.dart';

class LicensePageCustom extends StatelessWidget {
  const LicensePageCustom({super.key});

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;

    final items = [
      {
        'title': '성경 데이터 (KorRV)',
        'license': '''MIT License

Copyright (c) 2024 Scrollmapper

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.'''
      },
      {
        'title': 'Flutter SDK',
        'license': '''BSD 3-Clause License

Copyright 2014 The Flutter Authors. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
(이하 생략 - 전체 라이선스는 https://github.com/flutter/flutter/blob/master/LICENSE 참조)'''
      },
      {
        'title': 'cupertino_icons',
        'license': '''MIT License

Copyright (c) 2018 Cupertino Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
(전체: https://pub.dev/packages/cupertino_icons)'''
      },
      {
        'title': 'intl',
        'license': '''BSD-style License

Copyright 2008 Google Inc. All Rights Reserved.
(전체: https://github.com/dart-lang/intl/blob/main/LICENSE 참조)'''
      },
      {
        'title': 'flutter_launcher_icons',
        'license': '''MIT License

Copyright (c) 2018 Mark O'Sullivan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
(전체: https://pub.dev/packages/flutter_launcher_icons)'''
      },
      {
        'title': 'Bookk 폰트',
        'license': '''저작권 ⓒ 북큐브네트웍스
상업적 사용 가능
출처: https://bookk.co.kr/font'''
      },
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          '오픈소스 라이선스',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: w * 0.05,
            color: Colors.black,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView.separated(
        padding: EdgeInsets.symmetric(horizontal: w * 0.05, vertical: h * 0.01),
        itemCount: items.length,
        separatorBuilder: (context, index) =>
            Divider(color: Colors.grey.shade300),
        itemBuilder: (context, index) {
          final item = items[index];
          return ListTile(
            title: Text(
              item['title']!,
              style: TextStyle(
                fontSize: w * 0.045,
                fontWeight: FontWeight.w500,
                color: Colors.black,
              ),
            ),
            trailing: const Icon(Icons.chevron_right, color: Colors.black),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => LicenseDetailPage(
                    title: item['title']!,
                    content: item['license']!,
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
