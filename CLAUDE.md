# 로또번호 추첨기 - 프로젝트 가이드

## 📌 프로젝트 개요

웹 기반 로또번호 추첨 애플리케이션입니다. 1부터 45까지의 숫자 중 6개를 무작위로 추첨하는 기능을 제공합니다.

- **GitHub**: https://github.com/6418wjdghks/lotto-number-generator
- **기술 스택**: HTML5, CSS3, Vanilla JavaScript
- **배포**: GitHub Pages (예정)

---

## 🎯 현재 프로젝트 상태

### ✅ 완료된 Phase

#### Phase 1: 개발 환경 설정 (100%)
- Git 설정 및 GitHub 연동 완료
- GitHub CLI 설치 및 인증
- 프로젝트 문서화 완료 (plan, spec, design, tech)
- 코드 파일 분리 (HTML/CSS/JS)
- Git 검증 스킬 개발 (`.claude/plugins/local/git-helper`)

#### Phase 2: 핵심 기능 구현 (100%)
- 로또번호 추첨 기능 구현 (Fisher-Yates 알고리즘)
- 반응형 웹 디자인
- 애니메이션 효과
- 자동 테스트 도구 개발 (`test/test.html`)
- 1000회 추첨 테스트 통과

#### Phase 3: 기능 확장 및 개선 (75% - 진행 중)
**완료된 기능** (2026-02-11):
- ✅ Step 1: 추첨 이력 저장 (F-003) - LocalStorage, 최대 20개
- ✅ Step 2: 여러 세트 동시 추첨 (F-004) - 1~5개 세트
- ✅ Step 3: 추첨 결과 복사 (F-006) - Clipboard API

**남은 기능**:
- ⏳ Step 4: 수동 번호 제외 (F-005) - 특정 번호 제외 추첨

**우선순위 중간** (Phase 3 완료 후):
- 다크모드 지원
- 추첨 애니메이션 커스터마이징
- 추첨 사운드 효과

### 🚀 다음 Phase

#### Phase 4: 백엔드 및 데이터베이스 (계획 중)
- 사용자 인증 시스템
- 사용자별 추첨 이력
- 당첨 이력 추적
- 통계 분석
- **상세 계획**: `docs/phase4-plan.md` 참조

---

## 📁 파일 구조

```
HelloClaude/
├── CLAUDE.md              # 프로젝트 가이드 (본 문서)
├── README.md              # 프로젝트 설명
│
├── index.html             # 메인 HTML (45줄)
├── css/
│   └── style.css         # 스타일시트 (433줄)
├── js/
│   └── app.js            # JavaScript 로직 (336줄)
│
├── docs/                  # 프로젝트 문서
│   ├── plan.md           # 프로젝트 계획서
│   ├── spec.md           # 기능 명세서 ⭐ Phase 3 기능 정의
│   ├── design.md         # 디자인 명세서
│   └── tech.md           # 기술 명세서
│
├── test/                  # 테스트 도구
│   ├── test.html         # 자동 테스트 페이지 (v2, 21개 테스트)
│   └── README.md         # 테스트 문서
│
└── .claude/               # Claude Code 설정
    └── plugins/
        └── local/
            └── git-helper/  # Git 검증 스킬
```

---

## 💻 현재 코드베이스

### HTML 구조 (`index.html`)
```html
<div class="container">
  <h1>🎰 로또번호 추첨기</h1>
  <div class="set-selector">
    <select id="setCount"><!-- 1~5개 --></select>
  </div>
  <button onclick="generateLottoNumbers()">추첨하기</button>
  <div class="sets-container" id="setsContainer">
    <!-- 세트 카드가 동적으로 생성됨 -->
  </div>
  <div class="history-section">
    <button onclick="toggleHistoryView()">이력 보기</button>
    <button onclick="clearHistory()">전체 삭제</button>
    <div id="historyList" class="hidden"></div>
  </div>
</div>
```

### JavaScript API (`js/app.js` - 13개 함수)

#### 핵심 로직
- **`generateLottoNumbers()`** - 메인 진입점. 세트 수 조회 → 생성 → 표시 → 이력 저장
- **`generateSingleSet()`** - Fisher-Yates 셔플로 6개 숫자 생성, 오름차순 정렬 반환
- **`generateMultipleSets(count)`** - count개 세트 생성 (1~5)
- **`getSelectedSetCount()`** - `#setCount` 드롭다운 값 반환 (number)

#### 표시
- **`displayMultipleSets(sets)`** - 세트 카드(`.set-card`) DOM 생성, 라벨/뱃지/복사버튼 포함
- **`displayHistory()`** - 이력 목록 DOM 렌더링, 빈 상태 처리

#### 이력 관리
- **`saveToHistory(numbers, setCount=1)`** - LocalStorage 저장 (UUID, timestamp 자동 생성)
- **`loadHistory()`** - LocalStorage 로드 (JSON 파싱 에러 시 빈 배열)
- **`toggleHistoryView()`** - 이력 영역 표시/숨김 토글
- **`clearHistory()`** - 전체 이력 삭제 (confirm 다이얼로그)

