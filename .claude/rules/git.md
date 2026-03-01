## Git 정책

형식: `feat|fix|refactor|docs|test|style(workset명): 설명` + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
workset 없는 공통 작업: `feat|fix|...: 설명` (괄호 생략)
결과 요약 후 사용자 승인 → 커밋/푸시

### 브랜치 구조

- `master`: verify 완료된 안정 코드
- `dev`: 활성 개발 브랜치 (코드 구현은 여기서)
