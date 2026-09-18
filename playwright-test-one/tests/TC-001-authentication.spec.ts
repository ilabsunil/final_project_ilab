import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-001 - authentication accepts valid and rejects invalid credentials', async ({ pages, coverage }) => {
  await pages.login.open(); await pages.login.expectLoaded(); coverage.module(M.AUTH, 'Authentication'); coverage.subModule(M.AUTH, S.LOGIN_FORM, 'Login form');
  await pages.login.signIn('wrong.user@pnc.com', 'badpassword'); await pages.login.expectError(); coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_INVALID_LOGIN, 'Rejected invalid credentials', [W.AUTH]);
  await pages.login.signIn(); await pages.shell.expectSignedIn(); coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_ENTER_EMAIL, 'Entered email', [W.AUTH]); coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_ENTER_PASSWORD, 'Entered password', [W.AUTH]); coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_SIGNIN, 'Signed in', [W.AUTH]);
  await pages.shell.signOut(); coverage.subModule(M.AUTH, S.SESSION, 'Session controls'); coverage.functionality(M.AUTH, S.SESSION, F.AUTH_SIGNOUT, 'Signed out', [W.AUTH]);
});
