/**
 * 정밀 검증 전처리 스크립트
 *
 * 기계적/정량적 검증을 자동화하여 에이전트 부하를 줄인다.
 * CSS 변수 비교, 함수 카운트, 테스트 카운트, 파일 존재 확인을 수행하고
 * 구조화된 JSON 리포트를 출력한다.
 *
 * 매직 넘버 없음: 기대값은 문서(design.md, CLAUDE.md, spec.md,
 * README.md)에서 동적 파싱하고, 테스트 수는 소스 실측으로 검증한다.
 *
 * 실행: node scripts/verify.js
 * 출력: stdout (JSON)
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// ============================================================
// Helpers
// ============================================================

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

function normalizeCss(val) {
  return val
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, ', ')
    .trim();
}

// ============================================================
// CSS Variable Parsing
// ============================================================

function parseCssBlock(text, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\s*\\{([^}]+)\\}', 's');
  const match = text.match(re);
  if (!match) return {};

  const vars = {};
  const varRe = /--([\w-]+)\s*:\s*(.+?)\s*;/g;
  let m;
  while ((m = varRe.exec(match[1])) !== null) {
    vars[`--${m[1]}`] = normalizeCss(m[2]);
  }
  return vars;
}

function parseDesignRootBlock(mdText) {
  const re = /```css\s*\n:root\s*\{([\s\S]*?)\}\s*\n```/;
  const match = mdText.match(re);
  if (!match) return {};

  const vars = {};
  const varRe = /--([\w-]+)\s*:\s*(.+?)\s*;/g;
  let m;
  while ((m = varRe.exec(match[1])) !== null) {
    vars[`--${m[1]}`] = normalizeCss(m[2]);
  }
  return vars;
}

function parseDesignDarkTable(mdText) {
  const vars = {};
  const rowRe = /\|\s*`(--([\w-]+))`[^|]*\|[^|]+\|\s*`([^`]+)`\s*\|/g;
  let m;
  while ((m = rowRe.exec(mdText)) !== null) {
    vars[m[1]] = normalizeCss(m[3]);
  }
  return vars;
}

function compareVars(docVars, cssVars) {
  const mismatches = [];

  for (const [name, docVal] of Object.entries(docVars)) {
    if (!(name in cssVars)) {
      mismatches.push({ var: name, issue: 'missing_in_css', doc: docVal });
    } else if (normalizeCss(docVal) !== normalizeCss(cssVars[name])) {
      mismatches.push({ var: name, issue: 'value_diff', doc: docVal, css: cssVars[name] });
    }
  }

  for (const [name, cssVal] of Object.entries(cssVars)) {
    if (!(name in docVars)) {
      mismatches.push({ var: name, issue: 'missing_in_doc', css: cssVal });
    }
  }

  return mismatches;
}

// ============================================================
// Keyframes & Media Queries
// ============================================================

function parseKeyframes(cssText) {
  const names = [];
  const re = /@keyframes\s+([\w-]+)/g;
  let m;
  while ((m = re.exec(cssText)) !== null) names.push(m[1]);
  return names;
}

function parseDesignKeyframes(mdText) {
  const start = mdText.indexOf('## 애니메이션 명세');
  if (start === -1) return [];
  const rest = mdText.slice(start);
  const nextSection = rest.indexOf('\n### ');
  const table = nextSection > -1 ? rest.slice(0, nextSection) : rest.slice(0, 500);

  const names = [];
  const re = /\|\s*`(\w+)`\s*\|/g;
  let m;
  while ((m = re.exec(table)) !== null) {
    names.push(m[1]);
  }
  return names;
}

function parseBreakpoints(cssText) {
  const re = /@media\s*\(([^)]+)\)/g;
  const all = [];
  let m;
  while ((m = re.exec(cssText)) !== null) all.push(m[1].trim());
  return { total: all.length, unique: [...new Set(all)] };
}

// ============================================================
// Document Parsers (ADR-029: 매직 넘버 제거)
// ============================================================

function parseClaudeMdModules(mdText) {
  const match = mdText.match(/## 모듈 구조[^\n]*\n\n(.+)/);
  if (!match) return { total: 0, moduleCount: 0, perModule: {} };

  const line = match[1];
  const perModule = {};
  let total = 0;

  const re = /(\w+\.js)\((\d+)\)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const count = parseInt(m[2], 10);
    perModule[m[1]] = count;
    total += count;
  }

  return { total, moduleCount: Object.keys(perModule).length, perModule };
}

function parseSpecAriaTable(mdText) {
  const entries = [];
  const re = /\|\s*`#(\w+)`\s*\|\s*`([\w-]+)`\s*\|\s*`([^`]+)`/g;
  let m;
  while ((m = re.exec(mdText)) !== null) {
    entries.push({ id: m[1], attr: m[2], value: m[3] });
  }
  return entries;
}

function parseReadmeFileTree(mdText) {
  const blockMatch = mdText.match(/```\n([\s\S]*?)```/);
  if (!blockMatch) return [];

  const lines = blockMatch[1].split('\n').filter(l => l.trim());
  const files = [];
  const dirs = [];

  for (const line of lines) {
    const match = line.match(/^(.*?)[├└]── (.+?)(?:\s{2,}#.*)?$/);
    if (!match) continue;

    const prefix = match[1];
    const name = match[2].trim();
    const depth = Math.floor(prefix.length / 4);

    if (name.endsWith('/')) {
      dirs[depth] = name.slice(0, -1);
      dirs.length = depth + 1;
    } else {
      const dirPath = dirs.slice(0, depth).join('/');
      files.push(dirPath ? `${dirPath}/${name}` : name);
    }
  }

  // 필수 파일만 필터: code + style + test + config (docs/, scripts/, .md 제외)
  return files.filter(f => {
    if (f.endsWith('.md')) return false;
    if (f.startsWith('docs/')) return false;
    if (f.startsWith('scripts/')) return false;
    return /\.(html|css|js|json)$/.test(f);
  });
}

// ============================================================
// Function Counting
// ============================================================

function countFunctions() {
  const jsDir = path.join(ROOT, 'js');
  const moduleFiles = ['utils.js', 'theme.js', 'exclude.js', 'lottery.js',
    'history.js', 'auth.js', 'app.js'];
  const perModule = {};
  let total = 0;
  let asyncCount = 0;

  for (const file of moduleFiles) {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf-8');
    const funcs = [];
    const re = /^(async )?function\s+(\w+)/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
      funcs.push({ name: m[2], async: !!m[1] });
      if (m[1]) asyncCount++;
      total++;
    }
    perModule[file] = { count: funcs.length, names: funcs.map(f => f.name) };
  }

  return { total, async: asyncCount, sync: total - asyncCount, perModule };
}

// ============================================================
// Test Counting
// ============================================================

function countTests() {
  const logic = readFile('test/test-logic.js');
  const html = readFile('test/test.html');

  const cliCount = (logic.match(/\bit\s*\(/g) || []).length;
  const domCount = (html.match(/PASS:/g) || []).length;

  return { cli: cliCount, dom: domCount, total: cliCount + domCount };
}

// ============================================================
// ARIA / Accessibility
// ============================================================

function checkAria(specAria) {
  const html = readFile('index.html');
  const lines = html.split('\n');

  const missing = [];
  for (const entry of specAria) {
    const idLine = lines.find(l => l.includes(`id="${entry.id}"`));
    if (!idLine) {
      missing.push({ ...entry, issue: 'id_not_found' });
    } else if (!idLine.includes(`${entry.attr}="${entry.value}"`)) {
      missing.push({ ...entry, issue: 'attr_missing_or_wrong' });
    }
  }

  return { expected: specAria.length, missing };
}

function checkSrOnly() {
  const html = readFile('index.html');

  // auth-input ID를 HTML에서 동적 발견
  const inputIds = [];
  const inputRe = /id="(\w+)"[^>]*class="auth-input"|class="auth-input"[^>]*id="(\w+)"/g;
  let m;
  while ((m = inputRe.exec(html)) !== null) {
    inputIds.push(m[1] || m[2]);
  }

  const missing = [];
  for (const id of inputIds) {
    const re = new RegExp(`<label\\s[^>]*for="${id}"[^>]*class="sr-only"`);
    if (!re.test(html)) {
      missing.push({ for: id });
    }
  }

  return { expected: inputIds.length, missing };
}

// ============================================================
// File Existence
// ============================================================

function checkFiles(expectedFiles) {
  const missing = expectedFiles.filter(f => !fs.existsSync(path.join(ROOT, f)));
  return { expected: expectedFiles.length, missing };
}

// ============================================================
// Main
// ============================================================

function main() {
  const css = readFile('css/style.css');
  const designMd = readFile('docs/design.md');
  const claudeMd = readFile('CLAUDE.md');
  const specMd = readFile('docs/spec.md');
  const readmeMd = readFile('README.md');

  // --- Document Parsers (기대값 동적 추출) ---
  const docRoot = parseDesignRootBlock(designMd);
  const docDark = parseDesignDarkTable(designMd);
  const docKeyframes = parseDesignKeyframes(designMd);
  const claudeModules = parseClaudeMdModules(claudeMd);
  const specAria = parseSpecAriaTable(specMd);
  const expectedFiles = parseReadmeFileTree(readmeMd);

  // --- CSS Parsing ---
  const cssRoot = parseCssBlock(css, ':root');
  const cssDark = parseCssBlock(css, 'html[data-theme="dark"]');
  const rootMismatches = compareVars(docRoot, cssRoot);
  const darkMismatches = compareVars(docDark, cssDark);
  const keyframes = parseKeyframes(css);
  const breakpoints = parseBreakpoints(css);

  // --- Source Counting ---
  const functions = countFunctions();
  const tests = countTests();

  // --- Structural Checks ---
  const aria = checkAria(specAria);
  const srOnly = checkSrOnly();
  const files = checkFiles(expectedFiles);

  // Build report
  const checks = [];
  function check(name, pass, detail) {
    checks.push({ name, pass, detail });
  }

  const cssRootCount = Object.keys(cssRoot).length;
  const docRootCount = Object.keys(docRoot).length;
  check('css.root.count', cssRootCount === docRootCount && docRootCount > 0,
    `css:${cssRootCount} ↔ doc:${docRootCount}`);
  check('css.root.values', rootMismatches.length === 0,
    rootMismatches.length === 0 ? 'all match' : rootMismatches);

  const cssDarkCount = Object.keys(cssDark).length;
  const docDarkCount = Object.keys(docDark).length;
  check('css.dark.count', cssDarkCount === docDarkCount && docDarkCount > 0,
    `css:${cssDarkCount} ↔ doc:${docDarkCount}`);
  check('css.dark.values', darkMismatches.length === 0,
    darkMismatches.length === 0 ? 'all match' : darkMismatches);

  check('css.keyframes', keyframes.length === docKeyframes.length && docKeyframes.length > 0,
    { css: keyframes.length, doc: docKeyframes.length, cssNames: keyframes, docNames: docKeyframes });
  check('css.breakpoints', breakpoints.unique.length === 1 && breakpoints.unique[0] === 'max-width: 480px',
    { unique: breakpoints.unique, mediaQueryCount: breakpoints.total });

  check('functions.total', functions.total === claudeModules.total && claudeModules.total > 0,
    { grep: functions.total, claudeMd: claudeModules.total, async: functions.async, sync: functions.sync });

  check('tests.cli', tests.cli > 0, `${tests.cli} tests`);
  check('tests.dom', tests.dom > 0, `${tests.dom} tests`);
  check('tests.total', tests.total === tests.cli + tests.dom && tests.total > 0,
    `${tests.total} tests (cli:${tests.cli} + dom:${tests.dom})`);

  check('aria.attributes', aria.missing.length === 0 && specAria.length > 0,
    aria.missing.length === 0 ? `all ${aria.expected} present (from spec.md)` : { missing: aria.missing });
  check('aria.srOnly', srOnly.missing.length === 0 && srOnly.expected > 0,
    srOnly.missing.length === 0 ? `all ${srOnly.expected} present (dynamic)` : { missing: srOnly.missing });
  check('files', files.missing.length === 0 && expectedFiles.length > 0,
    files.missing.length === 0 ? `all ${files.expected} present (from README.md)` : { missing: files.missing });

  const failed = checks.filter(c => !c.pass);
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      allPassed: failed.length === 0
    },
    checks,
    data: {
      functions: functions.perModule,
      keyframes,
      breakpoints,
      sources: {
        'design.md': { rootVars: docRootCount, darkVars: docDarkCount, keyframes: docKeyframes.length },
        'CLAUDE.md': { modules: claudeModules.moduleCount, functions: claudeModules.total },
        'spec.md': { ariaEntries: specAria.length },
        'README.md': { codeFiles: expectedFiles.length }
      }
    }
  };

  // JSON output to stdout
  console.log(JSON.stringify(report, null, 2));

  // Human-readable summary to stderr
  const log = (...args) => process.stderr.write(args.join(' ') + '\n');
  log('\n=== 정밀 검증 전처리 ===');
  for (const c of checks) {
    log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name}: ${typeof c.detail === 'string' ? c.detail : JSON.stringify(c.detail)}`);
  }
  log(`\n결과: ${report.summary.passed}/${report.summary.total} pass`);
  if (failed.length > 0) {
    log(`불일치: ${failed.map(c => c.name).join(', ')}`);
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main();
