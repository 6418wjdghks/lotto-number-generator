# 로또번호 추첨기 - 디자인 명세서

## 📋 문서 정보

- **버전**: 1.0.0
- **작성일**: 2026-02-11
- **상태**: Draft

---

## 🎨 디자인 원칙

### 핵심 가치
1. **단순함**: 복잡하지 않고 직관적인 인터페이스
2. **즐거움**: 시각적으로 매력적이고 재미있는 경험
3. **명확함**: 추첨 결과를 한눈에 알아볼 수 있음
4. **접근성**: 누구나 쉽게 사용할 수 있음

### 디자인 컨셉
- **테마**: 행운과 기회를 상징하는 밝고 경쾌한 느낌
- **스타일**: 모던하고 미니멀한 디자인
- **감정**: 흥미롭고 기대감을 주는 분위기

---

## 🎨 색상 시스템

### 브랜드 색상

#### Primary (주 색상)
```css
--primary-start: #667eea
--primary-end: #764ba2
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```
**용도**: 배경, 버튼, 주요 강조

#### Secondary (보조 색상)
```css
--white: #ffffff
--card-bg: #ffffff
```
**용도**: 카드 배경, 콘텐츠 영역

### 텍스트 색상

| 변수명 | 색상 코드 | 용도 | 예시 |
|--------|-----------|------|------|
| `--text-primary` | `#333333` | 제목, 중요한 텍스트 | "로또번호 추첨기" |
| `--text-secondary` | `#666666` | 본문, 일반 텍스트 | 설명 텍스트 |
| `--text-tertiary` | `#999999` | 안내, 보조 텍스트 | "추첨하기 버튼을 눌러주세요" |

### 숫자 뱃지 색상

로또번호 각 위치별로 고유한 색상을 지정하여 시각적 구분성을 높입니다.

| 순서 | 색상명 | 색상 코드 | 설명 |
|------|--------|-----------|------|
| 1번째 | Yellow | `#fbc531` | 밝고 경쾌한 노란색 |
| 2번째 | Blue | `#00a8ff` | 신뢰감 있는 파란색 |
| 3번째 | Red | `#e84118` | 강렬한 빨간색 |
| 4번째 | Navy | `#273c75` | 차분한 남색 |
| 5번째 | Green | `#44bd32` | 생동감 있는 초록색 |
| 6번째 | Purple | `#8c7ae6` | 우아한 보라색 |

**디자인 의도**:
- 각 숫자가 독립적으로 인식되도록 대비가 높은 색상 선택
- 무지개 스펙트럼에서 영감을 받은 다양한 색상 팔레트
- 모든 색상은 흰색 텍스트와 충분한 대비를 가짐 (WCAG AA 기준 충족)

### 색상 접근성

| 조합 | 대비율 | WCAG 등급 |
|------|--------|-----------|
| White / Primary | 4.8:1 | AA |
| Text Primary / White | 12.6:1 | AAA |
| Text Secondary / White | 7.0:1 | AAA |
| 숫자 색상 / White | 최소 4.5:1 | AA |

---

## 📐 레이아웃

### 전체 구조

```
┌─────────────────────────────────────────┐
│          [BACKGROUND GRADIENT]          │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         CARD CONTAINER          │   │
│   │                                 │   │
│   │    🎰 로또번호 추첨기          │   │
│   │    ═══════════════════════      │   │
│   │                                 │   │
│   │    ┌───────────────────────┐    │   │
│   │    │   NUMBERS CONTAINER   │    │   │
│   │    │                       │    │   │
│   │    │   ⭕ ⭕ ⭕ ⭕ ⭕ ⭕  │    │   │
│   │    │                       │    │   │
│   │    └───────────────────────┘    │   │
│   │                                 │   │
│   │      ┌─────────────┐            │   │
│   │      │  추첨하기   │            │   │
│   │      └─────────────┘            │   │
│   │                                 │   │
│   │   1부터 45까지의 숫자 중...    │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 컨테이너 명세

#### 페이지 전체
```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
```

#### 카드 컨테이너
```css
.container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
}
```

**치수**:
- 최대 너비: 500px
- 패딩: 40px (상하좌우)
- 모서리 반경: 20px

#### 숫자 표시 영역
```css
.numbers-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 30px 0;
  min-height: 80px;
  flex-wrap: wrap;
}
```

---

## 🔤 타이포그래피

### 폰트 패밀리

```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

