# 로또번호 추첨기

웹 기반 로또번호 추첨 (1~45 중 6개). HTML5 + CSS3 + Vanilla JS (프레임워크 금지).
GitHub: https://github.com/6418wjdghks/lotto-number-generator

## 모듈 구조

| 모듈 | 역할 |
|------|------|
| config.js | JSON 설정 로더 |
| lottery.js | 추첨 생성/표시 |
| history.js | 이력 저장/로드/표시 |
| exclude.js | 번호 제외 기능 |
| utils.js | 공통 유틸 |
| theme.js | 테마(다크모드) 관리 |
| auth.js | 사용자 인증 |
| app.js | 메인 진입점 |
| supabase-config.js | Supabase REST API 래퍼 |

Data: `config/constants.json` | `config/supabase.json`
상세: `docs/tech.md` — 섹션별 줄번호 인덱스 포함

## 작업 시 Context 관리 규칙

1. CLAUDE.md만으로 작업 가능하면 **추가 문서 읽기 금지**
2. 활성 workset 존재 시 해당 CONTEXT.md 우선 참조
3. 프로젝트 현황 필요 시 `docs/_context.md` 참조
4. 문서 인덱스의 **읽기 방식**을 따를 것 — 직접 / 섹션 단위 / 서브에이전트
5. 단일 소스: 함수 목록 → `docs/tech.md` | 테스트 항목 → `test/README.md`
6. 새 workset 생성 시 `_archive/`에서 동일 카테고리 이력 확인

## 워크플로우

**준비**: CLAUDE.md → 활성 workset CONTEXT.md 확인 → 필요 시 관련 문서 섹션 읽기 → `git log --oneline -5`
**구현**: 기능 구현 → 테스트 (`npm test` 또는 `npm run test:logic` / `test:dom`)
**마무리**: CONTEXT.md 세션 로그 갱신 → 문서 업데이트 → 결과 요약 → 사용자 승인 후 커밋

### 테스트 타입

| 타입 | 정의 | 예시 |
|------|------|------|
| **bb_test** | 코드를 읽지 않고 동작/명세 기준 확인 | `npm test`, serve.js E2E |
| **wb_test** | 소스코드를 파싱/비교하여 확인 | `npm run verify`, Tier 2 에이전트 |

### Verify 수준 (strong ⊃ func ⊃ weak)

| 수준 | 누적 구성 | 용도 |
|------|----------|------|
| **weak_verify** | Tier 0 + `npm test:logic` | 로직 변경 빠른 확인 |
| **func_verify** | **weak 전체** + `npm test:dom` + serve.js E2E (MCP) | 기능/UI 변경 확인 |
| **strong_verify** | **func 전체** + **Tier 2 에이전트** | 문서 변경 / 릴리스 전 |

사용자가 "약한 검증", "기능 검증", "강한 검증"으로 요청하면 각각 weak_verify, func_verify, strong_verify로 해석한다.

상세: `docs/verification.md`

## 문서 인덱스

| 정보 | 파일 | 읽기 |
|------|------|------|
| Phase 진행률/블로커 | `docs/_context.md` | 직접 |
| 기능 명세 | `docs/spec.md` | 섹션 단위 |
| API/기술 상세 | `docs/tech.md` | 섹션 단위 |
| UI/디자인 | `docs/design.md` | 섹션 단위 |
| Phase 계획 | `docs/plan.md` | 직접 |
| 설계 결정 (ADR) | `docs/decisions.md` | 섹션 단위 |
| Verify 체계 | `docs/verification.md` | 서브에이전트 |
| 테스트 명세 | `test/README.md` | 섹션 단위 |
