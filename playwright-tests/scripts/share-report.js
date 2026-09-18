// Packages the final report into a single shareable HTML file and opens it in the browser.
//
// The report is fully self-contained (inline CSS, no external assets), so the copy can be
// emailed, dropped in Teams/Slack, or attached to a ticket and it will render anywhere.
//
// Usage:  node scripts/share-report.js          -> copy + open
//         node scripts/share-report.js --no-open -> copy only
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const reportsDir = path.resolve(__dirname, '..', 'reports');
const source = path.join(reportsDir, 'final-execution-report.html');
const summaryJson = path.join(reportsDir, 'final-execution-report.json');
const shareDir = path.join(reportsDir, 'share');

if (!fs.existsSync(source)) {
  console.error(`Report not found: ${source}\nRun "npm test" first.`);
  process.exit(1);
}

// Build a self-describing filename, e.g.
//   PNC-Test-Report_2026-09-18_16-00_pass75_cov32.html
let suffix = '';
try {
  const j = JSON.parse(fs.readFileSync(summaryJson, 'utf8'));
  suffix = `_pass${j.execution.passPercent}_cov${j.testGap.coveragePercent}`;
} catch {
  /* summary optional */
}
const stamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
const target = path.join(shareDir, `PNC-Test-Report_${stamp}${suffix}.html`);

fs.mkdirSync(shareDir, { recursive: true });
fs.copyFileSync(source, target);

console.log('Shareable report created:');
console.log(`  ${target}`);
console.log('Send this single file — it is self-contained and opens in any browser.');

if (!process.argv.includes('--no-open')) {
  // Windows: `start` needs an empty title argument when the path is quoted.
  execSync(`start "" "${target}"`, { stdio: 'ignore', shell: 'cmd.exe' });
  console.log('Opened in default browser.');
}
