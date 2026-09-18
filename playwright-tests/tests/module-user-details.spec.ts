// TC-USERS: User details section and details flow. Signs in, opens the User details
// module, verifies its description, records navigation, and drills into a sub-module.
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { AppPage } from '../framework/pages/app.page';
import { TestLogger } from '../framework/logging/test-logger';

test('TC-USERS - user details section and details', async ({ page }, testInfo) => {
  const logger = new TestLogger(testInfo);
  const app = new AppPage(page, logger);
  try {
    await app.openAndSignIn();
    await app.goto('User details');
    await app.expectHeading('User details');
    await expect(page.getByText('Customer identity, access, and profile workflows')).toBeVisible();
    await app.recordNavigation();
    await app.openFirstModuleRow();
    logger.pass('Exercised the User details section and its details');
  } catch (error) {
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await logger.save();
  }
});
