# 아키텍처 결정 기록 (Architecture Decision Records)

프로젝트의 주요 설계 결정과 그 사유를 기록합니다.

> 과거 ADR: [decisions_001_010.md](./decisions_001_010.md) (ADR-001~010) | [decisions_011_020.md](./decisions_011_020.md) (ADR-011~020) | [decisions_021_030.md](./decisions_021_030.md) (ADR-021~030)

**Chunk 규칙**: 활성 ADR **10개 초과** 시 가장 오래된 10개를 `decisions_NNN_MMM.md`로 아카이브. 헤더에 상호 링크 포함.

---

## 목차

| # | 결정 | 상태 | 날짜 |
|---|------|------|------|
| 031 | 모듈 레이어 아키텍처 및 로딩 순서 | 승인 | 2026-02-14 |
| 032 | 이력 데이터 버전 관리 정책 | 승인 | 2026-02-14 |
| 033 | LocalStorage↔Supabase 듀얼 저장소 분기 정책 | 승인 | 2026-02-14 |
| 034 | Supabase 토큰 localStorage 저장 정책 | 승인 | 2026-02-14 |
| 035 | IIFE + window 전역 객체 캡슐화 패턴 | 승인 | 2026-02-14 |
| 036 | 제외 버튼 지연 렌더링 (Lazy Init) | 승인 | 2026-02-14 |
| 037 | Fire-and-Forget 이력 저장 패턴 | 승인 | 2026-02-14 |
| 038 | 토스트 단일 인스턴스 정책 | 승인 | 2026-02-14 |
| 039 | hidden 클래스 기반 렌더링 스킵 | 승인 | 2026-02-14 |
| 040 | 다중 세트 순차 애니메이션 공식 | 승인 | 2026-02-14 |

---

## ADR-031: 모듈 레이어 아키텍처 및 로딩 순서

**상태**: 승인
**날짜**: 2026-02-14

### 배경

ES modules 미사용 환경에서 `<script>` 태그 순서로 모듈 의존성을 관리하고 있으나, 각 파일이 어떤 계층에 속하는지, 계층 간 참조 규칙이 무엇인지 암묵적으로만 존재. `app.js` L3에 로딩 순서 주석이 있지만 **왜 이 순서인지** 근거가 부재.

### 결정

3-Layer 아키텍처를 정의하고, 각 레이어의 역할·참조 규칙·소속 파일을 명시한다.
레이어 번호는 **안정성** 기준: L1(가장 안정, 고정) → L3(가장 구체적, 세분화·확장).

#### 설계 원칙

번호가 **작을수록 안정적**이고, **클수록 구체적이며 확장**된다.
- L1은 거의 변경되지 않는 고정 프레임 (Entry Point / Composition Root)
- L3은 프로젝트 성장에 따라 파일이 가장 많이 추가되는 계층 (Foundation)
- 의존 방향: L1 → L2 → L3 (안정된 상위가 구체적인 하위를 참조)

#### 레이어 정의

```
L1  Entry Point    (앱 초기화·이벤트 바인딩 — Composition Root, 가장 안정적)
L2  Feature        (도메인별 기능 모듈 — L3에 의존)
L3  Foundation     (설정 로더·헬퍼 + 외부 서비스 래퍼 — 프로젝트 내 의존 없음, 가장 구체적)
--  Data (JSON)    (순수 데이터 — 레이어 외, 관리 영역)
```

> **인라인 스크립트** (`index.html` `<head>`): FOUC 방지를 위한 **pre-render 최적화 기법**. 어떤 모듈도 참조하지 않고 어떤 모듈에서도 참조되지 않으므로 레이어 체계에 포함하지 않음.
>
> **Data (JSON)**: `config/*.json` 파일은 순수 데이터로서 코드가 아닌 **관리 영역**. 레이어 체계에 포함하지 않으며, L3 `config.js`가 런타임에 fetch하여 전역 변수로 노출.

#### 파일 → 레이어 매핑

