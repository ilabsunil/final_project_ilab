import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-002 - dashboard exposes every banking service and quick link', async ({ pages, coverage }) => {
  await pages.login.open(); await pages.login.signIn(); await pages.shell.expectSignedIn(); coverage.module(M.DASHBOARD, 'Dashboard'); coverage.subModule(M.DASHBOARD, S.DASH_GREETING, 'Welcome greeting'); coverage.functionality(M.DASHBOARD, S.DASH_GREETING, F.DASH_VIEW_GREETING, 'Viewed greeting', [W.BANKING]);
  await pages.dashboard.expectServices();
  for (const [label, subModule, action] of [['Loans', S.DASH_LOANS_CARD, F.DASH_OPEN_LOANS], ['Statements', S.DASH_STATEMENTS_CARD, F.DASH_OPEN_STATEMENTS], ['Cards', S.DASH_CARDS_CARD, F.DASH_OPEN_CARDS], ['Customers', S.DASH_CUSTOMERS_CARD, F.DASH_OPEN_CUSTOMERS]] as const) { await pages.dashboard.expectService(label); coverage.subModule(M.DASHBOARD, subModule, `${label} service card`); coverage.functionality(M.DASHBOARD, subModule, action, `Viewed ${label} card`, [W.BANKING]); }
  coverage.subModule(M.DASHBOARD, S.DASH_QUICK_LINKS, 'Quick links'); coverage.functionality(M.DASHBOARD, S.DASH_QUICK_LINKS, F.DASH_VIEW_ACTIVITY, 'Viewed activity quick link', [W.BANKING]);
});
