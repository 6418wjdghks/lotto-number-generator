# 아키텍처 결정 기록 (Architecture Decision Records)

프로젝트의 주요 설계 결정과 그 사유를 기록합니다.

> 과거 ADR: [decisions_001_010.md](./decisions_001_010.md) (ADR-001~010) | [decisions_011_020.md](./decisions_011_020.md) (ADR-011~020) | [decisions_021_030.md](./decisions_021_030.md) (ADR-021~030)

**Chunk 규칙**: 활성 ADR **10개 초과** 시 가장 오래된 10개를 `decisions_NNN_MMM.md`로 아카이브. 헤더에 상호 링크 포함.

---

## 목차

| # | 결정 | 상태 | 날짜 |
|---|------|------|------|
| 031 | 모듈 레이어 아키텍처 및 로딩 순서 | 승인 | 2026-02-14 |

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
