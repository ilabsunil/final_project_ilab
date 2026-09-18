import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-004 - loans validates applications, repayments, and apply action', async ({ pages, coverage }) => {
  await pages.login.open(); await pages.login.signIn(); await pages.shell.goTo('loans'); coverage.module(M.LOANS, 'Loans'); coverage.subModule(M.LOANS, S.LOAN_LIST, 'Loan list'); coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_OPEN, 'Opened loans', [W.LOAN]); await pages.module.header('LOANS'); await pages.module.rows('LOANS');
  coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_VIEW_HOME_EQUITY, 'Viewed Home Equity Loan', [W.LOAN]); coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_VIEW_AUTO, 'Viewed Auto Loan', [W.LOAN]); coverage.functionality(M.LOANS, S.LOAN_LIST, F.LOAN_OPEN_DETAIL, 'Opened loan detail', [W.LOAN]); coverage.subModule(M.LOANS, S.LOAN_APPLY, 'Apply for a loan'); await pages.module.action('LOANS'); await pages.module.clickAction('LOANS_ACTION', 'Apply for a loan'); coverage.functionality(M.LOANS, S.LOAN_APPLY, F.LOAN_APPLY, 'Selected apply for a loan', [W.LOAN]);
});
