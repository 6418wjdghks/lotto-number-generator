# 검증 체계 (서브 에이전트 위임)

검증 시 메인 컨텍스트에서 파일을 직접 읽지 말 것. `Task(subagent_type="general-purpose", run_in_background=true)` 백그라운드 병렬 위임으로 토큰 효율화 (메인 컨텍스트 96% 절감). 에이전트 완료 알림을 받아 결과를 취합한다.

**공통 규칙**:
- 각 에이전트는 불일치 목록만 반환, 메인은 취합 후 보고/수정
- Grep 기반 타겟 읽기: 파일 전체 Read 대신 `Grep`으로 필요 데이터만 추출
- **임시 파일 RAII**: 중간 파일 생성 허용하되, 에이전트 종료 전 반드시 삭제 (생성한 파일 목록 추적 → 최종 단계에서 정리)
- **재위임 금지**: 에이전트 내부에서 Task 도구로 서브에이전트를 재생성하지 말 것. 직접 Read/Grep으로 검증 수행
- `npm test`는 검증 체계가 아닌 개발 워크플로우(2단계)의 일부 — `code`/`test` 변경 시 항상 실행

## Tier 0: 스크립트 전처리 (ADR-027)

`npm run verify` (`scripts/verify.js`) — 기계적/정량적 검증을 자동화하여 에이전트 실행 전에 수행.

**검증 항목 (13개)** — 매직 넘버 없음, 양쪽 파싱 결과 비교 (ADR-029):
| 검증 | 비교 | 판정 |
|------|------|------|
| css.root.count | design.md :root 변수 수 ↔ style.css :root 변수 수 | 양쪽 일치 |
| css.root.values | design.md ↔ style.css :root 변수값 전수 비교 | all match |
| css.dark.count | design.md 다크모드 테이블 수 ↔ style.css dark 오버라이드 수 | 양쪽 일치 |
| css.dark.values | design.md 다크모드 테이블 ↔ style.css dark 변수값 전수 비교 | all match |
| css.keyframes | design.md 애니메이션 명세 수 ↔ style.css @keyframes 수 | 양쪽 일치 |
| css.breakpoints | style.css @media 브레이크포인트 | 480px 단일 |
| functions.total | CLAUDE.md 모듈 테이블 합계 ↔ js/ Grep 함수 수 | 양쪽 일치 |
| tests.cli | test-logic.js it() 실측 | > 0 |
| tests.dom | test.html PASS: 실측 | > 0 |
| tests.total | CLI + DOM 합산 | 일치 |
| aria.attributes | spec.md ARIA 테이블 ↔ index.html 속성 존재 | 전수 존재 |
| aria.srOnly | index.html auth-input 동적 발견 ↔ sr-only 라벨 존재 | 전수 존재 |
| files | README.md 파일 트리 파싱 ↔ 실제 파일 존재 | 전수 존재 |

**사용법**:
1. 에이전트 실행 전 `npm run verify` 실행
2. ALL PASS → 에이전트는 스크립트가 커버하지 않는 **의미적 검증만** 수행
3. FAIL → 불일치 항목을 에이전트에 전달하여 원인 분석 위임

**에이전트 부하 절감**:
- B 에이전트: CSS 변수 전수 비교를 스크립트가 대체 → 컴포넌트/반응형/애니메이션 의미적 검증만 수행
- A2 에이전트: ARIA/접근성 전수 확인을 스크립트가 대체 → 문서 정확성 + 구현 준수 검증만 수행
- C Tier 1: 함수 카운트 + ARIA 확인을 스크립트가 대체 → Tier 0 PASS 시 별도 에이전트 불필요

## 파일 타입 분류

| Label | 타입 | 포함 파일 |
|-------|------|----------|
| `style` | 스타일 | `style.css` |
| `code` | 코드 | `utils.js`, `theme.js`, `exclude.js`, `lottery.js`, `history.js`, `auth.js`, `app.js`, `supabase-config.js`, `index.html` |
| `test` | 테스트 | `test-logic.js`, `test-dom.js`, `test.html` |
| `doc:api` | 문서(API) | `tech.md`, `CLAUDE.md`, `README.md` |
| `doc:design` | 문서(디자인) | `design.md` |
| `doc:spec` | 문서(명세) | `spec.md` |
| `doc:test` | 문서(테스트) | `test/README.md` |
| `doc:track` | 문서(추적) | `plan.md`, `decisions.md`, `decisions_*_*.md`, `phase4-architecture.md`, `verification.md` |
| `config` | 설정 | `package.json` |

