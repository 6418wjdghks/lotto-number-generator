# 반응형 E2E 테스트

Playwright MCP 기반 반응형 E2E 테스트 정의서. `/e2e-test` 스킬에서 참조한다.

## 전제 조건

- **서버**: `npm run serve` (localhost:8080) 실행 상태
- **도구**: Playwright MCP (`--browser msedge`)
- **초기 상태**: 각 테스트 그룹 시작 전 `localStorage.clear()` 실행
- **스크린샷**: `temp/screenshots/`에 저장 (`.gitignore` 포함)

---

## 테스트 항목

### A. 기능 테스트 (27항목) — 375x667

#### 기본 추첨

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A1 | 추첨하기 (1세트) | 6개 번호, 1~45 범위, 중복 없음, 오름차순 |
| A2 | 세트 수 변경 (3세트) + 추첨 | 3개 카드, 각 6개 번호, "N회차" 라벨 |
| A3 | 세트 수 변경 (5세트) + 추첨 | 5개 카드, 각 6개 번호 |
| A4 | 번호 뱃지 6색 순서 | 1~6번째 각각 고유 배경색 (nth-child) |

#### 다크 모드

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A5 | 다크 모드 전환 | 아이콘 "☀️", aria-label "라이트 모드 전환", `data-theme="dark"` |
| A6 | 라이트 모드 복원 | 아이콘 "🌙", aria-label "다크 모드 전환", `data-theme` 제거 |
| A7 | 테마 새로고침 후 유지 | 다크 → 새로고침 → 다크 유지 (localStorage) |

#### 번호 제외

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A8 | 제외 패널 토글 | "번호 제외 설정 ▼" ↔ "▲", 패널 표시/숨김 |
| A9 | 번호 제외 선택 | `.excluded` 토글, 카운터 "제외: N개" / "남은 번호: N개" |
| A10 | 제외 번호 반영 추첨 | 결과에 제외 번호 미포함 |
| A11 | 제외 번호 초기화 | 카운터 "제외: 0개" / "남은 번호: 45개" |
| A12 | 제외 번호 새로고침 후 유지 | 제외 선택 → 새로고침 → 동일 상태 유지 |
| A13 | 39개 제외 후 추첨 차단 | 에러 토스트 "최소 6개의 번호가 필요합니다." |
| A14 | 40개 이상 제외 시 경고 | `#excludeWarning` 표시 |

#### 이력

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A15 | 이력 보기/숨기기 | 패널 토글, "이력 보기 ▼" ↔ "이력 숨기기 ▲" |
| A16 | 이력 전체 삭제 | confirm → 삭제 → alert → "아직 추첨 이력이 없습니다." |
| A17 | 빈 이력 삭제 시도 | alert('삭제할 이력이 없습니다.'), confirm 미호출 |
| A18 | 이력 열린 상태에서 추첨 | 이력 자동 갱신 확인 |
| A19 | 5세트 추첨 후 이력 | 5건 추가 (각 세트 개별 저장) |
| A20 | 이력 FIFO | 21번째 추첨 후 가장 오래된 항목 제거 |

#### 복사

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A21 | 복사 버튼 | 클립보드 복사 + 토스트 "N회차 복사되었습니다!" |
| A22 | 토스트 중복 방지 | 연속 복사 시 화면에 토스트 1개만 |

#### 인증

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A23 | 인증 폼 토글 | "로그인 / 회원가입 ▼" ↔ "▲", 폼 표시/숨김 |
| A24 | 빈 입력 로그인 시도 | 에러 토스트 "이메일과 비밀번호를 입력해주세요." |
| A25 | 빈 입력 회원가입 시도 | 에러 토스트 표시 |

#### 시나리오 통합

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| A26 | 전체 흐름 | 제외 5개 → 3세트 추첨 → 제외 미포함 → 이력 3건 → 복사 → 토스트 |
| A27 | 상태 복원 흐름 | 제외 5개 + 다크 모드 → 새로고침 → 상태 유지 |

---

### B. 뷰포트 레이아웃 테스트 (34항목) — 6개 뷰포트

> **CSS 브레이크포인트**: `max-width: 480px` (모바일), `max-width: 360px` (극소형), `> 480px` (데스크톱)

