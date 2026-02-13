# 검증 체계 (서브 에이전트 위임)

검증 시 메인 컨텍스트에서 파일을 직접 읽지 말 것. `Task(subagent_type="general-purpose")` 병렬 위임으로 토큰 효율화 (메인 컨텍스트 96% 절감).

**공통 규칙**:
- 각 에이전트는 불일치 목록만 반환, 메인은 취합 후 보고/수정
- Grep 기반 타겟 읽기: 파일 전체 Read 대신 `Grep`으로 필요 데이터만 추출
- **임시 파일 RAII**: 중간 파일 생성 허용하되, 에이전트 종료 전 반드시 삭제 (생성한 파일 목록 추적 → 최종 단계에서 정리)
- **재위임 금지**: 에이전트 내부에서 Task 도구로 서브에이전트를 재생성하지 말 것. 직접 Read/Grep으로 검증 수행
- `npm test`는 검증 체계가 아닌 개발 워크플로우(2단계)의 일부 — `code`/`test` 변경 시 항상 실행

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

## 2계층 검증

| 계층 | 방식 | 빈도 |
|------|------|------|
| **Tier 1** | 블랙박스 (핵심 수치 스팟체크) | 코드/스타일/테스트 변경 시 |
| **Tier 2** | 화이트박스 (소스 ↔ 명세 전수 비교) | 문서 변경 시 / 릴리스 전 |

## Label → 검증 매핑

| 변경 Label | Tier 1 | Tier 2 | 예상 토큰 |
|------------|--------|--------|----------|
| `style` | B | — | ~15K |
| `code` | A, C | — | ~40K |
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

**Tier 1** (1 에이전트, ~20K): 핵심 수치 스팟체크 — 함수 수 34, 테스트 수 73, 파일 목록 일치
- 함수 카운트 규칙: `function` + `async function` 모두 포함 (Grep 패턴: `^(async )?function`, 대상: `js/` 디렉토리)
- 기대값: 34개 (function 26 + async function 8), 7개 모듈에 분산

**Tier 2** (3 에이전트, ~150K — ADR-024 병합):

