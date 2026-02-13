/**
 * DOM/UI 테스트 CLI 러너
 *
 * puppeteer-core + Edge headless로 test/test.html을 실행하고
 * 결과를 CLI에 텍스트로 출력한다.
 *
 * 사용법:
 *   node test/test-dom.js              # 테스트만 실행
 *   node test/test-dom.js --screenshot # 스크린샷도 저장
 *   node test/test-dom.js --screenshot=path/to/file.png
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

// ============================================================
// Edge 경로 탐색
// ============================================================

function findEdgePath() {
  const candidates = [
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(process.env['PROGRAMFILES'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ];

  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }

  return null;
}

// ============================================================
// 미니 HTTP 서버 (프로젝트 루트 정적 서빙)
// ============================================================

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(rootDir, urlPath);

    // 디렉토리 탈출 방지
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

// ============================================================
// CLI 인자 파싱
// ============================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let screenshot = false;
  let screenshotPath = 'test/screenshot.png';

  for (const arg of args) {
    if (arg === '--screenshot') {
      screenshot = true;
    } else if (arg.startsWith('--screenshot=')) {
      screenshot = true;
      screenshotPath = arg.slice('--screenshot='.length);
    }
  }

  return { screenshot, screenshotPath };
}

// ============================================================
// 메인 실행
// ============================================================

async function main() {
  const { screenshot, screenshotPath } = parseArgs();

  console.log('DOM/UI Test Runner (puppeteer-core + Edge headless)');
  console.log('====================================================');

  // 1. Edge 경로 확인
  const edgePath = findEdgePath();
  if (!edgePath) {
    console.error('ERROR: Microsoft Edge를 찾을 수 없습니다.');
    console.error('확인 경로: Program Files (x86), Program Files, LocalAppData');
    process.exit(1);
  }

  // 2. HTTP 서버 시작
  const projectRoot = path.resolve(__dirname, '..');
  const server = createStaticServer(projectRoot);

  const port = await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });

  let browser;

  try {
    // 3. Edge headless 실행
    browser = await puppeteer.launch({
      executablePath: edgePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // 4. 클립보드 읽기/쓰기 권한 부여 (CDP)
    const client = await page.createCDPSession();
    await client.send('Browser.grantPermissions', {
      permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
      origin: `http://127.0.0.1:${port}`,
    });

    // 5. console 이벤트 → CLI 출력
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.startsWith('[PASS]')) {
        console.log(`  \x1b[32m${text}\x1b[0m`);
      } else if (text.startsWith('[FAIL]')) {
        console.log(`  \x1b[31m${text}\x1b[0m`);
      } else if (text.startsWith('[INFO]')) {
        console.log(`  \x1b[36m${text}\x1b[0m`);
      }
    });

    // 6. 페이지 탐색
    const url = `http://127.0.0.1:${port}/test/test.html`;
    await page.goto(url, { waitUntil: 'load' });

    // 7. 테스트 완료 대기 (30초 타임아웃)
    await page.waitForFunction(
      () => document.body.dataset.testComplete === 'true',
      { timeout: 30000 }
    );

    // 8. 결과 집계 (dataset에 저장된 카운트 사용)
    const results = await page.evaluate(() => {
      const pass = parseInt(document.body.dataset.testPassCount, 10);
      const fail = parseInt(document.body.dataset.testFailCount, 10);
      return { pass, fail };
    });

    // 9. 스크린샷 (선택)
    if (screenshot) {
      const absPath = path.resolve(screenshotPath);
      const dir = path.dirname(absPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await page.screenshot({ path: absPath, fullPage: true });
      console.log(`\nScreenshot saved: ${absPath}`);
    }

    // 10. 요약 출력
    console.log('====================================================');
    if (results.fail === 0) {
      console.log(`\x1b[32mResult: ${results.pass} passed, ${results.fail} failed\x1b[0m`);
    } else {
      console.log(`\x1b[31mResult: ${results.pass} passed, ${results.fail} failed\x1b[0m`);
    }

    // 11. 종료코드
    process.exitCode = results.fail > 0 ? 1 : 0;
  } catch (err) {
    console.error(`\nERROR: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main();
