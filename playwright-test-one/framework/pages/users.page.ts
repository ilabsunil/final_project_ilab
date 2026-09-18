import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';
export class UsersPage extends BasePage {
  public async expectProfile(): Promise<void> { await this.expectVisible('USER_PROFILE_CARD', 'Profile card'); await this.expectText('USER_PROFILE_NAME', testdata.get('LOGIN_VALID_FULL_NAME'), 'Profile name'); await this.expectText('USER_PROFILE_ROLE', testdata.get('USERS_PROFILE_ROLE'), 'Profile role'); await this.expectText('USER_PROFILE_STATUS', testdata.get('USERS_PROFILE_STATUS'), 'Profile status'); await this.expectCount('USER_DETAIL_ITEMS', testdata.getNumber('USERS_EXPECTED_DETAIL_COUNT'), 'Profile details'); }
}
