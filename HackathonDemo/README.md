# Bank Quality Platform

A .NET and React hackathon demonstrator for automation resiliency, coverage intelligence, and productivity analytics.

## Run

```powershell
dotnet run --project api
```

```powershell
cd web
npm install
npm run dev
```

The API runs on `http://localhost:5050` and the Vite client on `http://localhost:5173`.

The .NET solution is `BankQualityPlatform.slnx`.

Demo credentials: `maya.chen@pnc.com` / `demo123`

## JSON-backed data

The demo does not require a database. The API reads and writes these files under `api/data`:

- `users.json` - login users and roles
- `modules.json` - developer module inventory and implementation status
- `runs.json` - automation execution history
- `recovery-state.json` - latest interrupted execution checkpoint
- `automation-config.json` - framework settings and external repository paths
- `test-data.json` - configurable test values
- `locators.json` - CSS/test locators
- `xpath-repository.json` - XPath repository values

Useful API operations include `GET /api/config`, `PUT /api/modules/{name}/{subModule}/implementation`, `POST /api/runs`, and `POST /api/recovery`.
