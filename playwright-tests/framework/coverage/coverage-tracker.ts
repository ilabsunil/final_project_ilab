// Records which inventory nodes (module / sub-module / functionality) each test exercised
// and persists the hits run-wide for the test-gap report. The plugin SESSION lifecycle
// (extension launch, session start/stop, event forwarding to the CoverageEngine API) is
// owned by the LOCKED `framework/session/` module — this tracker only delegates to it.
import fs from 'node:fs';
import path from 'node:path';
import { REPORTS_DIR } from '../logging/execution-logger';
import { SessionRecorder } from '../session/session-recorder';

export const COVERAGE_HITS_FILE = path.join(REPORTS_DIR, 'coverage-hits.json');

// One recorded interaction (consumed by the reporting layer).
export type CoverageHit = {
  testCaseId: string;
  moduleId: string;
  subModuleId: string | null;
  functionalityId: string | null;
  label: string;
  timestamp: string;
};

// ---- run-wide hits file -----------------------------------------------------------
export function resetCoverageHits(): void {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(COVERAGE_HITS_FILE, '[]');
}

export function readCoverageHits(): CoverageHit[] {
  try {
    return JSON.parse(fs.readFileSync(COVERAGE_HITS_FILE, 'utf8')) as CoverageHit[];
  } catch {
    return [];
  }
}

function appendCoverageHits(hits: CoverageHit[]): void {
  const existing = readCoverageHits();
  fs.writeFileSync(COVERAGE_HITS_FILE, JSON.stringify([...existing, ...hits], null, 2));
}

// ---- per-test tracker -------------------------------------------------------------
// Thin wrapper over the LOCKED SessionRecorder. Specs call module()/subModule()/
// functionality() to capture the actions & validations they perform; on flush() the
// events go to the plugin session (via the locked recorder) AND to the run-wide hits file
// used by the test-gap report.
export class CoverageTracker {
  private readonly recorder: SessionRecorder;

  public constructor(private readonly testCaseId: string) {
    this.recorder = new SessionRecorder(testCaseId);
  }

  // Capture that a MODULE (route) was reached.
  public module(moduleId: string, label: string): void {
    this.recorder.captureModule(moduleId, label);
  }

  // Capture that a SUB-MODULE (component) inside a module was exercised.
  public subModule(moduleId: string, subModuleId: string, label: string): void {
    this.recorder.captureSubModule(moduleId, subModuleId, label);
  }

  // Capture that a specific FUNCTIONALITY (action / validation) was performed.
  public functionality(moduleId: string, subModuleId: string, functionalityId: string, label: string, workflowIds: string[] = []): void {
    this.recorder.captureFunctionality(moduleId, subModuleId, functionalityId, label, workflowIds);
  }

  // Flush: forward captured events to the plugin session AND persist hits for the report.
  public async flush(): Promise<number> {
    const count = await this.recorder.flush();
    appendCoverageHits(
      this.recorder.collected().map((h) => ({
        testCaseId: h.testCaseId,
        moduleId: h.moduleId,
        subModuleId: h.subModuleId,
        functionalityId: h.functionalityId,
        label: h.label,
        timestamp: h.timestamp,
      })),
    );
    return count;
  }
}
