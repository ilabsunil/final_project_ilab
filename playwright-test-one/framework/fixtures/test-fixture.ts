import { test as base, expect } from '@playwright/test';
import { CoverageTracker } from '../coverage/coverage-tracker';
import { ExecutionLogger } from '../logging/execution-logger';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { ModulePage } from '../pages/module.page';
import { ShellPage } from '../pages/shell.page';
import { UsersPage } from '../pages/users.page';
type Pages = { login: LoginPage; shell: ShellPage; dashboard: DashboardPage; module: ModulePage; users: UsersPage };
type Fixtures = { pages: Pages; log: ExecutionLogger; coverage: CoverageTracker };
export const test = base.extend<Fixtures>({
  log: [async ({}, use, info) => { const log = new ExecutionLogger(info); log.testStart(); await use(log); log.testEnd(); await log.save(); }, { auto: true }],
  coverage: [async ({ log }, use, info) => { const tracker = new CoverageTracker(info.title.split(' - ')[0].trim()); await use(tracker); const count = await tracker.flush(); log.info(`Recorded ${count} coverage hits`); }, { auto: true }],
  pages: async ({ page, log }, use) => await use({ login: new LoginPage(page, log), shell: new ShellPage(page, log), dashboard: new DashboardPage(page, log), module: new ModulePage(page, log), users: new UsersPage(page, log) }),
});
export { expect };
