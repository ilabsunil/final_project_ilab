// 🔒 LOCKED — part of the run-scoped session lifecycle. Do not modify.
//
// Playwright globalSetup: runs ONCE before any test executes. This is where the plugin
// session is started — "before the test execution starts you have to start the session".
// It records the session id so every test forwards its captured events into the same
// run-scoped session, and so the teardown can stop it and build the combined report.

import type { FullConfig } from '@playwright/test';
import { extensionAvailable } from './extension-launcher';
import { EXTENSION_PATH } from './session-constants';
import { clearRunSession, isApiReachable, resetRunResults, startRunSession } from './session-manager';

export default async function globalSetup(_config: FullConfig): Promise<void> {
  // Clear any stale marker and reset the incremental results from a previous run.
  clearRunSession();
  resetRunResults();

  if (!extensionAvailable()) {
    console.warn(
      `[session] Coverage extension not found at ${EXTENSION_PATH}. ` +
        'Tests will still run; extension-based capture is skipped.',
    );
  }

  const reachable = await isApiReachable();
  if (!reachable) {
    console.warn(
      '[session] Coverage Intelligence API is not reachable. ' +
        'The run session will not be started and no coverage will be recorded.',
    );
    return;
  }

  const session = await startRunSession();
  console.log(
    `[session] Started run-scoped coverage session ${session.sessionId} ("${session.name}"). ` +
      'Capturing automation actions and validations for the whole run.',
  );
}
