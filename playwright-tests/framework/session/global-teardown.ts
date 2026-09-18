// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
//
// Playwright globalTeardown: runs ONCE after every test finishes. This ends the plugin
// session ("once the test execution is completed the plugin session should end"), pulls
// the session's coverage report, and merges it with the CoverageEngine analysis and the
// per-test-case results into a SINGLE combined report.

import path from 'node:path';
import type { FullConfig } from '@playwright/test';
import {
  buildCombinedModel,
  writeCombinedReport,
  type TestCaseResult,
} from './combined-report';
import { PLAYWRIGHT_REPORT_DIR } from './session-constants';
import {
  clearRunResults,
  clearRunSession,
  getReport,
  readJsonSafe,
  readRunResults,
  readRunSession,
  stopRunSession,
  type CoverageReport,
} from './session-manager';

export default async function globalTeardown(_config: FullConfig): Promise<void> {
  const session = readRunSession();
  let runSessionReport: CoverageReport | null = null;

  if (session) {
    try {
      // End the plugin session, then read its final coverage report.
      await stopRunSession(session.sessionId, session.apiBaseUrl);
      runSessionReport = await getReport(session.sessionId, session.apiBaseUrl);
      console.log(`[session] Stopped run-scoped coverage session ${session.sessionId}.`);
    } catch (error) {
      console.warn(
        `[session] Could not stop/read the run session: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  } else {
    console.warn('[session] No active run session found during teardown.');
  }

  // Prefer the incrementally captured per-test results (always current). Fall back to
  // the custom reporter's file only if the incremental file is empty.
  let testCases = readRunResults() as TestCaseResult[];
  if (testCases.length === 0) {
    testCases =
      readJsonSafe<TestCaseResult[]>(path.join(PLAYWRIGHT_REPORT_DIR, 'test-results.json')) ?? [];
  }

  // Merge everything into the single combined report.
  const model = buildCombinedModel({ runSessionReport, testCases });
  const htmlPath = writeCombinedReport(model);
  console.log(`[session] Combined test + coverage report written to: ${htmlPath}`);

  // Clean up run-scoped markers so the next run starts fresh.
  clearRunSession();
  clearRunResults();
}