| 레이어 | 파일 | 역할 | 안정성 |
|--------|------|------|--------|
| L1 Entry Point | `js/app.js` | initApp + generateLottoNumbers (Composition Root) | 고정 |
| L2 Feature | `js/theme.js` | 다크 모드 테마 관리 | 기능별 변동 |
| L2 Feature | `js/exclude.js` | 번호 제외 UI + 영속화 | 기능별 변동 |
| L2 Feature | `js/lottery.js` | 추첨 로직 + 결과 표시 | 기능별 변동 |
| L2 Feature | `js/history.js` | 이력 관리 (듀얼 모드) | 기능별 변동 |
| L2 Feature | `js/auth.js` | 인증 UI + 세션 처리 | 기능별 변동 |
| L3 Foundation | `js/config.js` | JSON 설정 로더 (`loadConfig`) | 확장 가능 |
| L3 Foundation | `js/supabase-config.js` | Supabase REST API 래퍼 (IIFE, `window.supabase` 노출) | 확장 가능 |
| L3 Foundation | `js/utils.js` | generateUUID, showToast, copyToClipboard | 확장 가능 |
| — Data | `config/constants.json` | 앱 상수 (STORAGE_KEY, THEME_KEY 등) | 관리 영역 |
| — Data | `config/supabase.json` | Supabase 접속 정보 (URL, KEY) | 관리 영역 |

#### 참조 규칙

```
규칙 1: L(N) → L(N+1) 이하만 참조 가능  (같거나 더 큰 번호만 참조)
규칙 2: L(N) → L(N) 동일 레이어 참조 허용 (단, 로딩 순서 보장 필수)
규칙 3: L(N) ← L(N-1) 역방향 참조 금지   (하위가 상위를 참조할 수 없음)
```

#### 의존성 그래프

```
    config/*.json ─── (순수 데이터, 레이어 외)
    │ (fetch)
L1  app.js ────────→ L2 + L3 전체 (Composition Root: loadConfig → 초기화 → 바인딩)
    │
L2  theme.js ──────→ L3 (THEME_KEY)
    exclude.js ────→ L3 (EXCLUDED_KEY)
    lottery.js ────→ L3 (copyToClipboard)
    history.js ────→ L3 (STORAGE_KEY, MAX_HISTORY, generateUUID, showToast, window.supabase)
    auth.js ───────→ L3 (showToast, window.supabase) + L2:history (displayHistory)  ← 동일 레이어 참조
    │
L3  config.js ──────────── (JSON 로더, 전역 변수 선언)
    supabase-config.js ─── (독립 IIFE, 전역 변수 참조)
    utils.js ──────────── (독립)
```

#### 로딩 순서 (index.html `<script>` 태그)

스크립트 로딩은 의존성 해소를 위해 **L3 → L2 → L1** 순서 (하위 먼저).

```html
<!-- Pre-render: FOUC 방지 인라인 스크립트 (<head> 내, 레이어 외) -->
<!-- L3: Foundation (가장 먼저 로드 — 다른 레이어가 참조) -->
<script src="js/config.js"></script>            <!-- 전역 변수 선언 + loadConfig 정의 -->
<script src="js/supabase-config.js"></script>   <!-- 전역 변수 참조 (call-time 해소) -->
<script src="js/utils.js"></script>
<!-- L2: Feature (의존성 순서: 독립 → 피참조 → 참조) -->
<script src="js/theme.js"></script>       <!-- L3만 참조 -->
<script src="js/exclude.js"></script>     <!-- L3만 참조 -->
<script src="js/lottery.js"></script>     <!-- L3만 참조 -->
<script src="js/history.js"></script>     <!-- L3 참조 -->
<script src="js/auth.js"></script>        <!-- L3 + L2:history 참조 -->
<!-- L1: Entry Point (가장 마지막 로드 — Composition Root) -->
<script src="js/app.js"></script>         <!-- initApp: await loadConfig() → 초기화 -->
```

