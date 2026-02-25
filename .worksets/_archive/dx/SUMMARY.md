# dx (Developer Experience) — Archive Summary

## check-deps (2026-02-25)

- **목적**: npm install 미실행 시 MODULE_NOT_FOUND 대신 명확한 안내 메시지 출력
- **산출물**: `scripts/check-deps.js`, package.json pretest/preverify hook
- **부수 수정**: verify.js CRLF 버그 수정 (Windows 호환)
- **커밋**: `90b94ed` (dev)
