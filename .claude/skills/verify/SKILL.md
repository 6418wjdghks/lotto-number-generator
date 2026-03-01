---
name: verify
description: strong_verify(Tier 0+1+2) 자동 오케스트레이션. 5개 서브에이전트로 문서↔소스코드 전수 비교.
disable-model-invocation: true
argument-hint: "[all | A1 A2 A3 B D]"
---

# strong_verify 오케스트레이션

Tier 0(스크립트) + Tier 1(테스트) + Tier 2(서브에이전트)를 자동 실행한다.

## 인자 처리

`$ARGUMENTS` 값으로 실행할 에이전트를 결정:

- 비어있거나 `all` → A1, A2, A3, B, D 전체
- 에이전트 이름 나열 → 해당만 실행 (예: `A1 B`)
- 유효 이름: `A1`, `A2`, `A3`, `B`, `D` (대소문자 무시)

## Step 1: Tier 0 + Tier 1

순차 실행:

1. `npm run verify` — stdout JSON 캡처, `summary.allPassed` 확인
2. `npm test` — 전체 PASS 여부 확인. stdout에서 테스트 수 파싱 (예: "23 tests passed", "72 tests passed")

Tier 0 JSON 출력과 Tier 1 결과를 보관한다.

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

## Step 3: 결과 취합 + JSON 저장

모든 에이전트 완료 후:

1. 각 에이전트 반환값을 수집
2. **JSON 파싱**: 각 에이전트 반환값에서 ` ```json ` 블록을 찾아 파싱
   - fallback: JSON 블록 미발견 시 텍스트에서 `"ALL PASS"` → `status: "pass"` / `"불일치: N건"` → `status: "fail"` 파싱
3. **결과 JSON 조립** (`temp/verify-results.json`):

```json
{
  "meta": { "date": "YYYY-MM-DD", "type": "verify", "commitHash": "abc1234", "agents": ["A1","A2","A3","B","D"] },
  "groups": [
    {
      "group": "T0", "groupName": "Tier 0 — 스크립트 체크",
      "items": [{ "id": "T0-01", "name": "항목명", "status": "pass", "detail": "상세" }],
      "summary": { "total": 14, "pass": 14, "fail": 0 }
    },
    {
      "group": "T1", "groupName": "Tier 1 — npm test",
      "items": [
        { "id": "T1-CLI", "name": "test:logic", "status": "pass", "detail": "23/23" },
        { "id": "T1-DOM", "name": "test:dom", "status": "pass", "detail": "72/72" }
      ],
      "summary": { "total": 2, "pass": 2, "fail": 0 }
    },
    {
      "group": "T2-XX", "groupName": "Tier 2 — XX (설명)",
      "items": [{ "id": "XX", "name": "에이전트명", "status": "pass|fail|skipped", "detail": "요약", "mismatches": [] }],
      "summary": { "total": 1, "pass": 1, "fail": 0 }
    }
  ],
  "overall": { "total": 21, "pass": 21, "fail": 0 }
}
```

조립 로직:
- **Tier 0**: `npm run verify` stdout의 `checks[]` 배열 → ID는 `T0-01`~`T0-14`, name은 체크명, status/detail 매핑
- **Tier 1**: `npm test` 결과 → `T1-CLI`(test:logic), `T1-DOM`(test:dom) 2개 항목
- **Tier 2**: 에이전트당 1개 항목 (ID = 에이전트명). 미실행 에이전트는 `status: "skipped"`
- **overall**: 전체 그룹의 pass/fail/total 합산

4. `git log --oneline -1`로 커밋 해시 획득 → `meta.commitHash`에 저장
5. `temp/verify-results.json` 파일로 저장

6. 결과 보고:

| Tier | 에이전트 | 결과 | 비고 |
|------|---------|------|------|
| 0 | verify.js | PASS/FAIL | 상세 |
| 1 | npm test | PASS/FAIL | 상세 |
| 2 | A1~D | ALL PASS / Warning N건 | 불일치 요약 |

7. 불일치 있으면 수정 제안도 제시

## Step 4: PDF 리포트 생성

1. `Bash("node scripts/verify-report.js --html-only")` → `temp/verify-report-temp.html` 생성
2. Playwright MCP로 HTML 열기: `browser_navigate({ url: "file:///절대경로/temp/verify-report-temp.html" })`
3. `browser_run_code`로 PDF 생성:
   ```js
   async (page) => {
     await page.pdf({ path: 'temp/verify-report.pdf', format: 'A4', printBackground: true });
     return 'PDF saved';
   }
   ```
4. 브라우저 페이지 닫기
5. 임시 HTML 삭제: `Bash("rm temp/verify-report-temp.html")`

## Step 5: verification.md 업데이트

`docs/verification.md` 하단 "strong_verify 결과" 섹션을 현재 세션 결과로 갱신:

1. 헤더: `> 마지막 verify: {날짜} ({해시}) — {결과 요약}`
2. 체크 항목 테이블 + 성능 지표 테이블 갱신
3. **미실행 에이전트는 `—`으로 표기**, 이전 값 유지 금지

## Step 6: 보고

사용자에게 최종 보고:

1. 결과 요약 테이블 (Tier 0/1/2 각각)
2. PDF 리포트 경로: `temp/verify-report.pdf`
3. 불일치 항목 상세 (있는 경우)
4. 커밋 여부 확인