## 검증 수준

| 수준 | 별칭 | 구성 | 에이전트 | 용도 |
|------|------|------|---------|------|
| **보통 검증** | 일반 검증, 간편 검증 | Tier 0 + `npm test` | 없음 | 일상 변경 확인 |
| **정밀 검증** | 전수 검증 | Tier 0 + `npm test` + Tier 2 에이전트 | 5개 (백그라운드) | 문서 변경 / 릴리스 전 |

## 2계층 검증

| 계층 | 방식 | 빈도 |
|------|------|------|
| **Tier 1** | 블랙박스 (핵심 수치 스팟체크) | 코드/스타일/테스트 변경 시 |
| **Tier 2** | 화이트박스 (소스 ↔ 명세 전수 비교) | 문서 변경 시 / 릴리스 전 |

## Label → 검증 매핑

| 변경 Label | Tier 1 | Tier 2 | 예상 토큰 |
|------------|--------|--------|----------|
| `style` | B | — | ~15K |
| `code` | A | — | ~20K |
| `test` | D | — | ~15K |
| `doc:api` | — | A1, A3 | ~110K |
| `doc:design` | — | B | ~42K |
| `doc:spec` | — | A2 | ~40K |
| `doc:test` | — | A3, D | ~133K |
| `doc:track` | — | — | 0K |
| `config` | — | — | 0K |
| 릴리스 전 | — | A1+A2+A3+B+D (5) | ~270K |

**복합 변경 규칙**:
1. 변경된 파일들의 Label을 수집
2. 각 Label의 Tier 2 에이전트를 합집합(Union)
3. 같은 에이전트에 Tier 1 + Tier 2 → **Tier 2만 실행** (Tier 2 ⊃ Tier 1)

## 모델 선택 가이드

| 모델 | 정확도 | 권장 용도 |
|------|--------|----------|
| **Opus** | 최고 (오탐 0) | 릴리스 전 최종 검증 |
| **Sonnet** | 양호 | Tier 2 전 에이전트 (권장) |
| **Haiku** | 기초 | Tier 1 전용 |

**모델 지정**: `Task(model="sonnet")` — 미지정 시 메인 모델 상속

## 에이전트 분할/병합 기준

| 원칙 | 기준 | 근거 |
|------|------|------|
| 최소 작업량 | 유효 토큰 ≥ 25K (총 ≥ 35K) | 고정 오버헤드(~10K) 비율 30% 이하 유지 |
| 소스 겹침 | 주요 소스 파일 겹침 ≤ 1개 | 같은 파일 반복 읽기 = 토큰 낭비 |
| 병렬 이점 | 에이전트당 예상 실행시간 ≥ 30초 | 너무 짧으면 병렬화 이점 없음 |

## A. 문서 검증 (문서 ↔ 소스코드)

**Tier 1** (1 에이전트, ~20K): Tier 0(`npm run verify`) 결과를 기준으로 스팟체크. 함수/테스트/파일 카운트는 Tier 0이 검증
- 함수 카운트 규칙: `function` + `async function` 모두 포함 (Grep 패턴: `^(async )?function`, 대상: `js/` 디렉토리)

**Tier 2** (3 에이전트, ~150K — ADR-024 병합):

