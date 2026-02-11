# 로또번호 추첨기 - 프로젝트 가이드

## 프로젝트 개요

웹 기반 로또번호 추첨 애플리케이션 (1~45 중 6개 무작위 추첨).

- **GitHub**: https://github.com/6418wjdghks/lotto-number-generator
- **기술 스택**: HTML5, CSS3, Vanilla JavaScript (프레임워크 금지)
- **현재 상태**: Phase 4 코드 완료, Supabase 설정 대기 → `docs/plan.md` 참조
- **파일 구조**: `docs/tech.md` 참조

---

## JavaScript API 요약 (`js/app.js`)

상세 명세: `docs/tech.md` 참조

| 함수 | 설명 |
|------|------|
| `generateLottoNumbers()` | 메인 진입점. 세트 수 조회 → 생성 → 표시 → 이력 저장 |
| `generateSingleSet()` | Fisher-Yates 셔플로 6개 숫자 생성, 오름차순 정렬 |
| `generateMultipleSets(count)` | count개 세트 생성 (1~5) |
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
| `copyToClipboard(numbers, setNumber)` | Clipboard API 복사, 토스트 피드백 |
| `getExcludedNumbers()` | 제외된 번호 배열 반환 |
| `toggleExcludeView()` | 제외 패널 표시/숨김 토글, 그리드 생성 |
| `updateExcludeCount()` | 제외/남은 카운터 업데이트, 경고 표시 |
| `resetExcludedNumbers()` | 모든 제외 해제, 카운터 리셋 |
| `showToast(message, type, duration)` | 토스트 메시지 생성/자동 제거 |
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
**2단계 구현**: 기능 구현 → 테스트 (`node --test test/test-logic.js`, `test/test.html`)
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

### Git 정책

- 결과 요약 후 "커밋 및 푸시할까요?" 확인 → 사용자 승인 후에만 실행
- 형식: `feat|fix|refactor|docs|test|style: 설명` + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

---

## 코딩 규칙

- **JavaScript**: Vanilla JS, ES6+, `function` 키워드, 2 spaces, 작은따옴표/백틱, 세미콜론 사용
- **HTML**: 2 spaces, ID는 camelCase, 클래스는 kebab-case
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
