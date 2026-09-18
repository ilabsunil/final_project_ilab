# Northstar Bank Quality Platform
## Run and Test Guide

**Version:** 1.0  
**Audience:** Developers, automation engineers, QA leads, and demo reviewers

## 1. Prerequisites

Install the following before starting:

- .NET SDK 8 or later
- Node.js 20 or later
- npm
- VS Code or another code editor
- A modern browser

Verify the tools:

```powershell
dotnet --version
node --version
npm --version
```

## 2. Project Structure

```text
HackathonDemo/
  api/
    Program.cs
    BankQuality.Api.csproj
    data/
      users.json
      modules.json
      runs.json
      recovery-state.json
      automation-config.json
      test-data.json
      locators.json
      xpath-repository.json
  web/
    src/main.jsx
    src/styles.css
    package.json
  docs/
```

The application uses JSON files for demo persistence. No database is required.

## 3. Start the API

Open Terminal 1 from the repository root:

```powershell
cd "C:\Users\91738\OneDrive\Documents\SampleProjects\HackathonDemo"
dotnet run --project api
```

Expected output:

```text
Now listening on: http://localhost:5050
```

Check the API health endpoint:

```powershell
curl.exe http://localhost:5050/api/health
```

Expected response:

```json
{"status":"healthy","service":"Bank Quality API"}
```

> If port 5050 is already in use, do not start another API instance. Check the existing service first with the health command above.

## 4. Start the React Application

Open Terminal 2:

```powershell
cd "C:\Users\91738\OneDrive\Documents\SampleProjects\HackathonDemo\web"
npm install
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

Keep both terminals running.

## 5. Demo Login

Use the JSON-backed demo account:

```text
Email: maya.chen@northstarbank.com
Password: demo123
```

Additional demo user:

```text
Email: alex.rivera@northstarbank.com
Password: demo123
```

## 6. Main Test Flow

### 6.1 Login and application shell

1. Open `http://localhost:5173`.
2. Confirm the Northstar Bank login page appears.
3. Enter the demo credentials.
4. Confirm the dashboard opens.
5. Verify the header shows workspace and user information.
6. Verify the footer shows Northstar Bank support information.

### 6.2 Dashboard coverage test

Confirm the dashboard displays:

- Implemented modules
- Covered modules
- Missed modules
- Coverage percentage
- Test-gap percentage
- Risk level
- Business impact
- Recent execution runs
- Automation trend visualization

The default JSON inventory contains 9 sub-modules, 8 implemented/covered entries, and 1 disabled entry.

### 6.3 Module navigation test

1. Open **User details**.
2. Open **Loans**.
3. Open **Credit cards**.
4. Open **Statements**.
5. Select individual sub-modules.
6. Confirm the selected action is recorded as a recovery checkpoint.

### 6.4 Disabled functionality test

1. Open **Credit cards**.
2. Locate **Disputes**.
3. Confirm it shows **Disabled** and **High risk**.
4. Return to the dashboard.
5. Confirm the missed-module and test-gap metrics include the disabled functionality.

### 6.5 Automation run test

1. Return to the dashboard.
2. Select **Start automation run**.
3. Confirm the run captures the Loans and Statements navigation path.
4. Confirm the button displays the active capture state.
5. Confirm a completed run appears in Recent execution runs.
6. Open **Execution history** and confirm the run is listed.

### 6.6 Recovery test

1. Open a module or sub-module.
2. Confirm the action is saved.
3. Refresh the browser.
4. Confirm the interrupted-session banner appears.
5. Select **View recovery report**.
6. Confirm the last module, action, user, and status are displayed.

The recovery state is persisted in `api/data/recovery-state.json`.

### 6.7 JSON configuration test

Check the external configuration endpoint:

```powershell
curl.exe http://localhost:5050/api/config
```

Confirm the response references:

- `data/test-data.json`
- `data/locators.json`
- `data/xpath-repository.json`

## 7. API Smoke Tests

```powershell
curl.exe http://localhost:5050/api/modules
curl.exe http://localhost:5050/api/runs
curl.exe http://localhost:5050/api/summary
curl.exe http://localhost:5050/api/recovery
```

Test module re-enablement:

```powershell
curl.exe -X PUT http://localhost:5050/api/modules/Credit%20Cards/Disputes/implementation `
  -H "Content-Type: application/json" `
  -d "{\"implemented\":true}"
```

Restore the disabled demo state:

```powershell
curl.exe -X PUT http://localhost:5050/api/modules/Credit%20Cards/Disputes/implementation `
  -H "Content-Type: application/json" `
  -d "{\"implemented\":false}"
```

## 8. Build Validation

API build:

```powershell
dotnet build BankQualityPlatform.slnx
```

React build:

```powershell
cd web
npm run build
```

## 9. Reset Demo Data

To reset execution history and recovery state, restore these files from source control:

- `api/data/runs.json`
- `api/data/recovery-state.json`
- `api/data/modules.json`

The API writes JSON files directly, so keep a backup before changing demo data.

## 10. Stop the Application

Press `Ctrl+C` in the API and React terminals.

## 11. Current Scope

This version demonstrates the platform workflow with a JSON-backed API. The automation button is a controlled demo simulation. A production implementation would add a real Playwright or Selenium runner, server-side authentication, durable file locking or a database, report export, and dynamic trend analytics.
