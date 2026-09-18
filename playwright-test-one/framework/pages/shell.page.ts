import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';
export type ModuleKey = 'dashboard' | 'users' | 'loans' | 'cards' | 'statements' | 'activity' | 'preferences';
const nav: Record<ModuleKey, [string, string]> = { dashboard: ['NAV_DASHBOARD', 'Dashboard'], users: ['NAV_USER_DETAILS', 'User details'], loans: ['NAV_LOANS', 'Loans'], cards: ['NAV_CREDIT_CARDS', 'Credit cards'], statements: ['NAV_STATEMENTS', 'Statements'], activity: ['NAV_ACTIVITY_HISTORY', 'Activity history'], preferences: ['NAV_PREFERENCES', 'Preferences'] };
export class ShellPage extends BasePage {
  public async expectSignedIn(): Promise<void> { await this.expectText('SHELL_WELCOME_HEADING', `${testdata.get('LOGIN_VALID_FIRST_NAME')}`, 'Welcome greeting'); }
  public async goTo(module: ModuleKey): Promise<void> { const [key, label] = nav[module]; await this.click(key, label); await this.expectText('SHELL_BREADCRUMB_CURRENT', label, `${label} breadcrumb`); }
  public async signOut(): Promise<void> { await this.click('SHELL_SIGN_OUT_BUTTON', 'Sign out'); }
}
