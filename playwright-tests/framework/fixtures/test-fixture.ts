// Central fixture. Import `test`/`expect` from here and every spec automatically gets:
//   log      – ExecutionLogger (console + per-test log + run-wide execution.log)
//   coverage – CoverageTracker (records module/sub-module/functionality hits)
//   pages    – ready-made page objects (login, shell, module, users)
// Test START / END / SKIP lines and the coverage flush happen here, so specs stay short.
import { test as base, expect } from '@playwright/test';
import { CoverageTracker } from '../coverage/coverage-tracker';
import { ExecutionLogger } from '../logging/execution-logger';
import { AppShellPage } from '../pages/app-shell.page';
import { LoginPage } from '../pages/login.page';
import { ModulePage } from '../pages/module.page';
import { UserDetailsPage } from '../pages/user-details.page';

type Pages = {
  login: LoginPage;
  shell: AppShellPage;
  module: ModulePage;
  users: UserDetailsPage;
};

type Fixtures = {
  log: ExecutionLogger;
  coverage: CoverageTracker;
  pages: Pages;
};

export const test = base.extend<Fixtures>({
  log: [
    async ({}, use, testInfo) => {
      const log = new ExecutionLogger(testInfo);
      log.testStart();
      await use(log);
      // Skips have no failing error; surface the annotation reason if present.
      if (testInfo.status === 'skipped') {
        const reason = testInfo.annotations.find((a) => a.type === 'skip')?.description ?? 'test.skip() called';
        log.skip(reason);
      } else if (testInfo.status !== 'passed' && testInfo.error) {
        log.fail(testInfo.error.message?.split('\n')[0] ?? 'Unknown error');
      }
      log.testEnd();
      await log.save();
    },
    { auto: true },
  ],

  coverage: [
    async ({ log }, use, testInfo) => {
      const tracker = new CoverageTracker(testInfo.title.split(' - ')[0].trim());
      await use(tracker);
      const count = await tracker.flush();
      if (count > 0) log.info(`Recorded ${count} coverage hit(s) for the test-gap report`);
    },
    { auto: true },
  ],

  pages: async ({ page, log }, use) => {
    await use({
      login: new LoginPage(page, log),
      shell: new AppShellPage(page, log),
      module: new ModulePage(page, log),
      users: new UserDetailsPage(page, log),
    });
  },
});

export { expect };
