---
id: "doc-setup-guide"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Setup & Development Guide — Transivium

Version 0.1 | Scaffold implemented; feature implementation is tracked in [[memory/Project]]. Tested on Python 3.14.10, Node 26.13.1, npm 12.2.3. Frontend packages are pinned in package.json/package-lock.json; all backend runtime and development dependencies are pinned in requirements.txt.

## 1. Prerequisites
- Git, Python (proposed 3.12 or a supported later version), Node.js active LTS compatible with selected Vite version, npm.
- Modern browser and two terminal windows. Linux/macOS or Windows with compatible Python/Node distributions.
- No database, API key or external service required for proposed MVP. Confirm and pin tested versions in `backend/requirements.txt`, `frontend/package.json`, lockfile and README at scaffold milestone TRN-02.

## 2. Get repository
Repository remote: `git@github.com:hixam001/transivium.git`. After the implementation scaffold exists, clone the repository and enter its root. If starting from these docs only, place files at proposed paths and create the backend/frontend scaffold first (see SAD). Do not expect app routes from documentation files.

## 3. Backend (target instructions)
From repository root:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
For fish use `source .venv/bin/activate.fish`; for Windows PowerShell use `py -m venv .venv` then `.venv\Scripts\Activate.ps1` (follow local execution policy). Use `python -m pip` to ensure correct environment. Development reload is not a production deployment setting.

Once implemented, verify `http://127.0.0.1:8000/api/v1/health` returns `{"status":"ok","apiVersion":"v1"}`. FastAPI interactive docs may be enabled for local development at `/docs`.

## 4. Frontend (target instructions)
In a separate terminal from repository root:
```bash
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```
`npm ci` requires committed lockfile; initial scaffold creation generates it with npm install. Visit `http://127.0.0.1:5173`. The frontend uses `/api/v1` via Vite proxy to port 8000 (configure target during scaffold). No frontend secret variables. Proposed dev configuration: `VITE_API_BASE_URL=/api/v1`; optional `TRANSIVIUM_ALLOWED_ORIGIN=http://127.0.0.1:5173` for backend direct-origin access. Exact variable loading must be implemented and documented before release. Local same-origin proxy preferred; do not use permissive CORS wildcard for public deployment.

## 5. Run checks (target scripts)
Backend from `backend/` after activation: `python -m pytest`. Frontend from `frontend/`: `npm run lint`, `npm run test`, `npm run build`. Add these scripts during TRN-02. Browser tests: from frontend run `npx playwright install chromium --no-shell`, then `npm run test:e2e`. Tests use channel chromium and start local services automatically unless existing services are running. Browser dependencies may need the OS packages listed by Playwright. Test reports must include environment, dependency versions and commit. The scaffold health and frontend smoke tests, lint and build have run. Detailed evidence is in [[memory/Issues/TRN-02]]. In this coding sandbox, threaded TestClient requires the elevated execution path; normal local execution passes.

## 6. Troubleshooting
| Symptom | Check / recovery |
|---|---|
| Python or pip unavailable | Verify `python --version`; activate correct venv; use `python -m pip` |
| npm ci fails | Check Node compatibility, committed lockfile; do not remove lockfile to hide mismatch |
| Port already in use | Stop conflicting process or deliberately configure both proxy/API ports consistently |
| UI cannot reach API | Check health route and API terminal; verify proxy URL and CORS if direct |
| Missing source/manifests | This pack is docs only; implement scaffold first |
| Conversion hits limit | Reduce model, minimize DFA first; do not increase limits without profiling |

## 7. Local demo preparation
Start API and UI, check health, run test suite, open D01 example or build it manually, run acceptance/rejection and verified export. Keep local fixtures available in case partner team is unavailable. Follow [Test Plan](07_TEST_PLAN.md) and [User Guide](USER_GUIDE.md). Public deployment, TLS, rate limiting and account management are not specified for MVP; if needed, design separately before exposure.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