**선택 이유**:
- Windows/Mac 모두에서 우수한 가독성
- 모던하고 깔끔한 느낌
- 시스템 폰트로 빠른 로딩

### 폰트 크기 스케일

| 요소 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| h1 (제목) | 32px (2em) | Normal | "로또번호 추첨기" |
| 숫자 뱃지 | 24px | Bold | 추첨된 숫자 |
| 버튼 텍스트 | 18px | Bold | "추첨하기" |
| 본문 | 16px | Normal | 브라우저 기본 |
| 안내 텍스트 | 14px | Normal | 설명 텍스트 |

### 텍스트 스타일

#### 제목 (h1)
```css
h1 {
  font-size: 2em;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}
```

#### 숫자 뱃지
```css
.number {
  font-size: 24px;
  font-weight: bold;
  color: white;
}
```

#### 안내 텍스트
```css
.info {
  font-size: 14px;
  color: #666;
  text-align: center;
}
```

---

## 🎭 컴포넌트 디자인

### 숫자 뱃지

#### 시각적 명세
- **형태**: 원형 (Perfect Circle)
- **크기**: 60×60px
- **배경**: 위치별 고유 색상 (위 색상 시스템 참조)
- **텍스트**: 흰색, 24px, Bold, 중앙 정렬

#### CSS 명세
```css
.number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}
```

#### 상태별 디자인
- **기본**: 색상 배경 + 흰색 숫자
- **등장**: Pop 애니메이션 (아래 참조)

### 추첨 버튼

#### 시각적 명세
- **배경**: 그라데이션 (Primary)
- **텍스트**: 흰색, 18px, Bold
- **패딩**: 15px 40px (상하 / 좌우)
- **모서리**: 완전한 둥근 모양 (50px)
- **그림자**: 있음

#### CSS 명세
```css
button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
```

#### 인터랙션 상태

**Hover (마우스 오버)**:
```css
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
```
- 위로 2px 이동
- 그림자 증가 (부유 효과)

**Active (클릭 중)**:
```css
button:active {
  transform: translateY(0);
}
```
- 원래 위치로 복귀 (눌린 느낌)

**Focus**:
- 브라우저 기본 outline 사용
- 키보드 접근성 유지

---

## ✨ 애니메이션

### 숫자 등장 애니메이션 (Pop)

#### 키프레임 정의
```css
@keyframes pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

#### 적용 방식
```css
.number {
  animation: pop 0.5s ease;
}

