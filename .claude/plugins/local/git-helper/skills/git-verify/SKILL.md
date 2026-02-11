---
name: git-verify
description: This skill should be used when the user asks to "verify git setup", "check git status", "validate git configuration", "check github connection", or before making git commits or pushes. Verifies Git and GitHub configuration.
version: 1.0.0
---

# Git 검증 스킬

GitHub 프로젝트 작업 전에 Git 및 GitHub 설정을 검증하는 스킬입니다.

## 이 스킬을 사용하는 경우

- Git 커밋이나 푸시를 시도하기 전
- 새로운 저장소를 설정할 때
- Git 설정 문제를 해결할 때
- GitHub 연동 상태를 확인할 때

## 검증 항목

### 1. Git 사용자 정보 확인

먼저 Git 사용자 정보가 설정되어 있는지 확인합니다:

```bash
# 전역 설정 확인
git config --global user.name
git config --global user.email

# 로컬 저장소 설정 확인 (있는 경우)
git config user.name
git config user.email
```

**예상 결과:**
- 이름과 이메일이 출력되어야 함
- 출력이 없으면 설정이 필요함

**설정 방법:**
```bash
git config --global user.name "사용자이름"
git config --global user.email "email@example.com"
```

### 2. GitHub CLI 인증 상태 확인

GitHub CLI가 설치되어 있고 인증되어 있는지 확인합니다:

```bash
# gh CLI 설치 확인
gh --version

# 인증 상태 확인
gh auth status
```

**예상 결과:**
- `gh` 명령어가 인식되어야 함
- "Logged in to github.com" 메시지가 표시되어야 함

**인증 방법:**
```bash
# 브라우저를 통한 인증
gh auth login
```

### 3. Git 저장소 상태 확인

현재 디렉토리가 Git 저장소인지, remote가 설정되어 있는지 확인합니다:

```bash
# Git 저장소인지 확인
git rev-parse --is-inside-work-tree

# Remote 설정 확인
git remote -v

# 현재 브랜치 확인
git branch --show-current
```

**예상 결과:**
- `true` 출력 (Git 저장소인 경우)
- Remote URL 목록 표시 (설정된 경우)
- 현재 브랜치 이름 표시

### 4. 저장소 상태 요약

```bash
# 전체 상태 확인
git status
```

## 검증 절차

1. **Git 사용자 정보 검증**
   - 전역 또는 로컬 사용자 정보가 설정되어 있는지 확인
   - 없으면 사용자에게 설정 요청

2. **GitHub 인증 검증** (선택사항)
   - `gh` CLI가 설치되어 있으면 인증 상태 확인
   - 인증되지 않았으면 `gh auth login` 안내

3. **저장소 설정 검증**
   - Git 저장소 여부 확인
   - Remote 설정 확인 (push할 곳이 있는지)
   - 현재 브랜치 확인

4. **결과 요약**
   - 모든 검증 항목의 상태를 사용자에게 명확하게 전달
   - 문제가 있으면 해결 방법 제시
   - 모든 것이 정상이면 다음 단계 진행 가능 알림

## 검증 결과 출력 형식

검증을 수행한 후 다음과 같은 형식으로 결과를 요약합니다:

```
✅ Git 검증 완료

📋 Git 사용자 정보
   이름: [사용자이름]
   이메일: [이메일]

🔐 GitHub 인증
   상태: [인증됨/미인증]
   계정: [GitHub 계정명]

📦 저장소 정보
   Git 저장소: [예/아니오]
   Remote: [URL 또는 "설정되지 않음"]
   브랜치: [브랜치명]

💡 다음 단계: [권장 작업]
```

## 주의사항

- Git 사용자 정보가 없으면 커밋이 실패함
- GitHub 인증이 없으면 private 저장소에 push할 수 없음
- Remote가 설정되지 않았으면 push할 수 없음
- 검증 후 문제가 있으면 사용자에게 명확한 해결 방법 제시
