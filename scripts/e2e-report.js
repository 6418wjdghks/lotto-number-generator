#!/usr/bin/env node
/**
 * E2E 반응형 테스트 보고서 생성기
 * 결과 JSON + 스크린샷 → HTML 보고서
 *
 * Usage:
 *   node scripts/e2e-report.js [옵션]
 *     --input <path>        결과 JSON (기본: temp/e2e-results.json)
 *     --screenshots <dir>   스크린샷 경로 (기본: temp/screenshots/)
 *     --output <path>       HTML 출력 (기본: temp/e2e-report-temp.html)
 *     --html-only           HTML만 생성 (기본, SKILL.md가 Playwright로 PDF 변환)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    input: path.join(ROOT, 'temp/e2e-results.json'),
    screenshots: path.join(ROOT, 'temp/screenshots'),
    output: path.join(ROOT, 'temp/e2e-report-temp.html'),
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input' && argv[i + 1]) args.input = path.resolve(argv[++i]);
    else if (argv[i] === '--screenshots' && argv[i + 1]) args.screenshots = path.resolve(argv[++i]);
    else if (argv[i] === '--output' && argv[i + 1]) args.output = path.resolve(argv[++i]);
    else if (argv[i] === '--html-only') { /* default behavior */ }
  }
  return args;
}

function loadScreenshot(dir, filename) {
  if (!filename) return null;
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) return null;
  const buf = fs.readFileSync(filepath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function statusBadge(status) {
  const isPass = status === 'pass';
  const color = isPass ? '#22c55e' : '#ef4444';
  const label = isPass ? 'PASS' : 'FAIL';
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:12px">${label}</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateHtml(data, screenshotDir) {
  const { meta, groups, overall } = data;
  const date = meta.date || new Date().toISOString().slice(0, 10);
  const mode = meta.mode || 'full';
  const passRate = overall.total > 0 ? ((overall.pass / overall.total) * 100).toFixed(1) : '0.0';
  const allPass = overall.fail === 0;

  let groupsHtml = '';
  for (const group of groups) {
    let itemsHtml = '';
    for (const item of group.items) {
      const screenshot = loadScreenshot(screenshotDir, item.screenshotFile);
      const screenshotHtml = screenshot
        ? `<div style="margin-top:4px"><img src="${screenshot}" style="max-width:100%;max-height:300px;border:1px solid #ddd;border-radius:4px" /></div>`
        : '';
      itemsHtml += `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;white-space:nowrap">${escapeHtml(item.id)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${statusBadge(item.status)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#555">${escapeHtml(item.detail)}${screenshotHtml}</td>
        </tr>`;
    }

    const vpLabel = group.viewport
      ? `${group.viewport.width}x${group.viewport.height}`
      : '';

    groupsHtml += `
      <div style="page-break-inside:avoid;margin-bottom:32px">
        <h2 style="color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:4px;margin-bottom:12px">
          ${escapeHtml(group.group)}. ${escapeHtml(group.groupName)}${vpLabel ? ` (${vpLabel})` : ''}
        </h2>
        <p style="margin:0 0 8px;color:#666">
          합계: ${group.summary.total}항목 |
          <span style="color:#22c55e">PASS ${group.summary.pass}</span> |
          <span style="color:#ef4444">FAIL ${group.summary.fail}</span>
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f1f5f9">
              <th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;width:60px">ID</th>
              <th style="padding:8px;text-align:left;border-bottom:2px solid #ddd">항목</th>
              <th style="padding:8px;text-align:center;border-bottom:2px solid #ddd;width:70px">결과</th>
              <th style="padding:8px;text-align:left;border-bottom:2px solid #ddd">상세</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}
          </tbody>
        </table>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>E2E 반응형 테스트 리포트</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.5; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:32px;padding-bottom:16px;border-bottom:3px solid #1e40af">
    <h1 style="margin:0 0 8px;color:#1e40af">E2E 반응형 테스트 리포트</h1>
    <p style="margin:0;color:#64748b">로또번호 추첨기 | ${date} | 모드: ${mode}</p>
  </div>

  <div style="display:flex;gap:16px;margin-bottom:32px;flex-wrap:wrap">
    <div style="flex:1;min-width:120px;background:${allPass ? '#f0fdf4' : '#fef2f2'};border:1px solid ${allPass ? '#86efac' : '#fca5a5'};border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:${allPass ? '#16a34a' : '#dc2626'}">${passRate}%</div>
      <div style="color:#64748b;font-size:13px">통과율</div>
    </div>
    <div style="flex:1;min-width:120px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:#16a34a">${overall.pass}</div>
      <div style="color:#64748b;font-size:13px">PASS</div>
    </div>
    <div style="flex:1;min-width:120px;background:${overall.fail > 0 ? '#fef2f2' : '#f8fafc'};border:1px solid ${overall.fail > 0 ? '#fca5a5' : '#e2e8f0'};border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:${overall.fail > 0 ? '#dc2626' : '#94a3b8'}">${overall.fail}</div>
      <div style="color:#64748b;font-size:13px">FAIL</div>
    </div>
    <div style="flex:1;min-width:120px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:#334155">${overall.total}</div>
      <div style="color:#64748b;font-size:13px">전체</div>
    </div>
  </div>

  <div style="margin-bottom:32px;page-break-after:always">
    <h2 style="color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:4px">환경 정보</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold;width:140px">테스트 대상</td><td style="padding:6px 8px;border-bottom:1px solid #eee">로또번호 추첨기 (localhost:8080)</td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">브라우저</td><td style="padding:6px 8px;border-bottom:1px solid #eee">Microsoft Edge (Playwright MCP)</td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">실행 모드</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${mode === 'quick' ? 'Quick (~15항목)' : 'Full (63항목)'}</td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">실행 날짜</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${date}</td></tr>
    </table>
  </div>

  ${groupsHtml}

  <div style="margin-top:32px;padding-top:16px;border-top:2px solid #1e40af;page-break-inside:avoid">
    <h2 style="color:#1e40af;margin-bottom:8px">종합 결론</h2>
    <p style="font-size:16px">${allPass
      ? `전체 ${overall.total}개 항목 <strong style="color:#16a34a">ALL PASS</strong>. 반응형 레이아웃 및 기능이 정상 동작합니다.`
      : `전체 ${overall.total}개 항목 중 <strong style="color:#dc2626">${overall.fail}개 FAIL</strong>. 실패 항목의 상세 내용을 확인하고 수정이 필요합니다.`
    }</p>
  </div>

  <div style="margin-top:24px;text-align:center;color:#94a3b8;font-size:12px;padding-top:12px;border-top:1px solid #e2e8f0">
    Generated by e2e-report.js | ${date}
  </div>
</body>
</html>`;
}

function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(args.input)) {
    console.error(`ERROR: 결과 파일을 찾을 수 없습니다: ${args.input}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(args.input, 'utf-8'));
  const html = generateHtml(data, args.screenshots);

  const outDir = path.dirname(args.output);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(args.output, html, 'utf-8');
  console.log(`HTML 보고서 생성: ${args.output}`);
}

main();
