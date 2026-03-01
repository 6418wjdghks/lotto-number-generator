# verify-report

## 목적

`/verify` strong_verify 결과를 구조화된 JSON → HTML → PDF 리포트 파이프라인으로 생성한다.

## 요구사항

- Tier 0(14항목) + Tier 1(npm test) + Tier 2(5에이전트) 결과를 단일 JSON으로 통합
- JSON → HTML 보고서 생성 스크립트 (`scripts/verify-report.js`)
- SKILL.md가 Playwright MCP로 HTML → PDF 변환
- 에이전트 프롬프트에 JSON 출력 블록 추가 (기존 텍스트 출력 유지)

## 구현 범위

### 포함
- `scripts/verify-report.js` 신규 작성
- `docs/verification.md` 에이전트 프롬프트 수정 (5개)
- `.claude/skills/verify/SKILL.md` Step 확장
- `package.json` verify:report 스크립트 추가

### 제외
- verify.js (Tier 0 스크립트) 자체 수정
- 테스트 코드 변경
- E2E 보고서 스크립트 수정

## 수정 대상 모듈

| 모듈 | 변경 유형 | 비고 |
|------|-----------|------|
| scripts/verify-report.js | 신규 | JSON → HTML 보고서 생성 |
| docs/verification.md | 수정 | 에이전트 프롬프트 JSON 출력 블록 추가 |
| .claude/skills/verify/SKILL.md | 수정 | 4-Step → 6-Step 확장 |
| package.json | 수정 | verify:report 스크립트 추가 |

## 의존성

- 선행 workspace: 없음
- e2e-report.js 패턴 참조 (코드 공유 없음, 독립 작성)

## 설계 방향

- e2e-report.js 레이아웃/스타일 재현 (일관된 보고서 UX)
- 소량 헬퍼(statusBadge, escapeHtml) 중복 허용 (의존성 없는 독립 스크립트)
- Tier 2 FAIL 시 mismatches 상세 테이블 추가
- SKIPPED 상태 회색 뱃지 지원
