import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// The real Manifest V3 coverage extension that is loaded when the browser launches.
const extensionPath = path.resolve(
  __dirname,
  '..',
  'CoverageEngine',
  '05-browser-extension',
);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  // Locked run-scoped session lifecycle: start the plugin session before execution,
  // end it after execution, and build the single combined report.
  globalSetup: path.resolve(__dirname, 'framework/session/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'framework/session/global-teardown.ts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [path.resolve(__dirname, 'framework/reporters/test-reporter.ts')],
  ],
  outputDir: 'test-results',
  metadata: {
    framework: 'Playwright POM',
    executionEnvironment: process.env.CI ? 'CI' : 'local',
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    browserName: 'chromium',
    // Extensions require a headed Chromium; load the coverage extension on launch.
    headless: false,
    video: 'on',
    trace: 'on',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--no-default-browser-check',
      ],
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
