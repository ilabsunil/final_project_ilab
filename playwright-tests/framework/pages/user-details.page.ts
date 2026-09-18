// Page object for the User Details (customer profile) module — a profile card rather
// than a list, so it has its own validations.
import { testdata } from '../config/config-loader';
import { BasePage } from './base.page';

export class UserDetailsPage extends BasePage {
  public async expectHeader(): Promise<void> {
    await this.expectText('PAGE_TITLE_H1', testdata.get('USERS_PAGE_TITLE'), 'User Details title');
    await this.expectText('PAGE_SUBTITLE', testdata.get('USERS_PAGE_SUBTITLE'), 'User Details subtitle');
  }

  public async expectProfileCard(): Promise<void> {
    await this.expectVisible('USER_PROFILE_CARD', 'Profile card');
    await this.expectText('USER_PROFILE_NAME', testdata.get('LOGIN_VALID_FULL_NAME'), 'Profile name');
    await this.expectText('USER_PROFILE_ROLE', testdata.get('USERS_PROFILE_ROLE'), 'Profile role');
    await this.expectText('USER_PROFILE_STATUS', testdata.get('USERS_PROFILE_STATUS'), 'Profile status');
  }

  public async expectAccountDetails(): Promise<void> {
    await this.expectCount('USER_DETAIL_ITEMS', testdata.getNumber('USERS_EXPECTED_DETAIL_COUNT'), 'Account detail items');
    await this.expectText(
      'USER_DETAIL_VALUE_BY_LABEL',
      testdata.get('LOGIN_VALID_EMAIL'),
      'Email address detail',
      { label: testdata.get('USERS_DETAIL_LABEL_EMAIL') },
    );
    await this.expectText(
      'USER_DETAIL_VALUE_BY_LABEL',
      testdata.get('USERS_EXPECTED_ACCOUNT_TYPE'),
      'Account type detail',
      { label: testdata.get('USERS_DETAIL_LABEL_ACCOUNT_TYPE') },
    );
  }
}
