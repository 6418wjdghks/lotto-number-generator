# Git Helper Plugin

GitHub 프로젝트 작업을 위한 Git 및 GitHub 설정 검증 플러그인입니다.

## 기능

### Skills

- **git-verify**: Git 커밋/푸시 전에 Git 설정, GitHub 인증, 저장소 상태를 검증합니다.

## 사용 방법

스킬은 자동으로 활성화됩니다. 다음과 같은 상황에서 Claude가 자동으로 사용합니다:

- "git 설정 확인해줘"
- "github 연동 상태 검증해줘"
- Git 커밋을 시도하기 전
- 새 저장소를 설정할 때

## 설치

이 플러그인은 프로젝트 로컬 플러그인으로 `.claude/plugins/local/` 디렉토리에 위치합니다.

## 라이선스

MIT
