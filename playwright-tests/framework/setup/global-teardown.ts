// Runs ONCE after all tests. Hands control to the LOCKED plugin-session lifecycle to END
// the session after execution completes. (The final report is built by the reporter.)
import { logRun } from '../logging/execution-logger';
import { globalSessionTeardown } from '../session/session-hooks';

export default async function globalTeardown(): Promise<void> {
  // LOCKED: end the plugin session after test execution completes.
  await globalSessionTeardown();
  logRun('RUN END');
  logRun('════════════════════════════════════════════════════════════════');
}
