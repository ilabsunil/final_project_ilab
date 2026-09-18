import fs from 'node:fs';
import path from 'node:path';
import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

// A failed or flaky test recorded for the failure-analysis section.
type Failure = { testCaseId: string; testTitle: string; retries: number; reason: string; fix: string };

// Coverage summary attached by the coverage fixture for a single test.
type CoverageSummary = {
  sessionId: string;
  modulesExpected: number;
  modulesCovered: number;
  modulesMissed: number;
  coveragePercent: number;
  testGapPercent: number;
  capturedEvents: number;
};

// A per-test row combining identity and coverage numbers for the final report.
type CoverageRow = { testCaseId: string; testTitle: string; status: string } & Partial<CoverageSummary>;

// A per-test-case record consumed by the combined-report builder in global-teardown.
type TestCaseResult = {
  testCaseId: string;
  testTitle: string;
  status: string;
  durationMs: number;
  retries: number;
  error?: string;
};

export default class TestReporter implements Reporter {
  private readonly failures: Failure[] = [];
  private readonly coverageRows: CoverageRow[] = [];
  private readonly testCaseResults: TestCaseResult[] = [];

  public onTestEnd(test: TestCase, result: TestResult): void {
    const testCaseId = test.title.split(' - ')[0];

    // Record a per-test-case row for the single combined report.
    this.testCaseResults.push({
      testCaseId,
      testTitle: test.title,
      status: result.status,
      durationMs: result.duration,
      retries: result.retry,
      error: result.error?.message?.replace(/\n/g, ' '),
    });

    // Record failures and tests that only passed after a retry.
    if (result.status === 'failed' || (result.status === 'passed' && result.retry > 0)) {
      this.failures.push({
        testCaseId,
        testTitle: test.title,
        retries: result.retry,
        reason: result.error?.message ?? 'See trace, video, and test-steps.log.',
        fix: 'Review the locator and test data files, then inspect the attached trace and video.',
      });
    }

    // Pull the coverage summary attachment produced by the coverage fixture.
    const coverageAttachment = result.attachments.find((attachment) => attachment.name === 'coverage-report.json');
    let coverage: CoverageSummary | undefined;
    if (coverageAttachment?.body) {
      try {
        coverage = JSON.parse(coverageAttachment.body.toString('utf8')) as CoverageSummary;
      } catch {
        coverage = undefined;
      }
    }

    this.coverageRows.push({ testCaseId, testTitle: test.title, status: result.status, ...coverage });
  }

  public onEnd(_result: FullResult): void {
    const reportDirectory = path.resolve('playwright-report');
    fs.mkdirSync(reportDirectory, { recursive: true });

    // Failure analysis section.
    const failureContent = this.failures.length === 0
      ? '# Failure Analysis\n\nNo failed test cases.\n'
      : `# Failure Analysis\n\n${this.failures.map((failure) => `## ${failure.testCaseId}\n- **Test:** ${failure.testTitle}\n- **Retries:** ${failure.retries}\n- **Reason:** ${failure.reason.replace(/\n/g, ' ')}\n- **Recommended fix:** ${failure.fix}\n`).join('\n')}`;
    fs.writeFileSync(path.join(reportDirectory, 'failure-analysis.md'), failureContent);

    // Coverage summary section combining every test's coverage numbers.
    fs.writeFileSync(path.join(reportDirectory, 'coverage-summary.md'), this.buildCoverageMarkdown());
    fs.writeFileSync(
      path.join(reportDirectory, 'coverage-summary.json'),
      JSON.stringify(this.coverageRows, null, 2),
    );

    // Per-test-case results consumed by the locked combined-report builder.
    fs.writeFileSync(
      path.join(reportDirectory, 'test-results.json'),
      JSON.stringify(this.testCaseResults, null, 2),
    );
  }

  // Build a Markdown table of coverage results for all tests.
  private buildCoverageMarkdown(): string {
    const withCoverage = this.coverageRows.filter((row) => row.coveragePercent !== undefined);
    if (withCoverage.length === 0) {
      return '# Coverage Summary\n\nNo coverage data was captured. Ensure the Coverage Intelligence API is running on the configured port.\n';
    }

    const header = '| Test case | Status | Coverage % | Test gap % | Modules covered | Modules missed | Events |\n| --- | --- | --- | --- | --- | --- | --- |';
    const rows = withCoverage.map((row) =>
      `| ${row.testCaseId} | ${row.status} | ${row.coveragePercent}% | ${row.testGapPercent}% | ${row.modulesCovered}/${row.modulesExpected} | ${row.modulesMissed} | ${row.capturedEvents} |`,
    );

    const averageCoverage = Math.round(
      withCoverage.reduce((total, row) => total + (row.coveragePercent ?? 0), 0) / withCoverage.length,
    );

    return [
      '# Coverage Summary',
      '',
      `**Average coverage across tests: ${averageCoverage}%**`,
      '',
      header,
      ...rows,
      '',
    ].join('\n');
  }
}