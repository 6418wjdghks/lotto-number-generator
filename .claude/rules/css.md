---
paths:
  - "css/**"
---

## CSS 컨벤션

### 미디어쿼리 선언 순서

`@media` 오버라이드는 반드시 **해당 셀렉터의 기본 규칙 블록 직후**에 배치할 것.
다른 섹션의 미디어쿼리에 넣으면 기본 규칙이 뒤에서 덮어씌워 무효화된다.

```css
/* 올바름 — 기본 규칙 뒤 */
.theme-toggle { position: absolute; }
@media (max-width: 480px) { .theme-toggle { position: static; } }

/* 잘못됨 — 기본 규칙보다 앞 (덮어씌워짐) */
@media (max-width: 480px) { .theme-toggle { position: static; } }
.theme-toggle { position: absolute; }
```

**원칙**: 논리적 관련성이 아니라 **소스 순서** 기준으로 배치. 미디어쿼리는 특이성을 높이지 않는다.
