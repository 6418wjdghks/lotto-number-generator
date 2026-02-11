# 로또번호 추첨기 - 기술 명세서

## 📋 문서 정보

- **버전**: 1.1.0
- **작성일**: 2026-02-11
- **최종 수정**: 2026-02-11
- **상태**: Draft

---

## 🛠️ 기술 스택

### 프론트엔드

#### HTML
- **버전**: HTML5
- **문서 타입**: `<!DOCTYPE html>`
- **언어**: 한국어 (`lang="ko"`)
- **인코딩**: UTF-8
- **뷰포트**: `width=device-width, initial-scale=1.0`

#### CSS
- **버전**: CSS3
- **접근 방식**: 외부 스타일시트 (`css/style.css`)
- **레이아웃 기술**:
  - Flexbox (메인 레이아웃)
  - Grid (Phase 3 - 여러 세트 표시)
- **애니메이션**: CSS Keyframes, Transitions
- **전처리기**: 없음 (순수 CSS)

#### JavaScript
- **버전**: ES6+ (ES2015 이상)
- **스타일**: Vanilla JavaScript (프레임워크 없음)
- **모듈 시스템**: 외부 스크립트 파일 (`js/app.js`)
- **빌드 도구**: 없음

### 개발 도구

| 도구 | 용도 |
|------|------|
| Git | 버전 관리 |
| VS Code | 코드 편집 (권장) |
| Chrome DevTools | 디버깅 |
| Lighthouse | 성능 측정 |

### 배포
- **호스팅**: GitHub Pages (예정)
- **CI/CD**: 없음 (정적 파일)
- **도메인**: `[username].github.io/[repo-name]`

---

## 📊 아키텍처

### 파일 구조

```
HelloClaude/
├── index.html              # 메인 HTML 파일 (21줄)
│
├── css/                    # 스타일시트
│   └── style.css          # 모든 CSS 스타일 (131줄)
│
├── js/                     # JavaScript
│   └── app.js             # 로또 로직 및 UI (42줄)
│
├── docs/                   # 프로젝트 문서
│   ├── plan.md            # 프로젝트 계획서
│   ├── spec.md            # 기능 명세서
│   ├── design.md          # 디자인 명세서
│   └── tech.md            # 기술 명세서 (본 문서)
│
├── .claude/               # Claude Code 설정
│   └── plugins/
│       └── local/
│           └── git-helper/
│
├── README.md              # 프로젝트 설명
├── .gitignore            # Git 제외 파일
└── start-claude.bat      # 개발 환경 실행
```

### 아키텍처 패턴
- **패턴**: 관심사 분리 (Separation of Concerns)
- **구조**: HTML, CSS, JavaScript 파일 분리
- **이유**:
  - 코드 가독성 및 유지보수성 향상
  - 각 파일이 단일 책임을 가짐
  - 협업 시 충돌 최소화
  - 재사용 가능성 증가

---

## 🔧 핵심 알고리즘

### Fisher-Yates Shuffle

#### 설명
배열을 무작위로 섞는 알고리즘으로, 완전한 균등 분포를 보장합니다.

