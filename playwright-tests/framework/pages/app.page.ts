import { expect, type Page } from '@playwright/test';
import { testData } from '../config/config-loader';
import { TestLogger } from '../logging/test-logger';

// Page object for the Northstar Banking quality platform SPA. Navigation is state-based
// (sidebar buttons switch the active view), so methods click the accessible nav buttons
// and assert the resulting page heading.
export class AppPage {
  public constructor(private readonly page: Page, private readonly logger: TestLogger) {}

  // Open the app and sign in with the configured credentials.
  public async openAndSignIn(): Promise<void> {
    await this.page.goto(testData.baseUrl);
    await this.page.evaluate(() => window.localStorage.clear());
    await this.page.reload();
    await this.page.getByRole('textbox', { name: 'Work email' }).fill(testData.credentials.username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(testData.credentials.password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await expect(this.page.getByRole('heading', { name: 'Good morning, Maya' })).toBeVisible();
    this.logger.step('Signed in and landed on the Command center');
  }

  // Click a sidebar navigation item by its visible label.
  public async goto(navLabel: string): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(navLabel, 'i') }).first().click();
    this.logger.step(`Navigated to "${navLabel}"`);
  }

  // Assert a module heading is visible after navigation.
  public async expectHeading(heading: string): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    this.logger.pass(`"${heading}" page is displayed`);
  }

  // On a module page, click "Record navigation" to exercise a real app action.
  public async recordNavigation(): Promise<void> {
    const button = this.page.getByRole('button', { name: /Record navigation/i });
    if (await button.count()) {
      await button.first().click();
      this.logger.step('Clicked "Record navigation"');
    }
  }

  // Click the first module row on a module page, if present (drills into a sub-module).
  public async openFirstModuleRow(): Promise<void> {
    const row = this.page.locator('.module-row').first();
    if (await row.count()) {
      await row.click();
      this.logger.step('Opened the first sub-module row');
    }
  }

  // Sign out of the application.
  public async signOut(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign out' }).click();
    await expect(this.page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    this.logger.pass('Signed out of the application');
  }
}
