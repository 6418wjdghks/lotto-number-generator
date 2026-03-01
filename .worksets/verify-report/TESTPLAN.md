# verify-report — Test Plan

## 검증 항목

- [ ] verify-report.js: 샘플 JSON → HTML 생성 정상
- [ ] HTML 렌더링: 헤더/요약/Tier별 테이블/종합결론 표시
- [ ] FAIL 케이스: mismatches 상세 테이블 렌더링
- [ ] SKIPPED 케이스: 회색 뱃지 표시
- [ ] Playwright PDF 변환 가능 여부
- [ ] 에이전트 프롬프트: JSON 출력 블록 문법 정확성

## 테스트 방법

### 1. HTML 생성 (bb_test)
```
# 수동 샘플 JSON 작성 → 실행
node scripts/verify-report.js --input temp/verify-results.json
# temp/verify-report-temp.html 생성 확인
```

### 2. HTML 렌더링 확인 (func_verify)
- Playwright MCP로 HTML 열기 → 스크린샷 확인
- 각 섹션(헤더, 요약, Tier 0/1/2, 결론) 시각 확인

### 3. PDF 변환 (func_verify)
- `browser_run_code` → `page.pdf()` 실행
- PDF 파일 생성 확인

### 4. 에이전트 JSON 출력 (bb_test)
- `/verify A1` 단일 에이전트 실행 → JSON 블록 파싱 가능 확인

## 결과

| 항목 | 상태 | 비고 |
|------|------|------|
| HTML 생성 | | |
| HTML 렌더링 | | |
| PDF 변환 | | |
| 에이전트 JSON | | |
