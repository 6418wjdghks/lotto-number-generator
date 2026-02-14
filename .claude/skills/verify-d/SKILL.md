---
name: verify-d
description: "정밀 검증 D: test/README.md ↔ 테스트 코드 통합 검증. /verify에서 자동 호출되며, 단독 실행도 가능."
disable-model-invocation: true
---

# D: test/README.md ↔ 테스트 코드 통합 검증

## 역할

test/README.md가 실제 테스트 코드(CLI + DOM/UI)를 정확히 기술하는지 전수 비교한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다.

## 검증 항목

### 1. CLI 테스트 검증

- test/README.md CLI 테스트 항목/수 ↔ test/test-logic.js 실제 it() 블록 비교.
- 테스트 그룹명, 항목 수 일치 확인.

### 2. DOM/UI 테스트 검증

- test/README.md DOM/UI 테스트 항목/수 ↔ test/test-dom.js + test/test.html 비교.
- 테스트 그룹명, 검증 수 일치 확인.

### 3. 함수 커버리지 검증

- js/app.js module.exports에서 export 함수 목록 추출.
- Grep으로 js/ 전체 함수 목록 확인.
- test/README.md 함수 커버리지 섹션과 대조.

## 비교 소스

- test/README.md
- test/test-logic.js
- test/test-dom.js
- test/test.html
- js/app.js
- Grep(js/) 함수 목록

## 배치 가이드 (총 Tool 7회 이하)

1. test/README.md + test/test-logic.js + test/test-dom.js 병렬 Read (3회)
2. test/test.html + js/app.js 병렬 Read (2회)
3. Grep(`^(async )?function`, path: `js/`) 함수 목록 확인 (1회)
4. 모델 내 교차 비교 → 완료

## 금지 패턴

1. js/*.js 개별 Read 금지 — 함수 목록은 Grep 1회로 충족.
2. 추가 Glob 금지 — 파일 경로는 위에 고정.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [CLI/DOM/커버리지] 설명
2. ...

사용한 Bash 명령어: (목록)
