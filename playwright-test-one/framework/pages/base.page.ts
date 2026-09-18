import { expect, type Locator, type Page } from '@playwright/test';
import { testdata, xpaths } from '../config/config-loader';
import { ExecutionLogger } from '../logging/execution-logger';
export class BasePage {
  protected readonly timeout = testdata.getNumber('DEFAULT_TIMEOUT_MS');
  public constructor(protected readonly page: Page, protected readonly log: ExecutionLogger) {}
  protected byKey(key: string, params: Record<string, string> = {}): Locator { let selector = xpaths.get(key); for (const [name, value] of Object.entries(params)) selector = selector.split(`{${name}}`).join(value); return this.page.locator(selector); }
  protected async click(key: string, description: string, params: Record<string, string> = {}): Promise<void> { this.log.action(`Click ${description}`); await this.byKey(key, params).first().click({ timeout: this.timeout }); }
  protected async fill(key: string, value: string, description: string): Promise<void> { this.log.action(`Fill ${description}`); await this.byKey(key).first().fill(value, { timeout: this.timeout }); }
  protected async expectText(key: string, value: string, description: string, params: Record<string, string> = {}): Promise<void> { this.log.validate(`${description} contains ${value}`); await expect(this.byKey(key, params).first()).toContainText(value, { timeout: this.timeout }); this.log.pass(description); }
  protected async expectVisible(key: string, description: string, params: Record<string, string> = {}): Promise<void> { await expect(this.byKey(key, params).first(), description).toBeVisible({ timeout: this.timeout }); this.log.pass(description); }
  protected async expectCount(key: string, value: number, description: string): Promise<void> { await expect(this.byKey(key), description).toHaveCount(value, { timeout: this.timeout }); this.log.pass(description); }
  protected async expectMinCount(key: string, value: number, description: string): Promise<void> { await expect(this.byKey(key).first(), description).toBeVisible({ timeout: this.timeout }); const count = await this.byKey(key).count(); expect(count, description).toBeGreaterThanOrEqual(value); this.log.pass(`${description}: ${count}`); }
  protected async textOf(key: string): Promise<string> { return (await this.byKey(key).first().innerText({ timeout: this.timeout })).trim(); }
}
