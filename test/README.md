# 테스트 도구

로또번호 추첨기의 자동 테스트 도구입니다.

## 테스트 3계층 구조

| 계층 | 파일 | 실행 환경 | 대상 | 검증 수 |
|------|------|----------|------|---------|
| **순수 로직** | `test-logic.js` | Node.js (CLI) | 순수 함수, localStorage 로직 | 23개 |
| **DOM/UI (CLI)** | `test-dom.js` | Node.js + Edge headless | DOM 렌더링, 토스트, 클립보드 등 | 53개 |
| **DOM/UI (브라우저)** | `test.html` | 브라우저 직접 | 위와 동일 (시각적 확인용) | 53개 |

중복 없음: 순수 로직은 CLI에서만, DOM 의존 기능은 브라우저(또는 headless)에서만 테스트합니다.
`test-dom.js`는 `test.html`을 Edge headless로 실행하는 래퍼입니다.

## 실행 방법

### npm 통합 명령 (권장)
```bash
npm test                    # 로직 + DOM 테스트 순차 실행
npm run test:logic          # 순수 로직만
npm run test:dom            # DOM/UI (Edge headless)
npm run test:dom:screenshot # DOM/UI + 스크린샷 저장
```

### CLI 직접 실행
```bash
node --test test/test-logic.js          # 순수 로직 (Node.js 18+)
node test/test-dom.js                   # DOM/UI (puppeteer-core 필요)
node test/test-dom.js --screenshot      # 스크린샷: test/screenshot.png
node test/test-dom.js --screenshot=path # 스크린샷: 지정 경로
```

### 브라우저 DOM/UI 테스트
```bash
start test/test.html  # Windows
open test/test.html   # macOS
```
- 페이지 로드 시 자동 실행
- 분포 통계 시각화 포함

---

## CLI 테스트 항목 (test-logic.js, 23개)

### generateSingleSet() — 9개

| # | 검증 내용 | 반복 |
|---|-----------|------|
| 1 | 6개 숫자 생성 | 1회 |
| 2 | 숫자 범위 1-45 | 100회 |
| 3 | 중복 없음 | 100회 |
| 4 | 오름차순 정렬 | 100회 |
| 5 | 랜덤성 (90%+ 고유 조합) | 100회 |
| 6 | 분포 균등성 (표준편차 검증) | 1000회 |
| 7 | 제외 번호 미출현 | 100회 |
| 8 | 빈 제외 배열 = 기존 동작 | 1회 |
| 9 | 제외 후 6개 생성, 정렬, 중복 없음 | 1회 |

### generateMultipleSets() — 3개

| # | 검증 내용 |
|---|-----------|
| 1 | 요청 세트 수만큼 생성 (1, 3, 5) |
| 2 | 모든 세트 유효 (6개, 범위, 정렬, 중복) |
| 3 | 제외 번호가 모든 세트에 적용 |

### generateUUID() — 2개

| # | 검증 내용 |
|---|-----------|
| 1 | UUID v4 형식 정규식 |
| 2 | 100개 생성 시 모두 고유 |

### loadHistory() — 4개

| # | 검증 내용 |
|---|-----------|
| 1 | 빈 저장소 → 빈 배열 |
| 2 | 정상 데이터 로드 |
| 3 | 잘못된 JSON → 빈 배열 |
| 4 | 미지원 버전 → 빈 배열 |

### saveToHistory() — 5개

| # | 검증 내용 |
|---|-----------|
| 1 | 저장 후 로드 가능 |
| 2 | id, timestamp, setCount 자동 생성 |
| 3 | setCount 기본값 1 |
| 4 | 최신 항목이 맨 앞 |
| 5 | 최대 20개 제한 |

---

## DOM/UI 테스트 항목 (test.html + test-dom.js, 12그룹 53개 검증)

| # | 테스트 그룹 | 검증 수 | 의존 |
|---|------------|---------|------|
| 1 | `clearHistory()` — 빈 이력 경고, confirm 승인/거부, 완료 알림 | 4 | alert/confirm |
| 2 | `getSelectedSetCount()` — 기본값, 최대값, 반환 타입 | 3 | DOM |
| 3 | `copyToClipboard()` — 복사 성공, 클립보드 내용 일치, setNumber 토스트 | 3 | Clipboard API |
| 4 | `showToast()` — success/error 타입, 메시지, 자동 제거, 연속 교체 | 6 | DOM |
| 5 | `displayMultipleSets()` — 카드, 라벨, 뱃지, textContent, 복사버튼, 초기화 | 6 | DOM |
| 6 | `displayHistory()` — 빈 이력 메시지, 항목 렌더링, 숫자/시간/setCount | 5 | DOM |
| 7 | `toggleHistoryView()` — 초기 상태, hidden 토글, 텍스트 변경 (2회) | 6 | DOM |
| 8 | `toggleExcludeView()` — 패널 토글, 45개 버튼, 클릭 제외, 카운터, 재토글 | 6 | DOM |
| 9 | `resetExcludedNumbers()` — 제외 설정, 초기화, 카운터 리셋 | 3 | DOM |
| 10 | 제외 경고 — 40개 제외 시 경고 표시, 39개 시 숨김 | 2 | DOM |
| 11 | `generateLottoNumbers()` — 1세트/3세트 카드, 이력, setCount, 숫자 유효 | 6 | DOM + 통합 |
| 12 | `initApp()` 이벤트 바인딩 — btnGenerate, btnToggleHistory, btnToggleExclude 클릭 | 3 | 이벤트 바인딩 |
| | **합계** | **53** | |

