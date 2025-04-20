import 'package:flutter/material.dart';

class FavoritePage extends StatelessWidget {
  final Set<String> favorites;
  const FavoritePage({super.key, required this.favorites});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('즐겨찾기')),
      body: favorites.isEmpty
          ? const Center(child: Text('즐겨찾기한 말씀이 없습니다.'))
          : ListView(
        children: favorites.map((verse) {
          return Card(
            margin: const EdgeInsets.all(12),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                verse,
                style: const TextStyle(fontSize: 18),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
