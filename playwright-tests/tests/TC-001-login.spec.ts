// TC-001: Open the local app, clear the pre-filled email & password, enter the configured
// user id / password, click Sign in, read the welcome text and print it to the console.
// All locators come from xpaths.json and all data from testdata.json.
import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-001 - login with valid credentials and print welcome text', async ({ pages, log, coverage }) => {
  await pages.login.open();
  await pages.login.expectLoaded();
  coverage.module(M.AUTH, 'Login page displayed');

  // Clear + enter email, clear + enter password, click Sign in.
  await pages.login.signInAsValidUser();
  coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_ENTER_EMAIL, 'Entered work email', [W.AUTH]);
  coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_ENTER_PASSWORD, 'Entered password', [W.AUTH]);
  coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_SIGNIN, 'Signed in', [W.AUTH]);

  // Landed on the dashboard: validate and capture the personalised greeting.
  await pages.shell.expectSignedIn();
  coverage.functionality(M.DASHBOARD, S.DASH_GREETING, F.DASH_VIEW_GREETING, 'Validated welcome greeting', [W.BANKING_OVERVIEW]);

  const welcome = await pages.shell.getWelcomeText();
  // Print the captured welcome text prominently in the console + logs.
  log.result('Welcome text', welcome);
  console.log(`\n>>> WELCOME TEXT: ${welcome}\n`);

  await pages.shell.signOut();
  coverage.functionality(M.AUTH, S.SESSION, F.AUTH_SIGNOUT, 'Signed out', [W.AUTH]);
});
