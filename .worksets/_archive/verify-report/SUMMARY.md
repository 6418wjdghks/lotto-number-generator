# verify-report: /verify 리포트 파이프라인

> 아카이브 일자: 2026-03-01. 기간: 2026-03-01 ~ 2026-03-01.

## 요약

`/verify` strong_verify 결과를 JSON → HTML → PDF 리포트로 생성하는 파이프라인 구현. 이후 파라미터 기반 구조로 리팩터링하여 parallel/sequential 두 모드를 단일 SKILL.md로 통합.

## 주요 성과

- `scripts/verify-report.js` — JSON → HTML 보고서 생성 (성능 지표 섹션 포함)
- `SKILL.md` — 6-Step 오케스트레이션, AgentType(parallel/sequential) 파라미터 기반 디스패치
- `/verify report` — sequential 모드 (단일 에이전트 순차 체크 + PDF 생성)
- 에이전트 프롬프트(A1~D)에 JSON 출력 블록 추가
- Opus 서브에이전트 determinism 검증 → 15건 중 13건 수정

## 결정사항

- e2e-report.js 패턴 독립 작성, 헬퍼 중복 허용
- AgentType(parallel/sequential) 파라미터 기반 구조
- SOLO 프롬프트 불필요 — 개별 프롬프트(A1~D) 재사용
- sequential 모드 에이전트별 시간 측정 (`date +%s`)
