// Page object for the signed-in shell: welcome heading, sidebar navigation, breadcrumb,
// sign-out. Every module test navigates through this page.
import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';

export type ModuleKey = 'dashboard' | 'users' | 'loans' | 'cards' | 'statements' | 'activity' | 'preferences';

// Sidebar entry → NAV_* locator key + breadcrumb data key.
const NAV: Record<ModuleKey, { locator: string; breadcrumbKey: string }> = {
  dashboard: { locator: 'NAV_DASHBOARD', breadcrumbKey: 'DASH_BREADCRUMB' },
  users: { locator: 'NAV_USER_DETAILS', breadcrumbKey: 'USERS_BREADCRUMB' },
  loans: { locator: 'NAV_LOANS', breadcrumbKey: 'LOANS_BREADCRUMB' },
  cards: { locator: 'NAV_CREDIT_CARDS', breadcrumbKey: 'CARDS_BREADCRUMB' },
  statements: { locator: 'NAV_STATEMENTS', breadcrumbKey: 'STATEMENTS_BREADCRUMB' },
  activity: { locator: 'NAV_ACTIVITY_HISTORY', breadcrumbKey: 'ACTIVITY_BREADCRUMB' },
  preferences: { locator: 'NAV_PREFERENCES', breadcrumbKey: 'PREFERENCES_BREADCRUMB' },
};

export class AppShellPage extends BasePage {
  // Confirm the personalised greeting proves the user is signed in.
  public async expectSignedIn(): Promise<void> {
    const expected = `${testdata.get('WELCOME_HEADING_PREFIX')} ${testdata.get('LOGIN_VALID_FIRST_NAME')}`;
    await this.expectText('SHELL_WELCOME_HEADING', expected, 'Welcome heading');
  }

  // Read the welcome text (the test prints this to the console).
  public async getWelcomeText(): Promise<string> {
    return this.textOf('SHELL_WELCOME_HEADING');
  }

  // Navigate to a module via the sidebar and confirm the breadcrumb updated.
  public async goTo(module: ModuleKey): Promise<void> {
    const { locator, breadcrumbKey } = NAV[module];
    const label = testdata.getOr(breadcrumbKey, module);
    await this.click(locator, `sidebar item "${label}"`);
    if (testdata.has(breadcrumbKey)) {
      await this.expectText('SHELL_BREADCRUMB_CURRENT', label, 'Breadcrumb');
    }
  }

  // Sign out and confirm the login page is shown again.
  public async signOut(): Promise<void> {
    await this.click('SHELL_SIGN_OUT_BUTTON', 'Sign out button');
    await this.expectText('LOGIN_HEADING', testdata.get('LOGIN_HEADING_TEXT'), 'Login heading');
  }
}
