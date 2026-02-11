# 🎰 로또번호 추첨기

간단한 웹 기반 로또번호 추첨 프로그램입니다.

**GitHub 저장소**: https://github.com/6418wjdghks/lotto-number-generator

## 기능

### 핵심 기능
- 1부터 45까지의 숫자 중 6개를 무작위로 추첨 (Fisher-Yates 알고리즘)
- 자동 오름차순 정렬
- 애니메이션 효과로 시각적 재미 제공
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 확장 기능 (Phase 3)
- 여러 세트 동시 추첨 (1~5세트 선택)
- 추첨 이력 저장 및 조회 (LocalStorage, 최대 20개)
- 추첨 결과 클립보드 복사 (토스트 알림)

## 사용 방법

1. `index.html` 파일을 브라우저로 열기
2. 세트 수 선택 (1~5개)
3. "추첨하기" 버튼 클릭
4. 행운의 번호 확인!
5. 필요시 "복사" 버튼으로 결과 복사

## 파일 구조

```
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css       # 스타일시트
├── js/
│   └── app.js          # JavaScript 로직 (13개 함수)
├── test/               # 테스트 도구
│   ├── test.html       # 자동 테스트 (v2, 21개 테스트)
│   └── README.md       # 테스트 문서
└── docs/               # 프로젝트 문서
    ├── plan.md         # 프로젝트 계획서
    ├── spec.md         # 기능 명세서
    ├── design.md       # 디자인 명세서
    ├── tech.md         # 기술 명세서
    └── phase4-architecture.md  # Phase 4 기술 설계
```

## 기술 스택

- HTML5
- CSS3 (애니메이션, 그라데이션, 반응형)
- JavaScript (Vanilla JS, ES6+)
- LocalStorage (이력 저장)

## 테스트

```bash
# 자동 테스트 실행 (페이지 로드 시 자동 실행)
start test/test.html  # Windows
open test/test.html   # macOS
```

21개 테스트, app.js 13개 함수 100% 커버리지. 상세 내용은 `test/README.md` 참조.

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
