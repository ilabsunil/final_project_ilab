// Runs ONCE before any test. Resets the run-wide log + coverage hits, then hands control
// to the LOCKED plugin-session lifecycle to START the session before execution begins.
import type { FullConfig } from '@playwright/test';
import { testdata } from '../config/config-loader';
import { resetCoverageHits } from '../coverage/coverage-tracker';
import { logRun, resetRunLog } from '../logging/execution-logger';
import { globalSessionSetup } from '../session/session-hooks';

export default async function globalSetup(config: FullConfig): Promise<void> {
  resetRunLog();
  resetCoverageHits();

  logRun('════════════════════════════════════════════════════════════════');
  logRun(`RUN START  · app=${testdata.get('APP_BASE_URL')} · retries=${config.projects[0]?.retries ?? 0} · workers=${config.workers}`);

  // LOCKED: start the plugin session before test execution starts.
  await globalSessionSetup();

  logRun('────────────────────────────────────────────────────────────────');
}
