// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
//
// Builds the SINGLE combined report the process requires: every test-case result PLUS
// coverage from the plugin session PLUS the CoverageEngine analysis, all merged into one
// JSON + Markdown + HTML report under playwright-report/combined/.

import fs from 'node:fs';
import path from 'node:path';
import {
  COMBINED_REPORT_DIR,
  COVERAGE_API_DATA_DIR,
  MODULE_INVENTORY_PATH,
  PLAYWRIGHT_REPORT_DIR,
} from './session-constants';
import { readJsonSafe, type CoverageReport } from './session-manager';
import { renderReportHtml } from './report-html';

// A single test-case row gathered incrementally during the run (with coverage).
export type TestCaseResult = {
  testCaseId: string;
  testTitle: string;
  status: string;
  durationMs: number;
  retries: number;
  error?: string;
  coveragePercent?: number;
  testGapPercent?: number;
  modulesCovered?: number;
  modulesExpected?: number;
  capturedEvents?: number;
};

// Per-test coverage row shape used in the rendered table.
type ReporterCoverageRow = {
  testCaseId: string;
  testTitle: string;
  status: string;
  coveragePercent?: number;
  testGapPercent?: number;
  modulesCovered?: number;
  modulesExpected?: number;
  modulesMissed?: number;
  capturedEvents?: number;
};

// CoverageEngine module inventory shape (only the parts we need).
type ModuleInventory = {
  application?: { name?: string; routes?: unknown[]; workflows?: unknown[] };
};

// Compute a percentage safely.
function percent(covered: number, expected: number): number {
  return expected === 0 ? 0 : Math.round((covered / expected) * 100);
}

// Build the combined model from all available inputs.
export function buildCombinedModel(inputs: {
  runSessionReport: CoverageReport | null;
  testCases: TestCaseResult[];
}): Record<string, unknown> {
  const { runSessionReport, testCases } = inputs;

  // Per-test coverage rows derived from the incrementally captured results (always
  // current). These carry each test's coverage snapshot taken when the test ended.
  const reporterRows: ReporterCoverageRow[] = testCases.map((t) => ({
    testCaseId: t.testCaseId,
    testTitle: t.testTitle,
    status: t.status,
    coveragePercent: t.coveragePercent,
    testGapPercent: t.testGapPercent,
    modulesCovered: t.modulesCovered,
    modulesExpected: t.modulesExpected,
    capturedEvents: t.capturedEvents,
  }));

  // The CoverageEngine module inventory (expected application surface).
  const inventory = readJsonSafe<ModuleInventory>(MODULE_INVENTORY_PATH);

  // Test-case tallies.
  const total = testCases.length;
  const passed = testCases.filter((t) => t.status === 'passed').length;
  const failed = testCases.filter((t) => t.status === 'failed').length;
  const skipped = testCases.filter((t) => t.status === 'skipped').length;

  // Plugin-session coverage (the run-scoped session started before execution).
  const sessionCoverage = runSessionReport
    ? {
        sessionId: runSessionReport.session.id,
        status: runSessionReport.session.status,
        capturedEvents: runSessionReport.eventCount,
        modulesExpected: runSessionReport.overall.expected,
        modulesCovered: runSessionReport.overall.covered,
        modulesMissed: runSessionReport.overall.missed,
        coveragePercent: percent(
          runSessionReport.overall.covered,
          runSessionReport.overall.expected,
        ),
        routes: runSessionReport.routes,
        actions: runSessionReport.actions,
      }
    : null;

  return {
    generatedAt: new Date().toISOString(),
    application: inventory?.application?.name ?? 'Application under test',
    testExecution: {
      total,
      passed,
      failed,
      skipped,
      passRate: percent(passed, total),
      results: testCases,
    },
    pluginSessionCoverage: sessionCoverage,
    perTestCoverage: reporterRows,
    coverageEngine: {
      moduleInventoryPath: MODULE_INVENTORY_PATH,
      dataDir: COVERAGE_API_DATA_DIR,
      expectedRoutes: inventory?.application?.routes?.length ?? 0,
      expectedWorkflows: inventory?.application?.workflows?.length ?? 0,
    },
  };
}

