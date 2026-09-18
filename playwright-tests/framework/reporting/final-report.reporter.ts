// Custom Playwright reporter. Collects every test's FINAL outcome (after retries), then
// merges it with the CoverageEngine test-gap analysis into one HTML + JSON report.
import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { REPORTS_DIR, appendRunLog } from '../logging/execution-logger';
import { buildGapReport } from './gap-analysis';
import { renderReport, type ExecutionSummary, type TestRow } from './report-html';

export default class FinalReportReporter implements Reporter {
  private readonly rows = new Map<string, TestRow>();
  private startedAt = new Date();

  public onBegin(_config: FullConfig, _suite: Suite): void {
    this.startedAt = new Date();
  }

  // Called for EVERY attempt; the last attempt wins, but we remember retries + flakiness.
  public onTestEnd(test: TestCase, result: TestResult): void {
    const testCaseId = test.title.split(' - ')[0].trim();
    const outcome = test.outcome(); // 'expected' | 'unexpected' | 'flaky' | 'skipped'
    const status: TestRow['status'] =
      outcome === 'skipped' ? 'skipped' : outcome === 'flaky' ? 'flaky' : outcome === 'expected' ? 'passed' : 'failed';

    this.rows.set(test.id, {
      testCaseId,
      title: test.title,
      status,
      durationMs: test.results.reduce((n, r) => n + r.duration, 0),
      retries: result.retry,
      error: status === 'failed' || status === 'flaky' ? result.error?.message ?? test.results.find((r) => r.error)?.error?.message : undefined,
      skipReason: status === 'skipped' ? test.annotations.find((a) => a.type === 'skip')?.description ?? 'test.skip()' : undefined,
    });
  }

  public onEnd(_result: FullResult): void {
    const finishedAt = new Date();
    const tests = [...this.rows.values()].sort((a, b) => a.testCaseId.localeCompare(b.testCaseId));

    const passed = tests.filter((t) => t.status === 'passed' || t.status === 'flaky').length;
    const failed = tests.filter((t) => t.status === 'failed').length;
    const skipped = tests.filter((t) => t.status === 'skipped').length;
    const flaky = tests.filter((t) => t.status === 'flaky').length;
    const exec: ExecutionSummary = {
      total: tests.length,
      passed,
      failed,
      skipped,
      flaky,
      passPercent: tests.length ? Math.round((passed / tests.length) * 100) : 0,
      durationMs: finishedAt.getTime() - this.startedAt.getTime(),
      startedAt: this.startedAt.toLocaleString(),
      finishedAt: finishedAt.toLocaleString(),
    };

    const gap = buildGapReport();

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const htmlPath = path.join(REPORTS_DIR, 'final-execution-report.html');
    fs.writeFileSync(htmlPath, renderReport(exec, tests, gap), 'utf8');
    fs.writeFileSync(path.join(REPORTS_DIR, 'final-execution-report.json'), JSON.stringify({ execution: exec, tests, testGap: gap }, null, 2));

    // Console + run-log summary so the numbers are visible without opening the HTML.
    const lines = [
      '════════════════ FINAL EXECUTION SUMMARY ════════════════',
      `Tests: ${exec.total}  Passed: ${passed}  Failed: ${failed}  Skipped: ${skipped}  Flaky: ${flaky}  Pass %: ${exec.passPercent}%`,
      `Coverage: ${gap.coveragePercent}%  Test gap: ${gap.gapPercent}%  (${gap.covered.nodes}/${gap.totals.nodes} inventory nodes)`,
      `Untouched → modules: ${gap.untouchedModules.length}, sub-modules: ${gap.untouchedSubModules.length}, functionality: ${gap.untouchedFunctionality.length}`,
      ...gap.untouchedFunctionality.map((f) => `   ✖ ${f.module} › ${f.subModule} › ${f.functionality}`),
      `Report: ${htmlPath}`,
      '══════════════════════════════════════════════════════════',
    ];
    for (const line of lines) {
      appendRunLog(`[${new Date().toISOString()}] [RESULT  ] ${line}`);
      // eslint-disable-next-line no-console
      console.log(line);
    }
  }
}