> Test 3: Clipboard API 미지원 시 INFO 로그 후 스킵 (PASS 미계상). CLI 러너는 CDP로 클립보드 권한을 부여하여 3개 모두 실행. 브라우저에서 readText 권한이 없으면 내용 검증을 스킵하고 2개 실행.

추가로 분포 통계 시각화(1000회)를 참고 도구로 제공합니다 (테스트 검증 아님).

---

## 테스트 구조

- **DOM Fixture** (`test.html`): `index.html`의 DOM 구조를 재현 (버튼 10개 + 인증 요소 포함, `initApp()` 이벤트 바인딩 가능)
- **resetFixture()**: 테스트 간 상태 격리 — `STORAGE_KEY`, `EXCLUDED_KEY` LocalStorage 초기화 + DOM 리셋
- **localStorage 모킹** (`test-logic.js`): `global.localStorage`/`global.document` 최소 모킹
- **비동기 처리**: `runAllTests()`가 async, Clipboard/Toast 테스트를 `await`로 순차 실행
- **CLI 러너** (`test-dom.js`): puppeteer-core + Edge headless로 test.html 실행. `console.log` 이벤트로 실시간 CLI 출력, `dataset` 완료 시그널로 종료 감지

---

## 함수 커버리지

app.js 함수 목록은 `docs/tech.md` JS-API 섹션(L141~) 참조.

### Phase 1~3 함수 (18개 — 전수 테스트)

| 함수 | CLI | 브라우저 |
|------|-----|---------|
| `generateSingleSet` | ✅ | |
| `generateMultipleSets` | ✅ | |
| `generateUUID` | ✅ | |
| `saveToHistoryLocal` | ✅ | |
| `loadHistoryLocal` | ✅ | |
| `clearHistoryLocal` | | ✅ (clearHistory 경유) |
| `clearHistory` | | ✅ |
| `getSelectedSetCount` | | ✅ |
| `displayMultipleSets` | | ✅ |
| `displayHistory` | | ✅ |
| `toggleHistoryView` | | ✅ |
| `copyToClipboard` | | ✅ |
| `showToast` | | ✅ |
| `getExcludedNumbers` | | ✅ |
| `toggleExcludeView` | | ✅ |
| `updateExcludeCount` | | ✅ |
| `resetExcludedNumbers` | | ✅ |
| `generateLottoNumbers` | | ✅ |

### 테마 함수 (5개 — 미작성)

브라우저 환경(`localStorage`, `document.documentElement`, `matchMedia`) 의존으로 테스트 미작성 상태.

| 함수 | CLI | 브라우저 | 비고 |
|------|-----|---------|------|
| `applyTheme` | | ❌ 미작성 | DOM data-theme 조작 |
| `updateThemeToggle` | | ❌ 미작성 | 버튼 텍스트/aria-label 변경 |
| `toggleTheme` | | ❌ 미작성 | applyTheme + saveTheme 호출 |
| `loadTheme` | | ❌ 미작성 | localStorage + matchMedia 의존 |
| `saveTheme` | | ❌ 미작성 | localStorage 저장 |

### 제외 번호 저장 함수 (3개 — 미작성)

브라우저 환경(LocalStorage) 의존으로 테스트 미작성 상태. 향후 브라우저 테스트(`test.html`)에 추가 예정.

| 함수 | CLI | 브라우저 | 비고 |
|------|-----|---------|------|
| `saveExcludedNumbers` | | ❌ 미작성 | LocalStorage 저장 (브라우저 환경 필요) |
| `loadExcludedNumbers` | | ❌ 미작성 | LocalStorage 로드 (브라우저 환경 필요) |
| `clearExcludedNumbers` | | ❌ 미작성 | LocalStorage 삭제 (브라우저 환경 필요) |

### Phase 4 함수

미테스트 (Supabase 연동 필요). 프로젝트 설정 완료 후 통합 테스트 추가 예정.

---

정밀 검증 결과: `docs/verification.md` 하단 참조
