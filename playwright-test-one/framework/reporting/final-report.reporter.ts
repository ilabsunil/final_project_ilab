import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { REPORTS_DIR, appendRunLog } from '../logging/execution-logger';
import { buildGapReport } from './gap-analysis';
import { renderReport, type ExecutionSummary, type TestRow } from './report-html';

export default class FinalReportReporter implements Reporter {
  private readonly rows = new Map<string, TestRow>();
  private startedAt = new Date();
  public onBegin(_config: FullConfig, _suite: Suite): void { this.startedAt = new Date(); }
  public onTestEnd(test: TestCase, result: TestResult): void {
    const outcome = test.outcome();
    const status: TestRow['status'] = outcome === 'skipped' ? 'skipped' : outcome === 'flaky' ? 'flaky' : outcome === 'expected' ? 'passed' : 'failed';
    this.rows.set(test.id, { testCaseId: test.title.split(' - ')[0].trim(), title: test.title, status, durationMs: test.results.reduce((sum, item) => sum + item.duration, 0), retries: result.retry, error: status === 'failed' || status === 'flaky' ? result.error?.message : undefined, skipReason: status === 'skipped' ? test.annotations.find((annotation) => annotation.type === 'skip')?.description : undefined });
  }
  public onEnd(_result: FullResult): void {
    const finishedAt = new Date(); const tests = [...this.rows.values()].sort((a, b) => a.testCaseId.localeCompare(b.testCaseId)); const passed = tests.filter((test) => test.status === 'passed' || test.status === 'flaky').length; const failed = tests.filter((test) => test.status === 'failed').length; const skipped = tests.filter((test) => test.status === 'skipped').length; const flaky = tests.filter((test) => test.status === 'flaky').length;
    const execution: ExecutionSummary = { total: tests.length, passed, failed, skipped, flaky, passPercent: tests.length ? Math.round((passed / tests.length) * 100) : 0, durationMs: finishedAt.getTime() - this.startedAt.getTime(), startedAt: this.startedAt.toLocaleString(), finishedAt: finishedAt.toLocaleString() }; const testGap = buildGapReport();
    fs.mkdirSync(REPORTS_DIR, { recursive: true }); fs.writeFileSync(path.join(REPORTS_DIR, 'final-execution-report.html'), renderReport(execution, tests, testGap), 'utf8'); fs.writeFileSync(path.join(REPORTS_DIR, 'final-execution-report.json'), JSON.stringify({ execution, tests, testGap }, null, 2));
    const lines = [`FINAL EXECUTION SUMMARY`, `Tests: ${execution.total}  Passed: ${passed}  Failed: ${failed}  Skipped: ${skipped}  Flaky: ${flaky}  Pass %: ${execution.passPercent}%`, `Coverage: ${testGap.coveragePercent}%  Test gap: ${testGap.gapPercent}%  (${testGap.covered.nodes}/${testGap.totals.nodes} inventory nodes)`, `Untouched -> modules: ${testGap.untouchedModules.length}, sub-modules: ${testGap.untouchedSubModules.length}, functionality: ${testGap.untouchedFunctionality.length}`, `Report: ${path.join(REPORTS_DIR, 'final-execution-report.html')}`]; for (const line of lines) { appendRunLog(`[${new Date().toISOString()}] [RESULT  ] ${line}`); console.log(line); }
  }
}
