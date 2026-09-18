import { stopCoverageSession } from '../coverage/coverage-tracker';
import { logRun } from '../logging/execution-logger';
export default async function globalTeardown(): Promise<void> { await stopCoverageSession(); logRun('RUN END'); }
