// 🔒 LOCKED — part of the plugin session lifecycle. Do not modify.
//
// Fixed configuration for the coverage plugin session: where the browser extension lives,
// the CoverageEngine API base URL, and where the active session id is persisted for the
// run. Values come from testdata.json so environments can change without editing code.
import path from 'node:path';
import { testdata } from '../config/config-loader';
import { REPORTS_DIR } from '../logging/execution-logger';

// Absolute path to the real Manifest V3 browser extension that is loaded on browser launch.
export const EXTENSION_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'CoverageEngine',
  '05-browser-extension',
);

// CoverageEngine API base (e.g. http://127.0.0.1:5070/api).
export const COVERAGE_API_BASE_URL = testdata.get('COVERAGE_API_BASE_URL');

// Whether the plugin session is enabled for this run.
export const COVERAGE_ENABLED = testdata.getBoolean('COVERAGE_ENABLED');

// Friendly session name recorded against the run.
export const SESSION_NAME = testdata.get('COVERAGE_SESSION_NAME');

// File that holds the ONE active run-session id (written at setup, read by the recorder,
// removed at teardown).
export const ACTIVE_SESSION_FILE = path.join(REPORTS_DIR, '.plugin-session.json');
