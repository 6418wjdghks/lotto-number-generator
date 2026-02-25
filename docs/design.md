# 로또번호 추첨기 - 디자인 명세서

**버전**: 4.4.0 | **최종 수정**: 2026-02-13

> CSS 구현 상세는 `css/style.css` 참조. 본 문서는 디자인 시스템과 컴포넌트 명세만 기술.
> `:root` 디자인 토큰이 CSS에 적용되어 있으며, 모든 주요 값은 변수로 관리됨.

> **섹션 인덱스** — `Read(offset, limit)` 참고
> 디자인원칙 L14 | 색상 L25 (브랜드 L27 | 뱃지 L38 | 다크 L51) | 타이포 L80 | 레이아웃 L94
> 컴포넌트 L147 | 인터랙션 L198 | 애니메이션 L222 | 간격 L244 | 그림자 L255 | 접근성 L264 | 디자인토큰 L273 | 반응형 L334

---

## 디자인 원칙

1. **단순함**: 직관적 인터페이스
2. **즐거움**: 시각적으로 매력적인 경험
3. **명확함**: 추첨 결과를 한눈에 파악
4. **접근성**: 누구나 쉽게 사용

**컨셉**: 행운과 기회를 상징하는 밝고 경쾌한 모던 미니멀 디자인

---

## 색상 시스템

### 브랜드 색상

| 변수명 | 값 | 용도 |
|--------|-----|------|
| `--primary-start` | `#667eea` | 그라데이션 시작 |
| `--primary-end` | `#764ba2` | 그라데이션 끝 |
| `--white` | `#ffffff` | 카드 배경 |
| `--text-primary` | `#333333` | 제목 |
| `--text-secondary` | `#666666` | 본문 |
| `--text-tertiary` | `#999999` | 안내 텍스트 |

### 숫자 뱃지 색상 (위치별)

| 순서 | 변수명 | 값 | 색상 |
|------|--------|-----|------|
| 1 | `--number-1` | `#fbc531` | Yellow |
| 2 | `--number-2` | `#00a8ff` | Blue |
| 3 | `--number-3` | `#e84118` | Red |
| 4 | `--number-4` | `#273c75` | Navy |
| 5 | `--number-5` | `#44bd32` | Green |
| 6 | `--number-6` | `#8c7ae6` | Purple |

모든 색상은 흰색 텍스트와 WCAG AA 기준 대비 충족 (최소 4.5:1).

### 다크 모드 색상

`html[data-theme="dark"]`에서 CSS 변수를 오버라이드하여 전체 앱에 적용.

| 변수 | Light | Dark |
|------|-------|------|
| `--white` (카드 배경) | `#ffffff` | `#1e1e2e` |
| `--text-primary` | `#333333` | `#e0e0e0` |
| `--text-secondary` | `#666666` | `#b0b0b0` |
| `--text-tertiary` | `#999999` | `#808080` |
| `--bg-light` | `#f9f9f9` | `#252535` |
| `--bg-subtle` | `#f0f0ff` | `#2a2a3e` |
| `--bg-muted` | `#f0f0f0` | `#2e2e3e` |
| `--border-color` | `#e0e0e0` | `#3a3a4a` |
| `--error-bg` | `#fff3f3` | `#3a1a1a` |
| `--disabled-bg` | `#cccccc` | `#444455` |
| `--disabled-text` | `#999999` | `#777788` |
| `--disabled-hover` | `#bbbbbb` | `#555566` |
| `--focus-shadow` | `rgba(102,126,234, 0.1)` | `rgba(102,126,234, 0.2)` |
| `--shadow-primary-glow` | `rgba(102,126,234, 0.3)` | `rgba(102,126,234, 0.4)` |
| `--shadow-card` | `rgba(0,0,0, 0.1)` | `rgba(0,0,0, 0.3)` |
| `--shadow-card-hover` | `rgba(102,126,234, 0.2)` | `rgba(102,126,234, 0.3)` |
| `--shadow-toast` | `rgba(0,0,0, 0.3)` | `rgba(0,0,0, 0.5)` |
| `--shadow-high` | `0 20px 60px rgba(0,0,0,0.3)` | `0 20px 60px rgba(0,0,0,0.5)` |
| `--shadow-medium` | `0 10px 20px rgba(0,0,0,0.2)` | `0 10px 20px rgba(0,0,0,0.4)` |
| body 배경 | 보라 그라데이션 | `#2a2d4a → #1a1a2e` |

---

## 타이포그래피

