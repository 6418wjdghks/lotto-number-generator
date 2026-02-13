# 로또번호 추첨기 - 프로젝트 가이드

## 프로젝트 개요

웹 기반 로또번호 추첨 애플리케이션 (1~45 중 6개 무작위 추첨).

- **GitHub**: https://github.com/6418wjdghks/lotto-number-generator
- **기술 스택**: HTML5, CSS3, Vanilla JavaScript (프레임워크 금지)
- **현재 상태**: Phase 4 코드 완료, Supabase 설정 대기 → `docs/plan.md` 참조
- **파일 구조**: `docs/tech.md` 참조

---

## JavaScript API 요약 (7개 모듈)

상세 명세: `docs/tech.md` 참조. 모듈 분할: ADR-021

| 함수 | 설명 |
|------|------|
| `generateLottoNumbers()` | 메인 진입점. 제외 번호 확인 → 부족 시 중단 → 세트 수 조회 → 생성 → 표시 → 이력 저장 |
| `generateSingleSet(excludedNumbers)` | Fisher-Yates 셔플로 6개 숫자 생성, 오름차순 정렬 |
| `generateMultipleSets(count, excludedNumbers)` | count개 세트 생성 (1~5) |
| `getSelectedSetCount()` | `#setCount` 드롭다운 값 반환 |
| `displayMultipleSets(sets)` | 세트 카드 DOM 생성 (라벨/뱃지/복사버튼) |
| `displayHistory()` | (async) 이력 목록 DOM 렌더링, 빈 상태 처리 |
| `saveToHistory(numbers, setCount=1)` | (async) 듀얼 모드 이력 저장 (로그인: Supabase, 비로그인: Local) |
| `loadHistory()` | (async) 듀얼 모드 이력 로드 |
| `saveToHistoryLocal(numbers, setCount=1)` | LocalStorage 저장 (UUID, timestamp 자동) |
| `loadHistoryLocal()` | LocalStorage 로드 (에러 시 빈 배열) |
| `clearHistoryLocal()` | LocalStorage 이력 삭제 |
| `toggleHistoryView()` | 이력 영역 표시/숨김 토글 |
| `clearHistory()` | (async) 듀얼 모드 전체 이력 삭제 (confirm 다이얼로그) |
| `generateUUID()` | UUID v4 생성 |
| `copyToClipboard(numbers, setNumber=null)` | (async) Clipboard API 복사, 토스트 피드백 |
| `getExcludedNumbers()` | 제외된 번호 배열 반환 |
| `toggleExcludeView()` | 제외 패널 표시/숨김 토글, 그리드 생성 |
| `updateExcludeCount()` | 제외/남은 카운터 업데이트, 경고 표시 |
| `resetExcludedNumbers()` | 모든 제외 해제, 카운터 리셋 |
| `saveExcludedNumbers()` | 제외 번호를 LocalStorage에 저장 |
| `loadExcludedNumbers()` | LocalStorage에서 제외 번호 로드, 에러 시 빈 배열 |
| `clearExcludedNumbers()` | LocalStorage 제외 번호 삭제 |
| `showToast(message, type, duration)` | 토스트 메시지 생성/자동 제거 |
| `applyTheme(theme)` | `data-theme` 속성 설정/제거 + 버튼 업데이트 |
| `updateThemeToggle(theme)` | 아이콘/aria-label 전환 (🌙↔☀️) |
| `toggleTheme()` | 현재 테마 반전 + 저장 |
| `loadTheme()` | LocalStorage → 시스템설정 → light 순 로드 |
| `saveTheme(theme)` | LocalStorage에 테마 저장 |
| `toggleAuthForm()` | 로그인 폼 표시/숨김 토글 |
| `handleSignIn()` | (async) 로그인 처리 + UI 전환 |
| `handleSignUp()` | (async) 회원가입 처리 |
| `handleSignOut()` | (async) 로그아웃 + UI 전환 |
| `updateAuthUI()` | 로그인/비로그인 UI 상태 반영 |
| `initApp()` | 페이지 로드 시 세션 확인 및 UI 초기화 |

Supabase REST API (`js/supabase-config.js`): `docs/tech.md` 참조

---

## 개발 워크플로우

**1단계 준비**: CLAUDE.md 확인 → 관련 문서 읽기 → `git log --oneline -5`
**2단계 구현**: 기능 구현 → 테스트 (`npm test` 또는 개별: `npm run test:logic`, `npm run test:dom`)
**3단계 마무리**: 명세-구현 검증 → 문서 업데이트 → 결과 요약 → 사용자 승인 후 커밋

### 문서 업데이트 매트릭스

| 변경 유형 | 업데이트할 문서 |
|-----------|---------------|
| 기능 추가/변경 | spec.md, plan.md, CLAUDE.md (API 테이블), tech.md (API 상세) |
| UI/디자인 변경 | design.md |
| 설계 결정 (대안 비교) | decisions.md (새 ADR) |
| 테스트 추가 | test/README.md |
| Phase/Step 완료 | plan.md |

