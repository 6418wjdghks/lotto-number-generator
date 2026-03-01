---
paths:
  - "docs/**"
  - "README.md"
---

## 문서 변경 시 업데이트 대상

기능추가 → spec, plan, tech | UI변경 → design | 설계결정 → decisions (ADR)
테스트 → test/README | Phase완료 → plan | 구조변경 → README 파일트리
strong_verify → verification.md (verify 결과 + 성능 지표)
_context.md → Phase 전환 또는 블로커 변경 시에만 갱신

## 문서 관리 규칙

- 코드 구조 변경 시 README.md 파일 구조 섹션 동기화
- 아카이브 파일 생성 시 README.md 파일 트리 업데이트
- 암묵적 패턴은 명문화해야 지속 적용됨
