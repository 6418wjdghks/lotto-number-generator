#!/usr/bin/env node
/**
 * strong_verify 보고서 생성기
 * 결과 JSON → HTML 보고서
 *
 * Usage:
 *   node scripts/verify-report.js [옵션]
 *     --input <path>    결과 JSON (기본: temp/verify-results.json)
 *     --output <path>   HTML 출력 (기본: temp/verify-report-temp.html)
 *     --html-only       HTML만 생성 (기본, SKILL.md가 Playwright로 PDF 변환)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    input: path.join(ROOT, 'temp/verify-results.json'),
    output: path.join(ROOT, 'temp/verify-report-temp.html'),
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input' && argv[i + 1]) args.input = path.resolve(argv[++i]);
    else if (argv[i] === '--output' && argv[i + 1]) args.output = path.resolve(argv[++i]);
    else if (argv[i] === '--html-only') { /* default behavior */ }
  }
  return args;
}

function statusBadge(status) {
  if (status === 'pass') {
    return '<span style="background:#22c55e;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:12px">PASS</span>';
  }
  if (status === 'fail') {
    return '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:12px">FAIL</span>';
  }
  return '<span style="background:#94a3b8;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:12px">SKIP</span>';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMismatchesTable(mismatches) {
  if (!mismatches || mismatches.length === 0) return '';
  let rows = '';
  for (const m of mismatches) {
    rows += `
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #fecaca;font-size:13px">${escapeHtml(m.file)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #fecaca;font-size:13px">${escapeHtml(String(m.line || ''))}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #fecaca;font-size:13px">${escapeHtml(m.expected || '')}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #fecaca;font-size:13px">${escapeHtml(m.actual || '')}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #fecaca;font-size:13px">${escapeHtml(m.desc || '')}</td>
            </tr>`;
  }
  return `
        <div style="margin:8px 0 16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:12px;page-break-inside:avoid">
          <div style="font-weight:bold;color:#dc2626;margin-bottom:8px">불일치 상세</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="background:#fee2e2">
                <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fca5a5">파일</th>
                <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fca5a5">줄</th>
                <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fca5a5">기대값</th>
                <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fca5a5">실제값</th>
                <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fca5a5">설명</th>
              </tr>
            </thead>
            <tbody>${rows}
            </tbody>
          </table>
        </div>`;
}

function generateHtml(data) {
  const { meta, groups, overall } = data;
  const date = meta.date || new Date().toISOString().slice(0, 10);
  const commitHash = meta.commitHash || '(unknown)';
  const agents = meta.agents || [];
  const passRate = overall.total > 0 ? ((overall.pass / overall.total) * 100).toFixed(1) : '0.0';
  const skipCount = groups.reduce((sum, g) => sum + (g.items || []).filter(i => i.status === 'skipped').length, 0);
  const allPass = overall.fail === 0 && skipCount === 0;

  let groupsHtml = '';
  for (const group of groups) {
    let itemsHtml = '';
    for (const item of group.items) {
      itemsHtml += `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;white-space:nowrap">${escapeHtml(item.id)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${statusBadge(item.status)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#555">${escapeHtml(item.detail)}</td>
        </tr>`;
      if (item.status === 'fail' && item.mismatches && item.mismatches.length > 0) {
        itemsHtml += `
        <tr>
          <td colspan="4" style="padding:0 8px 8px">${renderMismatchesTable(item.mismatches)}</td>
        </tr>`;
      }
    }

    groupsHtml += `
      <div style="page-break-inside:avoid;margin-bottom:32px">
        <h2 style="color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:4px;margin-bottom:12px">
          ${escapeHtml(group.groupName)}
        </h2>
        <p style="margin:0 0 8px;color:#666">
          합계: ${group.summary.total}항목 |
          <span style="color:#22c55e">PASS ${group.summary.pass}</span> |
          <span style="color:#ef4444">FAIL ${group.summary.fail}</span>
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f1f5f9">
              <th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;width:80px">ID</th>
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
  <title>strong_verify 리포트</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.5; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:32px;padding-bottom:16px;border-bottom:3px solid #1e40af">
    <h1 style="margin:0 0 8px;color:#1e40af">strong_verify 리포트</h1>
    <p style="margin:0;color:#64748b">로또번호 추첨기 | ${escapeHtml(date)} | ${escapeHtml(commitHash)}</p>
  </div>

  <div style="display:flex;gap:16px;margin-bottom:32px;flex-wrap:wrap">
    <div style="flex:1;min-width:100px;background:${allPass ? '#f0fdf4' : '#fef2f2'};border:1px solid ${allPass ? '#86efac' : '#fca5a5'};border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:${allPass ? '#16a34a' : '#dc2626'}">${passRate}%</div>
      <div style="color:#64748b;font-size:13px">통과율</div>
    </div>
    <div style="flex:1;min-width:100px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:#16a34a">${overall.pass}</div>
      <div style="color:#64748b;font-size:13px">PASS</div>
    </div>
    <div style="flex:1;min-width:100px;background:${overall.fail > 0 ? '#fef2f2' : '#f8fafc'};border:1px solid ${overall.fail > 0 ? '#fca5a5' : '#e2e8f0'};border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:${overall.fail > 0 ? '#dc2626' : '#94a3b8'}">${overall.fail}</div>
      <div style="color:#64748b;font-size:13px">FAIL</div>
    </div>
    <div style="flex:1;min-width:100px;background:${skipCount > 0 ? '#f8fafc' : '#f8fafc'};border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:#94a3b8">${skipCount}</div>
      <div style="color:#64748b;font-size:13px">SKIP</div>
    </div>
    <div style="flex:1;min-width:100px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center">
      <div style="font-size:32px;font-weight:bold;color:#334155">${overall.total}</div>
      <div style="color:#64748b;font-size:13px">전체</div>
    </div>
  </div>

  <div style="margin-bottom:32px;page-break-after:always">
    <h2 style="color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:4px">환경 정보</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold;width:140px">테스트 대상</td><td style="padding:6px 8px;border-bottom:1px solid #eee">로또번호 추첨기</td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">Verify 유형</td><td style="padding:6px 8px;border-bottom:1px solid #eee">strong_verify (Tier 0 + Tier 1 + Tier 2)</td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">커밋 해시</td><td style="padding:6px 8px;border-bottom:1px solid #eee"><code>${escapeHtml(commitHash)}</code></td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">실행 에이전트</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${agents.length > 0 ? escapeHtml(agents.join(', ')) : '(없음)'}</td></tr>
      <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:bold">실행 날짜</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${escapeHtml(date)}</td></tr>
    </table>
  </div>

  ${groupsHtml}

  <div style="margin-top:32px;padding-top:16px;border-top:2px solid #1e40af;page-break-inside:avoid">
    <h2 style="color:#1e40af;margin-bottom:8px">종합 결론</h2>
    <p style="font-size:16px">${allPass
      ? `전체 ${overall.total}개 항목 <strong style="color:#16a34a">ALL PASS</strong>. 문서와 소스코드가 정확히 일치합니다.`
      : overall.fail > 0
        ? `전체 ${overall.total}개 항목 중 <strong style="color:#dc2626">${overall.fail}개 FAIL</strong>. 불일치 항목의 상세 내용을 확인하고 수정이 필요합니다.`
        : `전체 ${overall.total}개 항목 중 <strong style="color:#94a3b8">${skipCount}개 SKIPPED</strong>. 미실행 에이전트를 확인하세요.`
    }</p>
  </div>

  <div style="margin-top:24px;text-align:center;color:#94a3b8;font-size:12px;padding-top:12px;border-top:1px solid #e2e8f0">
    Generated by verify-report.js | ${escapeHtml(date)}
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
  const html = generateHtml(data);

  const outDir = path.dirname(args.output);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(args.output, html, 'utf-8');
  console.log(`HTML 보고서 생성: ${args.output}`);
}

main();
