// 🔒 LOCKED — part of the plugin session lifecycle. Do not modify.
//
// Owns the ONE plugin session that spans the whole run:
//   • globalSessionSetup     → runs BEFORE any test: starts the session.
//   • globalSessionTeardown  → runs AFTER all tests: ends the session.
// The active session id is persisted to ACTIVE_SESSION_FILE so the per-test recorder can
// forward captured events into the same session.
import fs from 'node:fs';
import { logRun } from '../logging/execution-logger';
import { ACTIVE_SESSION_FILE, COVERAGE_ENABLED, SESSION_NAME } from './session-config';
import { extensionAvailable } from './session-launch';
import { isReachable, startSession, stopSession } from './session-client';

type ActiveSession = { sessionId: string; startedAt: string };

// Persisted-session helpers -----------------------------------------------------------
export function readActiveSession(): ActiveSession | null {
  try {
    return JSON.parse(fs.readFileSync(ACTIVE_SESSION_FILE, 'utf8')) as ActiveSession;
  } catch {
    return null;
  }
}

function writeActiveSession(session: ActiveSession): void {
  fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(session, null, 2));
}

function clearActiveSession(): void {
  try {
    fs.rmSync(ACTIVE_SESSION_FILE);
  } catch {
    /* already gone */
  }
}

// BEFORE the run: start the plugin session (requirement #2). -------------------------
export async function globalSessionSetup(): Promise<void> {
  clearActiveSession();

  if (!COVERAGE_ENABLED) {
    logRun('Plugin session disabled (COVERAGE_ENABLED=false).');
    return;
  }
  if (!extensionAvailable()) {
    logRun('Coverage browser extension not found — capture will be skipped, tests still run.');
  }
  if (!(await isReachable())) {
    logRun('CoverageEngine API not reachable — plugin session NOT started.');
    return;
  }

  const sessionId = await startSession(SESSION_NAME);
  if (sessionId) {
    writeActiveSession({ sessionId, startedAt: new Date().toISOString() });
    logRun(`Plugin session STARTED before execution: ${sessionId}`);
  } else {
    logRun('Plugin session could not be started (API rejected the request).');
  }
}

// AFTER the run: end the plugin session (requirement #4). ----------------------------
export async function globalSessionTeardown(): Promise<void> {
  const active = readActiveSession();
  if (active) {
    await stopSession(active.sessionId);
    logRun(`Plugin session ENDED after execution: ${active.sessionId}`);
  }
  clearActiveSession();
}
