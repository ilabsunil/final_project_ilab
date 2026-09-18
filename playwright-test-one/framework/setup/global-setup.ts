import type { FullConfig } from '@playwright/test';
import { resetCoverageHits, startCoverageSession } from '../coverage/coverage-tracker';
import { logRun, resetRunLog } from '../logging/execution-logger';

export default async function globalSetup(config: FullConfig): Promise<void> { resetRunLog(); resetCoverageHits(); logRun(`RUN START app=${config.projects[0]?.use.baseURL ?? 'unknown'}`); await startCoverageSession(); }
