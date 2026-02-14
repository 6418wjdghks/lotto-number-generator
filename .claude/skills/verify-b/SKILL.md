---
name: verify-b
description: "정밀 검증 B: design.md ↔ CSS/HTML 전수 비교. /verify에서 자동 호출되며, 단독 실행도 가능."
disable-model-invocation: true
---

# B: design.md ↔ CSS/HTML 전수 비교

## 역할

docs/design.md가 실제 디자인(CSS/HTML)을 정확히 기술하는지 전수 비교한다.

## Tier 0 결과

{{TIER0_RESULT}}

## 규칙

- 불일치 목록만 반환한다. 일치 항목은 보고하지 않는다.
- 임시 파일 RAII: 생성한 파일 목록 추적 → 종료 전 반드시 삭제.
- 재위임 금지: Task 도구로 서브에이전트를 재생성하지 않는다.
- 기대값 하드코딩 금지: 문서에서 기대값을 파싱하여 소스와 비교한다.
- **Bash 사용 금지**: Read + Grep 도구만 사용한다.
- 종료 시 사용한 Bash 명령어 목록을 출력한다 (없어야 정상).

## Tier 0 커버리지

CSS 변수값 비교(css.root.values, css.dark.values)는 Tier 0이 완료한다.
Tier 0 ALL PASS → B는 변수값 전수 비교를 생략하고 **의미적 검증에 집중**.

## 검증 항목

### 검증 1: 문서 정확성

design.md의 색상, 타이포그래피, 레이아웃, 컴포넌트 명세가 실제 CSS/HTML과 일치하는지 확인.

### 검증 2: 구현 일치 (의미적 검증)

- 컴포넌트 명세 테이블의 크기/배치/테두리/모서리/그림자/배경/글자 값 ↔ style.css 전수 비교.
- 인터랙션 명세(hover/active/focus 효과) ↔ style.css 확인.
- 반응형(480px) 변경 항목 ↔ style.css @media 반영 확인.
- 애니메이션 명세(@keyframes 이름, 키프레임, 지속시간) ↔ style.css 일치 확인.
- DOM 순서(design.md 레이아웃) ↔ index.html 일치 확인.

## 비교 소스

- docs/design.md
- css/style.css
- index.html

## 배치 가이드

1. docs/design.md + css/style.css + index.html 병렬 Read (3회)
2. 모델 내 교차 비교 → 완료. 최소 Tool로 수행.

## 금지 패턴

1. Glob 금지 — 파일 경로는 위에 고정.
2. Grep 최소화 — 3파일 Read 후 모델 내에서 전수 비교.

## 출력 형식

불일치: N건 (또는 "ALL PASS")

불일치 목록:
1. [검증1/검증2] [파일:줄] 설명
2. ...

사용한 Bash 명령어: (없음)