#### 유틸리티
- **`generateUUID()`** - UUID v4 생성
- **`copyToClipboard(numbers, setNumber)`** - Clipboard API 복사, 토스트 피드백
- **`showToast(message, type, duration)`** - 토스트 메시지 생성/자동 제거

### CSS 클래스 (`css/style.css`)
- `.container` - 메인 카드
- `.set-selector` - 세트 수 선택 영역
- `.sets-container` - 세트 카드 그리드
- `.set-card` - 개별 세트 카드
- `.set-label` - 세트 번호 라벨 ("1회차")
- `.set-numbers` - 세트 내 숫자 영역
- `.number` - 개별 숫자 뱃지 (6가지 색상)
- `.copy-btn` - 복사 버튼
- `.toast`, `.toast.success`, `.toast.error` - 토스트 메시지
- `.history-section` - 이력 섹션
- `.history-item` - 이력 항목
- `.hidden` - 숨김 처리

---

## 🚀 Phase 3 진행 가이드

### 현재 진행 상황 (2026-02-11)
- ✅ **Step 1 완료**: 추첨 이력 저장 (F-003)
- ✅ **Step 2 완료**: 여러 세트 동시 추첨 (F-004)
- ✅ **Step 3 완료**: 추첨 결과 복사 (F-006)
- ⏳ **Step 4 대기**: 수동 번호 제외 (F-005) ← **다음 작업**

### 새 세션에서 Step 4 시작하기

**명령어**:
```
Step 4 시작해줘
```
또는:
```
Phase 3 마지막 기능인 "수동 번호 제외" 구현해줘
```

### 1. 문서 먼저 읽기
새로운 세션에서 시작할 때:
1. **본 문서 (CLAUDE.md)** - 프로젝트 전체 이해
2. **docs/spec.md** - F-005 기능 명세 확인
3. **docs/plan.md** - Phase 3 작업 항목 확인
4. **Git 로그**: `git log --oneline -10` - 최근 작업 확인

---

## 📋 Phase 3 구현 상세 (참고용)

### ✅ Step 1: 추첨 이력 저장 (F-003) [완료]
**파일**: `js/app.js` (기능 추가)

**구현 내용**:
- LocalStorage에 추첨 이력 저장
- 최대 20개까지 저장
- 추첨 시마다 자동 저장

**데이터 구조**:
```javascript
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

**필드 의미**:
- `version`: "1.0" (데이터 포맷 버전)
- `id`: UUID v4 고유 식별자
- `numbers`: 추첨 번호 배열 (6개, 오름차순)
- `timestamp`: ISO 8601 추첨 시간
- `setCount`: 동시 추첨 세트 수 (기본 1)

**UI 변경**:
- `index.html`에 이력 표시 섹션 추가
- 이력 조회 버튼 추가
- 이력 삭제 버튼 추가

### ✅ Step 2: 여러 세트 동시 추첨 (F-004) [완료]
**커밋**: `2d014ca`

**구현된 내용**:
- ✅ 세트 수 선택 드롭다운 (1~5개)
- ✅ 여러 세트 동시 생성 및 표시
- ✅ 각 세트 카드 형태 표시
- ✅ 그리드 레이아웃 (2열)

### ✅ Step 3: 추첨 결과 복사 (F-006) [완료]
**커밋**: `60d762c`

**구현된 내용**:
- ✅ Clipboard API 사용
- ✅ 각 세트 카드에 복사 버튼
- ✅ 토스트 메시지 (성공/에러)
- ✅ 2초 자동 사라짐

### ⏳ Step 4: 수동 번호 제외 (F-005) [대기 중] ← **다음 작업**
**파일**: `index.html`, `js/app.js`, `css/style.css`

**구현 내용**:
- 번호 선택 UI (체크박스 또는 버튼)
- 제외 번호를 제외한 추첨
- 최소 6개 남도록 검증

### 3. 개발 워크플로우

**작업 프로세스**:
1. 기능 구현
2. 테스트 (test/test.html 업데이트 또는 수동 테스트)
3. 문서 업데이트 (spec.md, plan.md)
4. **작업 결과 요약 및 검토**
5. 사용자 승인 후 커밋 & 푸시

**Git 커밋 정책**:
- ⚠️ **중요**: 작업 완료 후 바로 커밋하지 않음
- 모든 작업을 완료하고 결과를 요약한 후
- "커밋 및 푸시할까요?" 라고 물어보기
- 사용자 승인 후에만 git 명령어 실행

**커밋 메시지 형식**:
```bash
git add .
git commit -m "feat: [기능명]

[상세 설명]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

---

## 📐 코딩 규칙 및 컨벤션

