/**
 * 의존성 설치 여부 체크 스크립트
 *
 * package.json의 devDependencies를 동적으로 읽어
 * require.resolve로 설치 여부를 확인한다.
 * 미설치 패키지가 있으면 안내 메시지와 함께 exit 1.
 *
 * 실행: node scripts/check-deps.js
 * hook: pretest, preverify
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function main() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = Object.keys(pkg.devDependencies || {});

  if (deps.length === 0) {
    process.stderr.write('[check-deps] devDependencies 없음 — 스킵\n');
    process.exit(0);
  }

  const missing = [];

  for (const name of deps) {
    try {
      require.resolve(name, { paths: [ROOT] });
    } catch {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    process.stderr.write('\n');
    process.stderr.write('========================================\n');
    process.stderr.write('  [check-deps] 미설치 패키지 발견!\n');
    process.stderr.write('========================================\n');
    for (const name of missing) {
      process.stderr.write(`  MISSING: ${name}\n`);
    }
    process.stderr.write('\n');
    process.stderr.write('  해결: npm install\n');
    process.stderr.write('========================================\n');
    process.stderr.write('\n');
    process.exit(1);
  }

  process.stderr.write(`[check-deps] 모든 의존성 확인 완료 (${deps.length}개)\n`);
  process.exit(0);
}

main();
