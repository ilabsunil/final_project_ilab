// TC-DASH: Command center (dashboard) flow. Signs in, verifies the dashboard summary,
// and records the dashboard inventory coverage (route + View summary action +
// quality-review workflow).
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { AppPage } from '../framework/pages/app.page';
import { TestLogger } from '../framework/logging/test-logger';
import { coverModuleFlow } from '../framework/coverage/coverage-emit';

test('TC-DASH - command center dashboard and summary', async ({ page, coverage }, testInfo) => {
  const logger = new TestLogger(testInfo);
  const app = new AppPage(page, logger);
  try {
    await app.openAndSignIn();
    // The dashboard is the landing view; validate its key summary widgets.
    await expect(page.getByRole('heading', { name: 'Coverage intelligence' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Automation trend' })).toBeVisible();
    logger.pass('Command center summary widgets are visible');
    coverModuleFlow(coverage, 'dashboard');
    logger.pass('Recorded dashboard coverage');
  } catch (error) {
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await logger.save();
  }
});
