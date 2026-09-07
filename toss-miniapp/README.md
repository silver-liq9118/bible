# 오늘의 성경 · Apps in Toss WebView

React 18 + TypeScript + Vite + TDS Mobile 기반의 한국어 미니앱입니다. Flutter 앱은 루트에 legacy로 보존했습니다. **콘솔 등록, 실기기 QR 테스트, 검수·출시는 아직 수행하지 않았습니다.** 아래 수동 단계를 완료해야 출시할 수 있습니다.

## 기능

- `../assets/KorRV.json`의 66권·1,189장 사용. 첫 진입과 ‘다른 말씀 읽기’에서 무작위로 선택하며 직전 구절을 반복하지 않습니다. 날짜별 고정 구절 방식은 아닙니다.
- 장 전체 보기, 선택 구절 강조, 구절별 즐겨찾기·공유, 저장한 말씀 목록.
- 즐겨찾기와 5단계 글자 크기(18/21/24/28/32px) localStorage 저장. 손상 데이터·읽기 차단·용량 오류에도 앱이 열리며 저장 실패를 알립니다. 초기화는 이 앱의 키만 삭제합니다.
- 토스에서는 SDK 3.x `Share.sendMessage({ message })`. 일반 브라우저는 Web Share → clipboard → 선택 가능한 텍스트 fallback. 취소 후 자동 복사하지 않습니다. SDK 오류에는 별도 복사 화면을 제공합니다.
- 정보, 개인정보처리방침, 성경 데이터 라이선스 고지. 네이티브 광고·분석·후원 결제는 이식하지 않았습니다.

**원본 데이터:** 본문이 빈 절 20개가 있습니다. 원본을 변경하거나 본문을 추측하지 않습니다. 랜덤에서는 제외하고 장 보기에서 빈 본문 안내를 표시하며 해당 절의 저장·공유는 제공하지 않습니다. 운영자는 배포 전 데이터 정확성과 번역본 이용 권리를 확인해야 합니다.

## 2026-09-07 확인한 SDK 기준

`@apps-in-toss/web-framework` **3.3.0**, TDS Mobile/AIT **2.5.1**, Devtools **3.2.0** 사용. 공식 문서, 설치 시점 npm 배포 버전, SDK CHANGELOG/타입을 교차 확인했고 `pnpm-lock.yaml`을 커밋합니다.

| 항목 | 적용 |
| --- | --- |
| SDK 3.x 설정 | `apps-in-toss.config.ts`, `brand.primaryColor`, `webView`, `webBundleDir` |
| 이름·아이콘·유형 | 콘솔 등록. 구형 `brand.displayName`, `brand.icon`, `webViewProps.type` 제거 |
| 개발·빌드 | package.json의 Vite 명령 → 웹 빌드 후 `ait build` |
| UI | TDS Provider/Button, 라이트 모드, 토스 공통 내비게이션, 별도 상단 뒤로가기 버튼 없음 |
| Safe Area | `SafeArea.get/subscribe` 하단 여백 + CSS env fallback |
| 이동 | 내부 hash 경로와 자체 history 깊이. 하위 화면 backEvent 구독, 처음 화면의 종료는 SDK에 맡김 |
| 권한 | `permissions: []`, 기기 정보 수집·로그인 없음 |

일반 시작 가이드에는 구형 예제가 남아 있습니다. **설정은 SDK 3.x 전환 문서**, **Origin/Storage는 더 나중인 2026-08-25 공식 공지**를 우선 적용합니다. 전환 문서의 과거 localStorage 보류/`web.tossmini.com` 안내를 새 앱에 적용하지 않습니다.

### Origin / Storage

