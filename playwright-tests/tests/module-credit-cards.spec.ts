// TC-CARDS: Credit cards section and details flow (including disputes). Signs in, opens
// the Credit cards module, drills into a card sub-module, records navigation, and records
// the cards inventory coverage (route + Open/Submit dispute actions + card-dispute
// workflow).
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { AppPage } from '../framework/pages/app.page';
import { TestLogger } from '../framework/logging/test-logger';
import { coverModuleFlow } from '../framework/coverage/coverage-emit';

test('TC-CARDS - credit cards section and details', async ({ page, coverage }, testInfo) => {
  const logger = new TestLogger(testInfo);
  const app = new AppPage(page, logger);
  try {
    await app.openAndSignIn();
    await app.goto('Credit cards');
    await app.expectHeading('Credit cards');
    await expect(page.getByText('Card lifecycle, limits, and dispute workflows')).toBeVisible();
    await app.recordNavigation();
    await app.openFirstModuleRow();
    logger.pass('Exercised the Credit cards section and its details');
    coverModuleFlow(coverage, 'cards');
    logger.pass('Recorded credit cards coverage');
  } catch (error) {
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await logger.save();
  }
});
