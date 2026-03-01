---
name: verify
description: strong_verify(Tier 0+1+2) 파라미터 기반 오케스트레이션
disable-model-invocation: true
argument-hint: "[all | A1 A2 A3 B D | report]"
---

# strong_verify 오케스트레이션

## Parameters

| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| `AgentType` | enum | `parallel`, `sequential` | `parallel` |
| `reportMode` | bool | `true`, `false` | `false` |
| `agents` | list | subset of `[A1, A2, A3, B, D]` | all 5 |

## Argument Parsing

`$ARGUMENTS`를 공백 분리 → 소문자 변환 → 아래 순서로 처리:

1. **`report` 토큰 추출**: 토큰에 `report` 포함 → `reportMode=true`, `AgentType=sequential`. 토큰에서 `report` 제거.
2. **`report` 미포함**: `reportMode=false`, `AgentType=parallel`.
3. **에이전트 필터링**: 남은 토큰 중 유효 이름(`A1`,`A2`,`A3`,`B`,`D`)만 수집 → `agents`. 무효 토큰은 무시.
4. **`all` 또는 빈 목록**: 남은 토큰이 `all`이거나 `agents`가 빈 목록 → `agents=[A1,A2,A3,B,D]`.

**예시**:

| `$ARGUMENTS` | `AgentType` | `reportMode` | `agents` |
|--------------|-------------|--------------|----------|
| (빈값) | `parallel` | `false` | all 5 |
| `all` | `parallel` | `false` | all 5 |
| `A1 B` | `parallel` | `false` | `[A1, B]` |
| `report` | `sequential` | `true` | all 5 |
| `report A1 B` | `sequential` | `true` | `[A1, B]` |
| `A1 xyz B` | `parallel` | `false` | `[A1, B]` (xyz 무시) |

---

## Step 1: Tier 0 + Tier 1

1. `npm run verify` → stdout JSON 캡처, `summary.allPassed` 확인
2. `npm test` → 전체 PASS 확인, 테스트 수 파싱

결과 변수:

| 변수 | 형식 | 사용처 |
|------|------|--------|
| `tier0Result` | `npm run verify` stdout JSON 전체 | Step 2: `{{TIER0_RESULT}}` 치환, Step 3: T0 그룹 조립 |
| `tier1Result` | `{ cli: { passed: N, total: N }, dom: { passed: N, total: N } }` | Step 3: T1 그룹 조립 |

## Step 2: Tier 2 디스패치

### 프롬프트 로드 (공통)

소스: `docs/verification.md` → `<agent-prompt id="{ID}">` 태그

1. `Grep("<agent-prompt id=\"{ID}\">", path="docs/verification.md")` → 시작 줄
2. `Grep("</agent-prompt>", path="docs/verification.md")` → 결과 중 **줄 번호 > 시작줄**인 첫 번째 매치 = 종료 줄
3. `Read(path="docs/verification.md", offset=시작줄+1, limit=종료줄-시작줄-1)` → 본문
4. `{{TIER0_RESULT}}` → `tier0Result`로 치환

### 디스패치

| `AgentType` | Prompt ID | 실행 방식 |
|-------------|-----------|----------|
| `parallel` | `agents` 각각 (`A1`, `A2`, …) | `Agent(subagent_type="general-purpose", model="sonnet", run_in_background=true)` — **전체 한 번에 병렬 생성** |
| `sequential` | `agents` 각각 (`A1`, `A2`, …) | 메인 에이전트가 각 프롬프트를 **순차 로드 → 직접 수행** |

### `sequential` 모드 규칙

| 규칙 | 설명 |
|------|------|
| **파일 재 Read 금지** | 이전 프롬프트에서 이미 Read한 파일은 컨텍스트에 유지된다. 동일 파일을 다시 Read하지 않는다. |
| **서브에이전트 전용 규칙 무시** | 프롬프트 내 "재위임 금지", "임시 파일 RAII"는 서브에이전트 전용이므로 무시한다. |

출력: 에이전트별 JSON 블록 `{ agent, status, mismatchCount, mismatches, detail }`

## Step 3: 결과 JSON 조립

### 3-1. JSON 수집

| `AgentType` | 수집 방식 |
|-------------|----------|
| `parallel` | 서브에이전트 반환값에서 `` ```json `` 블록 파싱. 아래 fallback 참조 |

**`parallel` fallback** — `` ```json `` 블록이 반환값에 **존재하지 않을 때** 발동:

| 조건 (contains, 대소문자 무시) | 판정 |
|-------------------------------|------|
| 반환값에 `"ALL PASS"` 포함 | `status: "pass"` |
| 반환값에 `"불일치"` 포함 | `status: "fail"` |
| 위 어디에도 해당 안 됨 | `status: "fail"`, `detail: "파싱 실패"` |
| `sequential` | Step 2에서 직접 생성한 JSON 블록 사용 |

### 3-2. 조립 (`temp/verify-results.json`)

```json
{
  "meta": { "date": "YYYY-MM-DD", "type": "verify", "commitHash": "<git log --oneline -1>", "agents": ["A1","A2","A3","B","D"] },
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

조립 규칙:
- **T0**: `tier0Result.checks[]` → `T0-01`~, name=체크명, status/detail 매핑
- **T1**: `tier1Result` → `T1-CLI`(cli), `T1-DOM`(dom). detail=`"{passed}/{total}"`
- **T2**: 에이전트당 1항목 (ID = 에이전트명). 미실행 → `status: "skipped"`
- **overall**: 전체 pass/fail/total 합산

### 3-3. 결과 보고

| Tier | 에이전트 | 결과 | 비고 |
|------|---------|------|------|
| 0 | verify.js | PASS/FAIL | 상세 |
| 1 | npm test | PASS/FAIL | 상세 |
| 2 | A1~D | ALL PASS / 불일치 N건 | 불일치 요약 |

불일치 있으면 항목별로 수정 대상(코드 or 문서)과 위치(파일:줄)를 1줄 이내로 제시.

## Step 4: PDF 리포트

> **조건**: `reportMode=true`일 때만 실행. `reportMode=false`이면 건너뛴다.

1. `Bash("node scripts/verify-report.js --html-only")` → `temp/verify-report-temp.html`
2. `browser_navigate({ url: "file:///{CWD}/temp/verify-report-temp.html" })` — `{CWD}`는 에이전트가 알고 있는 작업 디렉토리. 경로 구분자는 `/` 사용 (예: `file:///C:/Users/.../temp/...`)
3. `browser_run_code`:
   ```js
   async (page) => {
     await page.pdf({ path: 'temp/verify-report.pdf', format: 'A4', printBackground: true });
     return 'PDF saved';
   }
   ```
4. 브라우저 페이지 닫기
5. `Bash("rm temp/verify-report-temp.html")`

## Step 5: verification.md 갱신

`docs/verification.md` 하단 "strong_verify 결과" 섹션 갱신:

1. 헤더: `> 마지막 verify: {날짜} ({해시}) — {결과 요약}`
2. 체크 항목 테이블 + 성능 지표 테이블
3. 미실행 에이전트는 `—` 표기 (이전 값 유지 금지)

## Step 6: 보고

1. 결과 요약 테이블 (Tier 0/1/2)
2. `reportMode=true` → PDF 경로 안내 (`temp/verify-report.pdf`)
3. 불일치 항목 상세 (있는 경우)
4. 커밋 여부 확인
