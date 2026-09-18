// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
// Renders a beautified, self-contained HTML dashboard for the combined report.

type Exec = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  results: Array<{
    testCaseId: string;
    testTitle: string;
    status: string;
    durationMs: number;
    retries: number;
    error?: string;
  }>;
};

type Cov = {
  sessionId: string;
  coveragePercent: number;
  modulesCovered: number;
  modulesExpected: number;
  modulesMissed: number;
  capturedEvents: number;
  routes: { covered: number; expected: number };
  actions: { covered: number; expected: number };
} | null;

type PerTest = Array<{
  testCaseId: string;
  status: string;
  coveragePercent?: number;
  testGapPercent?: number;
  modulesCovered?: number;
  modulesExpected?: number;
  capturedEvents?: number;
}>;

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function statusBadge(status: string): string {
  const s = status.toLowerCase();
  const cls = s === 'passed' ? 'ok' : s === 'failed' ? 'bad' : 'warn';
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

export function renderReportHtml(model: Record<string, unknown>): string {
  const exec = model.testExecution as Exec;
  const cov = model.pluginSessionCoverage as Cov;
  const perTest = model.perTestCoverage as PerTest;
  const engine = model.coverageEngine as { expectedRoutes: number; expectedWorkflows: number };
  const appName = esc(String(model.application ?? 'Application under test'));
  const generated = esc(String(model.generatedAt ?? ''));

  const covPct = cov?.coveragePercent ?? 0;
  const passPct = exec.passRate;

  const execRows = exec.results
    .map(
      (t) => `<tr>
        <td><code>${esc(t.testCaseId)}</code></td>
        <td>${esc(t.testTitle)}</td>
        <td>${statusBadge(t.status)}</td>
        <td class="num">${t.durationMs}</td>
        <td class="num">${t.retries}</td>
      </tr>`,
    )
    .join('');

  const perTestRows = perTest
    .map(
      (r) => `<tr>
        <td><code>${esc(r.testCaseId)}</code></td>
        <td>${statusBadge(r.status)}</td>
        <td class="num">${r.coveragePercent ?? '-'}%</td>
        <td class="num">${r.testGapPercent ?? '-'}%</td>
        <td class="num">${r.modulesCovered ?? '-'}/${r.modulesExpected ?? '-'}</td>
        <td class="num">${r.capturedEvents ?? '-'}</td>
      </tr>`,
    )
    .join('');

  return buildDocument({
    appName,
    generated,
    exec,
    cov,
    covPct,
    passPct,
    engine,
    execRows,
    perTestRows,
  });
}

type DocParts = {
  appName: string;
  generated: string;
  exec: Exec;
  cov: Cov;
  covPct: number;
  passPct: number;
  engine: { expectedRoutes: number; expectedWorkflows: number };
  execRows: string;
  perTestRows: string;
};

function buildDocument(p: DocParts): string {
  return HEAD + body(p) + FOOT;
}

const HEAD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Combined Test & Coverage Report</title>
<style>
  :root {
    --bg: #0b1220; --panel: #121c33; --panel2: #0f1830; --line: #223252;
    --ink: #e6edf7; --muted: #9fb0cc; --accent: #7cc4ff; --green: #34d399;
    --amber: #fbbf24; --red: #f87171; --blue: #60a5fa;
  }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 0;
    background: radial-gradient(1200px 600px at 80% -10%, #16233f 0%, var(--bg) 55%); color: var(--ink); }
  main { max-width: 1100px; margin: 0 auto; padding: 40px 24px 72px; }
  header.hero { display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: 1px solid var(--line); padding-bottom: 20px; margin-bottom: 28px; }
  header.hero h1 { margin: 0 0 6px; font-size: 26px; color: #fff; letter-spacing: .2px; }
  header.hero .sub { color: var(--muted); font-size: 13px; }
  .pill { background: rgba(124,196,255,.12); color: var(--accent); border: 1px solid rgba(124,196,255,.3);
    padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .card { background: linear-gradient(180deg, var(--panel), var(--panel2)); border: 1px solid var(--line);
    border-radius: 16px; padding: 18px; }
  .card .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .6px; }
  .card .value { font-size: 30px; font-weight: 700; margin-top: 8px; }
  .card .detail { color: var(--muted); font-size: 12px; margin-top: 4px; }
  .card.green .value { color: var(--green); } .card.amber .value { color: var(--amber); }
  .card.blue .value { color: var(--blue); } .card.ink .value { color: #fff; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .panel { background: linear-gradient(180deg, var(--panel), var(--panel2)); border: 1px solid var(--line);
    border-radius: 18px; padding: 22px; }
  .panel h2 { margin: 0 0 16px; font-size: 16px; color: #fff; }
  .bar { height: 12px; border-radius: 999px; background: #1b2740; overflow: hidden; margin: 10px 0 6px; }
  .bar > i { display: block; height: 100%; border-radius: 999px; }
  .bar.cov > i { background: linear-gradient(90deg, #34d399, #60a5fa); }
  .bar.pass > i { background: linear-gradient(90deg, #60a5fa, #a78bfa); }
  .bar-meta { display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; }
  .donut { --p: 0; width: 150px; height: 150px; border-radius: 50%; margin: 4px auto 10px;
    background: conic-gradient(var(--green) calc(var(--p) * 1%), #1b2740 0);
    display: grid; place-items: center; }
  .donut > div { width: 108px; height: 108px; border-radius: 50%; background: var(--panel2);
    display: grid; place-items: center; text-align: center; }
  .donut strong { font-size: 26px; color: #fff; } .donut span { display:block; color: var(--muted); font-size: 11px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); }
  th { color: var(--muted); font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .5px; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  code { background: rgba(124,196,255,.1); color: var(--accent);
    padding: 2px 7px; border-radius: 6px; font-size: 12px; }
  .badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .badge.ok { background: rgba(52,211,153,.15); color: var(--green); border: 1px solid rgba(52,211,153,.35); }
  .badge.bad { background: rgba(248,113,113,.15); color: var(--red); border: 1px solid rgba(248,113,113,.35); }
  .badge.warn { background: rgba(251,191,36,.15); color: var(--amber); border: 1px solid rgba(251,191,36,.35); }
  .section-title { font-size: 15px; color:#fff; margin: 30px 0 12px; }
  .legend { display:flex; gap:18px; justify-content:center; color:var(--muted); font-size:12px; margin-top:6px; }
  .legend i { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:6px; vertical-align:middle; }
  footer { color: var(--muted); font-size: 12px; margin-top: 36px; text-align: center; }
</style>
</head>
<body><main>`;

const FOOT = `</main></body></html>`;

function body(p: DocParts): string {
  const covLine = p.cov
    ? `<div class="donut" style="--p:${p.covPct}">
         <div><strong>${p.covPct}%</strong><span>covered</span></div>
       </div>
       <div class="legend">
         <span><i style="background:#34d399"></i>Covered ${p.cov.modulesCovered}</span>
         <span><i style="background:#1b2740"></i>Missed ${p.cov.modulesMissed}</span>
       </div>
       <div class="bar-meta" style="margin-top:14px"><span>Routes</span><span>${p.cov.routes.covered}/${p.cov.routes.expected}</span></div>
       <div class="bar cov"><i style="width:${pct(p.cov.routes.covered, p.cov.routes.expected)}%"></i></div>
       <div class="bar-meta"><span>Actions</span><span>${p.cov.actions.covered}/${p.cov.actions.expected}</span></div>
       <div class="bar cov"><i style="width:${pct(p.cov.actions.covered, p.cov.actions.expected)}%"></i></div>
       <div class="bar-meta" style="margin-top:8px"><span>Session</span><span><code>${esc(p.cov.sessionId)}</code> · ${p.cov.capturedEvents} events</span></div>`
    : `<p style="color:var(--muted)">No plugin-session coverage was recorded.</p>`;

  return `
  <header class="hero">
    <div>
      <h1>Combined Test &amp; Coverage Report</h1>
      <div class="sub">${p.appName} · Generated ${p.generated}</div>
    </div>
    <span class="pill">Single merged report</span>
  </header>

  <section class="cards">
    <div class="card green"><div class="label">Coverage</div><div class="value">${p.covPct}%</div><div class="detail">${p.cov ? `${p.cov.modulesCovered}/${p.cov.modulesExpected} modules` : 'n/a'}</div></div>
    <div class="card blue"><div class="label">Pass rate</div><div class="value">${p.passPct}%</div><div class="detail">${p.exec.passed}/${p.exec.total} passed</div></div>
    <div class="card ink"><div class="label">Test cases</div><div class="value">${p.exec.total}</div><div class="detail">${p.exec.failed} failed · ${p.exec.skipped} skipped</div></div>
    <div class="card amber"><div class="label">Test gap</div><div class="value">${100 - p.covPct}%</div><div class="detail">${p.cov ? `${p.cov.modulesMissed} modules missed` : 'n/a'}</div></div>
  </section>

  <section class="grid2">
    <div class="panel">
      <h2>Coverage intelligence</h2>
      ${covLine}
    </div>
    <div class="panel">
      <h2>Execution health</h2>
      <div class="bar-meta"><span>Pass rate</span><span>${p.passPct}%</span></div>
      <div class="bar pass"><i style="width:${p.passPct}%"></i></div>
      <div class="bar-meta" style="margin-top:14px"><span>Coverage</span><span>${p.covPct}%</span></div>
      <div class="bar cov"><i style="width:${p.covPct}%"></i></div>
      <div class="bar-meta" style="margin-top:18px"><span>Expected routes (inventory)</span><span>${p.engine.expectedRoutes}</span></div>
      <div class="bar-meta"><span>Expected workflows (inventory)</span><span>${p.engine.expectedWorkflows}</span></div>
    </div>
  </section>

  <h3 class="section-title">Test execution</h3>
  <div class="panel" style="padding:8px 0">
    <table>
      <thead><tr><th>Test case</th><th>Title</th><th>Status</th><th class="num">Duration (ms)</th><th class="num">Retries</th></tr></thead>
      <tbody>${p.execRows}</tbody>
    </table>
  </div>

  <h3 class="section-title">Per-test coverage</h3>
  <div class="panel" style="padding:8px 0">
    <table>
      <thead><tr><th>Test case</th><th>Status</th><th class="num">Coverage %</th><th class="num">Gap %</th><th class="num">Covered/Expected</th><th class="num">Events</th></tr></thead>
      <tbody>${p.perTestRows}</tbody>
    </table>
  </div>

  <footer>Northstar Bank Quality Engineering · Coverage Intelligence · single merged report</footer>`;
}

function pct(covered: number, expected: number): number {
  return expected === 0 ? 0 : Math.round((covered / expected) * 100);
}


