# check-deps — 의존성 자동 체크 스크립트

## 목적

`npm install` 없이 `npm test`/`npm run verify` 실행 시 MODULE_NOT_FOUND 에러가 발생하는 문제를 사전 감지하여 명확한 안내 메시지를 출력한다.

## 요구사항

- `package.json`의 `devDependencies`를 동적으로 읽어 설치 여부 확인
- 미설치 패키지 존재 시 stderr에 MISSING 목록 + "npm install 실행" 안내 → exit 1
- 전부 설치됨: stderr 성공 메시지 → exit 0
- npm lifecycle hook(pretest, preverify)으로 자동 실행

## 구현 범위

### 포함
- `scripts/check-deps.js` 신규 생성
- `package.json` scripts 섹션에 check-deps, pretest, preverify 추가
- README.md 파일 트리 업데이트

### 제외
- 기존 모듈(lottery.js, history.js 등) 변경 없음
- 테스트 코드 변경 없음

## 수정 대상 모듈

| 모듈 | 변경 유형 | 비고 |
|------|-----------|------|
| `scripts/check-deps.js` | 신규 | 의존성 체크 스크립트 |
| `package.json` | 수정 | scripts 섹션 |
| `README.md` | 수정 | 파일 트리 항목 추가 |

## 의존성

- 선행 workspace: 없음

## 설계 방향

- 기존 스크립트 패턴 준수 (`node:` 접두어, 동기 API, function 키워드, 2 spaces)
- `require.resolve(name, { paths: [ROOT] })`로 설치 여부 체크
- 하드코딩 없이 `devDependencies` 동적 파싱
