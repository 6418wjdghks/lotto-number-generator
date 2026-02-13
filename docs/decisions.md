# 아키텍처 결정 기록 (Architecture Decision Records)

프로젝트의 주요 설계 결정과 그 사유를 기록합니다.

> 과거 ADR: [decisions_001_010.md](./decisions_001_010.md) (ADR-001~010)

---

## 목차

| # | 결정 | 상태 | 날짜 |
|---|------|------|------|
| [011](#adr-011) | 문서 중복 제거 리팩토링 | 적용 완료 | 2026-02-11 |
| [012](#adr-012) | phase4-plan → phase4-architecture 이름 변경 | 적용 완료 | 2026-02-11 |
| [013](#adr-013) | 번호 제외 UI: 토글 버튼 그리드 | 유지 | 2026-02-11 |
| [014](#adr-014) | 2계층 테스트 아키텍처 (CLI + 브라우저) | 유지 | 2026-02-11 |
| [015](#adr-015) | 파생 수치 단일 소스 규칙 | 유지 | 2026-02-11 |
| [016](#adr-016) | Supabase REST API 직접 호출 (SDK 미사용) | 유지 | 2026-02-12 |
| [017](#adr-017) | 문서 전면 구조 개편 — 토큰 사용량 48% 감소 | 적용 완료 | 2026-02-12 |
| [018](#adr-018) | DOM/UI 테스트 CLI 러너 (puppeteer-core + Edge headless) | 유지 | 2026-02-13 |
| [019](#adr-019) | 다크 모드: `html[data-theme]` + FOUC 방지 인라인 스크립트 | 유지 | 2026-02-13 |

---

## ADR-011: 문서 중복 제거 리팩토링

**날짜**: 2026-02-11
**상태**: 적용 완료

### 맥락
프로젝트 문서 7개 파일에서 14개 중복 항목이 발견되었다. 특히 CLAUDE.md(~380줄)는 매 세션 로드되어 토큰 낭비가 심했다.

### 결정
"단일 진실 소스(Single Source of Truth)" 원칙을 적용. 각 문서에 명확한 역할을 부여하고, 중복 내용은 원본 참조로 대체.

### 결과
전체 문서 1,898줄 → 1,163줄 (39% 감소)

---

## ADR-012: phase4-plan → phase4-architecture 이름 변경

**날짜**: 2026-02-11
**상태**: 적용 완료
**관련 커밋**: `4c1e7b1`

### 맥락
`docs/phase4-plan.md`와 `docs/plan.md`가 이름만 보면 둘 다 "계획" 문서로 보였다. 실제로는 역할이 완전히 달랐다.

### 결정
`phase4-plan.md` → `phase4-architecture.md`로 이름 변경. plan = 진행 관리, architecture = 기술 설계.

---

## ADR-013: 번호 제외 UI: 토글 버튼 그리드

**날짜**: 2026-02-11 (Phase 3, Step 4)
**상태**: 유지
**명세**: `docs/spec.md` F-005

### 맥락
F-005 수동 번호 제외 기능에서 사용자가 제외할 번호를 선택하는 UI 방식을 정해야 했다.

### 결정
1~45 숫자를 9열 그리드의 토글 버튼으로 표시한다. 클릭하면 제외/해제가 토글된다.

### 사유
- **직관성**: 숫자를 보면서 바로 클릭. 입력값 검증이 불필요
- **터치 친화적**: 모바일에서 버튼 탭이 텍스트 입력보다 편리
- **시각적 피드백**: 제외된 번호가 즉시 회색 + 취소선으로 표시
- **기존 UI와 일관성**: 이력 섹션과 동일한 접이식(토글) 패턴 재사용

### 검토한 대안
- **체크박스 목록**: 45개 체크박스를 나열. 공간을 많이 차지하고 시각적 매력이 낮음
- **텍스트 입력**: 콤마로 구분된 숫자 직접 입력. 컴팩트하지만 입력 검증이 복잡하고 오타 위험

---

## ADR-014: 2계층 테스트 아키텍처 (CLI + 브라우저)

**날짜**: 2026-02-11
**상태**: 유지

### 맥락
기존 테스트(`test/test.html`)는 브라우저에서만 실행 가능하여 자동화가 어려웠다.

### 결정
2계층 테스트 구조를 도입한다:
- **계층 1** (`test/test-logic.js`): Node.js `node:test`로 순수 로직 테스트 (CLI 실행)
- **계층 2** (`test/test.html`): 브라우저에서 DOM/UI 테스트 (기존 유지)

### 사유
- **CI 연동**: `node --test test/test-logic.js`로 exit code 0/1 반환
- **외부 의존성 없음**: Node.js 18+ 내장 `node:test` 사용
- **빠른 피드백**: CLI 테스트는 브라우저 없이 즉시 실행 (~1초)
- **관심사 분리**: 순수 로직은 CLI, DOM 의존 기능은 브라우저

### app.js 호환성
```javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ... };
}
```

---

## ADR-015: 파생 수치 단일 소스 규칙

**날짜**: 2026-02-11
**상태**: 유지

### 맥락
문서 점검 결과 17건의 명세-구현 불일치가 발견되었다. 근본 원인 중 하나가 코드에서 파생되는 수치(함수 수, 테스트 수)가 여러 문서에 중복 기록된 것이었다.

### 결정
코드에서 파생되는 수치는 단일 소스에만 기록한다.

| 수치 | 단일 소스 | 다른 문서 |
|------|----------|---------|
| 함수 목록/수 | CLAUDE.md API 테이블 | "CLAUDE.md 참조" |
| 테스트 수/항목 | test/README.md | "test/README.md 참조" |
| 파일 줄 수 | 기록하지 않음 | - |

---

## ADR-016: Supabase REST API 직접 호출 (SDK 미사용)

**날짜**: 2026-02-12 (Phase 4)
**상태**: 유지
**코드**: `js/supabase-config.js`

### 맥락
Phase 4에서 Supabase를 백엔드로 도입할 때, SDK(`@supabase/supabase-js`)를 사용할지, 순수 `fetch()` + REST API로 직접 호출할지 결정해야 했다.

### 결정
순수 `fetch()` + Supabase REST API를 직접 호출한다. API 래퍼를 `js/supabase-config.js`에 IIFE로 구현하고 `window.supabase` 전역 객체로 노출.

### 사유
- **ADR-001 일관성**: "순수 JavaScript만 사용 — 프레임워크/라이브러리 금지" 원칙 유지
- **빌드 불필요**: 브라우저 내장 `fetch()`만 사용
- **학습 가치**: REST API 직접 호출로 HTTP 인증 흐름 이해
- **번들 크기 0**: SDK(~40KB gzip) 불필요

### 제약사항
- **토큰 갱신 미구현**: 세션 만료 시 재로그인 필요. 필요 시 추후 추가
- **세션 보안**: access_token을 LocalStorage에 저장 (Supabase SDK도 동일 방식)

### 재검토 조건
실시간 기능, 파일 스토리지, OAuth 등이 필요해지면 SDK 도입 재검토

---

## ADR-017: 문서 전면 구조 개편 — 토큰 사용량 48% 감소

**날짜**: 2026-02-12
**상태**: 적용 완료

### 맥락
매 세션 CLAUDE.md(211줄)가 자동 로드되고, 작업 시 2~4개 문서를 추가로 읽어야 해서 컨텍스트가 빠르게 차오르는 문제가 있었다. 8개 문서 총 3,919줄.

### 결정
문서 역할을 재정의하고 중복/사문화된 내용을 대폭 제거한다.

### 핵심 변경
1. **spec.md**: JavaScript API/데이터구조 → tech.md 이동. 순수 제품 명세만 유지
2. **tech.md**: spec.md에서 API 흡수, 불필요 섹션(코드 품질, 개발환경, 배포 명령) 제거
3. **design.md**: CSS 코드블록 전량 삭제 → 컴포넌트 명세 테이블로 대체
4. **phase4-architecture.md**: 미채택 아키텍처 옵션(Option 1/2) 삭제
5. **decisions.md**: ADR-001~010 → `decisions_001_010.md` 아카이브
6. **CLAUDE.md**: 파일구조/진행바/Supabase API 제거, 참조 방식 전환

### 사유
- **토큰 절감**: 3,919줄 → ~2,020줄 (48% 감소)
- **역할 명확화**: spec.md = WHAT, tech.md = HOW
- **CSS 중복 제거**: design.md에서 style.css 복사본 ~800줄 삭제
- **사문화 방지**: 미채택 옵션, 완료된 체크리스트 정리

---

## ADR-018: DOM/UI 테스트 CLI 러너 (puppeteer-core + Edge headless)

**날짜**: 2026-02-13
**상태**: 유지
**코드**: `test/test-dom.js`

### 맥락
기존 DOM/UI 테스트(`test/test.html`)는 브라우저에서만 실행 가능하여 CLI에서 결과를 확인할 수 없었다. `npm test` 한 번으로 전체 테스트를 실행할 수 있어야 했다.

### 결정
`puppeteer-core`로 시스템에 설치된 Edge를 headless 모드로 실행하여 `test/test.html`의 테스트 결과를 CLI에 텍스트로 출력한다.

### 사유
- **puppeteer-core** (Chromium 미포함): 번들 크기 ~3MB (puppeteer full ~170MB)
- **Edge 재사용**: Windows 11에 기본 설치된 Edge를 활용. 별도 브라우저 다운로드 불필요
- **test.html 최소 수정**: `console.log` 1줄 + `dataset` 완료 시그널 4줄 + `readText` try-catch 분리. 기존 브라우저 동작 유지
- **HTTP 서버 내장**: `node:http`로 프로젝트 루트를 정적 서빙. file:// 프로토콜 제한 회피
- **CDP 권한 부여**: `Browser.grantPermissions`로 `clipboardReadWrite` 부여. `overridePermissions`는 headless 클립보드 mock을 방해하여 부적합

### 검토한 대안
- **puppeteer (full)**: Chromium 내장. 용량이 크고 이미 Edge가 있으므로 불필요
- **Playwright**: 더 풍부한 API지만, 단순 테스트 러너에는 과도함. 별도 브라우저 설치 필요
- **JSDOM**: DOM 시뮬레이션. CSS 렌더링/시각적 테스트 불가
- **overridePermissions**: headless 모드에서 writeText까지 깨뜨림. CDP 직접 호출로 해결

---

## ADR-019: 다크 모드: `html[data-theme]` + FOUC 방지 인라인 스크립트

**날짜**: 2026-02-13
**상태**: 유지
**명세**: `docs/spec.md` F-008

### 맥락
Phase 3 미착수 항목인 다크 모드를 구현해야 했다. 현재 모든 색상이 CSS 변수(`:root`)로 관리되어 있어, 변수를 오버라이드하는 방식으로 전체 앱을 전환할 수 있었다.

### 결정
1. **테마 선택자**: `html[data-theme="dark"]` — `:root`보다 특이성이 높아 변수 오버라이드가 자연스러움
2. **저장**: LocalStorage 키 `lotto_theme` (기존 `lotto_history`, `lotto_excluded` 패턴 준수)
3. **FOUC 방지**: `<head>`에서 `<link>` 태그 앞에 인라인 `<script>`로 `data-theme` 설정
4. **우선순위**: LocalStorage > `prefers-color-scheme` > light 기본값

### 사유
- **CSS 변수 활용**: 기존 `:root` 토큰 구조 덕분에 `html[data-theme="dark"]`에서 변수만 재정의하면 전체 UI 전환. 개별 클래스/선택자 추가 불필요
- **FOUC 방지**: CSS 파싱 전에 `data-theme`을 설정하여 다크 모드 사용자에게 밝은 화면이 잠깐 보이는 문제 방지
- **`prefers-color-scheme` 연동**: 저장값이 없을 때만 시스템 설정 반영. `matchMedia` change 리스너로 실시간 감지

### 검토한 대안
- **`body.dark` 클래스**: `body`는 DOM 로드 후 접근 가능하여 FOUC 방지 어려움
- **`:root.dark`**: `:root`와 같은 특이성이라 오버라이드 충돌 가능
- **CSS `@media (prefers-color-scheme)` only**: 사용자가 수동 전환할 수 없음
