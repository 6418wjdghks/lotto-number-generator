# 🎰 로또번호 추첨기

간단한 웹 기반 로또번호 추첨 프로그램입니다.

**라이브 데모**: https://6418wjdghks.github.io/lotto-number-generator/

**GitHub 저장소**: https://github.com/6418wjdghks/lotto-number-generator

## 기능

### 핵심 기능 (Phase 2)
- 1부터 45까지의 숫자 중 6개를 무작위로 추첨 (Fisher-Yates 알고리즘)
- 자동 오름차순 정렬
- 애니메이션 효과로 시각적 재미 제공
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 확장 기능 (Phase 3)
- 여러 세트 동시 추첨 (1~5세트 선택)
- 추첨 이력 저장 및 조회 (LocalStorage, 최대 20개)
- 추첨 결과 클립보드 복사 (토스트 알림)
- 수동 번호 제외 (토글 버튼 그리드, 최대 39개 제외)
- 다크 모드 (테마 전환, 시스템 설정 감지, FOUC 방지)

### 백엔드 통합 (Phase 4 — 코드 완료, Supabase 설정 대기)
- 이메일/비밀번호 사용자 인증 (로그인/회원가입)
- 듀얼 모드 이력 관리 (비로그인: LocalStorage, 로그인: Supabase)

## 사용 방법

1. `index.html` 파일을 브라우저로 열기
2. 세트 수 선택 (1~5개)
3. 필요시 "번호 제외 설정"으로 원치 않는 번호 제외
4. "추첨하기" 버튼 클릭
5. 행운의 번호 확인!
6. 필요시 "복사" 버튼으로 결과 복사
7. 🌙/☀️ 버튼으로 다크 모드 전환

## 파일 구조

```
├── index.html              # 메인 HTML 파일
├── CLAUDE.md               # 프로젝트 가이드 (API 테이블)
├── package.json            # npm 스크립트 (test 등)
├── css/
│   └── style.css           # 스타일시트 (CSS Custom Properties)
├── js/
│   ├── utils.js            # 공통 유틸 (UUID, 토스트, 클립보드)
│   ├── theme.js            # 테마 (다크모드) 관리
│   ├── exclude.js          # 번호 제외 기능
│   ├── lottery.js          # 추첨 생성/표시
│   ├── history.js          # 이력 저장/로드/표시
│   ├── auth.js             # 사용자 인증
│   ├── app.js              # 메인 진입점 (총 34개 함수, 7개 모듈)
│   └── supabase-config.js  # Supabase REST API 래퍼
├── test/                   # 테스트 도구
│   ├── test-logic.js       # CLI 테스트 (23개, Node.js)
│   ├── test-dom.js         # DOM/UI CLI 러너 (Edge headless)
│   ├── test.html           # 브라우저 테스트 (50개)
│   └── README.md           # 테스트 문서
└── docs/                   # 프로젝트 문서
    ├── spec.md             # 기능 명세서
    ├── tech.md             # 기술 명세서
    ├── design.md           # 디자인 명세서
    ├── plan.md             # 프로젝트 계획서
    ├── decisions.md        # ADR (활성)
    ├── decisions_001_010.md # ADR 아카이브
    └── phase4-architecture.md  # Phase 4 기술 설계
```

## 기술 스택

- HTML5
- CSS3 (Custom Properties, 애니메이션, 그라데이션, Flexbox, Grid, 반응형)
- JavaScript (Vanilla JS, ES6+)
- LocalStorage (이력/제외번호/테마 저장)
- Supabase REST API (Phase 4 — SDK 미사용, 순수 fetch)

## 테스트

```bash
npm test                    # 전체 테스트 (로직 + DOM)
npm run test:logic          # CLI 순수 로직 (23개)
npm run test:dom            # DOM/UI Edge headless (50개)
```

```bash
# 브라우저에서 직접 확인
start test/test.html        # Windows
open test/test.html         # macOS
```

73개 테스트 (23 CLI + 50 DOM/UI). 상세 내용은 `test/README.md` 참조.

## 실행

```bash
# 브라우저에서 파일 열기
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

또는 `index.html` 파일을 직접 더블클릭하세요.

## 라이선스

MIT License
