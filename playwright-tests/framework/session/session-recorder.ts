// 🔒 LOCKED — part of the plugin session lifecycle. Do not modify.
//
// Per-test recorder (requirement #3): while tests execute, the actions and validations
// performed by the automation are captured here and forwarded into the ONE run-scoped
// plugin session started by globalSessionSetup. Test authors use this only via the
// `coverage` fixture — never by editing this file.
import { readActiveSession } from './session-hooks';
import { sendSessionEvents, type SessionEvent } from './session-client';

// An interaction the automation performed: a route visit, a sub-module visit, or a
// specific action/validation on a functionality node.
export type RecordedHit = {
  testCaseId: string;
  moduleId: string;
  subModuleId: string | null;
  functionalityId: string | null;
  kind: 'route' | 'action';
  label: string;
  timestamp: string;
};

export class SessionRecorder {
  private readonly hits: RecordedHit[] = [];
  private readonly events: SessionEvent[] = [];

  public constructor(private readonly testCaseId: string) {}

  // Capture that a MODULE (route) was reached.
  public captureModule(moduleId: string, label: string): void {
    this.capture(moduleId, null, null, 'route', label);
  }

  // Capture that a SUB-MODULE (component) was exercised.
  public captureSubModule(moduleId: string, subModuleId: string, label: string): void {
    this.capture(moduleId, subModuleId, null, 'route', label);
  }

  // Capture that a specific FUNCTIONALITY (action / validation) was performed.
  public captureFunctionality(
    moduleId: string,
    subModuleId: string,
    functionalityId: string,
    label: string,
    workflowIds: string[] = [],
  ): void {
    this.capture(moduleId, subModuleId, functionalityId, 'action', label, workflowIds);
  }

  // All hits captured by this test (used by the gap report; NON-reporting logic only).
  public collected(): RecordedHit[] {
    return this.hits;
  }

  // Flush this test's captured events into the run-scoped plugin session.
  public async flush(): Promise<number> {
    const active = readActiveSession();
    if (active) {
      await sendSessionEvents(active.sessionId, this.events);
    }
    return this.hits.length;
  }

  private capture(
    moduleId: string,
    subModuleId: string | null,
    functionalityId: string | null,
    kind: 'route' | 'action',
    label: string,
    workflowIds: string[] = [],
  ): void {
    const timestamp = new Date().toISOString();
    this.hits.push({ testCaseId: this.testCaseId, moduleId, subModuleId, functionalityId, kind, label, timestamp });
    this.events.push({
      eventId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind,
      routeId: moduleId,
      componentId: subModuleId,
      actionId: functionalityId,
      workflowIds,
      source: 'automation',
      timestamp,
      metadata: { test: this.testCaseId, label },
    });
  }
}
