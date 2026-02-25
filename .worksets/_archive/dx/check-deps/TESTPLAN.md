# check-deps — Test Plan

## 검증 항목

- [x] node_modules 없는 상태에서 `npm test` → MISSING 에러 + 안내 메시지
- [x] node_modules 없는 상태에서 `npm run verify` → MISSING 에러 + 안내 메시지
- [x] `npm install` 후 `npm test` → 정상 실행
- [x] `npm install` 후 `npm run verify` → 정상 실행
- [x] `node scripts/check-deps.js` 단독 실행 → 올바른 exit code

## 테스트 방법

1. `node_modules` 디렉토리 삭제 (또는 이름 변경)
2. `npm test` 실행 → stderr에 MISSING 목록 출력 확인
3. `npm install` 실행
4. `npm test` 실행 → 정상 통과 확인

## 결과

| 항목 | 상태 | 비고 |
|------|------|------|
| node_modules 없음 + check-deps.js | PASS | MISSING: puppeteer-core, exit 1 |
| node_modules 있음 + check-deps.js | PASS | 모든 의존성 확인 완료 (1개), exit 0 |
| npm install 후 npm test | PASS | pretest hook 실행 + 23 CLI + 72 DOM 통과 |
| npm install 후 npm run verify | PASS | preverify hook 실행 + verify.js 정상 |