#### 구현
```javascript
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

#### 복잡도
- **시간 복잡도**: O(n)
- **공간 복잡도**: O(1) (in-place)

#### 동작 원리
1. 배열의 마지막 요소부터 시작
2. 현재 인덱스(i) 이하의 랜덤 인덱스(j) 선택
3. 두 요소의 위치를 교환
4. 인덱스를 감소시키며 반복

#### 장점
- 균등한 확률 분포 보장 (모든 순열이 동일한 확률)
- 효율적인 성능 (선형 시간)
- 간단한 구현
- 추가 메모리 불필요

---

## 💻 JavaScript API 명세

### 전역 함수

#### `generateLottoNumbers()`

**설명**: 로또번호 6개를 생성하고 화면에 표시하는 메인 함수

**매개변수**: 없음

**반환값**: `void`

**동작 흐름**:
```javascript
function generateLottoNumbers() {
  // 1. 1-45 배열 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  // 2. Fisher-Yates 셔플
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // 3. 앞의 6개 선택 및 정렬
  const lottoNumbers = numbers.slice(0, 6).sort((a, b) => a - b);

  // 4. 화면에 표시
  displayNumbers(lottoNumbers);
}
```

**예외**: 없음

**성능**: O(n) where n = 45

---

#### `displayNumbers(numbers)`

**설명**: 생성된 번호를 DOM에 렌더링

**매개변수**:
- `numbers` (Array<number>): 표시할 숫자 배열 (길이: 6)

**반환값**: `void`

**동작 흐름**:
```javascript
function displayNumbers(numbers) {
  // 1. 컨테이너 참조
  const container = document.getElementById('numbersContainer');

  // 2. 기존 내용 제거
  container.innerHTML = '';

  // 3. 각 숫자에 대해 DOM 요소 생성
  numbers.forEach((num, index) => {
    const numberDiv = document.createElement('div');
    numberDiv.className = 'number';
    numberDiv.textContent = num;
    numberDiv.style.animationDelay = `${index * 0.1}s`;
    container.appendChild(numberDiv);
  });
}
```

**DOM 조작**:
- `innerHTML` 사용 (초기화)
- `createElement`, `appendChild` 사용 (추가)

**성능**: O(n) where n = 6

---

### DOM 구조

#### HTML 요소 ID

| ID | 요소 | 용도 |
|----|------|------|
| `numbersContainer` | `<div>` | 숫자 표시 영역 |

#### CSS 클래스

| 클래스명 | 요소 | 용도 |
|----------|------|------|
| `.container` | `<div>` | 메인 카드 컨테이너 |
| `.numbers-container` | `<div>` | 숫자 표시 영역 |
| `.number` | `<div>` | 개별 숫자 뱃지 |
| `.info` | `<p>` | 안내 텍스트 |

---

## 🌐 브라우저 호환성

### 지원 브라우저

#### 데스크톱
| 브라우저 | 최소 버전 | 테스트 상태 |
|----------|-----------|-------------|
| Chrome | 90+ | ✅ 지원 |
| Firefox | 88+ | ✅ 지원 |
| Safari | 14+ | ✅ 지원 |
| Edge | 90+ | ✅ 지원 |

#### 모바일
| 브라우저 | 최소 버전 | 테스트 상태 |
|----------|-----------|-------------|
| Chrome Mobile | 90+ | ✅ 지원 |
| Safari iOS | 14+ | ✅ 지원 |
| Samsung Internet | 14+ | ✅ 지원 |

### 필수 브라우저 기능

#### JavaScript
- **ES6 기능**:
  - Arrow Functions
  - Template Literals
  - Destructuring Assignment
  - `Array.from()`
  - `Array.forEach()`
  - `Array.sort()`
  - `Math.floor()`, `Math.random()`

#### CSS
- **레이아웃**:
  - Flexbox
  - Box Model
- **시각 효과**:
  - `linear-gradient()`
  - `border-radius`
  - `box-shadow`
  - CSS Animations (`@keyframes`)
  - CSS Transitions
- **반응형**:
  - Media Queries

#### HTML
- **HTML5 요소**:
  - `<!DOCTYPE html>`
  - Semantic elements (선택)

### 폴리필 불필요
- 사용된 모든 기능은 대상 브라우저에서 네이티브 지원
- 추가 라이브러리나 폴리필 없이 작동

---

## 📦 데이터 구조

### Phase 2 (현재)

#### 숫자 배열
```javascript
// Type: Array<number>
// Range: 1 ≤ n ≤ 45
// Length: 6
// Order: Ascending

const lottoNumbers = [3, 12, 19, 27, 38, 42];
```

### Phase 3 (예정)

#### 추첨 이력 (LocalStorage)
```javascript
// Key: 'lotto_history'
// Value: JSON string

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

