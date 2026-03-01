/**
 * temp-server.js — 임시 HTTP 파일 서버 (수명주기 관리)
 *
 * Usage:
 *   node scripts/temp-server.js [options]
 *
 * Options:
 *   --port <n>       포트 (기본: 0 = OS 자동 할당)
 *   --root <dir>     서빙 루트 디렉토리 (기본: temp/)
 *   --timeout <sec>  idle 타임아웃 초 (기본: 300, 0 = 무제한)
 *   --cleanup        이전 인스턴스 모두 종료 후 exit
 *
 * 첫 줄 출력: READY http://localhost:{port}
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const PID_FILE = path.join(PROJECT_ROOT, 'temp', '.temp-server.json');
const DEFAULT_TIMEOUT = 300; // 5분

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

// ── 인자 파싱 ──────────────────────────────────────────────

function parseArgs(argv) {
  const args = { port: 0, root: 'temp', timeout: DEFAULT_TIMEOUT, cleanup: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--port':    args.port = parseInt(argv[++i], 10); break;
      case '--root':    args.root = argv[++i]; break;
      case '--timeout': args.timeout = parseInt(argv[++i], 10); break;
      case '--cleanup': args.cleanup = true; break;
    }
  }
  return args;
}

// ── PID 파일 관리 ──────────────────────────────────────────

function readPidFile() {
  try {
    return JSON.parse(fs.readFileSync(PID_FILE, 'utf-8'));
  } catch { return []; }
}

function writePidFile(entries) {
  const dir = path.dirname(PID_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PID_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

function isProcessAlive(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function killProcess(pid) {
  try { process.kill(pid, 'SIGTERM'); } catch { /* already dead */ }
}

/** PID 파일에서 죽은 프로세스 제거 + 살아있는 목록 반환 */
function prunePidFile() {
  const entries = readPidFile();
  const alive = entries.filter(e => isProcessAlive(e.pid));
  writePidFile(alive);
  return alive;
}

/** 현재 프로세스를 PID 파일에 등록 */
function registerSelf(port) {
  const entries = prunePidFile();
  entries.push({ pid: process.pid, port, startedAt: new Date().toISOString() });
  writePidFile(entries);
}

/** PID 파일에서 현재 프로세스 제거 */
function unregisterSelf() {
  try {
    const entries = readPidFile().filter(e => e.pid !== process.pid);
    writePidFile(entries);
  } catch { /* 종료 중 에러 무시 */ }
}

// ── Cleanup 모드 ───────────────────────────────────────────

function runCleanup() {
  const entries = readPidFile();
  if (entries.length === 0) {
    console.log('활성 임시 서버 없음');
    return;
  }
  let killed = 0;
  for (const entry of entries) {
    if (isProcessAlive(entry.pid)) {
      killProcess(entry.pid);
      console.log(`종료: PID ${entry.pid} (port ${entry.port})`);
      killed++;
    }
  }
  writePidFile([]);
  console.log(`정리 완료: ${killed}개 종료, ${entries.length - killed}개 이미 종료됨`);
}

// ── 같은 포트의 이전 인스턴스 정리 ─────────────────────────

function killPreviousOnPort(port) {
  if (port === 0) return; // 자동 할당이면 충돌 없음
  const entries = readPidFile();
  for (const entry of entries) {
    if (entry.port === port && isProcessAlive(entry.pid)) {
      killProcess(entry.pid);
      console.error(`이전 인스턴스 종료: PID ${entry.pid} (port ${port})`);
    }
  }
}

// ── HTTP 서버 ──────────────────────────────────────────────

function createServer(rootDir) {
  const absRoot = path.resolve(PROJECT_ROOT, rootDir);
  return http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(absRoot, urlPath);

    // 디렉토리 탈출 방지
    if (!filePath.startsWith(absRoot)) {
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
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

// ── Idle 타임아웃 ──────────────────────────────────────────

function setupIdleTimeout(server, timeoutSec) {
  if (timeoutSec <= 0) return; // 무제한

  const ms = timeoutSec * 1000;
  let timer = setTimeout(() => shutdown(server, 'idle timeout'), ms);

  server.on('request', () => {
    clearTimeout(timer);
    timer = setTimeout(() => shutdown(server, 'idle timeout'), ms);
  });
}

// ── Graceful Shutdown ──────────────────────────────────────

let shuttingDown = false;

function shutdown(server, reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.error(`종료 중 (${reason})`);
  unregisterSelf();
  server.close(() => process.exit(0));
  // 강제 종료 fallback (1초)
  setTimeout(() => process.exit(0), 1000).unref();
}

// ── Main ───────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);

  if (args.cleanup) {
    runCleanup();
    return;
  }

  killPreviousOnPort(args.port);

  const server = createServer(args.root);

  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  process.on('exit', () => unregisterSelf());

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`ERROR: 포트 ${args.port}이 이미 사용 중입니다.`);
    } else {
      console.error(`ERROR: ${err.message}`);
    }
    process.exit(1);
  });

  server.listen(args.port, '127.0.0.1', () => {
    const actualPort = server.address().port;
    registerSelf(actualPort);
    setupIdleTimeout(server, args.timeout);
    console.log(`READY http://localhost:${actualPort}`);
  });
}

main();
