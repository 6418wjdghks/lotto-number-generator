# 테스트 도구

로또번호 추첨기의 자동 테스트 도구입니다.

## 테스트 2계층 구조

| 계층 | 파일 | 실행 환경 | 대상 | 테스트 수 |
|------|------|----------|------|-----------|
| **순수 로직** | `test-logic.js` | Node.js (CLI) | 순수 함수, localStorage 로직 | 23개 |
| **DOM/UI** | `test.html` | 브라우저 | DOM 렌더링, 토스트, 클립보드 등 | 11개 |

중복 없음: 순수 로직은 CLI에서만, DOM 의존 기능은 브라우저에서만 테스트합니다.

## 실행 방법

### CLI 자동 테스트 (Node.js 18+)
```bash
node --test test/test-logic.js
```
- 외부 의존성 없음 (Node.js 내장 `node:test` 사용)
- exit code 0/1로 CI 연동 가능
- 23개 테스트 (5 suites)

### 브라우저 DOM/UI 테스트
```bash
start test/test.html  # Windows
open test/test.html   # macOS
```
- 페이지 로드 시 자동 실행
- 11개 테스트 + 분포 통계 시각화

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

## 브라우저 테스트 항목 (test.html, 11개)

| Test | 검증 내용 | 의존 |
|------|-----------|------|
| 1 | `clearHistory()` - 빈 이력 경고, confirm 승인/거부, 완료 알림 | alert/confirm |
| 2 | `getSelectedSetCount()` - DOM select 연동, 타입 검증 | DOM |
| 3 | `copyToClipboard()` - 성공/실패, 클립보드 내용, setNumber 토스트 | Clipboard API |
| 4 | `showToast()` - success/error 타입, 메시지 일치, 자동 제거, 연속 호출 교체 | DOM |
| 5 | `displayMultipleSets()` - 카드, 라벨, 뱃지, textContent(XSS), 복사버튼, 재호출 초기화 | DOM |
| 6 | `displayHistory()` - 빈 이력 메시지, 숫자/시간 표시, setCount 표시 | DOM |
| 7 | `toggleHistoryView()` - hidden 토글, 버튼 텍스트 변경 | DOM |
| 8 | `toggleExcludeView()` - 패널 토글, 45개 버튼 생성, 클릭 제외, 카운터 | DOM |
| 9 | `resetExcludedNumbers()` - 초기화 후 제외 0개, 카운터 리셋 | DOM |
| 10 | 제외 39개 초과 시 경고 표시/숨김 | DOM |
| 11 | `generateLottoNumbers()` - 1세트/3세트 end-to-end (DOM + 이력 + setCount) | DOM + 통합 |

추가로 분포 통계 시각화(1000회)를 참고 도구로 제공합니다 (테스트 검증 아님).

---

## 테스트 구조

### DOM Fixture
`test.html`에 app.js가 참조하는 DOM 요소(`#setCount`, `#setsContainer`, `#historyList`, `#historyToggleText`, `#excludePanel`, `#excludeGrid`, `#excludeCount`, `#remainCount`, `#excludeWarning`, `#excludeToggleText`)를 숨겨진 영역으로 재현합니다.

### localStorage 모킹 (CLI)
`test-logic.js`에서 `global.localStorage`와 `global.document`를 최소 모킹하여 Node.js에서 순수 로직 함수를 테스트합니다.

### 비동기 처리
`test.html`의 `runAllTests()`가 async 함수이며, Clipboard API/Toast 테스트를 `await`로 순차 실행합니다.

---

## 결과 해석

### CLI (`node --test`)
- `ok` / `not ok`: 개별 테스트 통과/실패
- exit code 0: 전부 통과, 1: 실패 있음

### 브라우저 (`test.html`)
- ✅ PASS: 검증 통과
- ❌ FAIL: 검증 실패
- ⚠️ INFO: 환경 제한으로 스킵 (예: Clipboard API는 HTTPS 필요)
- 하단 요약 바에서 전체 통과/실패 수 확인

## 함수 커버리지

app.js 17개 함수 전체를 테스트합니다:

| 함수 | CLI | 브라우저 |
|------|-----|---------|
| `generateSingleSet` | ✅ | |
| `generateMultipleSets` | ✅ | |
| `generateUUID` | ✅ | |
| `saveToHistory` | ✅ | |
| `loadHistory` | ✅ | |
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

---

**최종 업데이트**: 2026-02-11 (v3 - 2계층 분리)