### 파생 수치 단일 소스 규칙

| 수치 | 단일 소스 |
|------|----------|
| 함수 목록/수 | CLAUDE.md API 테이블 |
| 테스트 수/항목 | test/README.md |

### 검증 체계 (서브 에이전트 위임)

검증 시 메인 컨텍스트에서 파일을 직접 읽지 말 것. `Task(subagent_type="general-purpose")` 병렬 위임으로 토큰 효율화 (메인 컨텍스트 96% 절감).

**공통 규칙**:
- 각 에이전트는 불일치 목록만 반환, 메인은 취합 후 보고/수정
- Grep 기반 타겟 읽기: 파일 전체 Read 대신 `Grep`으로 필요 데이터만 추출
- **임시 파일 RAII**: 중간 파일 생성 허용하되, 에이전트 종료 전 반드시 삭제 (생성한 파일 목록 추적 → 최종 단계에서 정리)
- **재위임 금지**: 에이전트 내부에서 Task 도구로 서브에이전트를 재생성하지 말 것. 직접 Read/Grep으로 검증 수행
- `npm test`는 검증 체계가 아닌 개발 워크플로우(2단계)의 일부 — `code`/`test` 변경 시 항상 실행

#### 파일 타입 분류

| Label | 타입 | 포함 파일 |
|-------|------|----------|
| `style` | 스타일 | `style.css` |
| `code` | 코드 | `utils.js`, `theme.js`, `exclude.js`, `lottery.js`, `history.js`, `auth.js`, `app.js`, `supabase-config.js`, `index.html` |
| `test` | 테스트 | `test-logic.js`, `test-dom.js`, `test.html` |
| `doc:api` | 문서(API) | `tech.md`, `CLAUDE.md`, `README.md` |
| `doc:design` | 문서(디자인) | `design.md` |
| `doc:spec` | 문서(명세) | `spec.md` |
| `doc:test` | 문서(테스트) | `test/README.md` |
| `doc:track` | 문서(추적) | `plan.md`, `decisions.md`, `phase4-architecture.md` |
| `config` | 설정 | `package.json` |

#### 2계층 검증

| 계층 | 방식 | 빈도 |
|------|------|------|
| **Tier 1** | 블랙박스 (핵심 수치 스팟체크) | 코드/스타일/테스트 변경 시 |
| **Tier 2** | 화이트박스 (소스 ↔ 명세 전수 비교) | 문서 변경 시 / 릴리스 전 |

#### Label → 검증 매핑

| 변경 Label | Tier 1 | Tier 2 | 예상 토큰 |
|------------|--------|--------|----------|
| `style` | B | — | ~15K |
| `code` | A, C | — | ~40K |
| `test` | D | — | ~15K |
| `doc:api` | — | A | ~196K |
| `doc:design` | — | B | ~34K |
| `doc:spec` | — | C | ~43K |
| `doc:test` | — | D | ~77K |
| `doc:track` | — | — | 0K |
| `config` | — | — | 0K |
| 릴리스 전 | — | A+B+C+D | ~350K |

**복합 변경 규칙**:
1. 변경된 파일들의 Label을 수집
2. 각 Label의 검증 카테고리를 합집합(Union)
3. 같은 카테고리에 Tier 1 + Tier 2 → **Tier 2만 실행** (Tier 2 ⊃ Tier 1)

#### 모델 선택 가이드

| 모델 | 토큰 (A-Tier2 기준) | 정확도 | 권장 용도 |
|------|---------------------|--------|----------|
| **Opus** | ~263K (기준) | 최고 (오탐 0) | 릴리스 전 최종 검증 |
| **Sonnet** | ~225K (-14%) | 양호 | 일상 검증 (권장) |
| **Haiku** | ~198K (-25%) | 기초 | Tier 1 전용 |

**모델 지정**: `Task(model="sonnet")` — 미지정 시 메인 모델 상속

#### 에이전트 분할/병합 기준

| 원칙 | 기준 | 근거 |
|------|------|------|
| 최소 작업량 | 유효 토큰 ≥ 25K (총 ≥ 35K) | 고정 오버헤드(~10K) 비율 30% 이하 유지 |
| 소스 겹침 | 주요 소스 파일 겹침 ≤ 1개 | 같은 파일 반복 읽기 = 토큰 낭비 |
| 병렬 이점 | 에이전트당 예상 실행시간 ≥ 30초 | 너무 짧으면 병렬화 이점 없음 |

#### A. 문서 검증 (문서 ↔ 소스코드)

**Tier 1** (1 에이전트, ~20K): 핵심 수치 스팟체크 — 함수 수 34, 테스트 수 73, 파일 목록 일치
- 함수 카운트 규칙: `function` + `async function` 모두 포함 (Grep 패턴: `^(async )?function`, 대상: `js/` 디렉토리)
- 기대값: 34개 (function 26 + async function 8), 7개 모듈에 분산

**Tier 2** (5 에이전트, ~196K):

