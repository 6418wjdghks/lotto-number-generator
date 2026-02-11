# 테스트 도구

로또번호 추첨기의 자동 테스트 도구입니다.

## 파일

### test.html (v2)
자동화된 기능 테스트 페이지 - **21개 테스트, ~70개 검증 항목**

**실행 방법**:
```bash
start test/test.html  # Windows
open test/test.html   # macOS
```
페이지 로드 시 자동 실행됩니다.

---

## 테스트 구조

### DOM Fixture
`test.html`에 app.js가 참조하는 DOM 요소(`#setCount`, `#setsContainer`, `#historyList`, `#historyToggleText`)를 숨겨진 영역으로 재현합니다. 이를 통해 DOM 의존 함수들을 실제로 테스트할 수 있습니다.

### 비동기 처리
`runAllTests()`가 async 함수이며, Clipboard API/Toast 테스트를 `await`로 순차 실행합니다. 모든 결과가 최종 요약에 정확히 반영됩니다.

---

## 테스트 항목 (21개)

### A. 핵심 생성 로직 (Test 1-6)
실제 `generateSingleSet()` 함수를 직접 호출하여 검증합니다.

| Test | 검증 내용 | 반복 |
|------|-----------|------|
| 1 | 기본 동작 (6개, 배열, 정수) | 1회 |
| 2 | 숫자 범위 1-45 | 100회 |
| 3 | 중복 없음 | 100회 |
| 4 | 오름차순 정렬 | 100회 |
| 5 | 랜덤성 (90%+ 고유 조합) | 100회 |
| 6 | 분포 균등성 (표준편차 검증) | 1000회 |

### B. 유틸리티 (Test 7)

| Test | 검증 내용 |
|------|-----------|
| 7 | `generateUUID()` v4 형식 정규식 + 100개 유일성 |

### C. 이력 관리 F-003 (Test 8-12)

| Test | 검증 내용 |
|------|-----------|
| 8 | `saveToHistory()` - version, 개수, 배열, id, timestamp, setCount |
| 9 | `loadHistory()` - 정상 로드, 잘못된 JSON, 미지원 버전, 빈 저장소 |
| 10 | 최대 20개 제한 + 최신순 정렬 |
| 11 | `clearHistory()` - 빈 이력 경고, confirm 승인/거부, 완료 알림 |
| 12 | setCount 파라미터 저장 + 기본값 |

### D. 여러 세트 F-004 (Test 13-15)

| Test | 검증 내용 |
|------|-----------|
| 13 | `generateMultipleSets(3)` - 개수, 숫자, 정렬, 중복 |
| 14 | 경계값 (1세트, 5세트) + 세트 간 독립성 |
| 15 | `getSelectedSetCount()` - DOM select 연동, 타입 검증 |

### E. 복사 및 토스트 F-006 (Test 16-17)

| Test | 검증 내용 |
|------|-----------|
| 16 | `copyToClipboard()` - 성공/실패, 클립보드 내용, setNumber 토스트 |
| 17 | `showToast()` - success/error 타입, 메시지 일치, 자동 제거, 연속 호출 교체 |

### F. DOM 렌더링 (Test 18-20)

| Test | 검증 내용 |
|------|-----------|
| 18 | `displayMultipleSets()` - 카드, 라벨, 뱃지, textContent(XSS), 복사버튼, 재호출 초기화 |
| 19 | `displayHistory()` - 빈 이력 메시지, 숫자/시간 표시, setCount 표시 |
| 20 | `toggleHistoryView()` - hidden 토글, 버튼 텍스트 변경 |

### G. 통합 테스트 (Test 21)

| Test | 검증 내용 |
|------|-----------|
| 21 | `generateLottoNumbers()` - 1세트/3세트 end-to-end (DOM + 이력 + setCount + 숫자 유효성) |

---

## 결과 해석
- ✅ PASS: 검증 통과
- ❌ FAIL: 검증 실패
- ⚠️ INFO: 환경 제한으로 스킵 (예: Clipboard API는 HTTPS 필요)
- 하단 요약 바에서 전체 통과/실패 수 확인

## 함수 커버리지

app.js 13개 함수 전체를 테스트합니다:
`generateLottoNumbers`, `generateSingleSet`, `generateMultipleSets`, `getSelectedSetCount`, `displayMultipleSets`, `generateUUID`, `saveToHistory`, `loadHistory`, `displayHistory`, `toggleHistoryView`, `clearHistory`, `copyToClipboard`, `showToast`

---

**최종 업데이트**: 2026-02-11 (v2)
