// TC-004: Credit Cards — intentionally SKIPPED (not yet automated) so the report shows a
// skipped test and the Credit Cards module appears as untouched in the test-gap section.
import { test } from '../framework/fixtures/test-fixture';

test('TC-004 - credit cards module lists customer cards', async ({ pages }) => {
  test.skip(true, 'Credit Cards automation not implemented yet — pending test data sign-off');
  await pages.login.open();
});
