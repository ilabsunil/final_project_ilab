# PNC Bank Quality Platform
## Presentation Content

This file mirrors the generated PowerPoint deck and can also be used as a speaking script.

### Slide 1 - PNC Bank Quality Platform

**Optimize Repetitive Tasks and Improve Productivity**

Automation resiliency + coverage intelligence + productivity analytics

Speaker note: Introduce the project as a quality engineering platform, not only a reporting dashboard.

### Slide 2 - The Problem

- Regression pass/fail does not show what was actually tested.
- Manual journeys can miss modules and scenarios.
- Hardcoded automation data and locators increase maintenance effort.
- Interrupted sessions lose the last known execution state.

Speaker note: The gap is visibility and resilience, not simply test execution.

### Slide 3 - The Objective

Build a platform that:

- Reuses automation assets
- Captures manual and automated paths
- Maps actions to modules and sub-modules
- Measures coverage and test gaps
- Assesses risk and business impact
- Recovers interrupted execution state

### Slide 4 - The Unified Concept

```text
Application
    ↓
Reusable automation
    ↓
Capture and self-recovery plugin
    ↓
Test Gap Analyzer
    ↓
Unified dashboard and reports
```

### Slide 5 - Phase 1 Proof

```text
Disable functionality
        ↓
Run the same reusable automation
        ↓
Detect failure or coverage gap
        ↓
Re-enable functionality
        ↓
Run again without code changes
        ↓
Pass
```

The banking application provides Login, Dashboard, User Details, Loans, Credit Cards, and Statements.

### Slide 6 - Phase 2 Proof

The analyzer compares:

- Developer module inventory
- Manual user actions
- Automation navigation paths
- Covered functionality
- Missed functionality

Coverage formula:

```text
Covered / Implemented × 100
```

Test-gap formula:

```text
Missed / Implemented × 100
```

### Slide 7 - JSON-First Architecture

- `users.json` - users and roles
- `modules.json` - module inventory and status
- `runs.json` - execution history
- `recovery-state.json` - latest checkpoint
- `test-data.json` - configurable test values
- `locators.json` - reusable locators
- `xpath-repository.json` - XPath values

Speaker note: JSON makes the prototype easy to run without database setup while preserving externalized data boundaries.

### Slide 8 - Product Walkthrough

1. Sign in to the banking workspace.
2. Review coverage and risk metrics.
3. Navigate through modules and sub-modules.
4. Inspect disabled Credit Card Disputes.
5. Start an automation capture.
6. Review the execution history.
7. Refresh during a checkpoint and recover the session.

### Slide 9 - Dashboard Output

- Pass/fail status
- Execution duration
- Modules executed
- Modules missed
- Coverage percentage
- Test-gap percentage
- Risk and business impact
- Automation trend
- Recovery report

### Slide 10 - Business Value

- Reduces script maintenance effort
- Improves regression coverage visibility
- Minimizes missed functionality
- Preserves execution evidence
- Speeds validation cycles
- Gives managers actionable quality signals

### Slide 11 - Current Prototype and Roadmap

Implemented now:

- React banking workspace
- .NET API
- JSON persistence
- Coverage dashboard
- Module status demonstration
- Recovery checkpoints

Next:

- Playwright/Selenium runner
- Real plugin integration
- Role-based Admin and Developer workflows
- Network interruption detection
- PDF/CSV reporting
- Dynamic recommendations

### Slide 12 - Closing

**Automation resiliency + coverage intelligence + productivity analytics**

A unified quality engineering platform for more reliable banking releases.