**L2 내부 순서 제약**: `auth.js`는 `history.js`의 `displayHistory()`를 참조하므로 반드시 `history.js` 뒤에 로드. 나머지 L2 파일(theme, exclude, lottery)은 상호 독립이므로 순서 자유.

### 대안 검토

| 대안 | 장점 | 채택하지 않은 이유 |
|------|------|-------------------|
| ES modules (`import/export`) | 정적 분석, 트리 셰이킹 | ADR-001 Vanilla JS 제약, 프레임워크/번들러 금지 |
| 단일 파일 (all-in-one) | 로딩 순서 문제 없음 | 440줄+ 단일 파일은 유지보수성 저하 |
| AMD/UMD 모듈 | 비동기 로딩 | 불필요한 복잡성, 라이브러리 의존 |
| L1=Foundation 번호 순 | 독립→의존 순서 직관적 | 안정성 역전: 가장 고정된 Entry Point가 큰 번호를 갖게 됨, 확장 방향과 번호가 불일치 |

### 새 모듈 추가 시 체크리스트

1. 해당 모듈이 속할 레이어(L2 or L3) 결정
2. 참조 규칙 위반 여부 확인 (하위→상위 역방향 참조 금지)
3. 동일 레이어 참조 시 `index.html` 로딩 순서에 제약 추가
4. `app.js` 헤더 주석의 로딩 순서 갱신
5. 이 ADR의 파일 → 레이어 매핑 테이블 갱신

---

## ADR-032: 이력 데이터 버전 관리 정책

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`history.js`의 `saveToHistoryLocal()`은 데이터를 `{ version: '1.0', history: [...] }` 형태로 localStorage에 저장하고, `loadHistoryLocal()`에서 `version !== '1.0'`이면 빈 배열을 반환한다. 이 동작이 의도적인 설계 결정인지, 향후 데이터 형식 변경 시 어떻게 처리할지 명시적 기록이 부재.

### 현재 동작 분석

```js
// 저장 (saveToHistoryLocal)
const data = { version: '1.0', history: [...] };
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// 로드 (loadHistoryLocal)
if (parsed.version !== '1.0') {
  console.warn('알 수 없는 데이터 버전:', parsed.version);
  return [];  // ← 데이터 폐기
}
```

- 버전 불일치 → `console.warn` + 빈 배열 반환 (기존 데이터 무시)
- 다음 저장 시 → `version: '1.0'`으로 새 데이터 덮어씀 (자동 리셋)
- 마이그레이션 로직 → 없음

### 결정

**버전 불일치 시 데이터 폐기(Drop) 정책을 의도적 설계로 승인한다.**

#### 근거

1. **데이터 특성**: 로또 추첨 이력은 일회성 참고 데이터. 유실되어도 사용자에게 실질적 손해 없음
2. **단순성**: 마이그레이션 로직은 복잡도를 크게 증가시킴 (버전별 변환 함수, 테스트, 엣지 케이스)
3. **변경 빈도**: 데이터 구조 변경은 극히 드묾 (현재 v1.0 이후 변경 없음)
4. **저장소 크기**: 최대 20건 제한 (MAX_HISTORY). 소량 데이터의 마이그레이션 ROI 낮음
5. **Supabase 듀얼 모드**: 로그인 사용자는 서버에 이력 보관. localStorage는 비로그인 임시 저장소 성격

#### 버전 변경 시 절차

향후 데이터 구조를 변경해야 할 경우:

1. `version`을 `'2.0'`으로 올림
2. `loadHistoryLocal()`의 버전 체크에서 구 버전 데이터는 자동 폐기
3. 사용자에게 별도 고지 불필요 (참고 데이터 특성)
4. Supabase 테이블 변경 시에는 별도 마이그레이션 SQL 필요 (서버측은 이 정책 범위 밖)

### 대안 검토

