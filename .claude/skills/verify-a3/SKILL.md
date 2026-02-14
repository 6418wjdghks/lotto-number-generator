---
name: verify-a3
description: "정밀 검증 A3: CLAUDE.md + README.md + test/README.md ↔ 실제 구조 교차 검증. /verify에서 자동 호출되며, 단독 실행도 가능."
disable-model-invocation: true
---

# A3: CLAUDE.md + README.md + test/README.md ↔ 실제 구조 교차 검증

## 역할

프로젝트 메타 문서가 실제 프로젝트 구조와 일치하는지 확인한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다.

## 검증 항목 (행위 기반 3단계)

### 단계 1: CLAUDE.md 모듈 구조 검증

- CLAUDE.md 모듈 구조 테이블에서 모듈 수와 각 모듈명을 추출.
- **supabase-config.js는 설정 파일이며 모듈 아님** (CLAUDE.md 모듈 테이블 기준).

### 단계 2: README.md 파일 구조 검증

- README.md 파일 구조 트리 읽기 → Glob으로 실제 파일 존재 여부 대조.

### 단계 3: test/README.md 수치 교차 확인

- test/README.md에서 테스트 수(CLI, DOM) 읽기.
- CLAUDE.md 수치와 교차 확인.
- **DOM 테스트 카운트 규칙**: 고유 테스트 케이스 수 기준. 각 케이스는 PASS/FAIL 두 분기를 가지므로 한쪽만 카운트. 양쪽 합산 시 2배가 되므로 주의. log() 전체 카운트 금지.

## 비교 소스

- CLAUDE.md (모듈 구조 테이블, 비API 섹션)
- README.md (파일 구조 트리)
- test/README.md (테스트 수)
- package.json (스크립트 참조)
- Glob (실제 파일 존재 확인)

## 배치 가이드

1. CLAUDE.md + README.md + test/README.md 병렬 Read (3회)
2. package.json Read (1회)
3. Glob으로 실제 파일 존재 확인 (1~2회)
4. 완료. 최소 Tool로 수행.

## 금지 패턴

1. test-dom.js, test.html 직접 Read하여 독자 카운트 금지 — D 에이전트 담당.
2. js/ Grep으로 함수 카운트 금지 — A1 에이전트 담당.
3. 불필요 Grep 탐색 금지 — 문서에서 추출한 값으로 대조만 수행.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [단계1/2/3] 설명
2. ...

사용한 Bash 명령어: (목록)
