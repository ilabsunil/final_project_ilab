// 🔒 LOCKED — part of the plugin session lifecycle. Do not modify.
//
// Chromium launch arguments that LOAD THE COVERAGE BROWSER EXTENSION on browser launch.
// Requirement #1: "On launching the browser the browser extension should be added."
// Loading a Manifest V3 extension requires a headed Chromium; these args do exactly that.
import fs from 'node:fs';
import type { LaunchOptions } from '@playwright/test';
import { COVERAGE_ENABLED, EXTENSION_DIR } from './session-config';

// True when the extension folder actually exists on disk.
export function extensionAvailable(): boolean {
  return fs.existsSync(EXTENSION_DIR) && fs.existsSync(`${EXTENSION_DIR}/manifest.json`);
}

// Launch options to merge into `use.launchOptions` so the extension is present in every
// browser context Playwright opens for the run.
export function sessionLaunchOptions(): LaunchOptions {
  if (!COVERAGE_ENABLED || !extensionAvailable()) {
    return {};
  }
  return {
    args: [
      `--disable-extensions-except=${EXTENSION_DIR}`,
      `--load-extension=${EXTENSION_DIR}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  };
}