| 대안 | 장점 | 채택하지 않은 이유 |
|------|------|-------------------|
| 버전별 마이그레이션 함수 | 데이터 보존 | 20건 이하 일회성 데이터에 과도한 복잡성 |
| 스키마 없는 저장 (버전 필드 제거) | 더 단순 | 구조 변경 시 파싱 오류 발생 가능, 방어 수단 상실 |
| 버전 경고 + 데이터 유지 | 부분 호환 | 필드 누락/타입 변경 시 런타임 오류 위험 |

---

## ADR-033: LocalStorage↔Supabase 듀얼 저장소 분기 정책

**상태**: 승인
**날짜**: 2026-02-14

### 배경

Phase 4에서 Supabase 백엔드를 도입하면서, 이력 관리 함수(`saveToHistory`, `loadHistory`, `clearHistory`)가 로그인 여부에 따라 저장소를 투명 전환한다. 이 분기 로직의 전환 기준, 데이터 동기화 정책, 로그인/로그아웃 시 동작이 암묵적으로만 구현되어 있음.

### 현재 동작 분석

```
history.js (듀얼 모드 분기)
──────────────────────────
saveToHistory(numbers, setCount)
  ├─ isLoggedIn() === true  → supabase.insertHistory()
  └─ isLoggedIn() === false → saveToHistoryLocal()

loadHistory()
  ├─ isLoggedIn() === true  → supabase.fetchHistory() + 필드 매핑
  └─ isLoggedIn() === false → loadHistoryLocal()

clearHistory()
  ├─ isLoggedIn() === true  → supabase.deleteAllHistory()
  └─ isLoggedIn() === false → clearHistoryLocal()
```

**전환 기준**: `window.supabase.isLoggedIn()` = `getSession() !== null` (localStorage에 세션 토큰 존재 여부)

### 결정

**동기화 없는 독립 저장소(Isolated Dual Store) 정책을 채택한다.**

#### 핵심 규칙

| 규칙 | 내용 |
|------|------|
| **전환 기준** | `isLoggedIn()` — 세션 토큰 존재 여부만 판단. 토큰 유효성(만료)은 미검증 |
| **데이터 격리** | 로컬 이력과 서버 이력은 완전히 독립. 상호 참조·병합 없음 |
| **로그인 시** | 서버 이력만 표시. 로컬 이력은 그대로 보존되지만 비가시 |
| **로그아웃 시** | 로컬 이력으로 자동 폴백. 서버 이력 접근 불가 |
| **병합(Merge)** | 미지원. 로컬→서버 이관 기능 없음 |

#### 근거

1. **단순성**: 병합/동기화는 충돌 해결 로직 필요 (timestamp 비교, 중복 제거, UI 확인). 로또 이력에 과도한 복잡성
2. **데이터 특성**: 추첨 이력은 동일 번호가 다른 시점에 생성될 수 있어, 중복 판별이 불가능 (같은 번호 ≠ 같은 이력)
3. **사용자 기대**: 로그인 사용자는 서버 저장을 기대. 비로그인 사용자는 로컬 저장을 기대. 혼재하면 혼란
4. **오프라인 지원 불필요**: 이 앱은 온라인 전제 (Supabase REST API). 오프라인 큐잉/동기화 불필요

#### 상태 전이 다이어그램

```
[비로그인] ──로그인──→ [로그인]
  │ localStorage        │ Supabase
  │ 이력 읽기/쓰기       │ 이력 읽기/쓰기
  │                     │
  │←──로그아웃────────────│
  │ localStorage (기존 데이터 보존)
```

### 대안 검토

| 대안 | 장점 | 채택하지 않은 이유 |
|------|------|-------------------|
| 로그인 시 로컬→서버 자동 이관 | 데이터 연속성 | 중복 판별 불가, 이관 실패 시 롤백 복잡 |
| 양방향 동기화 (Sync) | 완전한 데이터 일관성 | 충돌 해결 UI + 큐잉 로직, 프레임워크 금지 환경에서 과도 |
| 서버 전용 (로컬 폐지) | 구조 단순 | 비로그인 사용자 기능 상실, Phase 3까지의 기존 사용자 영향 |

### 향후 확장 고려