**폰트**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` (시스템 폰트)

| 요소 | 변수명 | 크기 | 굵기 |
|------|--------|------|------|
| 제목 (h1) | `--font-size-title` | 2em | Bold (브라우저 기본) |
| 숫자 뱃지 | `--font-size-number` | 24px | Bold |
| 버튼 | `--font-size-button` | 18px | Bold |
| 본문 | `--font-size-body` | 16px | Normal |
| 안내 | `--font-size-small` | 14px | Normal |

---

## 레이아웃

### 전체 구조

```
┌─────────────────────────────────────────┐
│          [BACKGROUND GRADIENT]          │
│   ┌─────────────────────────────────┐   │
│   │         CARD CONTAINER          │   │
│   │    🎰 로또번호 추첨기          │   │
│   │    [인증 섹션]                  │   │
│   │    세트 수: [▼]                 │   │
│   │    [번호 제외 설정 ▼]           │   │
│   │    [추첨하기]                   │   │
│   │    (안내 텍스트)                │   │
│   │    ⭕ ⭕ ⭕ ⭕ ⭕ ⭕           │   │
│   │    [이력 보기 ▼] [전체 삭제]    │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### DOM 순서 (정확한 배치)

```
main.container
├── .header (h1 + .theme-toggle)
├── .auth-section
│   ├── #authGuest (토글 버튼 + 폼)
│   └── #authUser (이메일 + 로그아웃)
├── .set-selector (label + select)      ← 추첨 버튼과 분리
├── .exclude-section (토글 버튼 + 패널)
├── .btn-primary#btnGenerate            ← 단독 배치
├── p.info                              ← 안내 텍스트
├── .sets-container#setsContainer       ← 결과 영역
└── .history-section
    ├── .history-controls (이력 보기 + 전체 삭제)
    └── .history-list#historyList
```

**주의**: 추첨 버튼은 `.set-selector` 내부가 **아닌** 독립 요소로 배치됨

### 여러 세트 레이아웃

```
┌───────────────┐  ┌───────────────┐
│  1회차        │  │  2회차        │
│  ○ ○ ○ ○ ○ ○ │  │  ○ ○ ○ ○ ○ ○ │
│  [📋 복사]    │  │  [📋 복사]    │
└───────────────┘  └───────────────┘
```

---

## 컴포넌트 명세

> 정확한 CSS 값은 `css/style.css` 참조. 아래는 재현에 필요한 핵심 시각 속성.

| 컴포넌트 | 크기/배치 | 테두리 | 모서리 | 그림자 | 배경 | 글자 |
|----------|----------|--------|--------|--------|------|------|
| `body` | flex center, pad 20 | — | — | — | primary gradient | — |
| `.container` | max-w 500, pad 40 (mobile: 30×20) | — | 20px | `--shadow-high` | white | — |
| `.number` | 60×60, flex center | — | 50% | — | 위치별 색상 | 24px bold `var(--white)` |
| `.set-selector` | flex, gap 10, center, align center, mb 20 | — | — | — | — | 16px bold |
| `.set-selector select` | pad 8×12 | 2px solid #667eea | 8px | — | white | 16px text-primary |
| `.sets-container` | grid auto-fit 280px, gap 20 | — | — | — | — | — |
| `.set-card` | pad 20 | 2px #e0e0e0 | 15px | 0 4 12 0.1 | white | — |
| `.set-label` | mb 15, text-align center | — | — | — | — | 14px bold #667eea |
| `.set-numbers .number` | 50×50 | — | 50% | — | 위치별 색상 | 20px bold `var(--white)` |
| `.copy-btn` | w 100%, pad 6×12 | 1px #667eea | 15px | — | #f0f0f0 | 12px #667eea |
| `.toast` | fixed bottom 30, center | — | 8px | 0 4 12 0.3 | #333333 | 14px white |
| `.toast.success` | — | — | — | — | #44bd32 | — |
| `.toast.error` | — | — | — | — | #e84118 | — |
| `.history-section` | mt 30, pt 20 | top 1px #e0e0e0 | — | — | — | — |
| `.history-list` | max-h 300, scroll, pad 15 | — | 10px | — | #f9f9f9 | — |
| `.history-item` | pad 12×15 | left 4px #667eea | 8px | — | white | 14px |
| `.history-time` | — | — | — | — | — | 12px #999 |
| `.history-numbers` | — | — | — | — | — | 15px bold #333 |
| `.history-empty` | pad 30 | — | — | — | — | 14px #999, center |
| `.btn-secondary` | pad 10×20 | 2px #667eea | 25px | — | white | 14px #667eea |
| `.hidden` | display none | — | — | — | — | — |
| `.exclude-section` | m 20×0 | — | — | — | — | — |
| `.exclude-panel` | pad 15 | — | 10px | — | #f9f9f9 | — |
| `.exclude-info` | flex between, align center, mb 15 | — | — | — | — | 13px #666 |
| `.exclude-grid` | grid 9col, gap 6 | — | — | — | — | — |
| `.exclude-btn` | aspect 1:1 | 2px #667eea | 50% | — | white | 14px bold |
| `.exclude-btn.excluded` | — | 2px #999 | 50% | — | #ccc | line-through, opacity 0.6 |
| `.exclude-reset-btn` | pad 4×12 | 1px #e84118 | 15px | — | white | 12px bold #e84118 |
| `.exclude-warning` | pad 8 | 1px #e84118 | 8px | — | #fff3f3 | 13px bold #e84118 |
| `.auth-section` | mb 20 | — | — | — | — | — |
| `.auth-form` | mt 10 | — | — | — | — | — |
| `.auth-input` | w 100%, pad 10×15 | 2px #e0e0e0 | 10px | — | white | 14px |
| `.auth-buttons` | flex, gap 8 | — | — | — | — | — |
| `.btn-auth` | flex 1, pad 10×20 | none | 25px | — | primary gradient | 14px white |
| `.btn-auth-secondary` | flex 1, pad 10×20 | 2px #667eea | 25px | — | white | 14px #667eea |
| `.auth-user-info` | pad 10×15, flex between | — | 10px | — | #f0f0ff | 14px |
| `.set-numbers` | flex center, gap 8, wrap | — | — | — | — | — |
| `.history-controls` | flex, space-between, gap 10, mb 15 | — | — | — | — | — |
| `.history-item:last-child` | mb 0 | — | — | — | — | — |
| `.auth-user-info span` | — | — | — | — | — | bold, primary-start, overflow ellipsis |
| `.header` | relative, flex center | — | — | — | — | — |
| `.theme-toggle` | abs right, 40×40 | 2px border-color | 50% | — | none | 20px |

