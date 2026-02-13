# 문서·검증 체계 전면 리팩터링 — 최종 기록

> 이 파일 하나만 로드하면 미커밋 변경 전체의 맥락·사유·파일별 히스토리를 파악할 수 있다.
> 2개 작업 Phase(A: 문서 구조, B: 검증 체계)를 하나의 기록으로 통합.

---

## 변경 규모 요약

- **수정 파일 9개** + **신규 파일 3개** = 총 12개 파일
- 삽입 510줄, 삭제 159줄 (net +351줄)
- ADR 9건 (021~029) 신규 작성
- verify.js 427줄 신규 스크립트

---

## Phase A: 문서 구조 리팩터링

### 동기

| 문제 | 상세 |
|------|------|
| CLAUDE.md 비대 (143줄) | 매 대화 자동 로드 ~4K 토큰. API 테이블(32함수)이 tech.md와 완전 중복 |
| 문서 "통째로 읽기" 구조 | tech.md(434줄), design.md(363줄) — 섹션 단위 읽기 불가 |
| 프로젝트 현황 파악에 plan.md 전체 읽기 필요 | 93줄을 읽어야 현황 파악 가능 |

### 설계 원칙

1. **CLAUDE.md 극한 경량화** — 매 대화 자동 로드이므로 1줄 줄이면 전 대화에서 절약
2. **Progressive Context Loading** — 요약 → 필요 섹션만 → 전문은 서브에이전트
3. **Main Context 보호** — 200줄 이상 읽기는 서브에이전트에 위임
4. **섹션 단위 읽기** — 문서 상단 인덱스 + `Read(offset, limit)`
5. **단일 소스 원칙** — 중복 제거 → 동기화 비용 0

### 정량 효과

| 지표 | Before | After | 절감 |
|------|--------|-------|------|
| CLAUDE.md 자동 로드 | ~4K 토큰 | ~1.8K 토큰 | -55% |
| 소형 작업 추가 읽기 | 5-15K | 2-4K | -70% |
| 대형 작업 (서브에이전트 위임) | 20-40K (Main) | 2-3K (Main) | -90% |
| Context 수명 | 기준 | ~2.5배 향상 | — |

---

## Phase B: 검증 체계 최적화 (ADR-021~029)

### 진화 경로

```
ADR-021  app.js 모듈 분할 (단일 757줄 → 7개 파일)
  ↓
ADR-022  A3 교차 검증 위임 → A1/A5 확장 (A3 토큰 -29%, Tool -64%)
  ↓
ADR-023  B 에이전트 Bash 금지 → Read/Grep 전환 (B 시간 289s→24s, -92%)
  ↓
ADR-024  에이전트 병합 9→5 + Sonnet 통일 (총 토큰 364K→270K, -26%)
  ↓
ADR-025  A3 오탐 방지 — 카운트 규칙·범위 명시 (A3 오탐 5→0, Tool 28→6)
  ↓
ADR-026  B·D Tool 예산 제한 (B Tool 11→3, D Tool 10→6)
  ↓
ADR-027  Tier 0 스크립트 전처리 — verify.js 신설 (기계적 검증 <1s)
  ↓
ADR-028  Tier 0에 ARIA 이관 + A2 배치 가이드 (11→13 검증 항목)
  ↓
ADR-029  프롬프트 추상화 + verify.js 동적 비교 (매직 넘버 전면 제거)
```

### ADR-029 핵심 (마지막 작업)

**3단계 추상화 수준**:
| 수준 | 설명 | 판정 |
|------|------|------|
| L1 순수 행위 | "병렬 Read 후 모델 내 비교" | 유지 |
| L2 역할 바인딩 | "A2는 spec.md를 검증" | 유지 |
| L3 스냅샷 데이터 | "함수 34개, CSS 42개" | **제거** |

**verify.js**: `=== 42` → `cssRoot.length === docRoot.length` (양쪽 파싱 비교)
**신규 파서 5개**: `parseDesignKeyframes`, `parseClaudeMdModules`, `parseTestReadmeCounts`, `parseSpecAriaTable`, `parseReadmeFileTree`

---

## 파일별 변경 히스토리 (12개)

### 1. `CLAUDE.md` — 전면 재작성 (143→64줄, -55%)

**Phase A에서 변경.**

제거:
- API 32함수 테이블 (~40줄) → tech.md 단일 소스로 전환
- 개발 워크플로우 상세 (~20줄) → 3줄 압축
- 문서 업데이트 매트릭스 (~10줄) → 2줄 압축
- 파생 수치 단일 소스 규칙 (~5줄) → Context 관리 규칙 1항으로 통합
- ADR Chunk 규칙 (~6줄) → decisions.md 헤더로 이동
- 검증 체계 참조 (~3줄) → 문서 인덱스에 포함
- 코딩 규칙 상세 (~25줄) → 8줄 핵심만
- 중요 제약사항 (~5줄) → 코딩 규칙에 통합
- 문서 참조 가이드 (~10줄) → 문서 인덱스 테이블로 교체

