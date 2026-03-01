# 아키텍처 결정 기록 (Architecture Decision Records)

프로젝트의 주요 설계 결정과 그 사유를 기록합니다.

> 과거 ADR: [decisions_001_010.md](./decisions_001_010.md) (ADR-001~010) | [decisions_011_020.md](./decisions_011_020.md) (ADR-011~020) | [decisions_021_030.md](./decisions_021_030.md) (ADR-021~030) | [decisions_031_040.md](./decisions_031_040.md) (ADR-031~040)

**Chunk 규칙**: 활성 ADR **10개 초과** 시 가장 오래된 10개를 `decisions_NNN_MMM.md`로 아카이브. 헤더에 상호 링크 포함.

---

## 목차

| # | 결정 | 상태 | 날짜 |
|---|------|------|------|
| 041 | pre-commit hook Windows null 디바이스 정책 | 승인 | 2026-02-15 |
| 042 | 임시 HTTP 서버 수명주기 관리 (temp-server.js) | 승인 | 2026-03-01 |

---

## ADR-041: pre-commit hook Windows null 디바이스 정책

**상태**: 승인
**날짜**: 2026-02-15

### 배경

프로젝트 루트에 `nul` 파일(4440 bytes)이 반복 생성되는 문제 발생. `scripts/hooks/pre-commit`의 출력 리다이렉션이 원인으로 의심되어, `/dev/null`을 Windows `NUL`로 분기하는 수정(c41a6d9)이 적용되었으나, 실제 테스트 결과 해당 수정이 문제를 **악화**시키는 것으로 확인.

### 조사 결과

#### 환경 분석

Git for Windows의 pre-commit hook은 항상 **MSYS2 sh**(GNU bash 5.2.37, MINGW64)에서 실행된다.

```
$ ls -la /dev/null
crw-rw-rw- 1 gg730 197609 1, 3 ... /dev/null   ← character special device
$ file /dev/null
/dev/null: character special (1/3)
```

#### 리다이렉션 동작 비교 (Git Bash/MSYS2)

| 리다이렉션 대상 | 동작 | nul 파일 영향 |
|---|---|---|
| `> /dev/null` | MSYS2가 character device(1/3)로 매핑 → **정상 억제** | 없음 |
| `> NUL` | MSYS2가 일반 파일명으로 처리 → **`nul` 파일 생성/덮어쓰기** | 매 실행마다 생성 |

클린 디렉토리에서도 `echo "test" > NUL`은 `nul` 파일을 새로 생성함을 확인:

```
$ cd /tmp/clean && echo "test" > NUL && ls -la nul
-rw-r--r-- 1 gg730 197609 5 ... nul   ← 파일 생성됨
```

#### nul 파일의 실제 생성 원인

`nul` 파일 내용이 `npm run verify`의 출력 형식(`> lotto-number-generator@1.0.0 verify`)과 일치. 이는 pre-commit hook(`node scripts/verify.js` 직접 실행)이 아닌, **PowerShell에서 `npm run verify > nul` 등을 실행**한 것이 원인으로 추정.

- PowerShell: `> nul`을 일반 파일 리다이렉션으로 처리 → `nul` 파일 생성
- cmd.exe: `> nul`을 Windows null 디바이스로 처리 → 파일 생성 안 됨
- Git Bash: `> /dev/null`을 POSIX null 디바이스로 처리 → 파일 생성 안 됨

### 결정

**pre-commit hook에서는 `/dev/null`만 사용한다. Windows `NUL` 분기를 도입하지 않는다.**

#### 근거

1. **Git hook 실행 컨텍스트가 고정적**: `#!/bin/sh` shebang + Git for Windows 번들 sh = 항상 MSYS2 환경. `/dev/null`이 100% 동작
2. **`NUL`은 MSYS2에서 역효과**: Windows 예약어지만 MSYS2 POSIX 레이어에서는 일반 파일명으로 처리되어 오히려 파일 생성
3. **플랫폼 분기는 불필요한 복잡성**: hook이 cmd.exe나 PowerShell에서 실행되는 경우는 없음

#### 방어 조치

- `.gitignore`에 `nul` 항목 유지 — PowerShell 등에서 우발적으로 생성될 경우 git 추적 방지
- 기존 `nul` 파일은 삭제 완료

### 대안 검토

| 대안 | 장점 | 채택하지 않은 이유 |
|------|------|-------------------|
| `$WINDIR` 감지 → `NUL` 분기 (c41a6d9) | Windows 네이티브 의도 | MSYS2에서 `NUL`이 파일로 생성됨. 의도와 반대 동작 |
| 임시 파일 + 삭제 | 모든 플랫폼 동작 보장 | 불필요한 I/O, `/dev/null`이 이미 동작하므로 과잉 |
| `> /dev/null` 유지 | 단순, MSYS2에서 검증 완료 | **채택** |

