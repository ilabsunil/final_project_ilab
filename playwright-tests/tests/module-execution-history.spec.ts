// TC-RUNS: Execution history (governance) flow. Signs in, opens Execution history, and
// verifies the recovery report panel is displayed.
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { AppPage } from '../framework/pages/app.page';
import { TestLogger } from '../framework/logging/test-logger';

test('TC-RUNS - execution history and recovery report', async ({ page }, testInfo) => {
  const logger = new TestLogger(testInfo);
  const app = new AppPage(page, logger);
  try {
    await app.openAndSignIn();
    await app.goto('Execution history');
    await expect(page.getByRole('heading', { name: 'Recovery report' })).toBeVisible();
    logger.pass('Execution history recovery report is displayed');
  } catch (error) {
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await logger.save();
  }
});