추가:
- 모듈 구조 1줄 요약: `lottery.js(4) | history.js(8) | ...`
- 작업 시 Context 관리 규칙 5개 항목 (이 리팩터링의 핵심)
- 문서 인덱스 테이블 (크기 포함, 서브에이전트 위임 판단 근거)

역할 전환: "포괄적 레퍼런스" → **"Context 라우터 + 최소 규칙셋"**

### 2. `README.md` — 파일 트리 갱신 (+6줄)

**Phase A+B에서 변경.**

- `CLAUDE.md` 설명: `(API 테이블)` → `(Context 라우터)`
- 파일 트리에 추가: `scripts/verify.js`, `docs/_context.md`, `docs/verification.md`

### 3. `docs/decisions.md` — ADR 9건 추가 (+365줄)

**Phase B에서 변경.**

| ADR | 제목 | 핵심 효과 |
|-----|------|----------|
| 021 | app.js 모듈 분할 + CSS @media 인라인 | 7개 모듈로 분리 |
| 022 | A3 교차 검증 위임 | A3 토큰 -29%, Tool -64%, 시간 -75% |
| 023 | B Bash 금지 → Read/Grep | B 시간 289s→24s (-92%) |
| 024 | 에이전트 병합 9→5 + Sonnet 통일 | 총 토큰 -34%, 에이전트 -44% |
| 025 | A3 오탐 방지 — 카운트 규칙 명시 | A3 오탐 5→0, 토큰 -56% |
| 026 | B·D Tool 예산 제한 | B Tool -73%, D Tool -40% |
| 027 | Tier 0 스크립트 전처리 | 기계적 검증 <1s 자동화 |
| 028 | ARIA Tier 0 이관 + A2 최적화 | 11→13 검증 항목 |
| 029 | 프롬프트 추상화 + 동적 비교 | 매직 넘버 전면 제거 |

목차 행도 추가됨. Chunk 규칙(CLAUDE.md에서 이동)이 헤더에 포함.

### 4. `docs/verification.md` — Tier 0 추가 + 프롬프트 추상화 (+84줄/-33줄)

**Phase B에서 변경 (ADR-027~029).**

추가:
- Tier 0 섹션 전체 (스크립트 전처리, 13개 검증 항목 테이블, 사용법, 부하 절감)
- A2 프롬프트: 배치 가이드 + 금지 패턴 (ADR-028)
- A3 프롬프트: 행위 기반 3단계 프로세스 + DOM 카운트 규칙 + 금지 패턴 (ADR-025, 029)
- B Tier 2: 의미적 검증 집중 지시 + 금지 패턴 (ADR-026)
- D 배치 가이드: Tool ≤ 7회 + 금지 패턴 (ADR-026)

변경:
- Tier 0 테이블: "기대값" 열 → "판정" 열 ("양쪽 일치", "전수 존재")
- A Tier 1: 하드코딩 수치 → "Tier 0 결과 기준 스팟체크"
- A1 설명: "34개" → "양쪽 읽고 교차 비교"
- A3 설명: 수치 나열 → "교차 비교"
- B Tier 1: "기대값 42개" → "design.md 파싱 수 기준"
- B Tier 2: "기대값 명시" → "의미적 검증 집중"
- D Tier 1: "23+50" → "전 테스트 통과"
- 품질 규칙: "기대값 프롬프트 삽입" → "행위 기반 프롬프트: 수치 하드코딩 금지"

### 5. `docs/tech.md` — TOC 삽입 + generateLottoNumbers 이동 (+14줄/-9줄)

**Phase A에서 변경.**

- 상단에 섹션 인덱스 블록 추가 (+5줄)
- `generateLottoNumbers()` 함수 설명을 "핵심 생성 함수" 섹션에서 "메인 진입점 (app.js)" 섹션으로 이동
- 이동 사유: 모듈 분할(ADR-021) 후 app.js에 위치하므로 문서도 해당 섹션에 배치

### 6. `docs/design.md` — TOC 삽입 (+4줄)

**Phase A에서 변경.**

```
> 디자인원칙 L14 | 색상 L25 (브랜드 L27 | 뱃지 L38 | 다크 L51) | 타이포 L80 | 레이아웃 L94
> 컴포넌트 L147 | 인터랙션 L198 | 애니메이션 L222 | 간격 L244 | 그림자 L255 | 접근성 L264 | 디자인토큰 L273 | 반응형 L334
```

### 7. `docs/spec.md` — TOC 삽입 (+3줄)

**Phase A에서 변경.**

