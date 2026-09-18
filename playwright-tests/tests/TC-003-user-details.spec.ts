// TC-003: Sign in, open User Details, validate the profile card and account details.
import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-003 - user details shows customer profile', async ({ pages, coverage }) => {
  await pages.login.open();
  await pages.login.signInAsValidUser();
  await pages.shell.expectSignedIn();
  coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_SIGNIN, 'Signed in', [W.AUTH]);

  await pages.shell.goTo('users');
  coverage.functionality(M.USERS, S.USER_PROFILE_HEADER, F.USER_OPEN, 'Opened User details', [W.USER_PROFILE]);

  await pages.users.expectHeader();
  // Profile header: name + status validated.
  await pages.users.expectProfileCard();
  coverage.functionality(M.USERS, S.USER_PROFILE_HEADER, F.USER_VIEW_NAME, 'Validated account holder name', [W.USER_PROFILE]);
  coverage.functionality(M.USERS, S.USER_PROFILE_HEADER, F.USER_VIEW_STATUS, 'Validated account status', [W.USER_PROFILE]);

  // Account details: only email + account type are asserted by the page object, so only
  // those two functionality nodes are captured — the rest stay untouched in the report.
  await pages.users.expectAccountDetails();
  coverage.functionality(M.USERS, S.USER_ACCOUNT_DETAILS, F.USER_VIEW_EMAIL, 'Validated email address', [W.USER_PROFILE]);
  coverage.functionality(M.USERS, S.USER_ACCOUNT_DETAILS, F.USER_VIEW_ACCOUNT_TYPE, 'Validated account type', [W.USER_PROFILE]);
});