- 3.1.1 이상 실제 서비스: `https://{appName}.apps.tossmini.com`
- 콘솔 QR: `https://{appName}.private-apps.tossmini.com`
- 초기 3.x는 `web.tossmini.com`, `private-web.tossmini.com`을 사용했습니다.
- 이 앱은 **SDK 3.x로 처음 출시**하므로 공식 공지상 별도 Origin 병합이 필요 없습니다. Flutter SharedPreferences는 다른 앱 저장소여서 가져올 수 없습니다.
- 같은 appName을 과거 2.x/초기 3.x로 운영했다면 **업로드 전에 가정을 재검토**하세요. `Migration.getOriginStorage()`로 이전/현재 저장소를 조회하고 실제 기존 키·스키마를 확인한 후 병합해야 합니다. 즐겨찾기는 유효 ID 합집합, 글자 크기는 명시적 우선순위를 사용하세요. 존재하지 않는 과거 스키마를 추측한 코드는 넣지 않았습니다.
- 키: `todays-bible:preferences:v1`, 값: `{ version: 1, favorites: string[], fontSize: number }`. 구절 ID는 원본 영문 책 이름+장+절입니다.
- localhost·QR·서비스는 별도 저장소입니다. 기기 간 동기화/서버 복구는 없습니다. 현재 외부 API가 없어 별도 CORS 설정이 없고, 추후 API 추가 시 위 최신 Origin 두 개를 서버에서 허용해야 합니다.

## 개발 / 빌드

Node.js **24 이상**, pnpm **11.19.0**. `toss-miniapp/`에서:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm lint
pnpm build
```

- 개발은 `http://localhost:5173`. AIT 버튼에서 기기 프리셋·권한·공유·뒤로가기 mock을 확인합니다. SDK 3.x 기본 개발에 이전 `ait dev`/Metro/샌드박스 앱 설치는 필요 없습니다.
- 빌드: 타입 검사 → Vite `dist/` → `<appName>.ait`. 기본 appName `todays-bible`은 개발용이며 **콘솔 등록 완료를 의미하지 않습니다**.
- 웹 빌드만 `pnpm build:web`, 프로덕션 웹 확인 `pnpm preview` (`http://localhost:4173`). 브릿지가 없는 일반 브라우저는 일반 TDS Provider와 공유 fallback을 사용합니다.
- Devtools는 개발 서버에만 적용하며 `forceEnable`을 사용하지 않습니다. TDS 내부 SDK import까지 mock 처리하도록 Vite 사전 번들링 설정을 조정했습니다.
- JSON은 원본 파일을 별도 정적 자산으로 번들에 포함하고 fetch합니다. 로딩 실패 시 다시 불러오기를 제공합니다. 번들은 압축 해제 후 100MB 이하이어야 합니다.
- `dist/`, `*.ait`, `node_modules/`는 커밋하지 않습니다. pnpm workspace 파일은 단독 패키지 경계와 설치 스크립트 허용 목록입니다.

### appName 지정

PowerShell:

```powershell
$env:TOSS_APP_NAME = '콘솔에서-확정한-appName'
pnpm build
```

macOS/Linux:

```sh
TOSS_APP_NAME='콘솔에서-확정한-appName' pnpm build
```

또는 `apps-in-toss.config.ts` 기본값을 확정 이름으로 수정하세요. SDK 설정은 셸 환경 변수를 읽고 `.env` 자동 로딩에 의존하지 않습니다. 이름 ‘오늘의 성경’과 실제 아이콘, 비게임 WebView 유형을 콘솔에 등록합니다. 토큰을 브라우저에 공개되는 `VITE_*`에 넣지 마세요.

## 토스 MCP

이번 작업에서 공식 **AX MCP 0.7.1**을 실제 실행하고 `tools/list`, `search_tds_web_docs`, `get_tds_web_doc`로 TDS 시작/버튼 문서를 조회했습니다. 공식 개발자센터와 최신 SDK 공지도 함께 확인했습니다. **AX 문서 MCP와 콘솔 MCP는 별개입니다.**

공식 문서 MCP:

```sh
npm install -g @apps-in-toss/ax
ax mcp --disable-usage-stats
```

콘솔 MCP 연결(공식 토스 콘솔 가이드의 Codex 명령):

```sh
codex mcp add apps-in-toss-console --url https://mcp.toss.im/adapters/apps-in-toss-console/mcp --oauth-client-id mcp-gateway
```

로그인 창에서 운영자가 인증하고 새 세션에서 연결을 확인합니다. 이번 작업에는 콘솔 인증/워크스페이스 정보가 없어 콘솔 조회·앱 생성·업로드·검수를 실행하지 않았습니다.

