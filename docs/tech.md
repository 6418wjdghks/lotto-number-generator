# 로또번호 추첨기 - 기술 명세서

**버전**: 3.0.0 | **최종 수정**: 2026-02-12 | **상태**: Phase 4 진행 중

---

## 기술 스택

- **Frontend**: HTML5, CSS3 (Flexbox + Grid), Vanilla JavaScript (ES6+)
- **백엔드 (Phase 4)**: Supabase REST API 직접 호출 (SDK 미사용, ADR-016)
- **배포**: GitHub Pages (`[username].github.io/[repo-name]`)
- **의존성**: 외부 없음. Supabase REST API만 사용

---

## 파일 구조

```
HelloClaude/
├── index.html              # 메인 HTML
├── css/style.css           # 스타일시트
├── js/
│   ├── supabase-config.js  # Supabase REST API 래퍼
│   └── app.js              # JavaScript 로직
├── docs/                   # 프로젝트 문서
│   ├── plan.md             # 진행 상황
│   ├── spec.md             # 기능 명세 (제품)
│   ├── design.md           # 디자인 시스템
│   ├── tech.md             # 기술 명세 (본 문서)
│   ├── decisions.md        # ADR (활성)
│   ├── decisions_001_010.md # ADR 아카이브
│   └── phase4-architecture.md # Phase 4 설계
├── test/
│   ├── test.html           # 브라우저 테스트
│   ├── test-logic.js       # CLI 테스트
│   └── README.md           # 테스트 문서
└── .claude/                # Claude Code 설정
```

---

## 아키텍처

**패턴**: 관심사 분리 (HTML/CSS/JS 파일 분리)
- 구조(HTML), 표현(CSS), 동작(JS) 독립 수정 가능
- CSS/JS 별도 캐시, 협업 충돌 최소화

---

## JavaScript API (`js/app.js`)

> 함수 요약: CLAUDE.md API 테이블 참조. 아래는 상세 명세.

### 핵심 생성 함수

**`generateSingleSet(excludedNumbers = [])`**
- **반환**: `Array<number>` — 6개 숫자, 1~45, 오름차순
- **알고리즘**: Fisher-Yates 셔플 → 앞 6개 추출 → sort
- **제외**: `excludedNumbers` 배열의 번호를 1~45에서 제거 후 셔플

**`generateMultipleSets(count, excludedNumbers = [])`**
- **매개변수**: `count` (1~5)
- **반환**: `Array<Array<number>>` — count개 세트

**`getSelectedSetCount()`**
- **반환**: `number` — `#setCount` 드롭다운 값

**`generateLottoNumbers()`**
- 메인 진입점. `getSelectedSetCount()` → `generateMultipleSets()` → `displayMultipleSets()` → `saveToHistory()` (각 세트)

### 표시 함수

**`displayMultipleSets(sets)`**
- 기존 DOM 초기화 → 각 세트 카드(라벨/뱃지/복사버튼) 생성 → 순차 애니메이션

**`displayHistory()`** (async)
- `loadHistory()` → DOM 렌더링, 빈 상태 처리

**`showToast(message, type = 'success', duration = 2000)`**
- 토스트 메시지 생성, `duration`ms 후 자동 제거. type: `'success'` | `'error'`

### 이력 함수 (듀얼 모드)

**`saveToHistory(numbers, setCount = 1)`** (async)
- 로그인 → `supabase.insertHistory()`, 비로그인 → `saveToHistoryLocal()`

**`loadHistory()`** (async)
- 로그인 → `supabase.fetchHistory()`, 비로그인 → `loadHistoryLocal()`
- **반환**: `Array<HistoryItem>`

**`clearHistory()`** (async)
- confirm 후 로그인 → `supabase.deleteAllHistory()`, 비로그인 → `clearHistoryLocal()`

**`saveToHistoryLocal(numbers, setCount = 1)`**
- LocalStorage에 JSON 저장. id(UUID), timestamp(ISO 8601) 자동 생성. 최대 20개 FIFO.

**`loadHistoryLocal()`**
- **반환**: `Array<HistoryItem>` — 에러 시 빈 배열

**`clearHistoryLocal()`** — LocalStorage 이력 삭제

**`toggleHistoryView()`** — 이력 영역 표시/숨김 토글

### 제외 함수

**`getExcludedNumbers()`** → `Array<number>` — `.exclude-btn.excluded` 버튼의 숫자 수집

**`toggleExcludeView()`** — 패널 토글, 최초 열기 시 45개 버튼 그리드 생성

**`updateExcludeCount()`** — 제외/남은 카운터 업데이트, 경고 표시

