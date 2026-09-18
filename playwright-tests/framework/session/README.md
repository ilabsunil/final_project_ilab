# 🔒 Locked session-lifecycle structure — DO NOT MODIFY

This folder implements the **run-scoped coverage plugin session lifecycle** exactly as
required by the automation process. It is intentionally isolated so that day-to-day test
authoring (new specs, locators, test data) never needs to touch it and cannot break it.

## What it guarantees

1. **Browser extension is loaded on launch.** The real Manifest V3 extension in
   `CoverageEngine/05-browser-extension` is loaded into a persistent Chromium context.
2. **The plugin session starts BEFORE test execution begins.** `global-setup` opens one
   coverage session and writes its id to `.session/active-session.json`.
3. **Automation actions and validations are captured during execution.** Every page gets
   the capture script; events are forwarded to the same run-scoped session.
4. **The plugin session ends AFTER execution completes.** `global-teardown` stops the
   session, pulls its coverage report, and merges it with the CoverageEngine reports into
   one combined report under `playwright-report/combined/`.

## Files (all locked)

| File | Responsibility |
| --- | --- |
| `session-constants.ts` | Shared paths, ports, and the run-session file location. |
| `session-manager.ts`   | Thin owner of the run-scoped session (start / persist / stop / report). |
| `extension-launcher.ts`| Launches Chromium with the coverage extension loaded. |
| `global-setup.ts`      | Starts the ONE plugin session before the whole run. |
| `global-teardown.ts`   | Stops the session and builds the combined report. |
| `combined-report.ts`   | Merges plugin-session coverage + CoverageEngine + test-case results. |

> ⚠️ Changing anything in this folder is **not required** to add or maintain tests. Add
> specs under `tests/`, update `framework/config/locators.json` and
> `framework/config/test-data.json`, and this lifecycle keeps working unchanged.
