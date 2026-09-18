import fs from 'node:fs';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';

export class TestLogger {
  // Keep log entries in memory so they can be written to a file after each test.
  private readonly entries: string[] = [];

  // Associate this logger with Playwright's unique output directory for the test.
  public constructor(private readonly testInfo: TestInfo) {}

  // Record a normal test step in the console and in the saved log.
  public step(message: string): void {
    const entry = `[${new Date().toISOString()}] [STEP] ${message}`;
    this.entries.push(entry);
    console.log(entry);
  }

  // Record a successful test action.
  public pass(message: string): void {
    const entry = `[${new Date().toISOString()}] [PASS] ${message}`;
    this.entries.push(entry);
    console.log(entry);
  }

  // Record a failed test action.
  public fail(message: string): void {
    const entry = `[${new Date().toISOString()}] [FAIL] ${message}`;
    this.entries.push(entry);
    console.error(entry);
  }

  // Save the complete human-readable log for this test attempt.
  public async save(): Promise<void> {
    const outputDirectory = this.testInfo.outputDir;
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, 'test-steps.log'), `${this.entries.join('\n')}\n`);
  }
}