// TC-LOANS: Loans section and details flow. Signs in, opens the Loans module, drills
// into a loan sub-module, records navigation, and records the loans inventory coverage
// (route + Open/Submit application actions + loan-application workflow).
import { expect, test } from '../framework/fixtures/coverage-fixture';
import { AppPage } from '../framework/pages/app.page';
import { TestLogger } from '../framework/logging/test-logger';
import { coverModuleFlow } from '../framework/coverage/coverage-emit';

test('TC-LOANS - loans section and details', async ({ page, coverage }, testInfo) => {
  const logger = new TestLogger(testInfo);
  const app = new AppPage(page, logger);
  try {
    await app.openAndSignIn();
    await app.goto('Loans');
    await app.expectHeading('Loans');
    await expect(page.getByText('Lending workflows and repayment validation')).toBeVisible();
    await app.recordNavigation();
    await app.openFirstModuleRow();
    logger.pass('Exercised the Loans section and its details');
    coverModuleFlow(coverage, 'loans');
    logger.pass('Recorded loans coverage');
  } catch (error) {
    logger.fail(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await logger.save();
  }
});