#### 필드 설명
| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 식별자 (UUID v4) |
| `numbers` | number[] | 추첨된 숫자 배열 |
| `timestamp` | string | ISO 8601 형식의 추첨 시간 |
| `setCount` | number | 동시 추첨 세트 수 |

---

## 🔒 보안 고려사항

### 클라이언트 사이드 보안

#### XSS 방지
```javascript
// ✅ 안전: textContent 사용
numberDiv.textContent = num;

// ❌ 위험: innerHTML 사용 금지
// numberDiv.innerHTML = num; // 사용하지 않음
```

**이유**: 사용자 입력이 없지만, 모범 사례로 `textContent` 사용

#### 입력 검증
- **Phase 2**: 사용자 입력 없음 → 검증 불필요
- **Phase 3**: LocalStorage 데이터 검증 필요
  ```javascript
  // 예정: JSON 파싱 시 try-catch
  try {
    const data = JSON.parse(localStorage.getItem('lotto_history'));
    // 데이터 검증
  } catch (e) {
    console.error('Invalid data');
  }
  ```

### 랜덤 보안

#### Math.random() 사용
- **목적**: 오락용 (비암호화)
- **보안 수준**: 충분함 (로또 추첨 시뮬레이션)
- **주의**: 실제 도박에는 부적합 (암호학적으로 안전하지 않음)

**참고**: 실제 보안이 필요한 경우 `crypto.getRandomValues()` 사용

---

## ⚡ 성능 명세

### 성능 목표

| 메트릭 | 목표 | 측정 방법 |
|--------|------|-----------|
| First Contentful Paint (FCP) | < 1.0s | Lighthouse |
| Time to Interactive (TTI) | < 1.5s | Lighthouse |
| 추첨 응답 시간 | < 100ms | Performance API |
| 애니메이션 FPS | 60fps | DevTools Performance |
| 페이지 크기 | < 50KB | Network Tab |

### 최적화 전략

#### 코드 최적화
- **관심사 분리**: HTML/CSS/JS 파일 분리로 유지보수성 향상
- **Vanilla JS**: 프레임워크 오버헤드 없음
- **간단한 DOM**: 최소한의 요소

#### CSS 최적화
- **외부 스타일시트**: `css/style.css` 사용 (캐시 가능)
- **하드웨어 가속**: `transform` 사용 (애니메이션)
- **효율적 선택자**: 클래스 기반

#### JavaScript 최적화
- **알고리즘**: O(n) 시간 복잡도
- **DOM 조작**: 배치 업데이트 (innerHTML 초기화 후 appendChild)
- **이벤트 리스너**: 단일 버튼에만 적용

### 성능 측정

#### Chrome DevTools
```javascript
// Performance API 사용
const start = performance.now();
generateLottoNumbers();
const end = performance.now();
console.log(`실행 시간: ${end - start}ms`);
```

**예상 결과**: 5-10ms (일반적인 PC 기준)

---

## 🧪 테스트 전략

### 테스트 레벨

#### 1. 단위 테스트 (수동)
**대상**: 개별 함수
```javascript
// generateLottoNumbers() 테스트
// 1. 콘솔에서 100회 실행
// 2. 결과 확인: 항상 6개, 1-45 범위, 중복 없음
```

#### 2. 통합 테스트 (수동)
**대상**: 전체 워크플로우
- 버튼 클릭 → 숫자 생성 → 화면 표시 → 애니메이션

#### 3. 호환성 테스트
**대상**: 여러 브라우저/디바이스
- Chrome, Firefox, Safari (데스크톱)
- iOS Safari, Chrome Mobile (모바일)

#### 4. 성능 테스트
**대상**: 응답 시간, FPS
- Lighthouse 점수 90+ 목표
- 연속 클릭 시 성능 유지

### 테스트 도구

