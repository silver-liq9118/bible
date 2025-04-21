import 'package:flutter/material.dart';

class LicenseDetailPage extends StatelessWidget {
  final String title;
  final String content;

  const LicenseDetailPage({super.key, required this.title, required this.content});

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          title,
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: w * 0.05),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.all(w * 0.05),
        child: SingleChildScrollView(
          child: Text(
            content,
            style: TextStyle(
              fontSize: w * 0.035,
              height: 1.6,
              fontFamily: 'Courier', // monospace font
              color: Colors.black87,
            ),
          ),
        ),
      ),
    );
  }
}
