// Thin client for the Coverage Intelligence API (the .NET service on port 5070).
// It performs exactly what the browser extension does: start a session, receive
// events, stop the session, and read the coverage report. This lets the Playwright
// framework record coverage without loading a real Chrome extension.

// Shape of a captured coverage event. It mirrors the payload produced by the
// extension's content script so the API scores it identically.
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

// Summary section returned by the API's coverage report.
export type CoverageReport = {
  session: { id: string; name: string; status: string; eventCount: number };
  overall: { expected: number; covered: number; missed: number };
  routes: { expected: number; covered: number; missed: string[] };
  actions: { expected: number; covered: number; missed: string[] };
  eventCount: number;
};

// Small wrapper around the coverage API endpoints.
export class CoverageClient {
  public constructor(private readonly apiBaseUrl: string) {}

  // Create a new coverage session. Equivalent to the extension's "Start session".
  public async startSession(name: string): Promise<string> {
    const response = await fetch(`${this.apiBaseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(`Coverage API returned ${response.status} when starting a session.`);
    }
    const session = (await response.json()) as { id: string };
    return session.id;
  }

  // Send a batch of captured events for a session.
  public async sendEvents(sessionId: string, events: CoverageEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }
    await fetch(`${this.apiBaseUrl}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  }

  // Stop the session. Equivalent to the extension's "Stop/End session".
  public async stopSession(sessionId: string): Promise<void> {
    await fetch(`${this.apiBaseUrl}/sessions/${sessionId}/stop`, { method: 'POST' });
  }

  // Read the computed coverage report (covered nodes, gaps, percentages).
  public async getReport(sessionId: string): Promise<CoverageReport> {
    const response = await fetch(`${this.apiBaseUrl}/sessions/${sessionId}/report`);
    if (!response.ok) {
      throw new Error(`Coverage API returned ${response.status} when reading the report.`);
    }
    return (await response.json()) as CoverageReport;
  }

  // Confirm the coverage API is reachable before a run starts.
  public async isReachable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
