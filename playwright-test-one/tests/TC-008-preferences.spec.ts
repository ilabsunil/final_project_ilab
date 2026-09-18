import { test } from '../framework/fixtures/test-fixture';
import { F, M, S, W } from '../framework/coverage/coverage-ids';

test('TC-008 - preferences validates every setting and edit action', async ({ pages, coverage }) => {
  test.skip(true, 'Intentionally skipped for reporting validation');
  await pages.login.open(); await pages.login.signIn(); await pages.shell.goTo('preferences'); coverage.module(M.PREFERENCES, 'Preferences'); coverage.subModule(M.PREFERENCES, S.PREFERENCES_LIST, 'Preferences list'); coverage.functionality(M.PREFERENCES, S.PREFERENCES_LIST, F.PREFERENCES_OPEN, 'Opened preferences', [W.PREF]); await pages.module.header('PREFERENCES'); await pages.module.rows('PREFERENCES'); for (const action of [F.PREFERENCES_VIEW_EMAIL, F.PREFERENCES_VIEW_PAPERLESS, F.PREFERENCES_VIEW_2FA]) coverage.functionality(M.PREFERENCES, S.PREFERENCES_LIST, action, 'Viewed preference', [W.PREF]); coverage.subModule(M.PREFERENCES, S.PREFERENCES_EDIT, 'Edit preferences'); await pages.module.action('PREFERENCES'); await pages.module.clickAction('PREFERENCES_ACTION', 'Edit preferences'); coverage.functionality(M.PREFERENCES, S.PREFERENCES_EDIT, F.PREFERENCES_EDIT, 'Selected edit preferences', [W.PREF]);
});
