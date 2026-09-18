// Import `test` and `expect` from the coverage fixture so every test automatically
// starts a coverage session, captures actions, ends the session, and adds coverage
// (modules covered, test gap, percentage) to the report. No other setup is needed.
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { locators } from '../framework/config/config-loader';
import { SignInPage } from '../framework/pages/sign-in.page';
import { TestLogger } from '../framework/logging/test-logger';

// End-to-end test for the local application's login, welcome message, page content, and logout flow.
test('TC-001 - sign in with configured credentials', async ({ page }, testInfo) => {
  // Create a logger so steps appear in the console and in the test result folder.
  const logger = new TestLogger(testInfo);
  try {
    // Create page objects that keep browser actions reusable and maintainable.
    const signInPage = new SignInPage(page, logger);
    await signInPage.open();
    // Give the homepage two seconds to finish loading before collecting its details.
    await page.waitForTimeout(2_000);
    logger.step('Waited two seconds to confirm the homepage was available');
    logger.step(`The homepage URL is ${page.url()}`);
    // Enter the configured credentials and submit the login form.
    await signInPage.signIn();
    logger.pass('Signed in to the application successfully');
    // Confirm that the personalized welcome heading is displayed after login.
    const welcomeHeading = page.locator(locators.welcomeHeading);
    await expect(welcomeHeading, 'The signed-in welcome heading should be visible').toBeVisible();
    const welcomeMessage = await welcomeHeading.innerText();
    logger.step(`The signed-in user is welcomed with: ${welcomeMessage}`);
    logger.pass('User successfully logged in and the personalized welcome message is available');
    // End the test by signing out of the application.
    await page.locator(locators.signOutButton).click();
    logger.step('Signed out of the application');
    logger.pass('Completed the sign-in and sign-out flow successfully');
  } catch (error) {
    // Log the failure before allowing Playwright to mark the test as failed.
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    // Always save the collected steps, including steps from failed attempts.
    await logger.save();
  }
});