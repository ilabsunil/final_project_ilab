// Central Playwright fixture that wires the Coverage Intelligence plugin into every
// test automatically. Import `test` and `expect` from this file in your specs and the
// following happens with NO extra code in the test:
//
//   1. A coverage session is started (like clicking "Start session" in the extension).
//   2. Every page records route/action events (like the extension content script).
//   3. When the test finishes (pass or fail), events are flushed, the session is
//      stopped (like "End session"), and the coverage report is attached to the
//      Playwright HTML report and written to the test output folder.
//
// You only ever need to write specs and update locators/test data. This plumbing is
// intended to stay unchanged.

import { test as base, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { testData } from '../config/config-loader';
import { CoverageClient, type CoverageEvent, type CoverageReport } from '../coverage/coverage-client';
import { coverageCaptureInitScript } from '../coverage/capture-script';
import { appendRunResult, readRunSession } from '../session/session-manager';

// Per-test coverage session handle shared between the fixture setup and teardown.
type CoverageSessionHandle = {
  client: CoverageClient;
  sessionId: string | null;
  events: CoverageEvent[];
};

// Extend the base test with an automatic, worker-safe coverage session.
export const test = base.extend<{ coverage: CoverageSessionHandle }>({
  // `auto: true` means every test gets coverage without importing anything else.
  coverage: [
    async ({ page, context }, use, testInfo) => {
      const config = testData.coverage;
      const client = new CoverageClient(config.apiBaseUrl);
      const handle: CoverageSessionHandle = { client, sessionId: null, events: [] };

      // The run-scoped session is started ONCE in global-setup (before execution). Every
      // test captures its actions/validations into that same session so the whole run is
      // recorded under one plugin session, then ended once in global-teardown.
      const runSession = readRunSession();
      const reachable = config.enabled && runSession !== null && (await client.isReachable());
      if (reachable && runSession) {
        handle.sessionId = runSession.sessionId;

        // Node-side binding that the injected browser script calls for each event.
        await context.exposeBinding('__coverageCapture', async (_source, event: CoverageEvent) => {
          handle.events.push(event);
        });

        // Inject the capture logic into the current and all future pages/frames.
        await context.addInitScript(coverageCaptureInitScript);
        // The first page may already be open, so install on it too.
        await installOnOpenPages(context.pages());
      }

      // Run the actual test body.
      await use(handle);

      // Teardown: flush this test's captured events into the run-scoped session and
      // attach a per-test coverage snapshot. The session itself stays OPEN and is only
      // ended once for the whole run in global-teardown.
      let perTestReport: CoverageReport | null = null;
      if (reachable && handle.sessionId) {
        try {
          await client.sendEvents(handle.sessionId, handle.events);
          perTestReport = await client.getReport(handle.sessionId);
          await attachCoverageReport(testInfo, perTestReport);
        } catch (error) {
          testInfo.annotations.push({
            type: 'coverage-warning',
            description: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Persist this test-case result incrementally so the combined report is always
      // current, even if the headed browser crashes at process shutdown before the
      // custom reporter's onEnd hook runs.
      const pct = perTestReport ? coveragePercent(perTestReport) : undefined;
      appendRunResult({
        testCaseId: testInfo.title.split(' - ')[0],
        testTitle: testInfo.title,
        status: testInfo.status ?? 'unknown',
        durationMs: testInfo.duration,
        retries: testInfo.retry,
        error: testInfo.error?.message?.replace(/\n/g, ' '),
        coveragePercent: pct,
        testGapPercent: pct === undefined ? undefined : 100 - pct,
        modulesCovered: perTestReport?.overall.covered,
        modulesExpected: perTestReport?.overall.expected,
        capturedEvents: perTestReport?.eventCount,
      });
    },
    { auto: true },
  ],
});

// Re-inject the capture script into pages that were already open before setup.
async function installOnOpenPages(pages: Page[]): Promise<void> {
  await Promise.all(
    pages.map((page) => page.evaluate(coverageCaptureInitScript).catch(() => undefined)),
  );
}

// Turn a coverage report into a readable percentage.
function coveragePercent(report: CoverageReport): number {
  if (report.overall.expected === 0) {
    return 0;
  }
  return Math.round((report.overall.covered / report.overall.expected) * 100);
}

// Attach the coverage report to the Playwright report and the test output folder.
async function attachCoverageReport(
  testInfo: import('@playwright/test').TestInfo,
  report: CoverageReport,
): Promise<void> {
  const percent = coveragePercent(report);
  const gapPercent = 100 - percent;
  const summary = {
    sessionId: report.session.id,
    modulesExpected: report.overall.expected,
    modulesCovered: report.overall.covered,
    modulesMissed: report.overall.missed,
    coveragePercent: percent,
    testGapPercent: gapPercent,
    routes: report.routes,
    actions: report.actions,
    capturedEvents: report.eventCount,
  };

  // Machine-readable JSON attachment (visible in the HTML report).
  await testInfo.attach('coverage-report.json', {
    body: JSON.stringify(summary, null, 2),
    contentType: 'application/json',
  });

  // Human-readable Markdown attachment.
  const markdown = [
    `# Coverage report for ${testInfo.title}`,
    '',
    `- Session: ${report.session.id}`,
    `- Coverage: ${percent}%`,
    `- Test gap: ${gapPercent}%`,
    `- Modules covered: ${report.overall.covered} / ${report.overall.expected}`,
    `- Modules missed: ${report.overall.missed}`,
    `- Routes covered: ${report.routes.covered} / ${report.routes.expected}`,
    `- Actions covered: ${report.actions.covered} / ${report.actions.expected}`,
    `- Captured events: ${report.eventCount}`,
  ].join('\n');
  await testInfo.attach('coverage-report.md', { body: markdown, contentType: 'text/markdown' });

  // Also drop the JSON next to other per-test artifacts so the custom reporter can
  // aggregate it into the final coverage summary.
  const outputDirectory = testInfo.outputDir;
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, 'coverage-summary.json'), JSON.stringify(summary, null, 2));
}

export { expect };
