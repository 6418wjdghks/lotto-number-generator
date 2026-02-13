# 로또번호 추첨기 - 프로젝트 계획서

## 프로젝트 개요

웹 기반 로또번호 추첨 애플리케이션 개발. 기술 스택: `docs/tech.md` 참조.

---

## 개발 단계

### Phase 1: 개발 환경 설정 ✅

프로젝트 디렉토리, Git, GitHub 연동, 문서 구조, 코드 파일 분리 완료.

---

### Phase 2: 로또번호 추첨기 핵심 기능 ✅

HTML 구조, UI/UX 디자인, 랜덤 번호 생성(Fisher-Yates), 반응형, 자동 테스트 완료.

---

### Phase 3: 기능 확장 및 개선 ✅ (100% 완료)

**완료 항목**:
- [x] 추첨 이력 저장 및 조회 (LocalStorage)
- [x] 여러 세트 동시 추첨 (1~5세트)
- [x] 추첨 결과 복사 기능
- [x] 수동 번호 제외 기능 (토글 버튼 그리드)

**추가 완료**:
- [x] 다크 모드 (테마 전환, LocalStorage 저장, 시스템 설정 감지)

**미착수 (우선순위 중간/낮음)**:
- 추첨 애니메이션 커스터마이징, 사운드 효과
- 번호 통계 분석, QR 공유, PWA, 다국어

---

### Phase 3 완료 후

- [x] 테스트 스위트 v2 전면 개선 (test/README.md 참조)
- [x] CLI 자동 테스트 도입 (Node.js `node:test`)
- [x] GitHub Pages 배포 (https://6418wjdghks.github.io/lotto-number-generator/)
- [ ] Phase 4 계획 검토 (docs/phase4-architecture.md 참조)
- [x] CSS 구조 개선 (design.md v4.1.0)
  - CSS 변수(디자인 토큰) 도입 — `:root` 블록 추가, 하드코딩 값을 변수로 교체
  - `button` → `.btn-primary` 분리 — 스타일 충돌 방지
  - `:focus-visible` 포커스 스타일 추가 — 접근성 개선
  - 미디어쿼리 통합 — 분산된 2개 블록을 1개로 통합
- [x] 코드 품질 및 접근성 개선 (5건)
  - clearHistory() 중복 제거 + 인증 함수 에러 처리 강화
  - HTML 접근성/시맨틱 개선 (main, label, aria-label, meta)
  - CSS 하드코딩 값을 디자인 토큰으로 완전 전환 (9개 추가 토큰)
  - 제외 번호 상태 LocalStorage 저장 (세션 유지)
  - 인라인 onclick → addEventListener 분리

---

## Phase 4 진행 중 (Supabase 백엔드 통합)

```
Phase 1: 개발 환경 설정     ████████████████████ 100%
Phase 2: 핵심 기능 구현     ████████████████████ 100%
Phase 3: 기능 확장 및 개선  ████████████████████ 100%
Phase 4: Supabase 백엔드    ████████░░░░░░░░░░░░  40%
```

**완료**:
1. [x] 아키텍처 선택: Supabase REST API 직접 호출 (ADR-016)
2. [x] 사용자 인증 UI + 핸들러 구현
3. [x] 듀얼 모드 이력 관리 구현 (Local/Supabase 분기)
4. [x] Supabase REST API 래퍼 생성 (`js/supabase-config.js`)

**대기**:
5. [ ] Supabase 대시보드에서 프로젝트 생성 + 테이블/RLS 설정 (사용자 수동)
6. [ ] `supabase-config.js`에 실제 URL/KEY 입력
7. [ ] 통합 테스트 (실제 Supabase 연동)

**다음**: Supabase 대시보드에서 프로젝트 생성 후 URL/KEY 교체

---

## 주요 고려사항

기술적 제약 및 설계 원칙: `docs/tech.md` 참조

---

**마지막 업데이트**: 2026-02-13
**현재 Phase**: Phase 4 진행 중
**프로젝트 상태**: Phase 4 코드 완료, Supabase 설정 대기 / 다크 모드 완료