---

## 인터랙션 명세

| 대상 | 이벤트 | 효과 | 전환 |
|------|--------|------|------|
| `.btn-primary` (추첨) | hover | translateY(-2px), shadow-medium | 0.2s |
| `.btn-primary` (추첨) | active | translateY(0) | 즉시 |
| `.set-card` | hover | border #667eea, shadow 증가 | 0.2s |
| `.copy-btn` | hover | bg #667eea, color white | 0.2s |
| `.copy-btn` | active | scale(0.95) | 즉시 |
| `.btn-secondary` | hover | bg #667eea, color white, translateY(-1px) | 0.2s |
| `.set-selector select` | hover | border primary-end | 0.2s |
| `.set-selector select` | focus | border primary, shadow 3px focus-shadow, outline none | 즉시 |
| `.btn-secondary` | active | translateY(0) | 즉시 |
| `.exclude-btn` | hover | bg #f0f0ff, scale(1.1) | 0.15s |
| `.exclude-btn.excluded` | hover | bg disabled-hover, opacity 0.8 | 0.15s |
| `.exclude-reset-btn` | hover | bg #e84118, color white | 0.2s |
| `.btn-auth` | hover | translateY(-1px), shadow primary-glow | 0.2s |
| `.btn-auth-secondary` | hover | bg #667eea, color white, translateY(-1px) | 0.2s |
| `.auth-input` | focus | border #667eea, shadow 3px rgba | 즉시 |
| 모든 버튼 | focus-visible | outline 3px solid primary, offset 2px | 즉시 |
| `.exclude-reset-btn` | focus-visible | outline 3px solid #e84118, offset 2px | 즉시 |
| `.theme-toggle` | hover | scale(1.1), border primary | 0.2s |
| `.theme-toggle` | focus-visible | outline 3px solid primary, offset 2px | 즉시 |

---

## 애니메이션 명세

| 이름 | 대상 | 설명 | 지속 | 이징 |
|------|------|------|------|------|
| `pop` | `.number` | scale 0→1.2→1 | 0.5s | ease |
| `fadeIn` | `.set-card` | opacity 0→1, translateY 10→0 | 0.3s | ease |
| `slideUp` | `.toast` (등장) | opacity 0→1, translate(-50%, 20px→0) | 0.3s | ease |
| `fadeOut` | `.toast` (제거) | opacity 1→0, translate(-50%, 0→10px) | 0.3s | ease |

### 키프레임 상세

