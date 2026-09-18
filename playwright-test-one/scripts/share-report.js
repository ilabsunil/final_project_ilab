const fs = require('node:fs');
const path = require('node:path');
const reportsDir = path.resolve(__dirname, '..', 'reports');
const source = path.join(reportsDir, 'final-execution-report.html');
if (!fs.existsSync(source)) { console.error(`Report not found: ${source}`); process.exit(1); }
const target = path.join(reportsDir, `Playwright-Test-One_${new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')}.html`);
fs.copyFileSync(source, target);
console.log(`Shareable report created: ${target}`);