### 교훈

1. **Windows Git Bash에서 `/dev/null`과 `NUL`은 다르다**: MSYS2는 `/dev/null`을 가상 디바이스로 매핑하지만, `NUL`은 POSIX 파일명으로 처리
2. **수정 전 실행 컨텍스트 확인 필수**: pre-commit hook이 어떤 셸에서 실행되는지 확인하지 않고 플랫폼 분기를 도입하면 역효과
3. **PowerShell에서 `> nul` 주의**: cmd.exe와 달리 PowerShell은 `nul`을 파일로 생성. `> $null` 사용 필요

---

## ADR-042: 임시 HTTP 서버 수명주기 관리 (temp-server.js)

**상태**: 승인
**날짜**: 2026-03-01

### 배경

CLI 에이전트가 HTML 보고서 PDF 변환, E2E 테스트 등에서 임시 HTTP 서버가 필요할 때 `npx serve`, `npx http-server`, ad-hoc `http.createServer` 등을 `run_in_background`로 실행하면 작업 종료 후에도 프로세스가 남아 좀비 프로세스가 되는 문제가 반복 발생했다.

#### 문제 상세

1. **좀비 프로세스**: `run_in_background`로 시작된 서버는 에이전트 세션 종료 후에도 살아있어 포트를 점유
2. **포트 충돌**: 이전 세션의 좀비 서버가 포트를 점유하면 다음 세션에서 같은 포트 사용 불가
3. **추적 불가**: ad-hoc 실행은 어떤 프로세스가 어떤 용도로 떠 있는지 식별 불가
4. **수동 정리 부담**: 사용자가 매번 `tasklist`/`taskkill`로 직접 정리해야 함

### 결정

**`scripts/temp-server.js` 단일 진입점으로 임시 HTTP 서버 수명주기를 관리한다. 다른 ad-hoc 서버 실행 방식은 금지한다.**

#### 구현

| 기능 | 설명 |
|------|------|
| PID 파일 (`temp/.temp-server.json`) | 활성 서버의 PID, 포트, 시작 시각을 JSON으로 추적 |
| 자동 정리 (idle timeout) | 기본 5분 무요청 시 자동 종료 (`--timeout` 조정 가능) |
| 중복 방지 | 같은 포트에 이전 인스턴스가 있으면 자동 교체 (kill → start) |
| 일괄 정리 (`--cleanup`) | 모든 활성 인스턴스 종료 + PID 파일 초기화 |
| Graceful shutdown | SIGINT/SIGTERM 핸들링 + PID 파일 자동 해제 |
| 준비 신호 | stdout 첫 줄 `READY http://localhost:{port}` → 호출자가 파싱 |

#### 프롬프트 규칙 (CLAUDE.md)

```
- 임시 파일 서빙이 필요하면 반드시 node scripts/temp-server.js 사용
- npx serve, npx http-server, node -e "http.createServer..." 등 ad-hoc 서버 금지
- 작업 완료 후 node scripts/temp-server.js --cleanup 실행
```

### 대안 검토

| 대안 | 장점 | 채택하지 않은 이유 |
|------|------|-------------------|
| `npx serve` / `npx http-server` | 설치 없이 즉시 사용 | PID 추적 불가, 좀비 프로세스 원인, idle timeout 없음 |
| ad-hoc `http.createServer` 인라인 | 유연함 | 매번 구현 필요, 수명주기 관리 코드 누락 가능 |
| OS 레벨 프로세스 그룹 관리 | 확실한 정리 | Windows/POSIX 차이로 복잡, 과잉 엔지니어링 |
| PID 파일 + 전용 스크립트 | 추적·정리·재사용 통합 | **채택** |

### 교훈

1. **`run_in_background` 서버는 반드시 수명주기 관리 필요**: 에이전트 세션은 프로세스 정리를 보장하지 않으므로, 서버 자체가 자동 종료 메커니즘을 가져야 한다
2. **PID 파일은 단순하지만 효과적**: JSON 기반 PID 파일로 다중 인스턴스 추적이 가능하고, prune 로직으로 죽은 프로세스 자동 정리
3. **프롬프트에 정책을 명시해야 준수됨**: 도구만 만들어두면 에이전트가 여전히 ad-hoc 방식을 사용할 수 있으므로, CLAUDE.md에 금지 규칙을 명시