| 이름 | 키프레임 | 비고 |
|------|---------|------|
| `pop` | 0%: `scale(0)` → 50%: `scale(1.2)` → 100%: `scale(1)` | opacity 변경 없음 |
| `fadeIn` | from: `opacity: 0; transform: translateY(10px)` → to: `opacity: 1; transform: translateY(0)` | Y축 이동 포함 |
| `slideUp` | from: `opacity: 0; translate(-50%, 20px)` → to: `opacity: 1; translate(-50%, 0)` | 토스트 `left: 50%` 중앙정렬 유지 |
| `fadeOut` | from: `opacity: 1` → to: `opacity: 0; translate(-50%, 10px)` | 토스트 중앙정렬 유지 |

숫자 뱃지 딜레이: `(setIndex * 0.1) + (numIndex * 0.05)s` (JS에서 동적 설정)

---

## 간격 시스템

| 변수명 | 값 | 용도 |
|--------|-----|------|
| `--space-xs` | 10px | 숫자 간격, 요소 내부 |
| `--space-sm` | 20px | 요소 간 작은 간격 |
| `--space-md` | 30px | 섹션 간 중간 간격 |
| `--space-lg` | 40px | 카드 내부 패딩 |

---

## 그림자 시스템

| 변수명 | CSS | 용도 |
|--------|-----|------|
| `--shadow-high` | `0 20px 60px rgba(0,0,0,0.3)` | 카드 컨테이너 |
| `--shadow-medium` | `0 10px 20px rgba(0,0,0,0.2)` | 버튼 hover |

---

## 접근성

- **색상 대비**: WCAG AA 이상 (text/bg 최소 4.5:1)
- **키보드**: Tab 포커스, Enter/Space 활성화, `:focus-visible` 아웃라인 표시
- **터치**: 최소 44×44px 터치 영역
- **스크린 리더**: 명확한 버튼 레이블

---

## 디자인 토큰

```css
:root {
  /* Colors */
  --primary-start: #667eea;
  --primary-end: #764ba2;
  --white: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  /* Number Badge */
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
  /* Surfaces */
  --border-color: #e0e0e0;
  --bg-light: #f9f9f9;
  --bg-subtle: #f0f0ff;
  --bg-muted: #f0f0f0;
  /* Status */
  --color-error: #e84118;
  --color-success: #44bd32;
  --error-bg: #fff3f3;
  /* Disabled */
  --disabled-bg: #cccccc;
  --disabled-text: #999999;
  --disabled-hover: #bbbbbb;
  /* Dynamic Shadows */
  --focus-shadow: rgba(102, 126, 234, 0.1);
  --shadow-primary-glow: rgba(102, 126, 234, 0.3);
  --shadow-card: rgba(0, 0, 0, 0.1);
  --shadow-card-hover: rgba(102, 126, 234, 0.2);
  --shadow-toast: rgba(0, 0, 0, 0.3);
}
```

---

## 반응형

| 디바이스 | 범위 | 주요 변경 |
|----------|------|----------|
| 모바일 | < 480px | 아래 상세 테이블 참조 |
| 태블릿 | 480-768px | 기본 유지 |
| 데스크톱 | > 768px | 기본 (최적화됨) |

### 모바일 (< 480px) 변경 항목

| 컴포넌트 | 변경 사항 |
|----------|----------|
| `.container` | `padding: 30px 20px` |
| `h1` | `font-size: 1.5em` |
| `.theme-toggle` | `34×34px`, `font-size: 16px` |
| `.number` | `50×50px`, `font-size: 20px` |
| `.btn-primary` | `padding: 12px 30px`, `font-size: 16px` |
| `.set-selector` | `flex-direction: column`, `align-items: flex-start` |
| `.sets-container` | `grid-template-columns: 1fr` (1열) |
| `.set-numbers .number` | `45×45px`, `font-size: 18px` |
| `.copy-btn` | `font-size: 11px`, `padding: 5px 10px` |
| `.toast` | `bottom: 20px`, `max-width: 90%`, `font-size: 13px` |
| `.exclude-grid` | `5열`, `gap: 5px` |
| `.exclude-btn` | `font-size: 12px` |
| `.exclude-info` | `font-size: 12px`, `flex-wrap: wrap`, `gap: 5px` |
| `.auth-buttons` | `flex-direction: column` |
| `.auth-user-info` | `flex-direction: column`, `text-align: center` |
| `.history-controls` | `flex-direction: column` |
| `.history-item` | `padding: 10px 12px` |
| `.history-numbers` | `font-size: var(--font-size-small)` |

---

**CSS 구현**: `css/style.css` | **관련 문서**: [spec.md](./spec.md), [tech.md](./tech.md)