**`resetExcludedNumbers()`** — 모든 제외 해제, 카운터 리셋

### 복사 / 유틸리티

**`copyToClipboard(numbers, setNumber = null)`** → `Promise<boolean>`
- Clipboard API 사용. 형식: `"3, 12, 19, 27, 38, 42"`

**`generateUUID()`** → `string` — UUID v4 (`Math.random()` 기반)

### 인증 함수 (Phase 4)

**`toggleAuthForm()`** — 로그인 폼 토글
**`handleSignIn()`** (async) — 로그인 + UI 전환
**`handleSignUp()`** (async) — 회원가입
**`handleSignOut()`** (async) — 로그아웃 + UI 전환
**`updateAuthUI()`** — 로그인/비로그인 UI 상태 반영
**`initApp()`** — 페이지 로드 시 세션 확인 + UI 초기화

---

## Supabase REST API (`js/supabase-config.js`)

전역 객체 `window.supabase`로 노출. 설정: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (플레이스홀더).

| 함수 | 설명 |
|------|------|
| `getSession()` | LocalStorage에서 세션(토큰/유저) 반환 |
| `saveSession(data)` | 세션 저장 |
| `clearSession()` | 세션 삭제 |
| `isLoggedIn()` | 세션 존재 + access_token 유무 |
| `signUp(email, password)` | (async) `/auth/v1/signup` |
| `signIn(email, password)` | (async) `/auth/v1/token?grant_type=password` |
| `signOut()` | (async) `/auth/v1/logout` + 세션 삭제 |
| `getUser()` | (async) `/auth/v1/user` |
| `fetchHistory(limit)` | (async) `/rest/v1/lottery_history` 조회 |
| `insertHistory(numbers, setCount)` | (async) 이력 POST |
| `deleteAllHistory()` | (async) 전체 이력 DELETE |

---

## 데이터 구조

### LocalStorage — 이력 (`lotto_history`)

```json
{
  "version": "1.0",
  "history": [
    {
      "id": "uuid-v4",
      "numbers": [3, 12, 19, 27, 38, 42],
      "timestamp": "2026-02-11T10:30:00.000Z",
      "setCount": 1
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `version` | string | 데이터 포맷 버전 |
| `id` | string | UUID v4 |
| `numbers` | number[] | 6개, 1~45, 오름차순 |
| `timestamp` | string | ISO 8601 |
| `setCount` | number | 동시 추첨 세트 수 |

### LocalStorage — 세션 (`supabase_session`)

인증 세션 (access_token, user 정보). `supabase-config.js`가 관리.

### Supabase DB

DB 스키마 상세: `docs/phase4-architecture.md` 참조.
- `lottery_history`: 서버 측 추첨 이력 (user_id, numbers, set_count, created_at)
- `lottery_results`, `winning_history`, `users`: Phase 4 후반 구현 예정

---

## 핵심 알고리즘: Fisher-Yates Shuffle

```javascript
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

- **복잡도**: O(n) 시간, O(1) 공간 (in-place)
- **균등 분포 보장**: 모든 순열 동일 확률
- **목적**: 오락용 (`Math.random()`). 암호학적 안전성 불필요

---

## 브라우저 호환성

**지원**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (데스크톱/모바일)

**필수 API**: ES6 (Arrow, Template Literals, Destructuring, Array.from), LocalStorage, Clipboard, Fetch, Flexbox, Grid, CSS Animations

**폴리필 불필요**: 모든 기능이 대상 브라우저에서 네이티브 지원

---

## 보안

- **XSS 방지**: `textContent` 사용 (innerHTML 금지). 컨테이너 초기화(`innerHTML = ''`)만 예외
- **입력 검증**: LocalStorage JSON 파싱 시 try-catch
- **랜덤**: `Math.random()` — 오락용 충분. 실제 도박에는 `crypto.getRandomValues()` 필요
- **세션**: access_token을 LocalStorage 저장 (Supabase SDK와 동일 방식)

---

## 성능

| 메트릭 | 목표 |
|--------|------|
| First Contentful Paint | < 1.0s |
| Time to Interactive | < 1.5s |
| 추첨 응답 | < 100ms |
| 애니메이션 | 60fps |
| 페이지 크기 | < 50KB |

**최적화**: Vanilla JS (프레임워크 오버헤드 없음), CSS `transform` 하드웨어 가속, 배치 DOM 업데이트, 클래스 기반 효율적 선택자

---

## 테스트

`test/README.md` 참조. CLI 순수 로직 + 브라우저 DOM/UI, 중복 없음.

---

**관련 문서**: [spec.md](./spec.md), [design.md](./design.md), [plan.md](./plan.md)
