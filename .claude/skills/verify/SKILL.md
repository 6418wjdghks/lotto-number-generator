---
name: verify
description: 정밀 검증(Tier 0+1+2) 자동 오케스트레이션. 5개 서브에이전트로 문서↔소스코드 전수 비교.
disable-model-invocation: true
argument-hint: "[all | A1 A2 A3 B D]"
---

# 정밀 검증 오케스트레이션

Tier 0(스크립트) + Tier 1(테스트) + Tier 2(서브에이전트)를 자동 실행한다.

## 인자 처리

`$ARGUMENTS` 값으로 실행할 에이전트를 결정:

- 비어있거나 `all` → A1, A2, A3, B, D 전체
- 에이전트 이름 나열 → 해당만 실행 (예: `A1 B`)
- 유효 이름: `A1`, `A2`, `A3`, `B`, `D` (대소문자 무시)

## Step 1: Tier 0 + Tier 1

순차 실행:

1. `npm run verify` — stdout JSON 캡처, `summary.allPassed` 확인
2. `npm test` — 전체 PASS 여부 확인

Tier 0 JSON 출력을 보관한다 (Step 2에서 에이전트에 주입).

## Step 2: 에이전트 프롬프트 로드 + Tier 2 생성

각 에이전트의 프롬프트는 `docs/verification.md`에 `<agent-prompt id="X">` 태그로 내장되어 있다.
유효 ID: `A1`, `A2`, `A3`, `B`, `D`

절차 (에이전트별 반복):
1. `Grep("<agent-prompt id=\"X\">", path="docs/verification.md")` → 시작 줄 번호 획득
2. `Grep("</agent-prompt>", path="docs/verification.md")` 결과에서 시작 줄 이후 첫 매치 → 종료 줄 번호 획득
3. `Read(path="docs/verification.md", offset=시작줄+1, limit=종료줄-시작줄-1)` → 프롬프트 본문 추출
4. 본문 내 `{{TIER0_RESULT}}`를 Step 1의 Tier 0 JSON으로 치환한다
5. 치환된 본문을 `Task(subagent_type="general-purpose", model="sonnet", run_in_background=true)`의 prompt로 전달한다
6. **선택된 에이전트를 모두 한 번에 병렬 생성**한다

## Step 3: 결과 취합

모든 에이전트 완료 후:

1. 각 에이전트 반환값(불일치 목록)을 수집
2. 결과 보고:

| Tier | 에이전트 | 결과 | 비고 |
|------|---------|------|------|
| 0 | verify.js | PASS/FAIL | 상세 |
| 1 | npm test | PASS/FAIL | 상세 |
| 2 | A1~D | ALL PASS / Warning N건 | 불일치 요약 |

3. 불일치 있으면 수정 제안도 제시

## Step 4: verification.md 업데이트

`docs/verification.md` 하단 "정밀 검증 결과" 섹션을 현재 세션 결과로 갱신:

1. `git log --oneline -1`로 커밋 해시 획득
2. 헤더: `> 마지막 검증: {날짜} ({해시}) — {결과 요약}`
3. 검증 항목 테이블 + 성능 지표 테이블 갱신
4. **미실행 에이전트는 `—`으로 표기**, 이전 값 유지 금지

업데이트 후 사용자에게 결과 보고 + 커밋 여부 확인.