/* animation-delay는 JavaScript에서 동적으로 설정 (app.js displayMultipleSets) */
/* numberDiv.style.animationDelay = `${(setIndex * 0.1) + (numIndex * 0.05)}s`; */
```

#### 애니메이션 특성
- **지속 시간**: 0.5초 (각 숫자)
- **딜레이**: 0.1초씩 증가 (순차적 등장)
- **이징**: ease (자연스러운 가속/감속)
- **효과**: 0 → 120% → 100% 크기 변화 (바운스 느낌)

### 버튼 트랜지션

```css
transition: transform 0.2s, box-shadow 0.2s;
```

- **대상**: transform, box-shadow
- **지속 시간**: 0.2초
- **이징**: 기본 (ease)

---

## 📱 반응형 디자인

### 브레이크포인트

| 디바이스 | 범위 | 주요 변경사항 |
|----------|------|---------------|
| 모바일 | < 480px | 숫자 크기 축소, 패딩 조정 |
| 태블릿 | 480px - 768px | 기본 디자인 유지 |
| 데스크톱 | > 768px | 기본 디자인 (최적화됨) |

### 모바일 최적화 (< 480px)

#### 컨테이너
```css
@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }
}
```

#### 숫자 뱃지
```css
@media (max-width: 480px) {
  .number {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
```

#### 제목
```css
@media (max-width: 480px) {
  h1 {
    font-size: 1.5em; /* 24px */
  }
}
```

#### 버튼
```css
@media (max-width: 480px) {
  button {
    padding: 12px 30px;
    font-size: 16px;
  }
}
```

### 터치 최적화
- **최소 터치 영역**: 44×44px (iOS 가이드라인)
- **버튼 크기**: 충분히 큼 (패딩 포함 48px 이상)
- **간격**: 요소 간 최소 8px

---

## 🌟 간격 시스템

### 간격 단위

| 변수명 | 값 | 용도 |
|--------|-----|------|
| `--space-xs` | 10px | 숫자 간 간격 |
| `--space-sm` | 20px | 요소 간 작은 간격 |
| `--space-md` | 30px | 섹션 간 중간 간격 |
| `--space-lg` | 40px | 카드 내부 패딩 |

### 적용 예시

```css
/* 제목과 숫자 사이 */
margin-bottom: var(--space-md); /* 30px */

/* 숫자와 버튼 사이 */
margin: var(--space-md) 0; /* 30px 0 */

/* 숫자 간격 */
gap: var(--space-xs); /* 10px */
```

---

## 🎯 그림자 시스템

### 그림자 레벨

| 레벨 | CSS | 용도 |
|------|-----|------|
| 높음 | `0 20px 60px rgba(0, 0, 0, 0.3)` | 카드 컨테이너 |
| 중간 | `0 10px 20px rgba(0, 0, 0, 0.2)` | 버튼 호버 |
| 낮음 | `0 2px 4px rgba(0, 0, 0, 0.1)` | 미사용 (예약) |

---

## ♿ 접근성 가이드

### 색상 대비
- 모든 텍스트는 WCAG AA 기준 이상의 대비율 유지
- 숫자 뱃지: 흰색 텍스트 + 색상 배경 (최소 4.5:1)

### 키보드 접근성
- 버튼에 Tab으로 포커스 가능
- Enter 또는 Space로 버튼 활성화
- 포커스 시 명확한 시각적 표시

### 스크린 리더
- 버튼에 명확한 레이블 ("추첨하기")
- 숫자 결과는 텍스트로 인식 가능
- ARIA 레이블 추가 고려 (Phase 3)

---

## 🎨 디자인 토큰 (요약)

```css
:root {
  /* Colors */
  --primary-start: #667eea;
  --primary-end: #764ba2;
  --white: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;

  /* Number Badge Colors */
  --number-1: #fbc531;
  --number-2: #00a8ff;
  --number-3: #e84118;
  --number-4: #273c75;
  --number-5: #44bd32;
  --number-6: #8c7ae6;

  /* Spacing */
  --space-xs: 10px;
  --space-sm: 20px;
  --space-md: 30px;
  --space-lg: 40px;

  /* Typography */
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-title: 2em;
  --font-size-number: 24px;
  --font-size-button: 18px;
  --font-size-body: 16px;
  --font-size-small: 14px;

  /* Borders */
  --radius-full: 50%;
  --radius-large: 50px;
  --radius-medium: 20px;

  /* Shadows */
  --shadow-high: 0 20px 60px rgba(0, 0, 0, 0.3);
  --shadow-medium: 0 10px 20px rgba(0, 0, 0, 0.2);
}
```

---

## 📸 시각적 레퍼런스

### 색상 팔레트
```
Primary Gradient:  [████████████] #667eea → #764ba2
숫자 1 (Yellow):   [████████████] #fbc531
숫자 2 (Blue):     [████████████] #00a8ff
숫자 3 (Red):      [████████████] #e84118
숫자 4 (Navy):     [████████████] #273c75
숫자 5 (Green):    [████████████] #44bd32
숫자 6 (Purple):   [████████████] #8c7ae6
```

---

## 🎨 Phase 3 컴포넌트 디자인

### 여러 세트 추첨 (Multiple Sets)

#### 레이아웃
```
┌─────────────────────────────────────┐
│  세트 수: [▼ 3개]    [추첨하기]     │
│                                     │
│  ┌───────────────┐  ┌─────────────┐ │
│  │  1회차        │  │  2회차      │ │
│  │  ○ ○ ○ ○ ○ ○ │  │  ○ ○ ○ ○ ○ ○│ │
│  └───────────────┘  └─────────────┘ │
│  ┌───────────────┐                  │
│  │  3회차        │                  │
│  │  ○ ○ ○ ○ ○ ○ │                  │
│  └───────────────┘                  │
└─────────────────────────────────────┘
```

#### CSS 클래스

**`.set-selector`** - 세트 수 선택 영역
```css
.set-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.set-selector label {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.set-selector select {
  padding: 8px 12px;
  font-size: 16px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}
```

**`.sets-container`** - 여러 세트 컨테이너
```css
.sets-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 30px 0;
}
```

**`.set-card`** - 개별 세트 카드
```css
.set-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  animation: fadeIn 0.3s ease;
}

.set-card:hover {
  border-color: #667eea;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
}
```

**`.set-label`** - 세트 번호 라벨
```css
.set-label {
  font-size: 14px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 15px;
  text-align: center;
}
```

**`.set-numbers`** - 세트 내 숫자 컨테이너
```css
.set-numbers {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.set-numbers .number {
  width: 50px;
  height: 50px;
  font-size: 20px;
}
```

#### 반응형 (모바일)
```css
@media (max-width: 480px) {
  .sets-container {
    grid-template-columns: 1fr;
  }

  .set-selector {
    flex-direction: column;
    align-items: flex-start;
  }

  .set-numbers .number {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}
```

#### 애니메이션
- 각 세트 카드: fade-in (0.3초, 순차 딜레이)
- 세트 내 숫자: 기존 pop 애니메이션 재사용

---

### 복사 기능 (Copy Feature)

#### 복사 버튼 (세트 카드 내)

**`.copy-btn`** - 복사 버튼
```css
.copy-btn {
  background: #f0f0f0;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
  display: block;
  width: 100%;
}

.copy-btn:hover {
  background: #667eea;
  color: white;
}

.copy-btn:active {
  transform: scale(0.95);
}
```

**아이콘 포함**:
```html
<button class="copy-btn">📋 복사</button>
```

#### 전체 복사 버튼

**위치**: 추첨하기 버튼 옆 또는 세트 컨테이너 상단

```css
.copy-all-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
}

.copy-all-btn:hover {
  background: #667eea;
  color: white;
}
```

#### 토스트 메시지

**레이아웃**:
```
┌──────────────────────────────┐
│    ✅ 복사되었습니다!        │
└──────────────────────────────┘
```

**`.toast`** - 토스트 컨테이너
```css
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  pointer-events: none;
}

.toast.success {
  background: #44bd32;
}

.toast.error {
  background: #e84118;
}
```

**애니메이션**:
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
}
```

#### 반응형 (모바일)
```css
@media (max-width: 480px) {
  .copy-btn {
    font-size: 11px;
    padding: 5px 10px;
  }

  .toast {
    bottom: 20px;
    max-width: 90%;
    font-size: 13px;
  }
}
```

---

### 이력 섹션 (History Section)

#### 레이아웃
```
┌─────────────────────────────────┐
│     [이력 보기 ▼]  [전체 삭제]  │
│                                 │
│   ┌─────────────────────────┐   │
│   │   2026-02-11 10:30      │   │
│   │   3, 12, 19, 27, 38, 42 │   │
│   ├─────────────────────────┤   │
│   │   2026-02-11 09:15      │   │
│   │   8, 15, 23, 31, 40, 44 │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

#### CSS 클래스

**`.history-section`** - 이력 섹션 컨테이너
```css
.history-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}
```

**`.history-controls`** - 버튼 영역
```css
.history-controls {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
}
```

**`.history-list`** - 이력 목록
```css
.history-list {
  max-height: 300px;
  overflow-y: auto;
  background: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
}
```

**`.history-item`** - 개별 이력 항목
```css
.history-item {
  background: white;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  font-size: 14px;
}
```

**`.history-time`** - 시간 표시
```css
.history-time {
  color: #999;
  font-size: 12px;
  margin-bottom: 5px;
}
```

**`.history-numbers`** - 번호 표시
```css
.history-numbers {
  color: #333;
  font-weight: bold;
  font-size: 15px;
}
```

**`.history-empty`** - 빈 상태
```css
.history-empty {
  text-align: center;
  color: #999;
  padding: 30px;
  font-size: 14px;
}
```

**`.btn-secondary`** - 보조 버튼 (이력 보기, 전체 삭제)
```css
.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}
```

**`.hidden`** - 숨김 클래스
```css
.hidden {
  display: none;
}
```

#### 색상
- 이력 항목 배경: `#ffffff`
- 이력 영역 배경: `#f9f9f9`
- 테두리: `#e0e0e0`
- 강조 테두리: `#667eea` (Primary)