| 에이전트 | 문서 | 비교 소스 |
|----------|------|----------|
| Agent 1 | tech.md | js/*.js, style.css, index.html |
| Agent 2 | spec.md | index.html, js/*.js |
| Agent 3 | CLAUDE.md + README.md | Grep(`js/`), Glob, package.json, test/README.md |
| Agent 4 | design.md | style.css, index.html |
| Agent 5 | test/README.md | test-logic.js, test-dom.js, js/app.js, package.json |

> `js/*.js` = utils, theme, exclude, lottery, history, auth, app (7개 모듈)
> Agent 5: test-logic.js는 `require('../js/app.js')` 경유로 전 모듈 접근 → app.js만 참조 충분

#### B. 디자인 검증 (design.md ↔ CSS)

**Tier 1** (1 에이전트, ~15K): CSS 변수 개수 + 주요 색상값 샘플 체크
- 카운트 규칙: **고유 변수명 기준** (`:root`와 `[data-theme="dark"]`에 중복 정의 시 1개로 계산)
- design.md: 다크모드 비교 테이블 포함 모든 `--` 변수 행 카운트
- 기대값: 고유 42개

**Tier 2** (1 에이전트, ~34K): design.md ↔ style.css 전수 비교 (변수값 + 컴포넌트 + 반응형 + 애니메이션)

#### C. 구현 검증 (spec.md ↔ 실제 동작)

**Tier 1** (1 에이전트, ~20K): 핵심 함수 존재 확인 (Grep `js/`) + ARIA 속성 존재 확인 (index.html)

**Tier 2** (1 에이전트, ~43K): F-001~F-008 동작/UI/DOM + ARIA/접근성 전수 비교 (spec.md ↔ index.html + js/*.js)

> Supabase API 흐름 검증은 별도 검토 시 추가 예정

#### D. 테스트 검증 (test/README.md ↔ 실제 테스트)

**Tier 1** (1 에이전트, ~15K): `npm test` 실행 → 23 CLI pass + 50 DOM pass, 0 fail 확인

**Tier 2** (2 에이전트, ~77K):

| 에이전트 | 검증 항목 | 비교 소스 |
|----------|----------|----------|
| Agent 1 | CLI 테스트 항목/수 + 함수 커버리지 | test-logic.js, js/app.js, Grep(`js/`) |
| Agent 2 | DOM/UI 테스트 항목/수 | test.html, test-dom.js |

> D-Agent 1: app.js의 module.exports로 export된 함수 목록 + Grep(`js/`)로 전체 함수 목록 비교하여 커버리지 판단

### Git 정책

- 결과 요약 후 "커밋 및 푸시할까요?" 확인 → 사용자 승인 후에만 실행
- 형식: `feat|fix|refactor|docs|test|style: 설명` + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

---

## 코딩 규칙

- **JavaScript**: Vanilla JS, ES6+, `function` 키워드 (톱레벨 함수 선언), 2 spaces, 작은따옴표/백틱, 세미콜론 사용
  - `const`/`let` 사용 (`var` 금지)
  - 화살표 함수: 콜백, `forEach`, `map`, `filter` 등에 사용
  - 템플릿 리터럴: 문자열 연결(`+`) 대신 백틱(`` ` ``) 사용
  - 구조분해 할당: `[array[i], array[j]] = [array[j], array[i]]`
  - ES6 메서드: `Array.from`, `includes`, `padStart`, `String.prototype.trim` 등
  - 기본 매개변수: `function fn(excludedNumbers = [])`
- **HTML**: 2 spaces, ID는 camelCase, 클래스는 kebab-case
  - 토글 버튼: 텍스트를 `<span id="xxxText">` 로 분리 (JS에서 `span.textContent` 변경)
  - 동적 생성 버튼: `type="button"` 명시
  - 버튼 ID: `btn` 접두어 (`btnGenerate`, `btnToggleHistory`, `btnThemeToggle` 등)
- **CSS**: 2 spaces, 선택자 순서 요소→클래스→ID, 섹션별 주석
- **보안**: `textContent` 사용 (innerHTML 금지), JSON.parse 시 try-catch

---

## 중요 제약사항

1. **순수 JavaScript만 사용** - 프레임워크/라이브러리 금지 (Supabase는 REST API로 연동)
2. **모바일 반응형** - 480px 이하에서도 작동
3. **단순성 우선** - 복잡한 구조 피하기, 기존 코드 스타일 유지

---

## 문서 참조 가이드

| 찾고 싶은 정보 | 참조 문서 |
|---------------|----------|
| 기능 명세 (제품 관점) | `docs/spec.md` |
| JavaScript API 상세, 데이터 구조, 기술 스택 | `docs/tech.md` |
| Phase 진행 상황, 액션 아이템 | `docs/plan.md` |
| 색상, 타이포그래피, 컴포넌트 명세, 레이아웃 | `docs/design.md` |
| 테스트 항목, 커버리지, 실행 방법 | `test/README.md` |
| 설계 결정 사유 (왜 이렇게 했는지) | `docs/decisions.md` |
| Phase 4 기술 설계 (아키텍처, DB, API) | `docs/phase4-architecture.md` |
