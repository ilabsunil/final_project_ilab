// 🔒 LOCKED — part of the plugin session lifecycle. Do not modify.
//
// Thin client for the CoverageEngine API. Performs exactly what the browser extension does
// programmatically: start a session, push captured events, stop the session, read a report.
import { COVERAGE_API_BASE_URL } from './session-config';

// Coverage event payload — identical to what the extension content script emits.
export type SessionEvent = {
  eventId: string;
  kind: 'route' | 'action';
  routeId: string;
  componentId: string | null;
  actionId: string | null;
  workflowIds: string[];
  source: 'automation';
  timestamp: string;
  metadata: Record<string, string>;
};

export type SessionReport = {
  session: { id: string; name: string; status: string; eventCount: number };
  overall: { expected: number; covered: number; missed: number };
  routes: { expected: number; covered: number; missed: string[] };
  actions: { expected: number; covered: number; missed: string[] };
  eventCount: number;
};

// Confirm the API is reachable before the run starts.
export async function isReachable(): Promise<boolean> {
  try {
    return (await fetch(`${COVERAGE_API_BASE_URL}/health`)).ok;
  } catch {
    return false;
  }
}

// Start a session ("Start session" in the extension popup).
export async function startSession(name: string): Promise<string | null> {
  try {
    const response = await fetch(`${COVERAGE_API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) return null;
    return ((await response.json()) as { id: string }).id;
  } catch {
    return null;
  }
}

// Push a batch of captured events into a session.
export async function sendSessionEvents(sessionId: string, events: SessionEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    await fetch(`${COVERAGE_API_BASE_URL}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  } catch {
    /* best effort */
  }
}

// Stop a session ("End session" in the extension popup).
export async function stopSession(sessionId: string): Promise<void> {
  try {
    await fetch(`${COVERAGE_API_BASE_URL}/sessions/${sessionId}/stop`, { method: 'POST' });
  } catch {
    /* best effort */
  }
}

// Read the computed coverage report for a session.
export async function getSessionReport(sessionId: string): Promise<SessionReport | null> {
  try {
    const response = await fetch(`${COVERAGE_API_BASE_URL}/sessions/${sessionId}/report`);
    return response.ok ? ((await response.json()) as SessionReport) : null;
  } catch {
    return null;
  }
}