연결 후 순서:

1. `workspace_list` → `miniapp_list`/`miniapp_get`로 워크스페이스·대상 앱·중복 등록 확인.
2. 확정된 appName, 유형, 이름, 아이콘, 스크린샷, 연령등급, 고객센터, 방침 설정.
3. 최종 검증·빌드 후 `bundle_upload`로 `.ait` 업로드.
4. 실기기 QR 테스트 후 `bundle_submit_review`/`review_submit` 검수 요청.
5. `review_get`/`review_get_feedback` 결과 확인, 수정·재검증·재업로드. 승인 후 출시 조작은 콘솔 상태와 실제 제공 도구를 확인합니다.

도구 입력은 연결된 서버의 실제 스키마를 먼저 조회하고, 토큰은 저장소/PR에 기록하지 마세요.

## 콘솔 등록 → QR → 출시

1. 콘솔에서 파트너·워크스페이스 등록과 필요한 계약·운영자 정보를 완료합니다.
2. 비게임 WebView 앱을 등록하고 appName, 이름, 카테고리, 아이콘, 고객센터, 연령등급, 소개·스크린샷을 입력합니다. 같은 appName의 과거 서비스 이력을 확인합니다.
3. [PRIVACY.md](PRIVACY.md)의 운영자·연락처 및 데이터 처리를 확인하고 공개 HTTPS 방침 URL을 게시·등록합니다. 인앱 `#privacy`만으로 외부 심사용 URL을 대신하지 않습니다.
4. 확정 appName으로 `pnpm test`, `pnpm lint`, `pnpm build` 실행.
5. 콘솔 ‘출시하기’에서 `.ait` 업로드 또는 인증된 MCP `bundle_upload`. ‘테스트하기’ QR을 최신 iOS/Android 토스 앱으로 스캔합니다. **로그인된 만 19세 이상 워크스페이스 멤버**가 테스트해야 합니다.
6. QR 환경은 `intoss-private://{appName}`입니다. 공유에는 비공개 QR 주소를 넣지 않습니다. 말씀 공유는 `Share.createLink`로 공개 `intoss://todaysbible/verse?verseId=...`를 변환하며, 링크 진입 시 해당 구절을 홈 카드로 엽니다. 공개 딥링크는 정식 출시 이후 실기기에서 최종 확인합니다.
7. QR 테스트를 1회 이상 완료해야 검토 요청이 활성화됩니다. 아래 체크리스트 후 검수 요청 → 승인 → 콘솔 ‘출시하기’. 공개 후 실제 Origin에서 다시 검증합니다. **3.x 출시 후 2.x로 롤백할 수 없습니다.**

## 남은 수동 단계 / 심사 체크리스트

- [ ] 콘솔 MCP OAuth 인증, 워크스페이스/appName 확정, 기존 2.x·초기 3.x 운영 이력 확인.
- [ ] 비게임 WebView, 이름·아이콘·카테고리·연령등급·고객센터·소개·스크린샷 등록.
- [ ] 운영자명/문의 주소 `sonprojecta@gmail.com`(기존 README 보존) 확인, 방침 확정·HTTPS 게시·등록.
- [ ] KorRV 정확성(빈 절 20개 포함), 번역본·데이터·아이콘 이용 권리 확인.
- [ ] iOS/Android QR: 최초 진입·랜덤·장 전체·긴 장(시편 119편)·즐겨찾기 저장/해제·재진입·글자 크기 최소/최대.
- [ ] QR/실서비스 저장소 분리, 저장소 차단/삭제/용량 초과 안내.
- [ ] 실제 공유 시트 열기·취소·복귀·본문, 실패 시 복사 확인. 메시지 전송은 테스트 대상에게 직접 수행.
- [ ] 토스 뒤로가기·Android 시스템 백·첫 화면 종료·공통 더보기/닫기·노치/홈 인디케이터·스크롤 확인.
- [ ] 라이트 모드, 320px/최대 글자 크기에서도 겹침 없음, 인터랙션 2초 이상 지연 없음.
- [ ] 광고·추적·후원 결제·설치 유도·불필요한 외부 이동 없음.
- [ ] 사용자 식별키 항목은 계정 없는 로컬 전용 앱으로 미사용임을 검수 설명에 기재하고 적용 여부 확인. 로그인·광고·결제 미사용도 설명.
- [ ] 최종 `.ait` QR 검증 → 검수 → 승인 → 출시 → 운영 확인.

