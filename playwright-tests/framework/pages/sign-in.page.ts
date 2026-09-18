import type { Page } from '@playwright/test';
import { locators, testData } from '../config/config-loader';
import { TestLogger } from '../logging/test-logger';

export class SignInPage {
  // Store the browser page and shared logger for all sign-in actions.
  public constructor(private readonly page: Page, private readonly logger: TestLogger) {}

  // Open the URL supplied by the external test-data configuration.
  public async open(): Promise<void> {
    await this.page.goto(testData.baseUrl);
    // Clear any saved session so the application always starts at the login page.
    await this.page.evaluate(() => window.localStorage.clear());
    await this.page.reload();
    this.logger.step(`Opened ${testData.baseUrl}`);
  }

  // Fill the login form using selectors and credentials loaded from configuration files.
  public async signIn(): Promise<void> {
    // Clear any pre-filled values before entering the configured credentials.
    await this.page.locator(locators.usernameInput).clear();
    await this.page.locator(locators.usernameInput).fill(testData.credentials.username);
    this.logger.step('Entered the configured username');
    await this.page.locator(locators.passwordInput).clear();
    await this.page.locator(locators.passwordInput).fill(testData.credentials.password);
    this.logger.step('Entered the configured password');
    await this.page.locator(locators.signInButton).click();
    this.logger.step('Selected the Sign in button');
  }
}