로컬→서버 이관 기능을 추가할 경우:
1. UI에 "로컬 이력 가져오기" 버튼 추가 (자동 아님, 사용자 의도 명확)
2. 로컬 이력 전체를 서버에 INSERT (중복 허용)
3. 이관 성공 시 로컬 이력 삭제 여부를 사용자에게 확인
4. 별도 ADR로 기록

---

## ADR-034: Supabase 토큰 localStorage 저장 정책

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`supabase-config.js`의 `saveSession()`은 Supabase에서 발급받은 `access_token`을 포함한 세션 객체를 localStorage에 저장한다. localStorage는 XSS 공격 시 JavaScript로 읽을 수 있어 토큰 탈취 위험이 존재. 이 저장 방식의 보안 트레이드오프가 기록되지 않음.

### 현재 동작

```js
// supabase-config.js
const SESSION_KEY = 'supabase_session';  // config/supabase.json에서 로드

function saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  // data = { access_token, token_type, expires_in, refresh_token, user }
}

function isLoggedIn() {
  return getSession() !== null;  // 토큰 존재 여부만 확인, 만료 미검증
}
```

### 결정

**localStorage 저장을 유지하되, 프로젝트의 XSS 방어 체계에 의존하여 위험을 수용한다.**

#### 보안 분석

| 위협 | 위험도 | 이 프로젝트의 완화 조치 |
|------|--------|----------------------|
| XSS를 통한 토큰 탈취 | 중간 | `textContent` 강제 (ADR-009), innerHTML 금지 |
| 서드파티 스크립트 토큰 접근 | 낮음 | 서드파티 스크립트 없음 (프레임워크 금지) |
| 토큰 만료 후 무효 세션 | 낮음 | Supabase API가 401 반환 시 자연 실패 |
| 로컬 물리 접근 | 낮음 | 개인용 웹앱, 공유 기기 시나리오 범위 외 |

#### XSS 방어 체계 (토큰 보호의 전제 조건)

이 결정은 다음 규칙들이 **지속적으로 준수**될 때만 유효:

1. **ADR-009**: `textContent` 사용, `innerHTML` 금지
2. **CLAUDE.md 보안 규칙**: JSON.parse try-catch
3. **서드파티 스크립트 없음**: `<script>` 태그는 프로젝트 자체 파일만
4. **사용자 입력 미렌더링**: 이메일/비밀번호는 `<input>`에서만 사용, DOM에 렌더링하지 않음

> 위 조건 중 하나라도 위반되면 이 ADR을 재검토해야 함.

#### 미구현 사항 (수용된 제한)

| 항목 | 현재 상태 | 수용 근거 |
|------|-----------|-----------|
| 토큰 만료 검증 | 미구현 | API 호출 시 401로 자연 실패, 사용자가 재로그인 |
| refresh_token 자동 갱신 | 미구현 | 단순성 우선, 세션 만료 시 재로그인으로 충분 |
| 로그아웃 시 토큰 무효화 | 구현됨 | `signOut()` → API 호출 + `clearSession()` |

### 대안 검토

| 대안 | 장점 | 채택하지 않은 이유 |
|------|------|-------------------|
| httpOnly 쿠키 | JS로 접근 불가, XSS 면역 | 서버사이드 Set-Cookie 필요, Vanilla JS + REST API 제약에 위배 |
| sessionStorage | 탭 닫으면 자동 삭제 | 새 탭 열 때마다 재로그인 필요, UX 저하 |
| 메모리 전용 (변수) | 가장 안전 | 페이지 새로고침 시 로그아웃, 실용성 없음 |
| Web Crypto API 암호화 | 탈취해도 복호화 필요 | 암호화 키도 JS에 존재하므로 XSS 시 무의미 |

---

## ADR-035: IIFE + window 전역 객체 캡슐화 패턴

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`supabase-config.js`는 IIFE로 내부 함수 11개를 캡슐화하고, `window.supabase` 객체 하나만 외부에 노출한다. 반면 다른 모듈(utils, theme, exclude 등)은 전역 스코프에 함수를 직접 선언한다. 이 불일치의 설계 근거가 기록되지 않음.