## 검증 범위

Vitest: 실제 KorRV 전체 구조·한국어 책 이름·장 정렬·빈 절·랜덤 경계·공유문, 저장소 재읽기/손상/용량 오류/키 범위 삭제, 공유 취소/fallback. 로컬 브라우저 mock 성공은 실제 토스 QR 성공을 의미하지 않습니다.

## 맞춤 말씀 알림 도입 순서

추천 말씀 푸시는 현재 번들에 포함되지 않았습니다. 다음 준비가 끝난 뒤 별도 기능으로 연결합니다.

1. 콘솔 스마트 발송에서 알림 동의문과 캠페인을 만들고 문구 검수를 받아 `templateSetCode`를 확정합니다. 재방문·리텐션 성격이면 광고성 메시지로 판단될 수 있으므로 기능성 메시지로 임의 구현하지 않습니다.
2. 사용자가 아침·점심·저녁 중 받을 시간을 직접 고르는 설정 화면을 만들고 `requestNotificationAgreement`에 승인된 템플릿 코드를 전달합니다. 거부·철회 상태도 설정 화면에서 명확히 표시합니다.
3. 비게임 사용자 식별에는 `User.getAnonymousKey()`를 사용하고, 선호 시간·시간대·추천 이력은 파트너 서버에 최소한으로 저장합니다. `localStorage`만으로는 앱이 닫힌 시간에 사용자별 푸시를 예약할 수 없습니다.
4. 파트너 서버에서 스케줄러와 추천 로직을 실행하고 mTLS로 스마트 발송 API를 호출합니다. 인증서와 키는 번들에 포함하지 않습니다.
5. 첫 버전은 시간대별 큐레이션과 즐겨찾기 주제 기반 추천으로 제한합니다. 조회 횟수를 서버로 보낼 경우 개인정보처리방침과 동의 내용을 먼저 갱신합니다.
6. 날씨 추천은 별도 단계로 진행합니다. `geolocation` 권한을 추가하고 사용자 요청 시에만 위치를 조회하며, 원본 좌표는 저장하지 않고 지역/기상 코드로 즉시 변환합니다. 날씨 API 장애 시에는 시간대 추천으로 대체합니다.

알림 제목은 7자 이내, 내용은 25자 이내 규칙을 기준으로 작성하고 콘솔 검수 결과를 최종 기준으로 사용합니다.

## 공식 근거

- [SDK 3.x 설정 변경](https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x)
- [2026-08-25 Storage/CORS 후속 공지](https://techchat-apps-in-toss.toss.im/t/webview-storage-cors/4673)
- [9월 14일 전환 공지](https://techchat-apps-in-toss.toss.im/t/webview-sdk-3-x-9-14/4624)
- [Share.sendMessage](https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/share/share.sendmessage)
- [토스앱 공유 링크](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B3%B5%EC%9C%A0/getTossShareLink.html)
- [알림 동의문 요청](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%9D%B8%ED%84%B0%EB%A0%89%EC%85%98/requestNotificationAgreement.html)
- [스마트 발송](https://developers-apps-in-toss.toss.im/smart-message/intro.html), [스마트 발송 API](https://developers-apps-in-toss.toss.im/smart-message/develop.html)
- [TDS 시작](https://tossmini-docs.toss.im/tds-mobile/start/), [공식 AX MCP](https://github.com/toss/apps-in-toss-ax), [콘솔 MCP](https://developers-apps-in-toss.toss.im/guide/console-mcp)
- [비게임 출시](https://developers-apps-in-toss.toss.im/checklist/app-nongame), [오픈 정책](https://developers-apps-in-toss.toss.im/intro/guide)
- [QR 테스트](https://developers-apps-in-toss.toss.im/guide/operation/toss), [출시하기](https://developers-apps-in-toss.toss.im/guide/operation/deploy)