| 에이전트 | 모델 | 문서 | 비교 소스 |
|----------|------|------|----------|
| A1 | Sonnet | tech.md | js/*.js, style.css, index.html, CLAUDE.md(API 테이블) |
| A2 | Sonnet | spec.md | index.html, js/*.js (양방향) |
| A3 | Sonnet | CLAUDE.md(비API) + README.md + test/README.md | Glob, test-logic.js, test-dom.js, js/app.js, package.json, CLAUDE.md(수치) |

> `js/*.js` = utils, theme, exclude, lottery, history, auth, app (7개 모듈)
> A1: CLAUDE.md API 테이블과 tech.md 함수 목록을 양쪽 읽고 교차 비교. 각 모듈의 실제 소스와 대조. **Bash 금지**: Read + Grep만 사용
> A2: spec.md 문서 정확성 + F-001~F-008 구현 준수 + ARIA/접근성 양방향 검증. 소스를 한 번만 읽고 양쪽 수행
> A3: README.md 파일 트리 ↔ Glob 실제 파일, test/README.md ↔ 테스트 코드, CLAUDE.md 모듈 테이블 ↔ 실제 구조 교차 비교

<agent-prompt id="A1">
# A1: tech.md ↔ 소스코드 교차 검증

## 역할

docs/tech.md가 실제 소스코드를 정확히 기술하는지 전수 비교한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- **Bash 사용 금지**: Read + Grep 도구만 사용한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다 (없어야 정상).

## 검증 항목

### 1. 함수 목록 교차 비교

- CLAUDE.md 모듈 구조 테이블에서 모듈 목록 추출.
- tech.md JavaScript API 섹션에서 모듈별 함수 목록 추출.
- 각 모듈의 실제 소스(js/*.js)를 Read하여 실제 함수와 대조.
- CLAUDE.md ↔ tech.md ↔ 실제 소스 3중 교차 비교로 누락/추가 발견.

### 2. CSS 파일 구성 트리

- tech.md CSS 파일 구성 트리와 css/style.css 섹션 주석(`/* ... */`) 비교.

### 3. HTML ID 네이밍 규칙

- tech.md HTML ID 네이밍 규칙 테이블과 index.html 실제 ID 비교.

## 비교 소스

- docs/tech.md
- CLAUDE.md (모듈 구조 테이블)
- js/config.js, js/utils.js, js/theme.js, js/exclude.js, js/lottery.js, js/history.js, js/auth.js, js/app.js, js/supabase-config.js
- css/style.css
- index.html

## 배치 가이드

1. CLAUDE.md + docs/tech.md 병렬 Read
2. js/ 9개 .js 파일 병렬 Read — 가능한 만큼 병렬화하여 최소한의 호출로 수행
3. css/style.css + index.html 병렬 Read
4. 모델 내 교차 비교

## 금지 패턴

1. **Bash 사용 금지** — `ls`, `find`, `Get-ChildItem` 등 사용 금지. 파일은 Read/Grep 도구로만 접근.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [파일:줄] 설명
2. ...

사용한 Bash 명령어: (없음)
</agent-prompt>

**A2 프롬프트 설계** (ADR-024, ADR-028):
- 검증 1: spec.md가 소스를 정확히 기술하는지 (문서 정확성)
- 검증 2: 소스가 F-001~F-008 요구사항을 구현하는지 (구현 준수)
- 검증 3: ~~ARIA/접근성 속성 전수 확인~~ → **Tier 0 이관** (aria.attributes + aria.srOnly). Tier 0 ALL PASS 시 A2는 ARIA 검증 생략
- **Bash 금지**: Read + Grep만 사용
- **배치 가이드**: spec.md + index.html + js/*.js를 **병렬 Read**하여 RT(API 왕복)를 최소화 → **모델 내 양방향 비교**. 추가 확인 필요 시 css/style.css Read 또는 Grep 보충
- **금지 패턴**: (1) 기능별 Grep 순차 호출 금지 — Read 후 모델 내 비교 우선 (2) Glob 금지 — 파일 경로 고정 (3) ARIA 속성 수동 확인 금지 — Tier 0 위임

<agent-prompt id="A2">
# A2: spec.md ↔ 소스코드 양방향 검증

## 역할

두 방향으로 검증한다:
1. spec.md가 소스를 정확히 기술하는지 (문서 정확성)
2. 소스가 F-001~F-008 요구사항을 구현하는지 (구현 준수)

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- **Bash 사용 금지**: Read + Grep 도구만 사용한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다 (없어야 정상).

## 검증 항목

### 검증 1: 문서 정확성

spec.md의 UI 요구사항, 제약사항, 동작 상세가 실제 소스코드와 일치하는지 확인.

### 검증 2: 구현 준수

F-001(기본 추첨) ~ F-008(다크 모드) 요구사항이 소스코드에 구현되어 있는지 확인.

### ARIA 검증

ARIA/접근성 전수 확인은 Tier 0(aria.attributes, aria.srOnly)이 담당한다.
Tier 0 ALL PASS → A2는 ARIA 검증 생략.
Tier 0 FAIL → 해당 항목 원인 분석 후 보고.

## 비교 소스

- docs/spec.md
- index.html
- js/config.js, js/utils.js, js/theme.js, js/exclude.js, js/lottery.js, js/history.js, js/auth.js, js/app.js

## 배치 가이드

1. docs/spec.md + index.html 병렬 Read
2. js/*.js 7개 모듈 병렬 Read — 가능한 만큼 병렬화하여 최소한의 호출로 수행
3. 모델 내 양방향 비교 (추가 확인 시 css/style.css Read 또는 Grep 보충)

## 금지 패턴

1. 기능별 Grep 순차 호출 금지 — Read 후 모델 내 비교 우선.
2. Glob 금지 — 파일 경로는 위에 고정.
3. ARIA 속성 수동 확인 금지 — Tier 0 위임.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [검증1/검증2] [파일:줄] 설명
2. ...

사용한 Bash 명령어: (없음)
</agent-prompt>

**A3 프롬프트 설계** (ADR-025, ADR-029):
- 행위 기반 3단계 프로세스:
  1. CLAUDE.md에서 모듈 구조 테이블을 읽고, 기술된 모듈 수·함수 분포를 추출
  2. README.md 파일 구조 트리와 `Glob("**/*")` 결과를 대조 (1과 동시 수집)
  3. test/README.md에서 테스트 수를 읽고, CLAUDE.md의 수치와 교차 확인
- 모듈 정의: **supabase-config.js는 설정 파일이며 모듈 아님** (CLAUDE.md 모듈 테이블 기준)
- DOM 테스트 카운트 규칙: **고유 테스트 케이스 수** 기준. 각 케이스는 PASS/FAIL 두 분기를 가지므로 `PASS:` 또는 `FAIL:` 한쪽만 카운트 (양쪽 합산 시 2배). **log() 전체 카운트 금지**
- 배치 가이드: CLAUDE.md + README.md + test/README.md + package.json + `Glob("**/*")` 동시 호출 → 메모리 내 대조 → 완료 (1라운드 수집)
- **금지 패턴**: (1) test-dom.js·test.html을 직접 Read하여 독자 카운트 금지 — D 에이전트 담당 (2) js/ Grep으로 함수 카운트 금지 — A1 담당 (3) 불필요 Grep 탐색 금지 — 문서에서 추출한 값으로 대조만 수행 (4) Bash로 파일 목록 조회 금지

<agent-prompt id="A3">
# A3: CLAUDE.md + README.md + test/README.md ↔ 실제 구조 교차 검증

## 역할

프로젝트 메타 문서가 실제 프로젝트 구조와 일치하는지 확인한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다.

## 검증 항목 (행위 기반 3단계)

### 단계 1: CLAUDE.md 모듈 구조 검증

- CLAUDE.md 모듈 구조 테이블에서 모듈 수와 각 모듈명을 추출.
- **supabase-config.js는 설정 파일이며 모듈 아님** (CLAUDE.md 모듈 테이블 기준).

### 단계 2: README.md 파일 구조 검증

- README.md 파일 구조 트리와 `Glob("**/*")` 결과를 대조 (둘 다 단계 1과 동시에 수집됨).

### 단계 3: test/README.md 수치 교차 확인

- test/README.md에서 테스트 수(CLI, DOM) 읽기.
- CLAUDE.md 수치와 교차 확인.
- **DOM 테스트 카운트 규칙**: 고유 테스트 케이스 수 기준. 각 케이스는 PASS/FAIL 두 분기를 가지므로 한쪽만 카운트. 양쪽 합산 시 2배가 되므로 주의. log() 전체 카운트 금지.

## 비교 소스 (1라운드에 동시 수집)

- Read: CLAUDE.md, README.md, test/README.md, package.json
- Glob("**/*"): 전체 파일 목록

## 배치 가이드

모든 입력 파일은 서로 의존성이 없다. 1라운드에 동시 수집한다.

1. 다음을 **모두 동시에** 호출 (병렬):
   - Read: CLAUDE.md, README.md, test/README.md, package.json
   - Glob("**/*")
2. 위 결과만으로 메모리 내 교차 대조 → 완료. 추가 Tool 호출 불필요.

## 금지 패턴

1. test-dom.js, test.html 직접 Read하여 독자 카운트 금지 — D 에이전트 담당.
2. js/ Grep으로 함수 카운트 금지 — A1 에이전트 담당.
3. 불필요 Grep 탐색 금지 — 문서에서 추출한 값으로 대조만 수행.
4. **Bash로 파일 목록 조회 금지** — `ls`, `find`, `Get-ChildItem` 등 사용 금지.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [단계1/2/3] 설명
2. ...

사용한 Bash 명령어: (목록)
</agent-prompt>

## B. 디자인 검증 (design.md ↔ CSS)

**Tier 1** (1 에이전트, ~15K): CSS 변수 개수 + 주요 색상값 샘플 체크
- 카운트 규칙: **고유 변수명 기준** (`:root`와 `[data-theme="dark"]`에 중복 정의 시 1개로 계산)
- design.md에서 변수 목록을 파싱한 수를 기준으로 style.css와 비교

**Tier 2** (1 에이전트, Sonnet, ~42K): design.md ↔ style.css + index.html 전수 비교 (ADR-024, ADR-026)
- 검증 1: design.md가 실제 디자인을 정확히 기술하는지 (문서 정확성)
- 검증 2: 변수값 + 컴포넌트 + 반응형 + 애니메이션 전수 비교 (구현 일치)
- **Bash 금지**: Read + Grep만 사용
- **배치 가이드**: design.md + style.css + index.html 병렬 Read → **모델 내 교차 비교** → 완료. **최소 Tool로 수행**
- design.md에서 각 카테고리(변수, 컴포넌트, 반응형, 애니메이션) 명세를 추출하여 style.css·index.html과 전수 비교. CSS 변수값 비교는 Tier 0 완료이므로 의미적 검증에 집중
- **금지 패턴**: (1) Glob 금지 — 파일 경로는 `docs/design.md`, `css/style.css`, `index.html` 고정 (2) Grep 최소화 — 3파일 Read 후 모델 내에서 전수 비교

<agent-prompt id="B">
# B: design.md ↔ CSS/HTML 전수 비교

## 역할

docs/design.md가 실제 디자인(CSS/HTML)을 정확히 기술하는지 전수 비교한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- **Bash 사용 금지**: Read + Grep 도구만 사용한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다 (없어야 정상).

## Tier 0 커버리지

CSS 변수값 비교(css.root.values, css.dark.values)는 Tier 0이 완료한다.
Tier 0 ALL PASS → B는 변수값 전수 비교를 생략하고 **의미적 검증에 집중**.

## 검증 항목

### 검증 1: 문서 정확성

design.md의 색상, 타이포그래피, 레이아웃, 컴포넌트 명세가 실제 CSS/HTML과 일치하는지 확인.

### 검증 2: 구현 일치 (의미적 검증)

- 컴포넌트 명세 테이블의 크기/배치/테두리/모서리/그림자/배경/글자 값 ↔ style.css 전수 비교.
- 인터랙션 명세(hover/active/focus 효과) ↔ style.css 확인.
- 반응형(480px) 변경 항목 ↔ style.css @media 반영 확인.
- 애니메이션 명세(@keyframes 이름, 키프레임, 지속시간) ↔ style.css 일치 확인.
- DOM 순서(design.md 레이아웃) ↔ index.html 일치 확인.

## 비교 소스

- docs/design.md
- css/style.css
- index.html

## 배치 가이드

1. docs/design.md + css/style.css + index.html 병렬 Read
2. 모델 내 교차 비교 → 완료. 최소한의 호출로 수행.

## 금지 패턴

1. Glob 금지 — 파일 경로는 위에 고정.
2. Grep 최소화 — 3파일 Read 후 모델 내에서 전수 비교.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [검증1/검증2] [파일:줄] 설명
2. ...

사용한 Bash 명령어: (없음)
</agent-prompt>

## C. 구현 검증 (spec.md ↔ 실제 동작)

**Tier 1**: Tier 0이 함수 카운트(`functions.total`) + ARIA(`aria.attributes`, `aria.srOnly`)를 커버. Tier 0 PASS 시 별도 에이전트 불필요.

**Tier 2**: A2에 통합 (ADR-024). A2가 spec.md ↔ 소스코드 양방향 검증(문서 정확성 + 구현 준수) 수행.

## D. 테스트 검증 (test/README.md ↔ 실제 테스트)

**Tier 1** (1 에이전트, ~15K): `npm test` 실행 → 전 테스트 통과, 0 fail 확인

**Tier 2** (1 에이전트, Sonnet, ~78K): CLI + DOM/UI 테스트 통합 검증 (ADR-024, ADR-026)

| 검증 항목 | 비교 소스 |
|----------|----------|
| CLI 테스트 항목/수 + 함수 커버리지 | test-logic.js, js/app.js, Grep(`js/`) |
| DOM/UI 테스트 항목/수 | test.html, test-dom.js |

> app.js의 module.exports로 export된 함수 목록 + Grep(`js/`)로 전체 함수 목록 비교하여 커버리지 판단

**배치 가이드** (ADR-026): 최소한의 호출로 수행
1. test/README.md + test/test-logic.js + test/test-dom.js 병렬 Read
2. test/test.html + js/app.js 병렬 Read
3. Grep(`^(async )?function`, path: `js/`) 함수 목록 확인
4. 모델 내 교차 비교 → 완료
- **Bash 금지**: Read + Grep만 사용
- **금지 패턴**: (1) js/*.js 개별 Read 금지 — 함수 목록은 Grep 1회로 충족 (2) 추가 Glob 금지 — 파일 경로 고정

<agent-prompt id="D">
# D: test/README.md ↔ 테스트 코드 통합 검증

## 역할

test/README.md가 실제 테스트 코드(CLI + DOM/UI)를 정확히 기술하는지 전수 비교한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- **Bash 사용 금지**: Read + Grep 도구만 사용한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다 (없어야 정상).

## 검증 항목

### 1. CLI 테스트 검증

- test/README.md CLI 테스트 항목/수 ↔ test/test-logic.js 실제 it() 블록 비교.
- 테스트 그룹명, 항목 수 일치 확인.

### 2. DOM/UI 테스트 검증

- test/README.md DOM/UI 테스트 항목/수 ↔ test/test-dom.js + test/test.html 비교.
- 테스트 그룹명, 검증 수 일치 확인.

### 3. 함수 커버리지 검증

- js/app.js module.exports에서 export 함수 목록 추출.
- Grep으로 js/ 전체 함수 목록 확인.
- test/README.md 함수 커버리지 섹션과 대조.

## 비교 소스

- test/README.md
- test/test-logic.js
- test/test-dom.js
- test/test.html
- js/app.js
- Grep(js/) 함수 목록

## 배치 가이드

최소한의 호출로 수행한다.

1. test/README.md + test/test-logic.js + test/test-dom.js 병렬 Read
2. test/test.html + js/app.js 병렬 Read
3. Grep(`^(async )?function`, path: `js/`) 함수 목록 확인
4. 모델 내 교차 비교 → 완료

## 금지 패턴

1. js/*.js 개별 Read 금지 — 함수 목록은 Grep 1회로 충족.
2. 추가 Glob 금지 — 파일 경로는 위에 고정.
3. **Bash로 파일 조회 금지** — `ls`, `find`, `Get-ChildItem` 등 사용 금지. 파일 확인은 반드시 Read/Grep 도구 사용.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [CLI/DOM/커버리지] 설명
2. ...

사용한 Bash 명령어: (없음)
</agent-prompt>

---

## 에이전트 프롬프트 품질 규칙

- **카운트 방법론**: Grep 패턴, 파싱 대상 문서만 명시. 기대값 수치는 프롬프트에 삽입 금지 (ADR-029)
- **재위임 금지**: "Task 도구로 서브에이전트 재생성 금지" 명시 필수
- **임시 파일 RAII**: "생성한 파일 목록 추적 → 종료 전 삭제" 명시 필수
- **Bash 명령어 보고**: 프롬프트 끝에 "사용한 Bash 명령어 목록 출력" 지시
- **교차 검증 위임**: 에이전트 간 중복 파일 읽기 → 이미 읽는 에이전트에 검증 위임 (ADR-022)
- **행위 기반 프롬프트**: Tier 0 결과 활용 + 단일 소스 문서에서 기대값 파싱. 스냅샷 수치 하드코딩 금지 (ADR-029)
- **Bash 금지 규칙**: CSS/문서 비교 에이전트에 "Bash 사용 금지, Read+Grep만 사용" 명시 필수 (ADR-023)

## 검증 결과 기록

정밀 검증(Tier 2) 성공 시 이 문서 하단 "정밀 검증 결과" 섹션을 업데이트:

1. **검증 항목 테이블**: 각 에이전트 결과(ALL PASS / Warning N건)
2. **성능 지표 테이블**: Tool 호출 수, 토큰, 경과 시간, Warning 수
3. **헤더**: 마지막 검증 날짜 + 커밋 해시
4. Warning 정의: ALL PASS이나 경미한 불일치 (코드 결함이 아닌 문서 표현 차이 등)
5. 미실행 에이전트는 `—`으로 표기, 이전 값 유지 금지 (해당 세션 실측값만 기록)

## Permission 관리

- settings.local.json 위치: `.claude/settings.local.json`
- 서브 에이전트 Bash 실행 시 권한 프롬프트 → 사용자 대기 시간 발생
- 에이전트 사용 명령어 사전 파악 → settings에 선제 등록으로 지연 방지
- 현재 등록 패턴: git, npm, node, ls, dir, find, findstr, grep, cat, echo, diff, wc, sed, rm, cd, where, start, powershell, python, Get-ChildItem, Sort-Object, Select-String, awk, sort, head, tail

## 정밀 검증 결과

> 마지막 검증: 2026-02-15 (`426ce8e`) — **Tier 0~1 PASS, ADR-041 추가 + nul 파일 버그 해결 후 검증**

### 검증 항목

| Tier | 에이전트 | 검증 대상 | 결과 | 비고 |
|------|---------|----------|------|------|
| 0 | verify.js | 코드↔문서 정량 비교 (14항목) | **14/14 PASS** | CSS 변수, 함수 수, 테스트 수, ARIA, 파일 존재 |
| 1 | npm test | 테스트 실행 | **73/73 PASS** | CLI 23 + DOM 50 |
| 2 | A1 (Sonnet) | tech.md ↔ 소스코드 | **ALL PASS** | 함수 46개 전수 일치, CSS 구조 일치, HTML ID 28개 일치 |
| 2 | A2 (Sonnet) | spec.md ↔ 소스코드 | **ALL PASS** | F-001~F-008 양방향 검증, ARIA Tier 0 위임 |
| 2 | A3 (Sonnet) | CLAUDE.md + README ↔ 실제 구조 | **ALL PASS** | 모듈 9개, 파일 17개, 테스트 73개 교차 확인 |
| 2 | B (Sonnet) | design.md ↔ CSS/HTML | **ALL PASS** | 컴포넌트 35개, 반응형 18항목, 애니메이션 4개 검증 |
| 2 | D (Sonnet) | test/README ↔ 테스트 코드 | **ALL PASS** | CLI 23개, DOM 50개, 커버리지 검증 |

### 성능 지표 (Tier 2)

| 에이전트 | Tool 호출 | 토큰 | 경과 시간 | Bash | Warning |
|----------|----------|------|----------|------|---------|
| A1 | 13 | 52.7K | 47.4s | 0 | 1건 |
| A2 | 10 | 32.2K | 35.6s | 0 | 0건 |
| A3 | **5** | 21.3K | — | 1 | 4건 |
| B | 3 | 31.1K | 20.8s | 0 | 0건 |
| D | 6 | 39.7K | 36.6s | 0 | 0건 |

> `—` = 해당 세션에서 미측정. Warning = ALL PASS이나 경미한 불일치 (코드 결함이 아닌 문서 표현 차이 등)