### 현재 패턴 비교

| 패턴 | 사용 파일 | 특징 |
|------|-----------|------|
| **IIFE + window 노출** | `supabase-config.js` | 내부 함수 캡슐화, `window.supabase`로 네임스페이스 격리 |
| **전역 함수 선언** | utils, theme, exclude, lottery, history, auth, app, config | `function foo() {}` 직접 선언, 전역 스코프 |

### 결정

**IIFE 패턴은 외부 서비스 래퍼에만 적용하고, 나머지 모듈은 전역 함수 선언을 유지한다.**

#### 적용 기준

| 조건 | 패턴 | 이유 |
|------|------|------|
| 외부 서비스 API 래퍼 (Supabase 등) | IIFE + `window.*` | 내부 상태(세션) 보호, 공개 API 명시적 정의, 네임스페이스 충돌 방지 |
| 프로젝트 내부 모듈 | 전역 함수 선언 | 단순성, 모듈 간 직접 호출 가능, 테스트 접근 용이 |

#### 근거

1. **supabase-config.js에 IIFE가 필요한 이유**
   - 내부 헬퍼(`getSession`, `saveSession`, `clearSession`)는 외부에서 직접 호출하면 안 됨
   - `window.supabase.signIn()` 형태로 네임스페이스를 명확히 구분
   - 향후 다른 백엔드(Firebase 등)로 교체 시 `window.supabase` 인터페이스만 교체

2. **나머지 모듈에 IIFE가 불필요한 이유**
   - ES modules 미사용 환경에서 IIFE는 보일러플레이트 증가
   - 프로젝트 내부 함수는 숨길 필요 없음 (전부 공개 API)
   - 테스트에서 `module.exports`로 내보낼 때 전역 함수가 더 단순

### 새 외부 서비스 추가 시 체크리스트

1. IIFE로 감싸고 `window.<서비스명>` 객체로 노출
2. 내부 상태/헬퍼는 IIFE 클로저로 캡슐화
3. 공개 API만 `window` 객체에 포함
4. ADR-031 레이어 매핑에 L3 Foundation으로 추가

---

## ADR-036: 제외 버튼 지연 렌더링 (Lazy Init)

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`exclude.js`의 `toggleExcludeView()`는 제외 패널을 처음 열 때만 45개 버튼을 생성한다 (`grid.children.length === 0` 체크). 페이지 로드 시 DOM에 버튼이 없으며, 사용자가 패널을 한 번도 열지 않으면 생성되지 않음.

### 결정

**제외 버튼은 Lazy Init 패턴으로 첫 열기 시 생성한다.**

- **근거**: 대부분의 사용자가 제외 기능을 매번 사용하지 않음. 45개 버튼 DOM 노드를 페이지 로드 시 생성하면 초기 렌더링에 불필요한 비용
- **트레이드오프**: 첫 열기 시 약간의 지연 (45개 `createElement` + `appendChild`), 실측 무시 가능 수준
- **영속성**: 한번 생성된 버튼은 DOM에 유지. 패널을 닫아도 `hidden` 클래스만 토글, 재생성하지 않음

---

## ADR-037: Fire-and-Forget 이력 저장 패턴

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`app.js`의 `generateLottoNumbers()`에서 `saveToHistory()`를 `await` 없이 호출한다. 이력 저장 실패가 추첨 결과 표시를 차단하지 않음.

### 결정

**이력 저장은 Fire-and-Forget으로 처리한다. 추첨 결과 표시가 저장 완료를 기다리지 않음.**

```js
// app.js — await 없음 (의도적)
sets.forEach(numbers => {
  saveToHistory(numbers, setCount);
});
```

- **근거**: 사용자에게 가장 중요한 것은 추첨 결과 즉시 확인. 이력 저장은 부가 기능
- **실패 시 동작**: `saveToHistory()` 내부 try-catch에서 `console.error` + 토스트 표시. 추첨 결과는 이미 화면에 표시됨
- **Supabase 모드**: 네트워크 지연이 있어도 추첨 결과 표시에 영향 없음