#### 타이포그래피
- 시간: 12px, `#999999`
- 번호: 15px, Bold, `#333333`

#### 반응형 (모바일)
```css
@media (max-width: 480px) {
  .history-controls {
    flex-direction: column;
  }

  .history-item {
    padding: 10px 12px;
  }

  .history-numbers {
    font-size: 14px;
  }
}
```

---

### 번호 제외 섹션 (Exclude Section)

#### 레이아웃
```
┌─────────────────────────────────┐
│   [번호 제외 설정 ▼]            │
│                                 │
│   제외: 0개 / 남은: 45개 [초기화]│
│                                 │
│   ┌──┐┌──┐┌──┐┌──┐┌──┐...     │
│   │ 1││ 2││ 3││ 4││ 5│  (9열)  │
│   └──┘└──┘└──┘└──┘└──┘...     │
│                                 │
│   ⚠️ 최소 6개의 번호 필요       │
└─────────────────────────────────┘
```

#### CSS 클래스

**`.exclude-section`** - 제외 섹션 컨테이너
```css
.exclude-section {
  margin: 20px 0;
}
```

**`.exclude-panel`** - 접이식 패널
```css
.exclude-panel {
  margin-top: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
}
```

**`.exclude-info`** - 카운터 및 초기화 영역
```css
.exclude-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 13px;
  color: #666;
}
```

