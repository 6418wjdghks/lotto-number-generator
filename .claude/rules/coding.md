---
paths:
  - "js/**"
  - "css/**"
  - "index.html"
  - "scripts/**"
---

## 코딩 규칙

- **JS**: Vanilla ES6+, `function` 키워드, 2 spaces, 작은따옴표/백틱, 세미콜론, `const`/`let` (var 금지)
  - 화살표함수=콜백에만, 템플릿 리터럴, 구조분해 할당, 기본 매개변수
- **HTML**: 2 spaces, ID=camelCase, class=kebab-case, 버튼ID=`btn` 접두어, 동적버튼 `type="button"`
  - 토글 버튼 텍스트: `<span id="xxxText">` 분리
- **CSS**: 2 spaces, 선택자 순서 요소→클래스→ID, 섹션별 주석
- **보안**: `textContent` (innerHTML 금지), JSON.parse try-catch
- **제약**: 프레임워크 금지 (Supabase=REST API), 모바일 480px 반응형, 단순성 우선
