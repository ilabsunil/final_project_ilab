import fs from 'node:fs';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';

export const REPORTS_DIR = path.resolve(__dirname, '..', '..', 'reports');
export const RUN_LOG_FILE = path.join(REPORTS_DIR, 'execution.log');
export function appendRunLog(line: string): void { fs.mkdirSync(REPORTS_DIR, { recursive: true }); fs.appendFileSync(RUN_LOG_FILE, `${line}\n`); }
export function resetRunLog(): void { fs.mkdirSync(REPORTS_DIR, { recursive: true }); fs.writeFileSync(RUN_LOG_FILE, ''); }

export class ExecutionLogger {
  private readonly entries: string[] = [];
  private readonly id: string;
  public constructor(private readonly testInfo: TestInfo) { this.id = testInfo.title.split(' - ')[0].trim(); }
  public testStart(): void { this.write('TEST', `START ${this.testInfo.title}`); }
  public testEnd(): void { this.write(this.testInfo.status === 'passed' ? 'PASS' : this.testInfo.status === 'skipped' ? 'SKIP' : 'FAIL', `END ${this.testInfo.title} -> ${this.testInfo.status}`); }
  public action(message: string): void { this.write('ACTION', message); }
  public validate(message: string): void { this.write('VALIDATE', message); }
  public pass(message: string): void { this.write('PASS', message); }
  public result(label: string, value: string): void { this.write('RESULT', `${label}: ${value}`); }
  public info(message: string): void { this.write('INFO', message); }
  public async save(): Promise<void> { fs.mkdirSync(this.testInfo.outputDir, { recursive: true }); fs.writeFileSync(path.join(this.testInfo.outputDir, 'test-steps.log'), `${this.entries.join('\n')}\n`); }
  private write(level: string, message: string): void { const line = `[${new Date().toISOString()}] [${level.padEnd(8)}] [${this.id}] ${message}`; this.entries.push(line); appendRunLog(line); console.log(line); }
}
export function logRun(message: string): void { appendRunLog(`[${new Date().toISOString()}] [RUN     ] ${message}`); }
