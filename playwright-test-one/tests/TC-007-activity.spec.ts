import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-007 - activity history validates transactions and download action', async ({ pages, coverage }) => {
  await pages.login.open(); await pages.login.signIn(); await pages.shell.goTo('activity'); coverage.module(M.ACTIVITY, 'Activity History'); coverage.subModule(M.ACTIVITY, S.ACTIVITY_LIST, 'Transaction list'); coverage.functionality(M.ACTIVITY, S.ACTIVITY_LIST, F.ACTIVITY_OPEN, 'Opened activity history', [W.ACTIVITY]); await pages.module.header('ACTIVITY'); await pages.module.rows('ACTIVITY'); for (const action of [F.ACTIVITY_VIEW_DEPOSIT, F.ACTIVITY_VIEW_PAYMENT, F.ACTIVITY_VIEW_WITHDRAWAL, F.ACTIVITY_VIEW_STATUS]) coverage.functionality(M.ACTIVITY, S.ACTIVITY_LIST, action, 'Viewed transaction history', [W.ACTIVITY]); coverage.subModule(M.ACTIVITY, S.ACTIVITY_DOWNLOAD, 'Download activity'); await pages.module.action('ACTIVITY'); await pages.module.clickAction('ACTIVITY_ACTION', 'Download activity'); coverage.functionality(M.ACTIVITY, S.ACTIVITY_DOWNLOAD, F.ACTIVITY_DOWNLOAD, 'Selected download activity', [W.ACTIVITY]);
});
