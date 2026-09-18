import fs from 'node:fs';
import path from 'node:path';
import { testdata } from '../config/config-loader';
import { REPORTS_DIR } from '../logging/execution-logger';

export const COVERAGE_HITS_FILE = path.join(REPORTS_DIR, 'coverage-hits.json');
export type CoverageHit = { testCaseId: string; moduleId: string; subModuleId: string | null; functionalityId: string | null; label: string; timestamp: string };
let sessionId: string | null = null;
export function resetCoverageHits(): void { fs.mkdirSync(REPORTS_DIR, { recursive: true }); fs.writeFileSync(COVERAGE_HITS_FILE, '[]'); }
export function readCoverageHits(): CoverageHit[] { try { return JSON.parse(fs.readFileSync(COVERAGE_HITS_FILE, 'utf8')) as CoverageHit[]; } catch { return []; } }
export async function startCoverageSession(): Promise<void> { try { const response = await fetch(`${testdata.get('COVERAGE_API_BASE_URL')}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: testdata.get('COVERAGE_SESSION_NAME') }) }); if (response.ok) sessionId = ((await response.json()) as { id: string }).id; } catch { sessionId = null; } }
export async function stopCoverageSession(): Promise<void> { if (!sessionId) return; try { await fetch(`${testdata.get('COVERAGE_API_BASE_URL')}/sessions/${sessionId}/stop`, { method: 'POST' }); } catch { /* coverage API is best effort */ } }
export class CoverageTracker {
  private readonly hits: CoverageHit[] = [];
  public constructor(private readonly testCaseId: string) {}
  public module(moduleId: string, label: string): void { this.record(moduleId, null, null, label); }
  public subModule(moduleId: string, subModuleId: string, label: string): void { this.record(moduleId, subModuleId, null, label); }
  public functionality(moduleId: string, subModuleId: string, functionalityId: string, label: string, workflowIds: string[] = []): void { this.record(moduleId, subModuleId, functionalityId, label); if (sessionId) void fetch(`${testdata.get('COVERAGE_API_BASE_URL')}/sessions/${sessionId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: [{ eventId: `${Date.now()}-${Math.random()}`, kind: 'action', routeId: moduleId, componentId: subModuleId, actionId: functionalityId, workflowIds, source: 'automation', timestamp: new Date().toISOString(), metadata: { test: this.testCaseId, label } }] }) }).catch(() => undefined); }
  public async flush(): Promise<number> { const hits = readCoverageHits(); fs.writeFileSync(COVERAGE_HITS_FILE, JSON.stringify([...hits, ...this.hits], null, 2)); return this.hits.length; }
  private record(moduleId: string, subModuleId: string | null, functionalityId: string | null, label: string): void { this.hits.push({ testCaseId: this.testCaseId, moduleId, subModuleId, functionalityId, label, timestamp: new Date().toISOString() }); }
}
