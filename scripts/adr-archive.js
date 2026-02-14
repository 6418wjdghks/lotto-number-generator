/**
 * ADR 자동 아카이브 스크립트
 *
 * decisions.md의 활성 ADR이 10개를 초과하면
 * 가장 오래된 10개를 decisions_NNN_MMM.md로 자동 이동.
 *
 * pre-commit hook에서 verify.js 전에 실행.
 * 변경 발생 시 git add까지 수행.
 *
 * 실행: node scripts/adr-archive.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DECISIONS = path.join(ROOT, 'docs', 'decisions.md');
const THRESHOLD = 10;

function countAdrs() {
  const content = fs.readFileSync(DECISIONS, 'utf-8');
  const adrPattern = /^## ADR-(\d{3})/gm;
  const positions = [];
  let m;
  while ((m = adrPattern.exec(content)) !== null) {
    positions.push({ num: parseInt(m[1], 10), index: m.index });
  }
  return { content, positions };
}

function archiveOnce(content, positions) {

  // 아카이브 대상: 첫 10개
  const toArchive = positions.slice(0, THRESHOLD);
  const toKeep = positions.slice(THRESHOLD);
  const firstNum = toArchive[0].num;
  const lastNum = toArchive[toArchive.length - 1].num;
  const keepStart = toKeep[0].index;

  // 헤더 영역 (첫 ADR 시작 전까지)
  const header = content.slice(0, toArchive[0].index);
  // 아카이브 본문
  const archiveBody = content.slice(toArchive[0].index, keepStart).trimEnd();
  // 유지 본문
  const keepBody = content.slice(keepStart).trimEnd();

  // --- 아카이브 파일 생성 ---
  const pad = (n) => String(n).padStart(3, '0');
  const archiveFilename = `decisions_${pad(firstNum)}_${pad(lastNum)}.md`;
  const archivePath = path.join(ROOT, 'docs', archiveFilename);

  // 이전 아카이브 찾기
  const prevArchiveMatch = header.match(/\[decisions_(\d{3}_\d{3})\.md\]/g);
  const prevArchives = prevArchiveMatch || [];
  const lastPrevArchive = prevArchives.length > 0
    ? prevArchives[prevArchives.length - 1].match(/decisions_(\d{3}_\d{3})\.md/)[0]
    : null;

  let archiveHeader = `# 아키텍처 결정 기록 (Archive: ADR-${pad(firstNum)}~${pad(lastNum)})\n\n`;
  archiveHeader += `> 활성 ADR: [decisions.md](./decisions.md)\n`;
  if (lastPrevArchive) {
    const prevRange = lastPrevArchive.replace('decisions_', '').replace('.md', '').replace('_', '~');
    archiveHeader += `> 이전 아카이브: [${lastPrevArchive}](./${lastPrevArchive}) (ADR-${prevRange})\n`;
  }
  archiveHeader += `\n---\n\n`;

  fs.writeFileSync(archivePath, archiveHeader + archiveBody + '\n', 'utf-8');

  // --- decisions.md 재구성 ---
  // 과거 ADR 링크 업데이트
  const newLink = `[${archiveFilename}](./${archiveFilename}) (ADR-${pad(firstNum)}~${pad(lastNum)})`;
  let newHeader = header;

  const pastAdrLineRe = /^> 과거 ADR: .+$/m;
  if (pastAdrLineRe.test(newHeader)) {
    newHeader = newHeader.replace(pastAdrLineRe, (line) => `${line} | ${newLink}`);
  } else {
    // 과거 ADR 라인이 없으면 설명 문단 뒤에 추가
    newHeader = newHeader.replace(
      /프로젝트의 주요 설계 결정과 그 사유를 기록합니다.\n/,
      `프로젝트의 주요 설계 결정과 그 사유를 기록합니다.\n\n> 과거 ADR: ${newLink}\n`
    );
  }

  // 목차 재구성: 유지되는 ADR만
  const tocEntries = [];
  const tocRe = /## ADR-(\d{3}): (.+)\n\n\*\*상태\*\*: (.+)\n\*\*날짜\*\*: (.+)/g;
  let tm;
  while ((tm = tocRe.exec(keepBody)) !== null) {
    tocEntries.push({ num: tm[1], title: tm[2], status: tm[3], date: tm[4] });
  }

  let newToc = '## 목차\n\n| # | 결정 | 상태 | 날짜 |\n|---|------|------|------|\n';
  for (const entry of tocEntries) {
    const statusText = entry.status.includes('승인') ? '승인' : entry.status;
    newToc += `| ${entry.num} | ${entry.title} | ${statusText} | ${entry.date} |\n`;
  }

  // 헤더에서 기존 목차 제거 후 새 목차 + 유지 본문으로 재구성
  const tocStart = newHeader.indexOf('## 목차');
  const beforeToc = tocStart > -1 ? newHeader.slice(0, tocStart) : newHeader;

  const newContent = beforeToc + newToc + '\n---\n\n' + keepBody + '\n';
  fs.writeFileSync(DECISIONS, newContent, 'utf-8');

  // --- git add ---
  execSync(`git add "${archivePath}" "${DECISIONS}"`, { cwd: ROOT });

  process.stderr.write(`ADR 자동 아카이브: ${pad(firstNum)}~${pad(lastNum)} → ${archiveFilename}\n`);
}

function main() {
  let round = 0;
  while (true) {
    const { content, positions } = countAdrs();
    if (positions.length <= THRESHOLD) {
      process.stderr.write(`ADR: ${positions.length}/${THRESHOLD} — 아카이브 불필요\n`);
      break;
    }
    archiveOnce(content, positions);
    round++;
  }
}

main();
