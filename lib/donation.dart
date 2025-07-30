import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'dart:async';
import 'dart:io' show Platform;

final InAppPurchase _iap = InAppPurchase.instance;
bool _purchaseInProgress = false;

class DonationPage extends StatelessWidget {
  const DonationPage({super.key});

  final List<Map<String, dynamic>> donationOptions = const [
    {'amount': 400, 'id': 'donation_400', 'emoji': '☕️'},
    {'amount': 700, 'id': 'donation_700', 'emoji': '🍩'},
    {'amount': 990, 'id': 'donation_990', 'emoji': '💎'},
    {'amount': 1500, 'id': 'donation_1500', 'emoji': '🌟'},
    {'amount': 3000, 'id': 'donation_3000', 'emoji': '🎁'},
    {'amount': 10000, 'id': 'donation_10000', 'emoji': '👑'},
  ];

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        title: const Text(
          '후원 금액 선택',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: h * 0.00, bottom: h * 0.02),
                child: Column(
                  children: [
                    Text(
                      '오늘의 말씀이 마음에 와닿으셨나요?',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: w * 0.045,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    SizedBox(height: h * 0.005),
                    Text(
                      '작은 후원이 큰 힘이 됩니다 💛',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: w * 0.04,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
              ),

              // ✅ 후원 버튼들
              ...donationOptions.map((option) {
                return Padding(
                  padding: EdgeInsets.symmetric(vertical: h * 0.012),
                  child: Container(
                    width: w * 0.6,
                    height: h * 0.07,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFFD600), Color(0xFFFFA000)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        _buyDonationProduct(context, option['id'], option['amount']);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        '${option['emoji']} ${option['amount']}원',
                        style: TextStyle(
                          fontSize: w * 0.045,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }
}


void _buyDonationProduct(BuildContext context, String productId, int amount) async {
  if (!(Platform.isAndroid || Platform.isIOS)) {
    _showSnack(context, '이 플랫폼에서는 후원을 지원하지 않습니다.');
    return;
  }

  if (_purchaseInProgress) return;
  _purchaseInProgress = true;

  final available = await _iap.isAvailable();
  if (!available) {
    _showSnack(context, '인앱결제를 사용할 수 없습니다.');
    _purchaseInProgress = false;
    return;
  }

  final response = await _iap.queryProductDetails({productId});
  if (response.error != null || response.productDetails.isEmpty) {
    _showSnack(context, '상품 정보를 불러올 수 없습니다.');
    _purchaseInProgress = false;
    return;
  }

  final product = response.productDetails.first;
  final param = PurchaseParam(productDetails: product);
  _iap.buyConsumable(purchaseParam: param, autoConsume: true);

  late final StreamSubscription<List<PurchaseDetails>> subscription;
  subscription = _iap.purchaseStream.listen((purchases) {
    for (final purchase in purchases) {
      if (purchase.status == PurchaseStatus.purchased) {
        _showSnack(context, '${amount}원 후원이 완료되었습니다. 감사합니다!');
      } else if (purchase.status == PurchaseStatus.error) {
        _showSnack(context, '결제 중 오류가 발생했습니다.');
      }
    }
    _purchaseInProgress = false;
    subscription.cancel();
  }, onError: (_) {
    _showSnack(context, '결제 스트림 오류');
    _purchaseInProgress = false;
    subscription.cancel();
  });
}

void _showSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}
