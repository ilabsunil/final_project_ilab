import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { testdata } from './framework/config/config-loader';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: testdata.getNumber('RETRY_COUNT'),
  forbidOnly: !!process.env.CI,
  timeout: testdata.getNumber('TEST_TIMEOUT_MS'),
  outputDir: 'test-results',
  globalSetup: path.resolve(__dirname, 'framework/setup/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'framework/setup/global-teardown.ts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [path.resolve(__dirname, 'framework/reporting/final-report.reporter.ts')],
  ],
  use: {
    baseURL: testdata.get('APP_BASE_URL'),
    browserName: 'chromium',
    headless: testdata.getBoolean('HEADLESS'),
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: testdata.getNumber('DEFAULT_TIMEOUT_MS'),
    navigationTimeout: testdata.getNumber('NAVIGATION_TIMEOUT_MS'),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