#### B1. 극소형 모바일 (320x568) — 8항목

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| B1-1 | 헤더 | h1 `1.25em`, theme-toggle `static` + `34x34px`, `space-between`, 잘림 없음 |
| B1-2 | 제외 그리드 | 5열 (`repeat(5, 1fr)`), gap 5px |
| B1-3 | 추첨 결과 볼 | `flex-wrap`, 크기 45x45px, 잘림 없음 |
| B1-4 | 이력/삭제 버튼 | 세로 배치 (`flex-direction: column`) |
| B1-5 | 세트 셀렉터 | 세로 배치 (`flex-direction: column`, `align-items: flex-start`) |
| B1-6 | 인증 버튼 | 세로 배치 (`flex-direction: column`) |
| B1-7 | 토스트 | `bottom: 20px`, `max-width: 90%` |
| B1-8 | 가로 스크롤바 | `scrollWidth <= clientWidth` |

#### B2. 모바일 (375x667) — 7항목

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| B2-1 | 헤더 | h1 `1.5em`, theme-toggle `static` + `34x34px`, `space-between` |
| B2-2 | 제외 그리드 | 5열 (`repeat(5, 1fr)`) |
| B2-3 | 추첨 결과 볼 | `flex-wrap`, 크기 45x45px, 잘림 없음 |
| B2-4 | 이력/삭제 버튼 | 세로 배치 (`flex-direction: column`) |
| B2-5 | 세트 셀렉터 | 세로 배치 (`flex-direction: column`) |
| B2-6 | 인증 버튼 | 세로 배치 (`flex-direction: column`) |
| B2-7 | 가로 스크롤바 | `scrollWidth <= clientWidth` |

#### B3. 480px 경계값 (480x800) — 4항목

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| B3-1 | 헤더 | h1 `1.5em`, theme-toggle `static`, `space-between` |
| B3-2 | 제외 그리드 | 5열 (480px 이하) |
| B3-3 | 이력/삭제 버튼 | 세로 배치 (480px 이하) |
| B3-4 | 가로 스크롤바 | `scrollWidth <= clientWidth` |

#### B4. 481px 경계값 (481x800) — 5항목

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| B4-1 | 헤더 | h1 `2em`, theme-toggle `absolute right`, `justify-content: center` |
| B4-2 | 제외 그리드 | 9열 (`repeat(9, 1fr)`) |
| B4-3 | 이력/삭제 버튼 | 가로 배치 (`flex-direction: row`) |
| B4-4 | 세트 셀렉터 | 가로 배치 (기본 `flex-direction: row`) |
| B4-5 | 인증 버튼 | 가로 배치 (기본 `flex-direction: row`) |

#### B5. 태블릿 (768x1024) — 5항목

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| B5-1 | 헤더 | 중앙 정렬, theme-toggle absolute |
| B5-2 | 제외 그리드 | 9열 |
| B5-3 | 추첨 결과 볼 | 1줄 배치 (6개 가로) |
| B5-4 | 이력/삭제 버튼 | 가로 배치 |
| B5-5 | 컨테이너 | max-width 500px |

#### B6. 데스크톱 (1920x1080) — 5항목

| ID | 항목 | 검증 기준 |
|----|------|-----------|
| B6-1 | 헤더 | 중앙 정렬, theme-toggle absolute |
| B6-2 | 제외 그리드 | 9열 |
| B6-3 | 추첨 결과 볼 | 1줄 배치 (6개 가로) |
| B6-4 | 이력/삭제 버튼 | 가로 배치 |
| B6-5 | 컨테이너 | max-width 500px, 화면 중앙 (body `flex center`) |

---

### C. 교차 테스트 (2항목)

| ID | 뷰포트 | 항목 | 검증 기준 |
|----|--------|------|-----------|
| C1 | 320x568 | 다크 모드 | 배경 그라데이션 변경, 카드 `#1e1e2e`, 텍스트 가독성 |
| C2 | 1920x1080 | 다크 모드 | 동일 확인, 넓은 화면 그라데이션 정상 |

---

## Quick 모드 항목

`--quick` 실행 시 핵심 항목만 선별 (~15항목):

### 기능 (7항목)
A1, A2, A5, A8, A9, A15, A26

### 뷰포트 (6항목)
B1-1, B1-8, B2-1, B4-1, B5-5, B6-5

### 교차 (2항목)
C1, C2

---

## 의존성

- B 그룹 실행 전 A1~A3 통과 필수 (추첨 결과가 있어야 볼 배치 확인 가능)
- A13, A14는 A8, A9 통과 후 실행 (제외 패널 열림 필요)
- A16, A17은 A15 통과 후 실행 (이력 패널 조작 필요)

---

## 에이전트 프롬프트 템플릿

<agent-prompt id="e2e-functional">
# E2E 기능 테스트 에이전트

Playwright MCP를 사용하여 로또번호 추첨기의 기능을 테스트한다.

