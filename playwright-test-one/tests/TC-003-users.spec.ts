import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-003 - user details validates profile and all account fields', async ({ pages, coverage }) => {
  await pages.login.open(); await pages.login.signIn(); await pages.shell.goTo('users'); coverage.module(M.USERS, 'User Details'); coverage.subModule(M.USERS, S.USER_PROFILE_HEADER, 'Profile header'); coverage.functionality(M.USERS, S.USER_PROFILE_HEADER, F.USER_OPEN, 'Opened user details', [W.USER]);
  await pages.users.expectProfile(); coverage.functionality(M.USERS, S.USER_PROFILE_HEADER, F.USER_VIEW_NAME, 'Viewed profile name', [W.USER]); coverage.functionality(M.USERS, S.USER_PROFILE_HEADER, F.USER_VIEW_STATUS, 'Viewed profile status', [W.USER]); coverage.subModule(M.USERS, S.USER_ACCOUNT_DETAILS, 'Account details');
  for (const action of [F.USER_VIEW_FULL_NAME, F.USER_VIEW_ACCOUNT_NUMBER, F.USER_VIEW_EMAIL, F.USER_VIEW_PHONE, F.USER_VIEW_ADDRESS, F.USER_VIEW_ACCOUNT_TYPE]) coverage.functionality(M.USERS, S.USER_ACCOUNT_DETAILS, action, 'Viewed account detail', [W.USER]);
});
