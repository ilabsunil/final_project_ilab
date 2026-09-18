# 🔒 LOCKED — Plugin Session Lifecycle (do not modify)

Everything in `framework/session/` implements a **fixed** contract and must not be changed
by test authors. It guarantees the following, once, for the whole run:

1. **On browser launch, the Coverage Intelligence browser extension is loaded** into
   Chromium (see `session-launch.ts` → `sessionLaunchOptions`, wired in `playwright.config.ts`).
2. **Before test execution starts, the plugin session is started** (`session-hooks.ts` →
   `globalSessionSetup`, wired as Playwright `globalSetup`).
3. **While tests execute, automation actions and validations are captured** into that one
   session (`session-recorder.ts`, used by the coverage fixture).
4. **After test execution completes, the plugin session is ended** (`session-hooks.ts` →
   `globalSessionTeardown`, wired as Playwright `globalTeardown`).

Files:

| File | Responsibility |
| --- | --- |
| `session-config.ts`   | Fixed paths/URLs (extension dir, API base, session file). Reads only environment values. |
| `session-client.ts`   | Thin CoverageEngine API client (start / events / stop / report). |
| `session-launch.ts`   | Chromium launch options that load the extension on browser launch. |
| `session-recorder.ts` | Per-test recorder that captures actions & validations into the run session. |
| `session-hooks.ts`    | `globalSessionSetup` (start before run) and `globalSessionTeardown` (end after run). |

Test authors interact with capture only through the `coverage` fixture — never by editing
these files. Adding new tests requires **no** changes here.