```
> 범위 L12 | F-001추첨 L24 | F-002표시 L38 | F-003이력 L62 | F-004다중 L88 | F-005제외 L105 | F-006복사 L126 | F-007인증 L144 | F-008다크모드 L163 | 비기능 L186 | 용어 L210
```

### 8. `docs/phase4-architecture.md` — TOC 삽입 (+4줄)

**Phase A에서 변경.**

```
> 문서정보 L7 | 확장목표 L15 | 아키텍처설계 L38 | DB스키마 L67 | API엔드포인트 L190
> 구현로드맵 L478 | 개발우선순위 L549 | 보안 L568 | 비용 L589 | 참고자료 L600
```

### 9. `package.json` — verify 스크립트 추가 (+1줄)

**Phase B에서 변경 (ADR-027).**

```json
"verify": "node scripts/verify.js"
```

### 10. `docs/_context.md` — 신규 생성 (~30줄)

**Phase A에서 생성.**

plan.md(93줄) 전체를 읽지 않고 프로젝트 현황을 파악하기 위한 경량 스냅샷.
Phase 진행 테이블, 블로커, 최근 변경 3건, 다음 할 일 포함.
**주의**: 최종 업데이트 2026-02-13. ADR-025~029 반영 필요.

### 11. `docs/refactor.md` — 신규 생성 (~192줄)

**Phase A에서 생성.**

문서 구조 리팩터링의 Context 전환용 기록. Phase A의 설계 원칙, 구체적 변경 내용, 정량 효과를 상세히 기술.
이 파일(`refactor_final.md`)이 상위 호환이므로 커밋 후 아카이브 가능.

### 12. `scripts/verify.js` — 신규 생성 (427줄)

**Phase B에서 생성 (ADR-027), 이후 ADR-029에서 동적 비교로 전환.**

정밀 검증 전처리 스크립트. 13개 기계적 검증을 <1s에 자동화.

구조:
- CSS 변수 파싱 (기존): `parseCssBlock`, `parseDesignRootBlock`, `parseDesignDarkTable`, `compareVars`
- Keyframes/Media (기존+신규): `parseKeyframes`, `parseBreakpoints`, `parseDesignKeyframes`
- 문서 파서 (신규 5개): `parseClaudeMdModules`, `parseTestReadmeCounts`, `parseSpecAriaTable`, `parseReadmeFileTree`
- 소스 카운팅 (기존): `countFunctions`, `countTests`
- 접근성 (수정): `checkAria(specAria)` — spec.md 파싱 결과를 인자로, `checkSrOnly()` — HTML에서 auth-input 동적 발견
- 파일 존재 (수정): `checkFiles(expectedFiles)` — README.md 파일 트리 파싱 결과를 인자로
- 리포트: JSON(stdout) + 사람 읽기용(stderr)

핵심 원칙: **매직 넘버 0개**. 모든 기대값은 문서에서 동적 파싱 → 양쪽 결과 비교.

---

## 커밋 전략 (추천)

| 순서 | 범위 | 메시지 형식 |
|------|------|------------|
| 1 | Phase A 문서 구조 | `refactor: 문서 구조 리팩터링 — CLAUDE.md 경량화 + Progressive Context Loading` |
| 2 | Phase B 검증 체계 (ADR-021~028) | `docs: 검증 체계 최적화 ADR-021~028 — 에이전트 병합 + Tier 0 + verify.js` |
| 3 | ADR-029 추상화 | `refactor: 에이전트 프롬프트 추상화 + verify.js 동적 비교 (ADR-029)` |

또는 전체를 하나의 커밋으로:
```
refactor: 문서 구조 + 검증 체계 전면 리팩터링 (ADR-021~029)
```

---

## 미완료 사항

| 항목 | 상태 | 비고 |
|------|------|------|
| 커밋/푸시 | 미완료 | 사용자 승인 대기 |
| `_context.md` 갱신 | 필요 | 2026-02-13 기준 → ADR-025~029 반영 필요 |
| Tier 2 에이전트 검증 | 선택 | 추상화 후 오탐 0건 확인용 (~270K 토큰) |
| TOC 줄번호 검증 | 주의 | 문서 내용 변경 시 L값이 틀어질 수 있음 |

---

## 현재 npm run verify 결과

```
13/13 PASS (동적 비교)
  css.root.count:    css:42 ↔ doc:42
  css.root.values:   all match
  css.dark.count:    css:19 ↔ doc:19
  css.dark.values:   all match
  css.keyframes:     css:4 ↔ doc:4
  css.breakpoints:   480px, 12 media queries
  functions.total:   grep:34 ↔ claudeMd:34
  tests.cli:         actual:23 ↔ readme:23
  tests.dom:         actual:50 ↔ readme:50
  tests.total:       actual:73 ↔ readme:73
  aria.attributes:   all 7 present (from spec.md)
  aria.srOnly:       all 2 present (dynamic)
  files:             all 14 present (from README.md)
```