---

## ADR-038: 토스트 단일 인스턴스 정책

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`utils.js`의 `showToast()`는 새 토스트 생성 전 기존 토스트를 제거한다. 화면에 동시에 하나의 토스트만 존재.

### 결정

**토스트는 화면에 최대 1개만 표시한다. 새 토스트 요청 시 기존 토스트를 즉시 교체.**

```js
// utils.js
const existingToast = document.querySelector('.toast');
if (existingToast) existingToast.remove();  // 기존 제거 후 새로 생성
```

- **근거**: 다중 토스트는 위치 관리(스택), z-index 충돌, 제거 타이밍 관리가 복잡. 이 앱에서 동시 알림이 필요한 시나리오 없음
- **자동 제거**: 2초 표시 + 0.3초 fadeOut 애니메이션 후 DOM에서 제거
- **타입별 색상**: `success`(초록) / `error`(빨강) CSS 클래스로 구분

---

## ADR-039: hidden 클래스 기반 렌더링 스킵

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`history.js`와 `auth.js`에서 패널이 닫혀 있으면(`classList.contains('hidden')`) 재렌더링을 스킵한다. 이 패턴이 여러 곳에서 반복 사용됨.

### 결정

**닫힌 패널(hidden)은 데이터 변경 시에도 재렌더링하지 않는다. 열릴 때 최신 데이터로 렌더링.**

적용 위치:
- `history.js:98` — `saveToHistory()` 후 이력 패널이 열려있을 때만 `displayHistory()` 호출
- `auth.js:46` — `handleSignIn()` 후 이력 패널이 열려있을 때만 갱신
- `auth.js:104` — `handleSignOut()` 후 이력 패널이 열려있을 때만 갱신

```js
if (!historyList.classList.contains('hidden')) {
  displayHistory();  // 열려있을 때만 재렌더링
}
```

- **근거**: 보이지 않는 DOM을 갱신하는 것은 불필요한 연산. 특히 Supabase 모드에서는 네트워크 요청까지 발생
- **일관성 규칙**: 모든 토글식 패널에서 이 패턴을 적용해야 함. `toggleHistoryView()`가 패널을 열 때 `displayHistory()`를 호출하므로 데이터 최신성 보장

---

## ADR-040: 다중 세트 순차 애니메이션 공식

**상태**: 승인
**날짜**: 2026-02-14

### 배경

`lottery.js`의 `displayMultipleSets()`에서 세트별·번호별 `animationDelay`를 계산하여 순차적 등장 효과를 구현. 공식의 설계 근거가 기록되지 않음.

### 결정

**순차 애니메이션은 `setIndex * 0.1 + numIndex * 0.05` 공식으로 CSS animationDelay를 설정한다.**

```js
// 세트 카드 딜레이
setCard.style.animationDelay = `${setIndex * 0.1}s`;

// 개별 번호 딜레이
numberDiv.style.animationDelay = `${(setIndex * 0.1) + (numIndex * 0.05)}s`;
```

| 매개변수 | 값 | 설명 |
|----------|-----|------|
| 세트 간 간격 | 0.1초 | 세트 카드가 100ms 단위로 순차 등장 |
| 번호 간 간격 | 0.05초 | 같은 세트 내 6개 번호가 50ms 단위로 순차 등장 |
| 1세트 총 시간 | 0.35초 | `0.1*0 + 0.05*5 = 0.25` + 애니메이션 duration |
| 5세트 마지막 번호 | 0.65초 | `0.1*4 + 0.05*5 = 0.65` |

- **근거**: CSS 애니메이션만으로 시각적 흐름 제어. JavaScript 타이머 불필요, GPU 가속 활용
- **변경 시 주의**: 두 공식의 `setIndex * 0.1` 부분이 동일해야 세트 카드와 내부 번호의 타이밍이 일치
