---
name: verify-a2
description: "정밀 검증 A2: spec.md ↔ 소스코드 양방향 검증. /verify에서 자동 호출되며, 단독 실행도 가능."
disable-model-invocation: true
---

# A2: spec.md ↔ 소스코드 양방향 검증

## 역할

두 방향으로 검증한다:
1. spec.md가 소스를 정확히 기술하는지 (문서 정확성)
2. 소스가 F-001~F-008 요구사항을 구현하는지 (구현 준수)

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- **Bash 사용 금지**: Read + Grep 도구만 사용한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다 (없어야 정상).

## 검증 항목

### 검증 1: 문서 정확성

spec.md의 UI 요구사항, 제약사항, 동작 상세가 실제 소스코드와 일치하는지 확인.

### 검증 2: 구현 준수

F-001(기본 추첨) ~ F-008(다크 모드) 요구사항이 소스코드에 구현되어 있는지 확인.

### ARIA 검증

ARIA/접근성 전수 확인은 Tier 0(aria.attributes, aria.srOnly)이 담당한다.
Tier 0 ALL PASS → A2는 ARIA 검증 생략.
Tier 0 FAIL → 해당 항목 원인 분석 후 보고.

## 비교 소스

- docs/spec.md
- index.html
- js/config.js, js/utils.js, js/theme.js, js/exclude.js, js/lottery.js, js/history.js, js/auth.js, js/app.js

## 배치 가이드

1. docs/spec.md + index.html 병렬 Read (2회)
2. js/*.js 7개 모듈 병렬 Read (가능한 만큼 병렬화)
3. 모델 내 양방향 비교 (추가 확인 시 css/style.css Read 또는 Grep 보충)

## 금지 패턴

1. 기능별 Grep 순차 호출 금지 — Read 후 모델 내 비교 우선.
2. Glob 금지 — 파일 경로는 위에 고정.
3. ARIA 속성 수동 확인 금지 — Tier 0 위임.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [검증1/검증2] [파일:줄] 설명
2. ...

사용한 Bash 명령어: (없음)
