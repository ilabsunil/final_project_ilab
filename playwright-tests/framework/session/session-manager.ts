// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
//
// Owner of the ONE coverage session that spans an entire Playwright run. This is the
// programmatic equivalent of the extension popup's "Start session" / "End session"
// buttons, but scoped to the whole run instead of a single test.

import fs from 'node:fs';
import path from 'node:path';
import {
  ACTIVE_SESSION_FILE,
  COVERAGE_API_BASE_URL,
  RUN_RESULTS_FILE,
  RUN_SESSION_NAME,
  SESSION_STATE_DIR,
  type ActiveSessionState,
} from './session-constants';

// A per-test-case record appended incrementally during the run.
export type RunTestCaseResult = {
  testCaseId: string;
  testTitle: string;
  status: string;
  durationMs: number;
  retries: number;
  error?: string;
  // Coverage snapshot for this test (from the run-scoped session at the time it ended).
  coveragePercent?: number;
  testGapPercent?: number;
  modulesCovered?: number;
  modulesExpected?: number;
  capturedEvents?: number;
};

// Coverage event payload, identical to what the extension content script emits.
export type CoverageEvent = {
  eventId: string;
  kind: string;
  routeId: string | null;
  componentId: string | null;
  actionId: string | null;
  workflowIds: string[];
  source: string;
  timestamp: string;
  metadata: Record<string, string>;
};

// Coverage report shape returned by the API.
export type CoverageReport = {
  session: { id: string; name: string; status: string; eventCount: number };
  overall: { expected: number; covered: number; missed: number };
  routes: { expected: number; covered: number; missed: string[] };
  actions: { expected: number; covered: number; missed: string[] };
  eventCount: number;
};

// Confirm the coverage API is reachable before a run starts.
export async function isApiReachable(apiBaseUrl = COVERAGE_API_BASE_URL): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Start the ONE run-scoped session and persist its id for the whole run.
export async function startRunSession(
  apiBaseUrl = COVERAGE_API_BASE_URL,
): Promise<ActiveSessionState> {
  const response = await fetch(`${apiBaseUrl}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: RUN_SESSION_NAME }),
  });
  if (!response.ok) {
    throw new Error(`Coverage API returned ${response.status} when starting the run session.`);
  }
  const session = (await response.json()) as { id: string; name: string };
  const state: ActiveSessionState = {
    sessionId: session.id,
    name: session.name ?? RUN_SESSION_NAME,
    startedAt: new Date().toISOString(),
    apiBaseUrl,
  };
  fs.mkdirSync(SESSION_STATE_DIR, { recursive: true });
  fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(state, null, 2));
  return state;
}

// Read the persisted run session (used by tests and teardown). Null if none is active.
export function readRunSession(): ActiveSessionState | null {
  try {
    if (!fs.existsSync(ACTIVE_SESSION_FILE)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(ACTIVE_SESSION_FILE, 'utf8')) as ActiveSessionState;
  } catch {
    return null;
  }
}

// Forward a batch of captured events to the run session.
export async function sendEvents(
  sessionId: string,
  events: CoverageEvent[],
  apiBaseUrl = COVERAGE_API_BASE_URL,
): Promise<void> {
  if (events.length === 0) {
    return;
  }
  await fetch(`${apiBaseUrl}/sessions/${sessionId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
}

// Stop the run session (equivalent to the extension's "End session").
export async function stopRunSession(
  sessionId: string,
  apiBaseUrl = COVERAGE_API_BASE_URL,
): Promise<void> {
  await fetch(`${apiBaseUrl}/sessions/${sessionId}/stop`, { method: 'POST' });
}

// Read the computed coverage report for the run session.
export async function getReport(
  sessionId: string,
  apiBaseUrl = COVERAGE_API_BASE_URL,
): Promise<CoverageReport> {
  const response = await fetch(`${apiBaseUrl}/sessions/${sessionId}/report`);
  if (!response.ok) {
    throw new Error(`Coverage API returned ${response.status} when reading the report.`);
  }
  return (await response.json()) as CoverageReport;
}

// Remove the persisted run-session marker after teardown.
export function clearRunSession(): void {
  try {
    if (fs.existsSync(ACTIVE_SESSION_FILE)) {
      fs.rmSync(ACTIVE_SESSION_FILE);
    }
  } catch {
    // Best effort only.
  }
}

// Reset the incremental run-results file at the start of a run.
export function resetRunResults(): void {
  try {
    fs.mkdirSync(SESSION_STATE_DIR, { recursive: true });
    fs.writeFileSync(RUN_RESULTS_FILE, '[]');
  } catch {
    // Best effort only.
  }
}

// Append one test-case result. Called by the coverage fixture after each test so the
// combined report reflects the CURRENT run even if the process crashes at shutdown.
export function appendRunResult(result: RunTestCaseResult): void {
  try {
    fs.mkdirSync(SESSION_STATE_DIR, { recursive: true });
    const existing = readJsonSafe<RunTestCaseResult[]>(RUN_RESULTS_FILE) ?? [];
    existing.push(result);
    fs.writeFileSync(RUN_RESULTS_FILE, JSON.stringify(existing, null, 2));
  } catch {
    // Best effort only.
  }
}

// Read all incrementally captured run results (used by the teardown).
export function readRunResults(): RunTestCaseResult[] {
  return readJsonSafe<RunTestCaseResult[]>(RUN_RESULTS_FILE) ?? [];
}

// Remove the incremental run-results file after teardown.
export function clearRunResults(): void {
  try {
    if (fs.existsSync(RUN_RESULTS_FILE)) {
      fs.rmSync(RUN_RESULTS_FILE);
    }
  } catch {
    // Best effort only.
  }
}

// Utility used by the report builder to safely read a JSON file.
export function readJsonSafe<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

// Utility to write JSON, creating the directory when needed.
export function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}
