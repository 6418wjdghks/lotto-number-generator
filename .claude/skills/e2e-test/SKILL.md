---
name: e2e-test
description: 반응형 E2E 테스트 실행 + PDF 리포트 자동 생성
disable-model-invocation: true
argument-hint: "[--quick] [--report-only]"
---

# 반응형 E2E 테스트 오케스트레이션

Playwright MCP 기반 반응형 E2E 테스트를 자동 실행하고 PDF 리포트를 생성한다.

## 인자 처리

`$ARGUMENTS` 값으로 실행 범위를 결정:

- 비어있음 → 전체 63항목 실행 + PDF 생성
- `--quick` → 핵심 ~15항목만 실행 + PDF 생성
- `--report-only` → 기존 `temp/e2e-results.json`으로 리포트만 재생성 (Step 4부터)

---

## Step 0 — 환경 준비

1. **서버 확인**: `Bash("curl -s -o /dev/null -w '%{http_code}' http://localhost:8080")`
   - 200이 아니면: "서버가 실행 중이지 않습니다. `npm run serve`를 먼저 실행해주세요." 출력 후 **중단**
2. **스크린샷 디렉토리 초기화**: `Bash("rm -f temp/screenshots/*.png && mkdir -p temp/screenshots")`
3. **테스트 정의서 읽기**: `Read("test/e2e-responsive.md")` → 전체 항목 파악

`--report-only`이면 Step 0의 서버 확인만 수행하고 **Step 4로 건너뛴다**.

---

## Step 1 — 프롬프트 구성

`test/e2e-responsive.md`에서 `<agent-prompt>` 태그를 추출한다.

### 추출 절차 (에이전트 프롬프트별)

1. `Grep("<agent-prompt id=\"{ID}\">", path="test/e2e-responsive.md")` → 시작 줄
2. `Grep("</agent-prompt>", path="test/e2e-responsive.md")` → 시작 줄 이후 첫 매치 = 종료 줄
3. `Read(path="test/e2e-responsive.md", offset=시작줄+1, limit=종료줄-시작줄-1)` → 본문

### 플레이스홀더 치환

| 플레이스홀더 | 값 |
|-------------|-----|
| `{{TEST_ITEMS}}` | 해당 그룹의 항목 테이블 (마크다운 그대로) |
| `{{VIEWPORT}}` | B그룹 뷰포트 `{ "width": N, "height": N }` |
| `{{GROUP_ID}}` | 그룹 식별자 (A, B1, B2, ..., C) |
| `{{SCREENSHOT_DIR}}` | `temp/screenshots` 절대 경로 |
| `{{PRECONDITIONS}}` | 전제 조건 섹션 내용 |

### Quick 모드

`--quick`이면 "Quick 모드 항목" 섹션에서 선별된 항목 ID만 추출:
- 기능: A1, A2, A5, A8, A9, A15, A26
- 뷰포트: B1-1, B1-8, B2-1, B4-1, B5-5, B6-5
- 교차: C1, C2

해당 ID에 맞는 항목만 `{{TEST_ITEMS}}`에 포함한다.

---

## Step 2 — 서브에이전트 순차 실행

**중요**: Playwright 단일 세션 공유 → 반드시 `run_in_background=false`로 순차 실행.

### 전체 모드 (5개 에이전트)

| 순서 | 에이전트 | 프롬프트 ID | 항목 |
|------|---------|------------|------|
| 1 | 기능 테스트 | `e2e-functional` | A1~A27 (27항목) |
| 2 | 모바일 뷰포트 | `e2e-viewport` | B1 (320x568) + B2 (375x667) = 15항목 |
| 3 | 경계값 뷰포트 | `e2e-viewport` | B3 (480x800) + B4 (481x800) = 9항목 |
| 4 | 데스크톱 뷰포트 | `e2e-viewport` | B5 (768x1024) + B6 (1920x1080) = 10항목 |
| 5 | 교차 테스트 | `e2e-cross` | C1~C2 (2항목) |

### Quick 모드 (2개 에이전트)

| 순서 | 에이전트 | 항목 |
|------|---------|------|
| 1 | 기능 | A1, A2, A5, A8, A9, A15, A26 (7항목) |
| 2 | 뷰포트 + 교차 | B1-1, B1-8, B2-1, B4-1, B5-5, B6-5, C1, C2 (8항목) |

### 에이전트 실행

각 에이전트는 다음과 같이 생성:

```
Agent(
  subagent_type="general-purpose",
  model="sonnet",
  run_in_background=false,
  prompt=<치환된 프롬프트>
)
```

에이전트당 최대 20항목. 초과 시 분할한다.

---

## Step 3 — 결과 취합

1. 각 에이전트 반환값에서 ` ```json ` 블록을 파싱
2. 모든 그룹 결과를 병합하여 `temp/e2e-results.json` 저장:

```json
{
  "meta": { "date": "YYYY-MM-DD", "mode": "full|quick", "screenshotDir": "temp/screenshots/" },
  "groups": [ ... ],
  "overall": { "total": N, "pass": N, "fail": N }
}
```

3. 결과 요약 테이블 출력:

| 그룹 | 항목 수 | PASS | FAIL |
|------|---------|------|------|
| ... | ... | ... | ... |
| **합계** | **N** | **N** | **N** |

---

## Step 4 — PDF 리포트 생성

`--report-only` 시 이 단계부터 시작.

1. `Bash("node scripts/e2e-report.js --html-only")` → `temp/e2e-report-temp.html` 생성
2. Playwright MCP로 HTML 열기:
   ```
   mcp__playwright__browser_navigate(url="http://localhost:8080/temp/e2e-report-temp.html")
   ```
3. PDF 생성:
   ```
   mcp__playwright__browser_run_code(code=`async (page) => {
     await page.pdf({
       path: 'temp/e2e-test-report.pdf',
       format: 'A4',
       printBackground: true,
       margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' }
     });
     return 'PDF saved';
   }`)
   ```
4. 임시 HTML 삭제: `Bash("rm -f temp/e2e-report-temp.html")`

---

## Step 5 — 보고

결과 요약 출력:

```
## E2E 반응형 테스트 완료

- 모드: full / quick
- 결과: PASS N / FAIL N (전체 N항목)
- PDF: temp/e2e-test-report.pdf
- 스크린샷: temp/screenshots/ (N개)
```

사용자에게 커밋 여부를 확인한다.
