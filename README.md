# 오늘의 성경

기존 Flutter 앱과 Apps in Toss WebView 미니앱 소스를 함께 보관합니다.

- **토스 미니앱 개발·빌드·콘솔 등록·QR 테스트·출시:** [toss-miniapp/README.md](toss-miniapp/README.md)
- **Flutter legacy:** 루트 `lib/`, `android/`, `ios/`, `pubspec.yaml` 등 기존 경로를 그대로 보존했습니다. 루트의 Flutter 빌드는 기존 네이티브 앱입니다.
- **공통 성경 데이터:** `assets/KorRV.json`. 미니앱은 원본을 빌드 자산으로 사용하며 별도 사본을 관리하지 않습니다.
- **기존 Flutter 개인정보처리방침:** [보존 문서](docs/flutter-privacy-policy-legacy.md). AdMob 내용은 Flutter 버전에만 적용됩니다.
- **토스 개인정보처리방침:** 인앱 정보 → 개인정보처리방침과 [출시 전 초안](toss-miniapp/PRIVACY.md).

미니앱에는 Flutter의 AdMob, AppsFlyer, 후원 결제, `in_app_purchase`, `dart:io` 및 네이티브 플랫폼 프로젝트를 포함하지 않습니다. 별도 로그인·광고·결제·분석 서버가 없는 클라이언트 앱입니다.

문의: sonprojecta@gmail.com
