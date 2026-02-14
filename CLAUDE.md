# 로또번호 추첨기

웹 기반 로또번호 추첨 (1~45 중 6개). HTML5 + CSS3 + Vanilla JS (프레임워크 금지).
GitHub: https://github.com/6418wjdghks/lotto-number-generator

## 모듈 구조 (8개 JS + 2개 JSON, 35함수)

config.js(1) | lottery.js(4) | history.js(8) | exclude.js(7) | utils.js(3) | theme.js(5) | auth.js(5) | app.js(2)
Data: `config/constants.json` | `config/supabase.json`
상세: `docs/tech.md` — 섹션별 줄번호 인덱스 포함

## 코딩 규칙

- **JS**: Vanilla ES6+, `function` 키워드, 2 spaces, 작은따옴표/백틱, 세미콜론, `const`/`let` (var 금지)
  - 화살표함수=콜백에만, 템플릿 리터럴, 구조분해 할당, 기본 매개변수
- **HTML**: 2 spaces, ID=camelCase, class=kebab-case, 버튼ID=`btn` 접두어, 동적버튼 `type="button"`
  - 토글 버튼 텍스트: `<span id="xxxText">` 분리
- **CSS**: 2 spaces, 선택자 순서 요소→클래스→ID, 섹션별 주석
- **보안**: `textContent` (innerHTML 금지), JSON.parse try-catch
- **제약**: 프레임워크 금지 (Supabase=REST API), 모바일 480px 반응형, 단순성 우선

## Git 정책

형식: `feat|fix|refactor|docs|test|style: 설명` + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
결과 요약 후 사용자 승인 → 커밋/푸시

## 작업 시 Context 관리 규칙

1. CLAUDE.md만으로 작업 가능하면 **추가 문서 읽기 금지**
2. 프로젝트 현황 필요 시 `docs/_context.md` 우선 참조
3. 문서 인덱스의 **읽기 방식**을 따를 것 — 직접 / 섹션 단위 / 서브에이전트
4. 단일 소스: 함수 목록 → `docs/tech.md` | 테스트 항목 → `test/README.md`

## 워크플로우

**준비**: CLAUDE.md → 필요 시 관련 문서 섹션 읽기 → `git log --oneline -5`
**구현**: 기능 구현 → 테스트 (`npm test` 또는 `npm run test:logic` / `test:dom`)
**마무리**: 문서 업데이트 → 결과 요약 → 사용자 승인 후 커밋

## 문서 변경 시 업데이트 대상

기능추가 → spec, plan, tech | UI변경 → design | 설계결정 → decisions (ADR)
테스트 → test/README | Phase완료 → plan | 구조변경 → README 파일트리
정밀검증 → test/README (검증 결과 + 성능 지표)

## 문서 관리 규칙

- 코드 구조 변경 시 README.md 파일 구조 섹션 동기화
- 아카이브 파일 생성 시 README.md 파일 트리 업데이트
- 암묵적 패턴은 명문화해야 지속 적용됨

## 문서 인덱스

| 정보 | 파일 | 읽기 |
|------|------|------|
| 현재 상태/진행 | `docs/_context.md` | 직접 |
| 기능 명세 | `docs/spec.md` | 섹션 단위 |
| API/기술 상세 | `docs/tech.md` | 섹션 단위 |
| UI/디자인 | `docs/design.md` | 섹션 단위 |
| Phase 계획 | `docs/plan.md` | 직접 |
| 설계 결정 (ADR) | `docs/decisions.md` | 섹션 단위 |
| Phase 4 아키텍처 | `docs/phase4-architecture.md` | 서브에이전트 |
| 검증 체계 | `docs/verification.md` | 서브에이전트 |
| 테스트 명세 | `test/README.md` | 섹션 단위 |
