# Worksets

Feature 단위의 작업 컨텍스트를 관리하는 디렉토리입니다.

## 구조

```
.worksets/
  _template/              ← 새 workset 생성 시 복사할 템플릿
  _archive/               ← 완료/폐기된 workset 보관
    <카테고리>/
      SUMMARY.md          ← 전체 iteration 요약 (조회 시 이것만 읽으면 됨)
      <phase명>/          ← 각 iteration의 SPEC, CONTEXT, TESTPLAN
  <workset명>/            ← 진행 중인 workset
```

## 활성 workset 식별

- `.worksets/` 루트에서 `_`로 시작하지 않는 디렉토리 = 활성 workset
- `_archive/`, `_template/`은 무시

## 생명주기

1. **생성**: `_template/`을 복사하여 새 디렉토리 생성 → SPEC.md 작성
2. **작업**: 코드는 `dev` 브랜치에 구현, CONTEXT.md에 진행상황 갱신
3. **완료**: TESTPLAN.md 검증 후 아카이브로 이동
   - `_archive/<카테고리>/` 존재 여부 확인
   - 없으면 카테고리 디렉토리 + SUMMARY.md 생성
   - workset을 `_archive/<카테고리>/<phase명>/`으로 이동
   - SUMMARY.md에 해당 iteration 요약 추가
4. **폐기**: CONTEXT.md에 사유 기록 후 동일한 아카이브 절차 수행

## 아카이브 조회

1단계: `ls _archive/` → 카테고리 목록 파악
2단계: `_archive/<카테고리>/SUMMARY.md` 읽기 → 과거 이력 파악
3단계: 필요 시 특정 phase 디렉토리의 상세 문서 참조

## 규칙

- 하나의 workset = 하나의 독립적 작업 단위
- 코드 작업 시작 전 반드시 SPEC.md 합의 완료
- CONTEXT.md는 작업 세션마다 갱신
- 새 workset 생성 시 `_archive/`에서 동일 카테고리 이력 확인
