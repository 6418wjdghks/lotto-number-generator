# 로또번호 추첨기 - 프로젝트 가이드

## 프로젝트 개요

웹 기반 로또번호 추첨 애플리케이션 (1~45 중 6개 무작위 추첨).

- **GitHub**: https://github.com/6418wjdghks/lotto-number-generator
- **기술 스택**: HTML5, CSS3, Vanilla JavaScript (프레임워크 금지)
- **배포**: GitHub Pages (예정)

---

## 현재 상태 & 다음 작업

```
Phase 1: 개발 환경 설정     ████████████████████ 100%
Phase 2: 핵심 기능 구현     ████████████████████ 100%
Phase 3: 기능 확장 및 개선  ███████████████░░░░░  75%
```

**Phase 3 진행 상황**:
- ✅ Step 1: 추첨 이력 저장 (F-003)
- ✅ Step 2: 여러 세트 동시 추첨 (F-004)
- ✅ Step 3: 추첨 결과 복사 (F-006)
- ⏳ **Step 4: 수동 번호 제외 (F-005)** ← 다음 작업

**Step 4 시작 명령어**: `Step 4 시작해줘` 또는 `수동 번호 제외 구현해줘`

**Step 4 시작 시 읽을 문서**:
1. 본 문서 → 2. `docs/spec.md` (F-005 명세) → 3. `git log --oneline -10`

---

## 파일 구조

```
HelloClaude/
├── index.html             # 메인 HTML
├── css/style.css          # 스타일시트
├── js/app.js              # JavaScript 로직 (13개 함수)
├── docs/                  # 프로젝트 문서 (아래 참조 가이드)
│   ├── plan.md            # 진행 상황, 액션 아이템
│   ├── spec.md            # 기능 명세 (F-001~F-006), API, 데이터 구조
│   ├── design.md          # 디자인 시스템, CSS 명세
│   ├── tech.md            # 기술 스택, 아키텍처, 성능
│   ├── decisions.md       # 설계 결정 기록 (ADR)
│   └── phase4-plan.md     # Phase 4 백엔드 확장 계획
├── test/
│   ├── test.html          # 자동 테스트 (21개, 100% 커버리지)
│   └── README.md          # 테스트 상세 문서
└── .claude/plugins/local/git-helper/  # Git 검증 스킬
```

---

## JavaScript API 요약 (`js/app.js`)

상세 명세: `docs/spec.md` 참조

| 함수 | 설명 |
|------|------|
| `generateLottoNumbers()` | 메인 진입점. 세트 수 조회 → 생성 → 표시 → 이력 저장 |
| `generateSingleSet()` | Fisher-Yates 셔플로 6개 숫자 생성, 오름차순 정렬 |
| `generateMultipleSets(count)` | count개 세트 생성 (1~5) |
| `getSelectedSetCount()` | `#setCount` 드롭다운 값 반환 |
| `displayMultipleSets(sets)` | 세트 카드 DOM 생성 (라벨/뱃지/복사버튼) |
| `displayHistory()` | 이력 목록 DOM 렌더링, 빈 상태 처리 |
| `saveToHistory(numbers, setCount=1)` | LocalStorage 저장 (UUID, timestamp 자동) |
| `loadHistory()` | LocalStorage 로드 (에러 시 빈 배열) |
| `toggleHistoryView()` | 이력 영역 표시/숨김 토글 |
| `clearHistory()` | 전체 이력 삭제 (confirm 다이얼로그) |
| `generateUUID()` | UUID v4 생성 |
| `copyToClipboard(numbers, setNumber)` | Clipboard API 복사, 토스트 피드백 |
| `showToast(message, type, duration)` | 토스트 메시지 생성/자동 제거 |

---

## 개발 워크플로우

**작업 프로세스**:
1. 기능 구현
2. 테스트 (`test/test.html` 업데이트 또는 수동 테스트)
3. 문서 업데이트 (spec.md, plan.md)
4. 작업 결과 요약 및 검토
5. 사용자 승인 후 커밋 & 푸시

**Git 커밋 정책**:
- ⚠️ 작업 완료 후 바로 커밋하지 않음
- 결과 요약 후 "커밋 및 푸시할까요?" 라고 물어보기
- 사용자 승인 후에만 git 명령어 실행

**커밋 메시지 형식**:
```
feat|fix|refactor|docs|test|style: 설명

상세 내용

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 코딩 규칙

- **JavaScript**: Vanilla JS, ES6+, `function` 키워드, 2 spaces, 작은따옴표/백틱, 세미콜론 사용
- **HTML**: 2 spaces, ID는 camelCase, 클래스는 kebab-case
- **CSS**: 2 spaces, 선택자 순서 요소→클래스→ID, 섹션별 주석
- **보안**: `textContent` 사용 (innerHTML 금지), JSON.parse 시 try-catch

---

## 중요 제약사항

1. **순수 JavaScript만 사용** - 프레임워크/라이브러리 금지
2. **모바일 반응형** - 480px 이하에서도 작동
3. **단순성 우선** - 복잡한 구조 피하기, 기존 코드 스타일 유지
4. **브라우저/성능 상세**: `docs/tech.md` 참조

---

## 문서 참조 가이드

| 찾고 싶은 정보 | 참조 문서 |
|---------------|----------|
| 기능 명세, API 상세, 데이터 구조 | `docs/spec.md` |
| Phase 진행 상황, 액션 아이템 | `docs/plan.md` |
| 색상, 타이포그래피, CSS 클래스, 레이아웃 | `docs/design.md` |
| 기술 스택, 브라우저 호환성, 성능 목표, 아키텍처 | `docs/tech.md` |
| 테스트 항목, 커버리지, 실행 방법 | `test/README.md` |
| 설계 결정 사유 (왜 이렇게 했는지) | `docs/decisions.md` |
| Phase 4 백엔드 확장 계획 | `docs/phase4-plan.md` |
