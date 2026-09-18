// TC-002: Sign in, open the Loans module, validate header / action / rows, open a loan.
// Note: "Apply for a loan" is deliberately NOT exercised so it shows as untouched in the
// test-gap report.
import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

const PREFIX = 'LOANS';

test('TC-002 - loans module lists existing loans', async ({ pages, log, coverage }) => {
  await pages.login.open();
  await pages.login.signInAsValidUser();
  await pages.shell.expectSignedIn();
  coverage.functionality(M.AUTH, S.LOGIN_FORM, F.AUTH_SIGNIN, 'Signed in', [W.AUTH]);

  await pages.shell.goTo('loans');
  coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_OPEN, 'Opened Loans list', [W.LOAN_APPLICATION]);

  await pages.module.expectHeader(PREFIX);
  await pages.module.expectPrimaryAction(PREFIX);
  await pages.module.expectRows(PREFIX);
  await pages.module.expectRowTitles(PREFIX);
  // Each loan row validated = its own functionality node.
  coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_VIEW_HOME_EQUITY, 'Validated Home Equity Loan row', [W.LOAN_APPLICATION]);
  coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_VIEW_AUTO, 'Validated Auto Loan row', [W.LOAN_APPLICATION]);

  const opened = await pages.module.openFirstRow(PREFIX);
  log.result('Opened loan', opened);
  coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_OPEN_DETAIL, 'Opened a loan detail row', [W.LOAN_APPLICATION]);
  // NOTE: S.LOAN_APPLY / F.LOAN_APPLY intentionally NOT exercised → shows as untouched.
});