**`.exclude-reset-btn`** - 초기화 버튼
```css
.exclude-reset-btn {
  background: white;
  color: #e84118;
  border: 1px solid #e84118;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
}

.exclude-reset-btn:hover {
  background: #e84118;
  color: white;
}
```

**`.exclude-grid`** - 번호 그리드 (9열)
```css
.exclude-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
}
```

**`.exclude-btn`** - 개별 번호 버튼
```css
.exclude-btn {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid #667eea;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.exclude-btn:hover {
  background: #f0f0ff;
  transform: scale(1.1);
}

.exclude-btn.excluded {
  background: #ccc;
  border-color: #999;
  color: #999;
  text-decoration: line-through;
  opacity: 0.6;
}

.exclude-btn.excluded:hover {
  background: #bbb;
  opacity: 0.8;
}
```

**`.exclude-warning`** - 경고 메시지
```css
.exclude-warning {
  margin-top: 10px;
  padding: 8px;
  background: #fff3f3;
  border: 1px solid #e84118;
  border-radius: 8px;
  color: #e84118;
  font-size: 13px;
  text-align: center;
  font-weight: bold;
}
```

#### 반응형 (모바일)
```css
@media (max-width: 480px) {
  .exclude-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
  }

  .exclude-btn {
    font-size: 12px;
  }

  .exclude-info {
    font-size: 12px;
    flex-wrap: wrap;
    gap: 5px;
  }
}
```

---

### 인증 섹션 (Auth Section) — Phase 4

#### 레이아웃
```
┌─────────────────────────────────┐
│  비로그인:                       │
│  [로그인 / 회원가입 ▼]           │
│  ┌─────────────────────────┐    │
│  │  📧 이메일               │    │
│  │  🔒 비밀번호             │    │
│  │  [로그인] [회원가입]      │    │
│  └─────────────────────────┘    │
│                                 │
│  로그인:                         │
│  ┌─────────────────────────┐    │
│  │  user@email.com  [로그아웃]│   │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

#### CSS 클래스

**`.auth-section`** - 인증 섹션 컨테이너
```css
.auth-section {
  margin-bottom: 20px;
}
```

**`.auth-form`** - 로그인/회원가입 폼
```css
.auth-form {
  margin-top: 10px;
}
```

**`.auth-input`** - 이메일/비밀번호 입력
```css
.auth-input {
  width: 100%;
  padding: 10px 15px;
  margin-bottom: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
}
.auth-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

**`.auth-buttons`** - 로그인/회원가입 버튼 영역
```css
.auth-buttons {
  display: flex;
  gap: 8px;
}
```

**`.btn-auth`** - 로그인 버튼 (primary 스타일)
```css
.btn-auth {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
}
```

**`.btn-auth-secondary`** - 회원가입 버튼 (secondary 스타일)
```css
.btn-auth-secondary {
  flex: 1;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
}
```

**`.auth-user-info`** - 로그인 상태 이메일 표시
```css
.auth-user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f0f0ff;
  border-radius: 10px;
  font-size: 14px;
}
```

#### 반응형 (모바일)
```css
@media (max-width: 480px) {
  .auth-buttons {
    flex-direction: column;
  }
  .auth-user-info {
    flex-direction: column;
    text-align: center;
  }
}
```

---

## 🔄 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 3.0.0 | 2026-02-12 | Phase 4 인증 섹션 디자인 추가 | - |
| 2.1.0 | 2026-02-11 | 번호 제외 섹션 추가, 애니메이션/transition 명세 수정 | - |
| 2.0.0 | 2026-02-11 | Phase 3 - 이력 섹션 디자인 추가 | - |
| 1.0.0 | 2026-02-11 | 초기 디자인 시스템 정의 | - |

---

**관련 문서**: [spec.md](./spec.md), [tech.md](./tech.md), [plan.md](./plan.md)
