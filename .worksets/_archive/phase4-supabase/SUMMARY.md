# Phase 4: Supabase 백엔드 아키텍처 설계

> 아카이브 일자: 2026-02-25. 원본: `docs/phase4-architecture.md`

## 요약

Phase 4 백엔드 확장을 위한 아키텍처 설계 문서. Supabase REST API 직접 호출 방식 채택 (ADR-016).

## 주요 내용

- **아키텍처**: Supabase (Auth + PostgreSQL + REST API)
- **DB 스키마**: users, lottery_history, lottery_results, winning_history (4 테이블)
- **API 엔드포인트**: Auth (signup/login/me), History (CRUD), Results (조회), Winning Check
- **구현 로드맵**: Phase 4.1~4.6 (환경설정 → 인증 → 이력API → 당첨확인 → 배포 → 마이그레이션)
- **비용**: Supabase 무료 티어로 충분

## 포함 파일

- `phase4-architecture.md` — 전체 설계 문서 (616줄)