## 전제 조건
{{PRECONDITIONS}}

## 테스트 항목
{{TEST_ITEMS}}

## 실행 규칙

1. 테스트 시작 전 `browser_resize`로 375x667 설정
2. `http://localhost:8080` 으로 이동
3. `browser_evaluate`로 `localStorage.clear()` 실행 후 페이지 새로고침
4. 각 항목 실행 후 결과를 기록
5. 필요 시 `browser_take_screenshot`으로 `{{SCREENSHOT_DIR}}/{{GROUP_ID}}_<id>.png` 저장
6. dialog(alert/confirm) 처리: `browser_handle_dialog` 사용

## CSS 검증 방법
- `browser_evaluate`로 `getComputedStyle(element).property` 확인
- overflow 검증: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`

## 결과 출력

모든 항목 완료 후 아래 JSON 블록을 출력:

```json
{
  "group": "{{GROUP_ID}}",
  "groupName": "기능 테스트",
  "viewport": { "width": 375, "height": 667 },
  "items": [
    { "id": "A1", "name": "추첨하기 (1세트)", "status": "pass|fail", "detail": "검증 내용", "screenshotFile": "파일명 또는 null" }
  ],
  "summary": { "total": 0, "pass": 0, "fail": 0 }
}
```
</agent-prompt>

<agent-prompt id="e2e-viewport">
# E2E 뷰포트 레이아웃 테스트 에이전트

Playwright MCP를 사용하여 특정 뷰포트에서 레이아웃을 검증한다.

## 전제 조건
{{PRECONDITIONS}}

## 뷰포트
{{VIEWPORT}}

## 테스트 항목
{{TEST_ITEMS}}

## 실행 규칙

1. `browser_resize`로 지정 뷰포트 설정
2. `http://localhost:8080` 으로 이동
3. `browser_evaluate`로 `localStorage.clear()` 실행 후 페이지 새로고침
4. B 그룹 검증 전 추첨 1회 실행 (볼 배치 확인용)
5. 제외 패널 열기 (그리드 배치 확인용)
6. 각 항목의 CSS 속성을 `browser_evaluate` + `getComputedStyle`으로 검증
7. 필요 시 `browser_take_screenshot`으로 `{{SCREENSHOT_DIR}}/{{GROUP_ID}}_<viewport>.png` 저장

## CSS 브레이크포인트 참조
- `max-width: 480px`: 모바일 전환
- `max-width: 360px`: 극소형 보정 (h1 크기 축소)
- `> 480px`: 기본 데스크톱

## 결과 출력

모든 항목 완료 후 아래 JSON 블록을 출력:

```json
{
  "group": "{{GROUP_ID}}",
  "groupName": "뷰포트 테스트 ({{VIEWPORT}})",
  "viewport": {{VIEWPORT}},
  "items": [
    { "id": "B1-1", "name": "헤더", "status": "pass|fail", "detail": "검증 내용", "screenshotFile": "파일명 또는 null" }
  ],
  "summary": { "total": 0, "pass": 0, "fail": 0 }
}
```
</agent-prompt>

<agent-prompt id="e2e-cross">
# E2E 교차 테스트 에이전트

Playwright MCP를 사용하여 다크 모드 + 뷰포트 교차 조합을 검증한다.

## 전제 조건
{{PRECONDITIONS}}

## 테스트 항목
{{TEST_ITEMS}}

## 실행 규칙

1. 각 항목의 지정 뷰포트로 `browser_resize` 설정
2. `http://localhost:8080` 으로 이동
3. `browser_evaluate`로 `localStorage.clear()` 실행 후 페이지 새로고침
4. 다크 모드 전환 (theme-toggle 클릭)
5. CSS 검증:
   - 배경 그라데이션 변경 확인 (`document.body` 또는 `html`의 background)
   - 카드 배경색 `#1e1e2e` 확인 (`.container` 또는 `.card`)
   - 텍스트 가독성: 전경/배경 색상 contrast 확인
6. `browser_take_screenshot`으로 `{{SCREENSHOT_DIR}}/{{GROUP_ID}}_<id>.png` 저장

## 결과 출력

모든 항목 완료 후 아래 JSON 블록을 출력:

```json
{
  "group": "C",
  "groupName": "교차 테스트",
  "viewport": { "width": 0, "height": 0 },
  "items": [
    { "id": "C1", "name": "320px + 다크 모드", "status": "pass|fail", "detail": "검증 내용", "screenshotFile": "파일명 또는 null" }
  ],
  "summary": { "total": 2, "pass": 0, "fail": 0 }
}
```
</agent-prompt>