### JavaScript
- **스타일**: Vanilla JavaScript (프레임워크 없음)
- **ES 버전**: ES6+ 사용
- **함수 선언**: function 키워드 사용 (기존 코드와 일관성)
- **들여쓰기**: 2 spaces
- **문자열**: 작은따옴표 (`'`) 또는 백틱 (`` ` ``) 사용
- **세미콜론**: 사용

### HTML
- **들여쓰기**: 2 spaces
- **ID 네이밍**: camelCase (예: `numbersContainer`)
- **클래스 네이밍**: kebab-case (예: `numbers-container`)

### CSS
- **들여쓰기**: 2 spaces
- **선택자 순서**: 요소 → 클래스 → ID
- **주석**: 섹션별로 구분 (`/* Section */`)

### Git 커밋 메시지
```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 업데이트
test: 테스트 추가/수정
style: 코드 포맷팅 (기능 변경 없음)
```

**Co-Authored-By 추가**:
```
feat: 기능명

설명

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## ⚠️ 중요한 제약사항

### 기술적 제약
1. **순수 JavaScript만 사용** - 프레임워크/라이브러리 금지
2. **브라우저 호환성** - Chrome 90+, Firefox 88+, Safari 14+
3. **LocalStorage 제한** - 최대 5MB (이력은 충분히 작음)
4. **모바일 반응형** - 480px 이하에서도 작동

### 설계 원칙
1. **단순성** - 복잡한 구조 피하기
2. **일관성** - 기존 코드 스타일 유지
3. **확장성** - 새 기능 추가가 쉽도록
4. **성능** - 불필요한 DOM 조작 최소화

### 보안
- XSS 방지: `textContent` 사용 (innerHTML 금지)
- LocalStorage 데이터 검증: JSON.parse 시 try-catch
- Clipboard API: HTTPS 또는 localhost 필요

---

## 🧪 테스트 가이드

### 자동 테스트 (v2 - 21개 테스트)
```bash
# test/test.html 실행 (페이지 로드 시 자동 실행)
start test/test.html  # Windows
open test/test.html   # macOS
```

**테스트 그룹**:
- A. 핵심 생성 로직 (Test 1-6) - `generateSingleSet()` 직접 호출
- B. 유틸리티 (Test 7) - UUID 형식/유일성
- C. 이력 관리 (Test 8-12) - 저장/로드/제한/삭제/setCount
- D. 여러 세트 (Test 13-15) - 생성/경계값/DOM 연동
- E. 복사/토스트 (Test 16-17) - Clipboard API, 토스트 동작
- F. DOM 렌더링 (Test 18-20) - 세트 카드, 이력, 토글
- G. 통합 (Test 21) - `generateLottoNumbers()` end-to-end

**커버리지**: app.js 13개 함수 전체 (100%)
**상세**: `test/README.md` 참조

새 기능 추가 시 `test/test.html`에 테스트 추가 권장

### 수동 테스트 체크리스트
- [ ] 기능이 정상 작동하는가?
- [ ] 애니메이션이 부드러운가?
- [ ] 모바일에서 작동하는가?
- [ ] 에러가 발생하지 않는가?
- [ ] 기존 기능이 여전히 작동하는가?

---

## 📚 주요 문서 참조

### 기능 명세
- **docs/spec.md** - 전체 기능 명세 (F-001 ~ F-006)
  - F-003: 추첨 이력 저장
  - F-004: 여러 세트 동시 추첨
  - F-005: 수동 번호 제외
  - F-006: 추첨 결과 복사

### 디자인 가이드
- **docs/design.md** - 색상, 타이포그래피, 레이아웃 규칙
  - 숫자 색상: 6가지 고정 색상
  - 애니메이션: pop (0.5초)
  - 버튼: 그라데이션 + hover 효과

### 기술 상세
- **docs/tech.md** - 기술 스택, 브라우저 지원, 성능 목표

### 프로젝트 계획
- **docs/plan.md** - Phase별 진행 상황, 다음 액션 아이템

---

## 🎯 Phase 3 시작 명령어

### 새로운 세션에서 Phase 3 시작하기
다음 명령어를 사용하세요:

```
Phase 3 시작해줘
```

또는 더 구체적으로:

```
Phase 3의 첫 번째 기능인 "추첨 이력 저장" 기능을 구현해줘
```

---

## 💡 개발 팁

### LocalStorage 디버깅
```javascript
// 콘솔에서 확인
localStorage.getItem('lotto_history');

// 초기화
localStorage.removeItem('lotto_history');
```

### 빠른 테스트
```javascript
// 콘솔에서 여러 번 추첨
for(let i = 0; i < 10; i++) {
  generateLottoNumbers();
}
```

### 반응형 테스트
- Chrome DevTools: F12 → Toggle device toolbar
- 모바일 크기: 375x667 (iPhone SE)
- 태블릿 크기: 768x1024 (iPad)

---

## 🔗 유용한 링크

- GitHub 저장소: https://github.com/6418wjdghks/lotto-number-generator
- MDN Web Docs: https://developer.mozilla.org/
- Fisher-Yates Algorithm: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle

---

## 📝 히스토리

- **2026-02-11**: 프로젝트 시작, Phase 1, 2 완료
- **2026-02-11**: Phase 3 Step 1~3 완료 (F-003, F-004, F-006)
- **2026-02-11**: 테스트 스위트 v2 전면 개선 (14개 → 21개, 100% 커버리지)
- **다음**: Phase 3 Step 4 (F-005 수동 번호 제외)

---

**이 문서를 다 읽었다면, Phase 3를 시작할 준비가 된 것입니다!** 🚀
