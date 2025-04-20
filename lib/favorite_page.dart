import 'package:flutter/material.dart';

class FavoritePage extends StatelessWidget {
  final Set<String> favorites;
  const FavoritePage({super.key, required this.favorites});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    final padding = width * 0.04;
    final margin = width * 0.03;
    final fontSize = width * 0.045;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '즐겨찾기',
          style: TextStyle(fontSize: width * 0.05),
        ),
      ),
      body: favorites.isEmpty
          ? Center(
        child: Text(
          '즐겨찾기한 말씀이 없습니다.',
          style: TextStyle(fontSize: fontSize),
        ),
      )
          : ListView(
        children: favorites.map((verse) {
          return Card(
            margin: EdgeInsets.all(margin),
            child: Padding(
              padding: EdgeInsets.all(padding),
              child: Text(
                verse,
                style: TextStyle(fontSize: fontSize),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
