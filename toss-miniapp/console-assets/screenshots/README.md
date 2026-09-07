# Apps in Toss 콘솔 스크린샷

공식 콘솔 워크스페이스 규격에 맞춘 실제 웹 미니앱 화면입니다. 홍보 문구, 기기 프레임, 기능을 과장하는 합성 요소를 추가하지 않았습니다.

| 파일 | 화면 | 크기 |
| --- | --- | --- |
| `portrait-01-today.png` | 오늘의 말씀 | 636 × 1048 |
| `portrait-02-chapter.png` | 장 전체 보기 | 636 × 1048 |
| `portrait-03-favorites.png` | 즐겨찾기 | 636 × 1048 |
| `portrait-04-info.png` | 정보 및 설정 | 636 × 1048 |
| `landscape-01-today.png` | 오늘의 말씀 | 1504 × 741 |

세로형은 최소 등록 수량인 3장을 모두 등록할 수 있습니다. 가로형을 사용할 경우 `landscape-01-today.png` 1장을 등록합니다. 콘솔에는 한 방향의 세트만 사용하는 것을 권장하며, 등록 화면의 최신 안내를 마지막으로 확인하세요.

촬영 기준:

- `pnpm build:web`으로 생성한 프로덕션 웹 빌드
- 실제 `assets/KorRV.json` 본문
- 실제 Toss Design System 컴포넌트와 앱 내 내비게이션
- 즐겨찾기 화면은 앱의 실제 `localStorage` 스키마에 요한복음 3장 16절과 시편 23장 1절을 저장한 상태
