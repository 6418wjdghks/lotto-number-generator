---
paths:
  - ".worksets/**"
---

## 동시 작업 프로토콜

여러 작업자(사람/에이전트)가 `dev` 브랜치에서 동시에 작업할 때의 규칙. workset 기반 충돌 방지 + 테스트에 기반한다.

### Workset 기반 충돌 방지

- 각 workset의 SPEC.md에 **수정 대상 모듈**이 명시됨
- 새 workset 생성 시 활성 workset들의 수정 대상과 **겹침 검사** 필수
- 모듈이 겹치면 작업 순서를 조율하거나 workset을 통합

### 세션 워크플로우

1. **시작**: `git pull origin dev` → `.worksets/`에서 활성 workset 확인 → 담당 workset의 CONTEXT.md 읽기
2. **작업**: `dev` 브랜치에 코드 구현, workset의 수정 대상 모듈 범위 내에서 작업
3. **종료**: CONTEXT.md 세션 로그 갱신 → 커밋 → `git push origin dev`

### 테스트가 계약이다

- 기능 변경 시 **테스트를 먼저 작성/수정** — 테스트가 변경의 명세 역할
- `npm run verify && npm test` 전체 통과하면 통합 성공으로 판단
- conflict 발생 시: base/theirs/mine 세 버전의 **의도를 파악**하여 병합, 이후 verify로 확인

### dev → master 머지 절차

1. dev에서 workset 작업 완료
2. `npm run verify && npm test` 전체 통과 확인
3. PR 생성 → master에 머지
