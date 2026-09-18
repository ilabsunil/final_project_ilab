// Renders the final execution + test-gap report as a single self-contained HTML page.
import type { GapReport } from './gap-analysis';
import { REPORT_CSS } from './report-styles';

export type TestRow = {
  testCaseId: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'flaky' | 'timedOut' | 'interrupted';
  durationMs: number;
  retries: number;
  error?: string;
  skipReason?: string;
};

export type ExecutionSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  passPercent: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
};

const esc = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ms = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${n}ms`);

const statusPill = (s: TestRow['status']): string => {
  if (s === 'passed') return '<span class="pill pass">● Passed</span>';
  if (s === 'skipped') return '<span class="pill skip">● Skipped</span>';
  if (s === 'flaky') return '<span class="pill flaky">● Flaky (passed on retry)</span>';
  return '<span class="pill fail">● Failed</span>';
};

export function renderReport(exec: ExecutionSummary, tests: TestRow[], gap: GapReport): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PNC Bank — Test Execution &amp; Test Gap Report</title><style>${REPORT_CSS}</style></head>
<body><div class="wrap">
${renderHero(exec, gap)}
${renderKpis(exec, gap)}
${renderDonuts(exec, gap)}
<h2 class="sec">Test case results <span class="rule"></span></h2>
<div class="card panel" style="padding:6px 6px 4px"><table>
<thead><tr><th>Test case</th><th>Status</th><th>Duration</th><th>Retries</th><th>Details</th></tr></thead>
<tbody>${tests.map(renderTestRow).join('')}</tbody></table></div>
${renderGapSection(gap)}
<div class="note"><strong>How the numbers are calculated.</strong>
Pass % = passed ÷ total test cases. Coverage % = (modules + sub-modules + functionality touched by <em>any</em> test) ÷ all
${gap.totals.nodes} inventory nodes from CoverageEngine (${gap.totals.modules} modules, ${gap.totals.subModules} sub-modules,
${gap.totals.functionality} functionality). Test-gap % = 100 − coverage %. Anything with no test case is listed as <b>untouched</b>.</div>
<p class="foot">PNC Bank Quality Platform · Playwright POM + CoverageEngine · generated ${esc(exec.finishedAt)}</p>
</div></body></html>`;
}

// ---- sections -------------------------------------------------------------------

function renderHero(exec: ExecutionSummary, gap: GapReport): string {
  return `<header class="hero">
<div class="brand"><div class="logo">PNC</div><div><small>PNC Bank · Quality Platform</small><strong>Test Execution &amp; Test Gap Report</strong></div></div>
<h1>${esc(gap.appName)}</h1>
<p>Execution results for every test case, combined with CoverageEngine module inventory analysis showing which modules, sub-modules and functionality remain untouched by automation.</p>
<div class="meta">
<div><span>Started</span>${esc(exec.startedAt)}</div><div><span>Finished</span>${esc(exec.finishedAt)}</div>
<div><span>Total duration</span>${ms(exec.durationMs)}</div><div><span>Browser</span>chromium · video on</div>
</div></header>`;
}