| 에이전트 | 모델 | 문서 | 비교 소스 | 병합 이력 |
|----------|------|------|----------|----------|
| A1 | Sonnet | tech.md | js/*.js, style.css, index.html, CLAUDE.md(API 테이블) | — |
| A2 | Sonnet | spec.md | index.html, js/*.js (양방향) | old-A2 + old-C |
| A3 | Sonnet | CLAUDE.md(비API) + README.md + test/README.md | Glob, test-logic.js, test-dom.js, js/app.js, package.json, CLAUDE.md(수치) | old-A3 + old-A5 |

> `js/*.js` = utils, theme, exclude, lottery, history, auth, app (7개 모듈)
> A1: CLAUDE.md API 테이블 함수 목록(34개)과 tech.md 함수 목록 교차 검증
> A2: spec.md 문서 정확성 + F-001~F-008 구현 준수 + ARIA/접근성 양방향 검증. 소스를 한 번만 읽고 양쪽 수행
> A3: 파일 타입 테이블(Glob) + README.md + test/README.md ↔ 테스트 코드 + CLAUDE.md 수치 통합

**A2 프롬프트 설계** (old-A2 + old-C 병합):
- 소스 읽기: spec.md + index.html + js/*.js 병렬 Read (한 번만)
- 검증 1: spec.md가 소스를 정확히 기술하는지 (문서 정확성)
- 검증 2: 소스가 F-001~F-008 요구사항을 구현하는지 (구현 준수)
- 검증 3: ARIA/접근성 속성 전수 확인
- **Bash 금지**: Read + Grep만 사용

**A3 프롬프트 설계** (old-A3 + old-A5 병합):
- 기대값 명시: js/ 모듈 7개, 파일 타입 분류 수, 테스트 수 73(=23+50)
- 배치 가이드: CLAUDE.md + README.md + test/README.md 병렬 Read → test 파일 Read → Glob 1~2회 → 완료
- CLAUDE.md 수치 교차 검증: 테스트 수 기대값(73) + package.json 스크립트 참조

## B. 디자인 검증 (design.md ↔ CSS)

**Tier 1** (1 에이전트, ~15K): CSS 변수 개수 + 주요 색상값 샘플 체크
- 카운트 규칙: **고유 변수명 기준** (`:root`와 `[data-theme="dark"]`에 중복 정의 시 1개로 계산)
- design.md: 다크모드 비교 테이블 포함 모든 `--` 변수 행 카운트
- 기대값: 고유 42개

**Tier 2** (1 에이전트, Sonnet, ~42K): design.md ↔ style.css + index.html 전수 비교 (old-A4 + old-B 병합, ADR-024)
- 검증 1: design.md가 실제 디자인을 정확히 기술하는지 (old-A4)
- 검증 2: 변수값 + 컴포넌트 + 반응형 + 애니메이션 전수 비교 (old-B)
- **Bash 금지**: Read + Grep만 사용
- **배치 가이드**: design.md + style.css + index.html 병렬 Read(3회) → Grep으로 교차 검증 → 완료
- **기대값 명시**: CSS 변수 고유 42개, :root 42개, dark 오버라이드 19개, keyframes 4개, 브레이크포인트 480px

## C. 구현 검증 (spec.md ↔ 실제 동작)

**Tier 1** (1 에이전트, ~20K): 핵심 함수 존재 확인 (Grep `js/`) + ARIA 속성 존재 확인 (index.html)

**Tier 2**: A2에 통합 (ADR-024). A2가 spec.md ↔ 소스코드 양방향 검증(문서 정확성 + 구현 준수 + ARIA/접근성) 수행.

> Supabase API 흐름 검증은 별도 검토 시 추가 예정

## D. 테스트 검증 (test/README.md ↔ 실제 테스트)

**Tier 1** (1 에이전트, ~15K): `npm test` 실행 → 23 CLI pass + 50 DOM pass, 0 fail 확인

**Tier 2** (1 에이전트, Sonnet, ~78K): CLI + DOM/UI 테스트 통합 검증 (old-D1 + old-D2 병합, ADR-024)

| 검증 항목 | 비교 소스 |
|----------|----------|
| CLI 테스트 항목/수 + 함수 커버리지 | test-logic.js, js/app.js, Grep(`js/`) |
| DOM/UI 테스트 항목/수 | test.html, test-dom.js |

> app.js의 module.exports로 export된 함수 목록 + Grep(`js/`)로 전체 함수 목록 비교하여 커버리지 판단

---

## 에이전트 프롬프트 품질 규칙

- **카운트 검증**: 기대값 + 카운트 규칙을 프롬프트에 명시
- **재위임 금지**: "Task 도구로 서브에이전트 재생성 금지" 명시 필수
- **임시 파일 RAII**: "생성한 파일 목록 추적 → 종료 전 삭제" 명시 필수
- **Bash 명령어 보고**: 프롬프트 끝에 "사용한 Bash 명령어 목록 출력" 지시
- **교차 검증 위임**: 에이전트 간 중복 파일 읽기 → 이미 읽는 에이전트에 검증 위임 (ADR-022)
- **기대값 프롬프트 삽입**: 탐색 대신 대조만 수행하도록 기대값을 프롬프트에 포함 → Tool 호출 대폭 감소
- **Bash 금지 규칙**: CSS/문서 비교 에이전트에 "Bash 사용 금지, Read+Grep만 사용" 명시 필수 (ADR-023)

## Permission 관리

- settings.local.json 위치: `.claude/settings.local.json`
- 서브 에이전트 Bash 실행 시 권한 프롬프트 → 사용자 대기 시간 발생
- 에이전트 사용 명령어 사전 파악 → settings에 선제 등록으로 지연 방지
- 현재 등록 패턴: git, npm, node, ls, dir, find, findstr, grep, cat, echo, diff, wc, sed, rm, cd, where, start, powershell, python, Get-ChildItem, Sort-Object, Select-String, awk, sort, head, tail
