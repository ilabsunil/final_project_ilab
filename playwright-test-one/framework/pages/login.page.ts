import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';
export class LoginPage extends BasePage {
  public async open(): Promise<void> { await this.page.goto('/'); }
  public async expectLoaded(): Promise<void> { await this.expectText('LOGIN_HEADING', testdata.get('LOGIN_HEADING_TEXT'), 'Login page'); }
  public async signIn(email = testdata.get('LOGIN_VALID_EMAIL'), password = testdata.get('LOGIN_VALID_PASSWORD')): Promise<void> { await this.fill('LOGIN_EMAIL_INPUT', email, 'email'); await this.fill('LOGIN_PASSWORD_INPUT', password, 'password'); await this.click('LOGIN_SUBMIT_BUTTON', 'Sign in'); }
  public async expectError(): Promise<void> { await this.expectText('LOGIN_ERROR_MESSAGE', testdata.get('LOGIN_ERROR_TEXT'), 'Invalid login error'); }
}
