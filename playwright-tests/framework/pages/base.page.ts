// Base page object. Concrete pages only declare WHICH locator keys and data keys they use;
// every HOW (click / fill / assert / read) lives here, fully logged as ACTION + VALIDATE.
import { expect, type Locator, type Page } from '@playwright/test';
import { testdata, xpaths } from '../config/config-loader';
import { ExecutionLogger } from '../logging/execution-logger';

export abstract class BasePage {
  protected readonly timeout = testdata.getNumber('DEFAULT_TIMEOUT_MS');

  public constructor(
    protected readonly page: Page,
    protected readonly log: ExecutionLogger,
  ) {}

  // Resolve a locator by its UNIQUE key in xpaths.properties. `params` substitute
  // `{placeholder}` tokens inside the stored XPath (e.g. {label}).
  protected byKey(key: string, params: Record<string, string> = {}): Locator {
    let selector = xpaths.get(key);
    for (const [name, value] of Object.entries(params)) {
      selector = selector.split(`{${name}}`).join(value);
    }
    return this.page.locator(selector);
  }

  // ---- actions --------------------------------------------------------------
  protected async click(key: string, description: string, params: Record<string, string> = {}): Promise<void> {
    this.log.action(`Click ${description}`);
    await this.byKey(key, params).first().click({ timeout: this.timeout });
  }

  // Clear the existing value, then type the new one.
  protected async clearAndFill(key: string, value: string, description: string, mask = false): Promise<void> {
    const input = this.byKey(key).first();
    this.log.action(`Clear existing value in ${description}`);
    await input.clear({ timeout: this.timeout });
    this.log.action(`Enter ${mask ? '********' : `"${value}"`} into ${description}`);
    await input.fill(value, { timeout: this.timeout });
  }

  // ---- validations ----------------------------------------------------------
  protected async expectVisible(key: string, description: string, params: Record<string, string> = {}): Promise<void> {
    this.log.validate(`${description} is visible`);
    await expect(this.byKey(key, params).first(), `${description} should be visible`).toBeVisible({ timeout: this.timeout });
    this.log.pass(`${description} is visible`);
  }

  protected async expectText(key: string, expected: string, description: string, params: Record<string, string> = {}): Promise<void> {
    this.log.validate(`${description} contains "${expected}"`);
    await expect(this.byKey(key, params).first(), `${description} should contain "${expected}"`).toContainText(expected, {
      timeout: this.timeout,
    });
    this.log.pass(`${description} shows "${expected}"`);
  }

  protected async expectCount(key: string, expected: number, description: string): Promise<void> {
    this.log.validate(`${description} count equals ${expected}`);
    await expect(this.byKey(key), `${description} count should be ${expected}`).toHaveCount(expected, { timeout: this.timeout });
    this.log.pass(`${description} count is ${expected}`);
  }

  protected async expectMinCount(key: string, min: number, description: string): Promise<void> {
    this.log.validate(`${description} has at least ${min} item(s)`);
    await expect(this.byKey(key).first(), `${description} should render at least one item`).toBeVisible({ timeout: this.timeout });
    const count = await this.byKey(key).count();
    expect(count, `${description} should have at least ${min} item(s)`).toBeGreaterThanOrEqual(min);
    this.log.pass(`${description} has ${count} item(s) (min ${min})`);
  }

  // ---- reads ----------------------------------------------------------------
  protected async textOf(key: string, params: Record<string, string> = {}): Promise<string> {
    return (await this.byKey(key, params).first().innerText({ timeout: this.timeout })).trim();
  }

  protected async settle(): Promise<void> {
    await this.page.waitForTimeout(testdata.getNumber('PAGE_LOAD_WAIT_MS'));
  }
}
