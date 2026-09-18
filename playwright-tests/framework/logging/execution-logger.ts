// Run-wide execution logger.
//
// One logger instance per test writes to THREE places at once:
//   1. The console (live, colour-tagged)
//   2. The test's own output folder  -> test-steps.log
//   3. A single run-wide file        -> reports/execution.log   (append-only, ordered)
//
// Every kind of event is captured — run start/end, test start/end, each ACTION, each
// VALIDATION (pass/fail), SKIPs, RETRY attempts and the final STATUS — so the whole
// execution can be replayed top-to-bottom from one file.
import fs from 'node:fs';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';

export const REPORTS_DIR = path.resolve(__dirname, '..', '..', 'reports');
export const RUN_LOG_FILE = path.join(REPORTS_DIR, 'execution.log');

type Level = 'RUN' | 'TEST' | 'ACTION' | 'VALIDATE' | 'PASS' | 'FAIL' | 'SKIP' | 'RETRY' | 'INFO' | 'RESULT';

const COLOURS: Record<Level, string> = {
  RUN: '\x1b[35m', // magenta
  TEST: '\x1b[36m', // cyan
  ACTION: '\x1b[34m', // blue
  VALIDATE: '\x1b[90m', // grey
  PASS: '\x1b[32m', // green
  FAIL: '\x1b[31m', // red
  SKIP: '\x1b[33m', // yellow
  RETRY: '\x1b[33m', // yellow
  INFO: '\x1b[37m', // white
  RESULT: '\x1b[1m', // bold
};
const RESET = '\x1b[0m';

function stamp(): string {
  return new Date().toISOString();
}

// Append one line to the run-wide log (creating the folder/file on first use).
export function appendRunLog(line: string): void {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.appendFileSync(RUN_LOG_FILE, `${line}\n`);
}

// Reset the run-wide log at the start of a run.
export function resetRunLog(): void {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(RUN_LOG_FILE, '');
}

export class ExecutionLogger {
  private readonly entries: string[] = [];
  private readonly testCaseId: string;
  private stepCounter = 0;

  public constructor(private readonly testInfo: TestInfo) {
    this.testCaseId = testInfo.title.split(' - ')[0].trim();
  }

  // ---- lifecycle -----------------------------------------------------------
  public testStart(): void {
    const attempt = this.testInfo.retry > 0 ? ` (retry ${this.testInfo.retry})` : '';
    this.write('TEST', `▶ START  ${this.testInfo.title}${attempt}`);
    if (this.testInfo.retry > 0) {
      this.write('RETRY', `Re-running ${this.testCaseId} — attempt #${this.testInfo.retry + 1}`);
    }
  }

  public testEnd(): void {
    const status = (this.testInfo.status ?? 'unknown').toUpperCase();
    const level: Level = status === 'PASSED' ? 'PASS' : status === 'SKIPPED' ? 'SKIP' : 'FAIL';
    this.write(level, `■ END    ${this.testInfo.title} → ${status} in ${this.testInfo.duration} ms`);
  }

  // ---- events --------------------------------------------------------------
  public action(message: string): void {
    this.stepCounter += 1;
    this.write('ACTION', `[step ${this.stepCounter}] ${message}`);
  }

  public validate(message: string): void {
    this.write('VALIDATE', `Validating: ${message}`);
  }

  public pass(message: string): void {
    this.write('PASS', `✔ ${message}`);
  }

  public fail(message: string): void {
    this.write('FAIL', `✖ ${message}`);
  }

  public skip(reason: string): void {
    this.write('SKIP', `⤼ SKIPPED — ${reason}`);
  }

  public info(message: string): void {
    this.write('INFO', message);
  }

  // Print a value the test captured (e.g. the welcome text) prominently.
  public result(label: string, value: string): void {
    this.write('RESULT', `${label}: "${value}"`);
  }

  // Save the per-test log into the test's output directory.
  public async save(): Promise<void> {
    fs.mkdirSync(this.testInfo.outputDir, { recursive: true });
    fs.writeFileSync(path.join(this.testInfo.outputDir, 'test-steps.log'), `${this.entries.join('\n')}\n`);
  }

  // ---- internals -----------------------------------------------------------
  private write(level: Level, message: string): void {
    const line = `[${stamp()}] [${level.padEnd(8)}] [${this.testCaseId}] ${message}`;
    this.entries.push(line);
    appendRunLog(line);
    const colour = COLOURS[level];
    // eslint-disable-next-line no-console
    (level === 'FAIL' ? console.error : console.log)(`${colour}${line}${RESET}`);
  }
}

// Run-level messages emitted by global setup/teardown (not tied to one test).
export function logRun(message: string): void {
  const line = `[${stamp()}] [RUN     ] ${message}`;
  appendRunLog(line);
  // eslint-disable-next-line no-console
  console.log(`${COLOURS.RUN}${line}${RESET}`);
}
