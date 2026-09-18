// TC-CONFIG: Configuration (governance) flow. Signs in, opens Configuration, and verifies
// the module heading and description are displayed.
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { AppPage } from '../framework/pages/app.page';
import { TestLogger } from '../framework/logging/test-logger';

test('TC-CONFIG - configuration workspace', async ({ page }, testInfo) => {
  const logger = new TestLogger(testInfo);
  const app = new AppPage(page, logger);
  try {
    await app.openAndSignIn();
    await app.goto('Configuration');
    await app.expectHeading('Configuration');
    await expect(page.getByText('External test data, locators, and XPath repositories')).toBeVisible();
    logger.pass('Configuration workspace is displayed');
  } catch (error) {
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await logger.save();
  }
});
