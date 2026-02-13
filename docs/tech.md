# 로또번호 추첨기 - 기술 명세서

**버전**: 3.1.0 | **최종 수정**: 2026-02-13 | **상태**: Phase 4 진행 중

---

## 기술 스택

- **Frontend**: HTML5, CSS3 (Custom Properties + Flexbox + Grid), Vanilla JavaScript (ES6+)
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

## CSS 구조 (`css/style.css`)

### 디자인 토큰 (CSS 변수)

`:root` 블록에서 CSS 커스텀 프로퍼티로 디자인 토큰을 관리. 색상, 간격, 폰트, 테두리, 그림자 값을 변수화하여 일관성 유지 및 유지보수 용이.

| 카테고리 | 주요 변수 | 예시 |
|----------|----------|------|
| 색상 | `--primary-start`, `--primary-end`, `--text-primary` 등 | `#667eea`, `#764ba2` |
| 번호 뱃지 | `--number-1` ~ `--number-6` | 각 번호 위치별 색상 |
| 간격 | `--space-xs` ~ `--space-lg` | `10px` ~ `40px` |
| 폰트 | `--font-family`, `--font-size-*` | `'Segoe UI'`, `2em` ~ `14px` |
| 테두리 | `--radius-full`, `--radius-large`, `--radius-medium` | `50%`, `50px`, `20px` |
| 그림자 | `--shadow-high`, `--shadow-medium`, `--shadow-card` 등 | 고/중 강도 box-shadow |
| 표면(Surfaces) | `--border-color`, `--bg-light`, `--bg-subtle`, `--bg-muted` | `#e0e0e0`, `#f9f9f9` |
| 상태(Status) | `--color-error`, `--color-success`, `--error-bg` | `#e84118`, `#44bd32` |
| 비활성(Disabled) | `--disabled-bg`, `--disabled-text`, `--disabled-hover` | `#cccccc`, `#999999` |

다크 모드 시 `html[data-theme="dark"]`에서 변수를 오버라이드하여 전체 UI 전환. 색상 팔레트는 `docs/design.md` 참조.

### 버튼 클래스 체계

범용 `button` 선택자 대신 용도별 클래스로 스타일 분리. `index.html`에서 추첨 버튼에 `class="btn-primary"` 지정.

| 클래스 | 용도 |
|--------|------|
| `.btn-primary` | 추첨 버튼 (그라데이션 배경, 굵은 글씨) |
| `.btn-secondary` | 이력 토글/삭제 등 보조 버튼 (아웃라인 스타일) |
| `.btn-auth` / `.btn-auth-secondary` | 인증 관련 버튼 |
| `.copy-btn` | 번호 복사 버튼 |
| `.exclude-btn` / `.exclude-reset-btn` | 제외 기능 버튼 |

### 접근성: 포커스 스타일

모든 인터랙티브 버튼에 `:focus-visible` 아웃라인 스타일 적용. 키보드 탐색 시 3px solid 아웃라인으로 포커스 상태 표시 (마우스 클릭 시에는 미표시).

### 파일 구성

```
css/style.css
├── Reset & Base Styles       /* 전역 리셋 */
├── Design Tokens (:root)     /* CSS 변수 정의 */
├── Layout                    /* body, .container */
├── Typography                /* h1, .info */
├── Components                /* 번호 뱃지, 버튼, 카드, 토스트 등 */
├── Animations                /* @keyframes pop, fadeIn, slideUp, fadeOut */
├── Focus Styles              /* :focus-visible (접근성) */
├── Section Styles            /* 인증, 제외, 이력 */
└── Responsive (@media)       /* 480px 이하 — 단일 미디어쿼리 블록 */
```

**미디어쿼리 통합**: 분산되어 있던 복수의 `@media` 블록을 파일 하단 단일 블록으로 통합. 반응형 스타일을 한 곳에서 관리.

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

**`saveExcludedNumbers()`** — 제외 번호를 LocalStorage에 저장. 키: `lotto_excluded`, 값: JSON 배열

**`loadExcludedNumbers()`** → `number[]` — LocalStorage에서 제외 번호 로드. 에러 시 빈 배열 반환

**`clearExcludedNumbers()`** — LocalStorage 제외 번호 삭제

### 복사 / 유틸리티

**`copyToClipboard(numbers, setNumber = null)`** → `Promise<boolean>`
- Clipboard API 사용. 형식: `"3, 12, 19, 27, 38, 42"`

**`generateUUID()`** → `string` — UUID v4 (`Math.random()` 기반)

### 테마 함수 (다크 모드)

**`applyTheme(theme)`**
- `data-theme` 속성 설정(`dark`) 또는 제거(`light`) + `updateThemeToggle()` 호출

**`updateThemeToggle(theme)`**
- 토글 버튼 아이콘(🌙/☀️) 및 `aria-label` 업데이트

**`toggleTheme()`**
- 현재 테마 반전 + `applyTheme()` + `saveTheme()`

**`loadTheme()`**
- **반환**: `string` — `'light'` | `'dark'`
- 우선순위: LocalStorage(`lotto_theme`) → `prefers-color-scheme` → `'light'`

**`saveTheme(theme)`**
- LocalStorage에 테마 저장. 키: `lotto_theme`

### 인증 함수 (Phase 4)

**`toggleAuthForm()`** — 로그인 폼 토글
**`handleSignIn()`** (async) — 로그인 + UI 전환
**`handleSignUp()`** (async) — 회원가입
**`handleSignOut()`** (async) — 로그아웃 + UI 전환
**`updateAuthUI()`** — 로그인/비로그인 UI 상태 반영
**`initApp()`** — 페이지 로드 시 이벤트 바인딩 + 세션 확인 + UI 초기화

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

### LocalStorage — 제외 번호 (`lotto_excluded`)

```json
[1, 7, 13, 28, 42]
```

| 필드 | 타입 | 설명 |
|------|------|------|
| (루트) | number[] | 제외된 번호 배열 (1~45 중 선택) |

### LocalStorage — 테마 (`lotto_theme`)

```
"dark"
```

| 값 | 설명 |
|------|------|
| `"light"` | 라이트 모드 |
| `"dark"` | 다크 모드 |

저장되지 않은 경우 시스템 `prefers-color-scheme` 설정을 따르며, 그것도 없으면 `light` 기본값.

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

**필수 API**: ES6 (Arrow, Template Literals, Destructuring, Array.from), LocalStorage, Clipboard, Fetch, CSS Custom Properties, Flexbox, Grid, CSS Animations, `:focus-visible`

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
