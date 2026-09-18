// Page object for the PNC Bank login screen.
// Locators: xpaths.properties (LOGIN_*)   Data: testdata.properties (LOGIN_*)
import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Open the app at APP_BASE_URL in a clean, logged-out state.
  public async open(): Promise<void> {
    const url = testdata.get('APP_BASE_URL');
    this.log.action(`Navigate to ${url}`);
    await this.page.goto(url);
    this.log.action('Clear any saved browser session (localStorage) so login is shown');
    await this.page.evaluate(() => window.localStorage.clear());
    await this.page.reload();
    await this.settle();
    this.log.info(`Page URL is ${this.page.url()}`);
  }

  // Confirm the login form is displayed.
  public async expectLoaded(): Promise<void> {
    await this.expectText('LOGIN_HEADING', testdata.get('LOGIN_HEADING_TEXT'), 'Login heading');
    await this.expectVisible('LOGIN_EMAIL_INPUT', 'Email / user-id field');
    await this.expectVisible('LOGIN_PASSWORD_INPUT', 'Password field');
    await this.expectVisible('LOGIN_SUBMIT_BUTTON', 'Sign in button');
  }

  // Clear the pre-filled email & password, enter the given credentials, click Sign in.
  public async signIn(email: string, password: string): Promise<void> {
    await this.clearAndFill('LOGIN_EMAIL_INPUT', email, 'Email / user-id field');
    await this.clearAndFill('LOGIN_PASSWORD_INPUT', password, 'Password field', true);
    await this.click('LOGIN_SUBMIT_BUTTON', 'Sign in button');
  }

  // Sign in with LOGIN_VALID_* from testdata.properties.
  public async signInAsValidUser(): Promise<void> {
    await this.signIn(testdata.get('LOGIN_VALID_EMAIL'), testdata.get('LOGIN_VALID_PASSWORD'));
  }

  // Sign in with LOGIN_INVALID_* from testdata.properties.
  public async signInAsInvalidUser(): Promise<void> {
    await this.signIn(testdata.get('LOGIN_INVALID_EMAIL'), testdata.get('LOGIN_INVALID_PASSWORD'));
  }

  // Confirm the invalid-credentials error message is shown.
  public async expectLoginError(): Promise<void> {
    await this.expectText('LOGIN_ERROR_MESSAGE', testdata.get('LOGIN_ERROR_TEXT'), 'Login error message');
  }
}
