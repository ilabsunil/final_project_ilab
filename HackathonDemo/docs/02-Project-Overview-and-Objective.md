# Northstar Bank Quality Platform
## Project Overview and Objective

**Hackathon theme:** Optimize Repetitive Tasks and Improve Productivity

## Executive Summary

Northstar Bank Quality Platform is an intelligent quality engineering demonstrator for banking applications. It combines application functionality, reusable automation concepts, coverage intelligence, and execution recovery in one workspace.

The platform is designed to answer a more useful question than whether a test passed:

> Which banking functionality was actually exercised, what was missed, and what business risk remains?

The current implementation is a .NET and React prototype using external JSON files instead of a database. This keeps the demonstration easy to run while preserving the architecture needed for a future automation plugin and test-gap analyzer.

## Why This Project

Regression testing often reports pass/fail results without showing the completeness of the test journey. Teams may unintentionally miss a module, sub-module, or business scenario while still reporting a successful regression cycle.

Automation also becomes expensive when scripts contain hardcoded data and brittle locators. When application functionality changes, testers spend time repairing scripts instead of improving coverage.

Execution interruptions create another visibility problem. Network loss, forgotten sessions, browser crashes, or application failures can leave the team without a reliable record of the last completed action.

This project addresses those problems by connecting three capabilities:

```text
Automation resiliency
        +
Coverage intelligence
        +
Productivity analytics
        ↓
Unified quality engineering platform
```

## Objective

Develop an intelligent quality engineering platform that:

1. Reduces automation maintenance effort through reusable test assets.
2. Separates test data, locators, and XPath values from automation logic.
3. Captures manual and automated navigation paths.
4. Compares executed paths with the developer module inventory.
5. Calculates coverage and test-gap percentages.
6. Identifies risk and business impact for uncovered functionality.
7. Preserves the latest execution state during interruptions.
8. Produces management-ready quality insights.

## Phase 1: Reusability and Self-Recovery

The banking application provides a realistic sample system with:

- Login
- Header and application information
- Footer and support details
- Modules
- Sub-modules
- Configurable user and test data
- External locator and XPath repositories

The intended validation story is:

```text
Developer disables a module
        ↓
Reusable automation detects the unavailable functionality
        ↓
Execution records a failure or coverage gap
        ↓
Developer re-enables the module
        ↓
The same automation runs without code changes
        ↓
The execution passes
```

The current prototype demonstrates the disabled-module and re-enable data flow through the JSON-backed API. A real Playwright or Selenium runner is the next implementation step.

## Phase 2: Test Gap Analyzer

The analyzer correlates application inventory with execution data.

### Coverage formula

```text
Coverage % = Modules Covered / Modules Implemented × 100
```

### Test-gap formula

```text
Test Gap % = Modules Missed / Modules Implemented × 100
```

### Example

```text
22 covered / 25 implemented × 100 = 88% coverage
3 missed / 25 implemented × 100 = 12% test gap
```

The dashboard is designed to surface:

- Pass/fail status
- Execution duration
- Modules executed
- Modules missed
- Coverage percentage
- Test-gap percentage
- Risk assessment
- Business impact
- Automation trends
- Recommendations

## Interruption Recovery

The platform saves the latest execution checkpoint with:

- Run ID
- User
- Role
- Last completed action
- Current module
- Current sub-module or action
- Timestamp
- Interruption reason
- Execution status

The current prototype persists this state in `api/data/recovery-state.json` and displays a recovery banner when the application resumes.

## Architecture

```text
Banking web application
          ↓
Reusable automation assets
          ↓
Capture and self-recovery layer
          ↓
JSON-backed module and execution data
          ↓
Test Gap Analyzer
          ↓
Coverage, risk, impact, and productivity dashboard
```

## Current Deliverable

The current version includes:

- .NET 8 minimal API
- React and Vite web client
- JSON-backed users, modules, runs, recovery, configuration, test data, locators, and XPath repositories
- Dashboard and module navigation
- Disabled functionality demonstration
- Coverage and test-gap calculations
- Automation run simulation
- Persistent recovery checkpoints
- Execution history view
- Responsive visual design

## Required Next Steps for Full Compliance

To complete the full hackathon vision, add:

1. Playwright or Selenium automation execution.
2. A reusable test framework that consumes JSON test data and locators.
3. Actual failure detection when a module is disabled.
4. Admin and Developer role-based workflows.
5. A source-code or developer-owned module inventory import.
6. Network and browser interruption detection.
7. Server-side session and checkpoint recovery.
8. CSV/PDF report generation.
9. Dynamic trends and recommendation rules.
10. A larger 25-module demonstration dataset with 22 covered and 3 missed.

## Expected Benefits

- Lower automation maintenance effort
- Fewer hardcoded values
- Faster regression validation
- Better module-level coverage visibility
- Reduced regression escape risk
- More reliable interruption recovery
- Clearer management reporting
- Better productivity measurement

## Success Criteria

The solution is successful when a tester can run the same reusable automation before and after a module is re-enabled, while the platform records the path, identifies the temporary gap, calculates risk, preserves interruptions, and presents the result in a unified dashboard.