// Render the combined model to Markdown.
export function renderMarkdown(model: Record<string, unknown>): string {
  const exec = model.testExecution as {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    results: TestCaseResult[];
  };
  const cov = model.pluginSessionCoverage as
    | {
        sessionId: string;
        coveragePercent: number;
        modulesCovered: number;
        modulesExpected: number;
        modulesMissed: number;
        capturedEvents: number;
        routes: { covered: number; expected: number };
        actions: { covered: number; expected: number };
      }
    | null;

  const lines: string[] = [];
  lines.push('# Combined Test & Coverage Report');
  lines.push('');
  lines.push(`- **Application:** ${model.application as string}`);
  lines.push(`- **Generated:** ${model.generatedAt as string}`);
  lines.push('');
  lines.push('## Test execution summary');
  lines.push('');
  lines.push(`- Total test cases: **${exec.total}**`);
  lines.push(`- Passed: **${exec.passed}**  |  Failed: **${exec.failed}**  |  Skipped: **${exec.skipped}**`);
  lines.push(`- Pass rate: **${exec.passRate}%**`);
  lines.push('');
  lines.push('| Test case | Title | Status | Duration (ms) | Retries |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const t of exec.results) {
    lines.push(
      `| ${t.testCaseId} | ${t.testTitle.replace(/\|/g, '\\|')} | ${t.status} | ${t.durationMs} | ${t.retries} |`,
    );
  }
  lines.push('');
  lines.push('## Coverage (plugin session for the whole run)');
  lines.push('');
  if (cov) {
    lines.push(`- Session: ${cov.sessionId}`);
    lines.push(`- Coverage: **${cov.coveragePercent}%**  (gap ${100 - cov.coveragePercent}%)`);
    lines.push(`- Modules covered: ${cov.modulesCovered}/${cov.modulesExpected}  (missed ${cov.modulesMissed})`);
    lines.push(`- Routes covered: ${cov.routes.covered}/${cov.routes.expected}`);
    lines.push(`- Actions covered: ${cov.actions.covered}/${cov.actions.expected}`);
    lines.push(`- Captured events: ${cov.capturedEvents}`);
  } else {
    lines.push('_No plugin-session coverage was recorded (API unreachable or no session)._');
  }
  lines.push('');

  const perTest = model.perTestCoverage as ReporterCoverageRow[];
  if (perTest.length > 0) {
    lines.push('## Per-test coverage');
    lines.push('');
    lines.push('| Test case | Status | Coverage % | Gap % | Covered/Expected | Events |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const r of perTest) {
      lines.push(
        `| ${r.testCaseId} | ${r.status} | ${r.coveragePercent ?? '-'}% | ${r.testGapPercent ?? '-'}% | ${r.modulesCovered ?? '-'}/${r.modulesExpected ?? '-'} | ${r.capturedEvents ?? '-'} |`,
      );
    }
    lines.push('');
  }

  const engine = model.coverageEngine as { expectedRoutes: number; expectedWorkflows: number };
  lines.push('## CoverageEngine analysis');
  lines.push('');
  lines.push(`- Expected routes in inventory: ${engine.expectedRoutes}`);
  lines.push(`- Expected workflows in inventory: ${engine.expectedWorkflows}`);
  lines.push('');
  return lines.join('\n');
}

// Render a beautified, self-contained HTML dashboard view of the combined model.
export function renderHtml(model: Record<string, unknown>): string {
  return renderReportHtml(model);
}

// Write JSON + Markdown + HTML to the combined report folder.
export function writeCombinedReport(model: Record<string, unknown>): string {
  fs.mkdirSync(COMBINED_REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(COMBINED_REPORT_DIR, 'combined-report.json'),
    JSON.stringify(model, null, 2),
  );
  fs.writeFileSync(path.join(COMBINED_REPORT_DIR, 'combined-report.md'), renderMarkdown(model));
  fs.writeFileSync(path.join(COMBINED_REPORT_DIR, 'combined-report.html'), renderHtml(model));
  return path.join(COMBINED_REPORT_DIR, 'combined-report.html');
}