function renderKpis(exec: ExecutionSummary, gap: GapReport): string {
  const k = (cls: string, l: string, v: string, s: string) =>
    `<div class="card kpi ${cls}"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
  return `<section class="grid k6">
${k('i', 'Total tests', String(exec.total), 'test cases executed')}
${k('g', 'Passed', String(exec.passed), `${exec.passPercent}% pass rate`)}
${k('r', 'Failed', String(exec.failed), exec.failed ? 'needs attention' : 'no failures')}
${k('a', 'Skipped', String(exec.skipped), exec.flaky ? `${exec.flaky} flaky (passed on retry)` : 'not executed')}
${k('b', 'Coverage', `${gap.coveragePercent}%`, `${gap.covered.nodes}/${gap.totals.nodes} inventory nodes`)}
${k('r', 'Test gap', `${gap.gapPercent}%`, `${gap.totals.nodes - gap.covered.nodes} untouched nodes`)}
</section>`;
}

function renderDonuts(exec: ExecutionSummary, gap: GapReport): string {
  const donut = (v: number, c: string, label: string) =>
    `<div class="donut" style="--v:${v};--c:${c}"><i><span></span><b>${v}%</b><span>${label}</span></i></div>`;
  return `<section class="grid two">
<div class="card panel"><h2>Execution outcome</h2><p class="hint">Pass percentage across all executed test cases.</p>
<div class="donuts">${donut(exec.passPercent, 'var(--green)', 'pass rate')}
<div class="legend">
<div class="row"><i style="background:var(--green)"></i>Passed<b>${exec.passed}</b></div>
<div class="row"><i style="background:var(--red)"></i>Failed<b>${exec.failed}</b></div>
<div class="row"><i style="background:var(--amber)"></i>Skipped<b>${exec.skipped}</b></div>
<div class="row"><i style="background:var(--blue)"></i>Flaky<b>${exec.flaky}</b></div></div></div></div>
<div class="card panel"><h2>Coverage vs. test gap</h2><p class="hint">Overall, against the full CoverageEngine inventory.</p>
<div class="donuts">${donut(gap.coveragePercent, 'var(--blue)', 'covered')}
<div class="legend">
<div class="row"><i style="background:var(--blue)"></i>Modules<b>${gap.covered.modules}/${gap.totals.modules}</b></div>
<div class="row"><i style="background:var(--blue)"></i>Sub-modules<b>${gap.covered.subModules}/${gap.totals.subModules}</b></div>
<div class="row"><i style="background:var(--blue)"></i>Functionality<b>${gap.covered.functionality}/${gap.totals.functionality}</b></div>
<div class="row"><i style="background:var(--red)"></i>Test gap<b>${gap.gapPercent}%</b></div></div></div></div>
</section>`;
}

function renderTestRow(t: TestRow): string {
  const detail =
    t.status === 'skipped'
      ? `<span style="color:var(--amber)">${esc(t.skipReason ?? 'Skipped')}</span>`
      : t.error
        ? `<div class="err">${esc(t.error.split('\n').slice(0, 4).join('\n'))}</div>`
        : '<span style="color:var(--muted)">—</span>';
  const [, ...rest] = t.title.split(' - ');
  return `<tr><td class="tc">${esc(t.testCaseId)}<small>${esc(rest.join(' - '))}</small></td>
<td>${statusPill(t.status)}</td><td>${ms(t.durationMs)}</td><td>${t.retries}</td><td>${detail}</td></tr>`;
}

function renderGapSection(gap: GapReport): string {
  const list = <T,>(items: T[], render: (x: T) => string, okText: string) =>
    items.length ? `<div class="chips">${items.map(render).join('')}</div>` : `<div class="chips"><span class="chip ok">✔ ${okText}</span></div>`;

  return `<h2 class="sec">Test gap — untouched by any test case <span class="rule"></span></h2>
<div class="card panel">
<p class="hint">Everything below exists in the CoverageEngine inventory but was <b>not exercised by any test case</b> in this run. These are the candidates for new automation.</p>
<h2 style="font-size:14px;margin-top:8px">Untouched modules (${gap.untouchedModules.length})</h2>
${list(gap.untouchedModules, (m) => `<span class="chip">${esc(m.module)}<small>risk: ${esc(m.risk)}</small></span>`, 'Every module was reached')}
<h2 style="font-size:14px;margin-top:20px">Untouched sub-modules (${gap.untouchedSubModules.length})</h2>
${list(gap.untouchedSubModules, (s) => `<span class="chip">${esc(s.subModule)}<small>${esc(s.module)}</small></span>`, 'Every sub-module was exercised')}
<h2 style="font-size:14px;margin-top:20px">Untouched functionality (${gap.untouchedFunctionality.length})</h2>
${list(gap.untouchedFunctionality, (f) => `<span class="chip">${esc(f.functionality)}<small>${esc(f.module)} › ${esc(f.subModule)}</small></span>`, 'Every functionality was exercised')}
</div>`;
}