| 도구 | 용도 |
|------|------|
| Chrome DevTools | 디버깅, 성능 측정 |
| Lighthouse | 성능, 접근성 점수 |
| BrowserStack | 크로스 브라우저 테스트 (선택) |

### 테스트 체크리스트

- [ ] 모든 브라우저에서 정상 작동
- [ ] 모바일에서 터치 인터랙션 정상
- [ ] 100회 추첨 시 랜덤 분포 균등
- [ ] 애니메이션이 60fps 유지
- [ ] 접근성 검사 통과 (Lighthouse)

---

## 🔄 Phase 3 기술 명세 (예정)

### LocalStorage API

#### 저장
```javascript
const history = {
  version: '1.0',
  history: [
    { id: uuid(), numbers: [...], timestamp: new Date().toISOString() }
  ]
};

localStorage.setItem('lotto_history', JSON.stringify(history));
```

#### 조회
```javascript
const data = JSON.parse(localStorage.getItem('lotto_history') || '{"history":[]}');
```

#### 용량
- **최대 크기**: 5MB (브라우저 제한)
- **예상 사용**: < 50KB (20개 이력 기준)

### Clipboard API (복사 기능)

```javascript
async function copyToClipboard(numbers) {
  const text = numbers.join(', ');

  try {
    await navigator.clipboard.writeText(text);
    showToast('복사되었습니다!');
  } catch (err) {
    console.error('복사 실패:', err);
  }
}
```

**요구사항**:
- HTTPS 또는 localhost
- 사용자 제스처 필요 (버튼 클릭)

---

## 🚀 배포 명세

### GitHub Pages 설정

#### 1. 저장소 설정
```bash
# GitHub에 저장소 생성 후
git remote add origin https://github.com/[username]/[repo-name].git
git push -u origin main
```

#### 2. Pages 활성화
- Settings → Pages
- Source: `main` branch
- Folder: `/` (root)

#### 3. 접근 URL
```
https://[username].github.io/[repo-name]/
```

### 배포 체크리스트
- [ ] `index.html`이 루트에 위치
- [ ] 모든 경로가 상대 경로
- [ ] HTTPS 사용 (GitHub Pages 기본)
- [ ] README에 라이브 URL 추가

---

## 📐 코드 품질 기준

### 코드 스타일
- **들여쓰기**: 2 spaces
- **문자열**: 작은따옴표 사용
- **세미콜론**: 사용 (선택적이지만 일관성)
- **네이밍**: camelCase (JavaScript), kebab-case (CSS)

### 주석
```javascript
// 함수 설명 주석
function generateLottoNumbers() {
  // 1. 배열 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  // 2. 셔플
  // ...
}
```

### 린팅
- **도구**: 없음 (선택사항)
- **기준**: 일관성 유지

---

## 🔧 개발 환경 설정

### 필수 요구사항
- 최신 브라우저 (Chrome 권장)
- 텍스트 에디터 (VS Code 권장)
- Git

### 선택 요구사항
- Live Server (VS Code 확장)
- GitHub CLI (`gh`)

### 로컬 실행
```bash
# 방법 1: 파일 직접 열기
# index.html을 더블클릭

# 방법 2: Live Server 사용 (VS Code)
# 1. Live Server 확장 설치
# 2. index.html에서 우클릭 → "Open with Live Server"

# 방법 3: Python 서버
python -m http.server 8000
# http://localhost:8000 접속
```

---

## 📚 의존성

### 외부 라이브러리
**없음** - 순수 HTML/CSS/JavaScript만 사용

### 개발 의존성
**없음** - 빌드 도구 불필요

---

## 🔄 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.1.0 | 2026-02-11 | 파일 구조 분리 (HTML/CSS/JS) 반영 | - |
| 1.0.0 | 2026-02-11 | 초기 기술 명세 작성 | - |

---

**관련 문서**: [spec.md](./spec.md), [design.md](./design.md), [plan.md](./plan.md)
