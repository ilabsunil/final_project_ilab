// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
//
// Shared, single-source-of-truth paths and endpoints used by the session lifecycle.
// Keeping these in one file means the setup, teardown, launcher, and report builder
// all agree on where things live.

import path from 'node:path';

// Root of the playwright-tests project (this file lives in framework/session).
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Root of the workspace ...\Documents, which also holds CoverageEngine.
export const WORKSPACE_ROOT = path.resolve(PROJECT_ROOT, '..');

// The real Manifest V3 browser extension that must be loaded on launch.
export const EXTENSION_PATH = path.resolve(
  WORKSPACE_ROOT,
  'CoverageEngine',
  '05-browser-extension',
);

// The CoverageEngine assets used to produce the combined report.
export const COVERAGE_ENGINE_ROOT = path.resolve(WORKSPACE_ROOT, 'CoverageEngine');
export const MODULE_INVENTORY_PATH = path.resolve(
  COVERAGE_ENGINE_ROOT,
  '01-module-inventory',
  'module_inventory.json',
);
export const COVERAGE_API_DATA_DIR = path.resolve(
  COVERAGE_ENGINE_ROOT,
  '03-coverage-api',
  'data',
);

// Coverage Intelligence API base URL (the .NET service on port 5070).
export const COVERAGE_API_BASE_URL =
  process.env.COVERAGE_API_BASE_URL ?? 'http://127.0.0.1:5070/api';

// Where the run-scoped session id is persisted so every test and the teardown agree.
export const SESSION_STATE_DIR = path.resolve(PROJECT_ROOT, '.session');
export const ACTIVE_SESSION_FILE = path.resolve(SESSION_STATE_DIR, 'active-session.json');

// Per-test-case results are appended here incrementally by the coverage fixture so the
// combined report is always current, even if the headed browser crashes at shutdown
// before the custom reporter's onEnd hook runs.
export const RUN_RESULTS_FILE = path.resolve(SESSION_STATE_DIR, 'run-results.json');

// Persistent Chromium user-data dir required to load an unpacked extension.
export const BROWSER_PROFILE_DIR = path.resolve(SESSION_STATE_DIR, 'chromium-profile');

// Output locations for the combined (single) report.
export const PLAYWRIGHT_REPORT_DIR = path.resolve(PROJECT_ROOT, 'playwright-report');
export const COMBINED_REPORT_DIR = path.resolve(PLAYWRIGHT_REPORT_DIR, 'combined');

// Friendly name recorded against the single run-scoped automation session.
export const RUN_SESSION_NAME =
  process.env.COVERAGE_SESSION_NAME ?? 'Playwright automation run (extension session)';

// Shape persisted to ACTIVE_SESSION_FILE.
export type ActiveSessionState = {
  sessionId: string;
  name: string;
  startedAt: string;
  apiBaseUrl: string;
};
