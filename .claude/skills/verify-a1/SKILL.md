---
name: verify-a1
description: "정밀 검증 A1: tech.md ↔ 소스코드 교차 검증. /verify에서 자동 호출되며, 단독 실행도 가능."
disable-model-invocation: true
---

# A1: tech.md ↔ 소스코드 교차 검증

## 역할

docs/tech.md가 실제 소스코드를 정확히 기술하는지 전수 비교한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다.

## 검증 항목

### 1. 함수 목록 교차 비교

- CLAUDE.md 모듈 구조 테이블에서 모듈 목록 추출.
- tech.md JavaScript API 섹션에서 모듈별 함수 목록 추출.
- 각 모듈의 실제 소스(js/*.js)를 Read하여 실제 함수와 대조.
- CLAUDE.md ↔ tech.md ↔ 실제 소스 3중 교차 비교로 누락/추가 발견.

### 2. CSS 파일 구성 트리

- tech.md CSS 파일 구성 트리와 css/style.css 섹션 주석(`/* ... */`) 비교.

### 3. HTML ID 네이밍 규칙

- tech.md HTML ID 네이밍 규칙 테이블과 index.html 실제 ID 비교.

## 비교 소스

- docs/tech.md
- CLAUDE.md (모듈 구조 테이블)
- js/config.js, js/utils.js, js/theme.js, js/exclude.js, js/lottery.js, js/history.js, js/auth.js, js/app.js, js/supabase-config.js
- css/style.css
- index.html

## 배치 가이드

1. CLAUDE.md + docs/tech.md 병렬 Read (2회)
2. js/ 9개 .js 파일 병렬 Read (가능한 만큼 병렬화)
3. css/style.css + index.html 병렬 Read (2회)
4. 모델 내 교차 비교

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [파일:줄] 설명
2. ...

사용한 Bash 명령어: (없음 또는 목록)
