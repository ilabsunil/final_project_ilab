import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { testdata } from './framework/config/config-loader';
import { sessionLaunchOptions } from './framework/session/session-launch';

// Every environment value comes from framework/config/testdata.json so nothing here has to
// change when the URL, timeouts or retry policy change. The coverage browser extension is
// loaded on browser launch via the LOCKED session launch options.
export default defineConfig({
  testDir: './tests',
  // Run serially so the run-wide execution log reads top-to-bottom in order.
  fullyParallel: false,
  workers: 1,
  // Failed tests are automatically re-run this many times.
  retries: testdata.getNumber('RETRY_COUNT'),
  forbidOnly: !!process.env.CI,
  timeout: testdata.getNumber('TEST_TIMEOUT_MS'),
  outputDir: 'test-results',
  // Open/close the CoverageEngine session and reset run-wide files once per run.
  globalSetup: path.resolve(__dirname, 'framework/setup/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'framework/setup/global-teardown.ts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Custom reporter: builds the final combined test-result + test-gap report.
    [path.resolve(__dirname, 'framework/reporting/final-report.reporter.ts')],
  ],
  use: {
    baseURL: testdata.get('APP_BASE_URL'),
    browserName: 'chromium',
    // Manifest V3 extensions require a headed Chromium, so headless is forced off when the
    // coverage plugin is enabled (see COVERAGE_ENABLED in testdata.json).
    headless: testdata.getBoolean('COVERAGE_ENABLED') ? false : testdata.getBoolean('HEADLESS'),
    // Record a video of every test so you can watch exactly what was exercised.
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: testdata.getNumber('DEFAULT_TIMEOUT_MS'),
    navigationTimeout: testdata.getNumber('NAVIGATION_TIMEOUT_MS'),
    // LOCKED: load the coverage browser extension on browser launch (requirement #1).
    launchOptions: sessionLaunchOptions(),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
