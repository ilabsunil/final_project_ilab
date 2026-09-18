// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
//
// Launches a persistent Chromium context with the real Manifest V3 coverage extension
// loaded, exactly as if a tester had added the unpacked extension in Chrome/Edge before
// running automation. Playwright can only load extensions through a *persistent* context
// with a non-headless (headed) Chromium, so this helper centralizes that requirement.

import fs from 'node:fs';
import { chromium, type BrowserContext } from '@playwright/test';
import { BROWSER_PROFILE_DIR, EXTENSION_PATH } from './session-constants';

// Returns true when the unpacked extension is present on disk.
export function extensionAvailable(): boolean {
  return fs.existsSync(EXTENSION_PATH) && fs.existsSync(`${EXTENSION_PATH}/manifest.json`);
}

// Launch a persistent context with the coverage extension loaded on launch.
export async function launchContextWithExtension(baseURL?: string): Promise<BrowserContext> {
  fs.mkdirSync(BROWSER_PROFILE_DIR, { recursive: true });

  // Extensions require a headed Chromium and the two --load-extension style flags.
  const context = await chromium.launchPersistentContext(BROWSER_PROFILE_DIR, {
    headless: false,
    baseURL,
    viewport: { width: 1280, height: 800 },
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  return context;
}

// Best-effort discovery of the loaded extension's id (useful for diagnostics/logging).
export async function resolveExtensionId(context: BrowserContext): Promise<string | null> {
  // The background service worker URL looks like chrome-extension://<id>/background.js.
  for (const worker of context.serviceWorkers()) {
    const match = worker.url().match(/^chrome-extension:\/\/([a-z]+)\//);
    if (match) {
      return match[1];
    }
  }
  try {
    const worker = await context.waitForEvent('serviceworker', { timeout: 5_000 });
    const match = worker.url().match(/^chrome-extension:\/\/([a-z]+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
