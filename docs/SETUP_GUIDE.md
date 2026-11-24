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

Version 0.1 | P0 application implemented; release evidence is tracked in [[memory/Project]]. Tested on Python 3.14.10, Node 26.13.1, npm 12.2.3. Frontend packages are pinned in package.json/package-lock.json; all backend runtime and development dependencies are pinned in requirements.txt.

## 1. Prerequisites
- Git, Python 3.14.10 and Node 26.13.1 (version files), npm 12.2.3. Other Python ≥3.12 / Node ≥22.12 versions are compatibility targets, not verified platforms.
- Modern browser and two terminal windows. Linux/macOS or Windows with compatible Python/Node distributions.
- No database, API key or external service is required. Install pinned dependencies from the committed manifests.

## 2. Get repository
Repository remote: `git@github.com:hixam001/transivium.git`. Clone the repository and enter its root.

## 3. Backend
From repository root:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
For fish use `source .venv/bin/activate.fish`; for Windows PowerShell use `py -m venv .venv` then `.venv\Scripts\Activate.ps1` (follow local execution policy). Use `python -m pip` to ensure correct environment. Development reload is not a production deployment setting.

Verify `http://127.0.0.1:8000/api/v1/health` returns `{"status":"ok","apiVersion":"v1"}`. FastAPI interactive docs are available for local development at `/docs`.

## 4. Frontend
In a separate terminal from repository root:
```bash
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```
`npm ci` installs the committed lockfile. Visit `http://127.0.0.1:5173`. The frontend uses `/api/v1` via Vite proxy to port 8000. No frontend secret variables. The API base path is `/api/v1`; optional `TRANSIVIUM_ALLOWED_ORIGIN=http://127.0.0.1:5173` for backend direct-origin access. The origin setting is read from the backend process environment. Local same-origin proxy preferred; do not use permissive CORS wildcard for public deployment.

## 5. Run checks
Backend from `backend/` after activation: `python -m pytest`. Frontend from `frontend/`: `npm run lint`, `npm run test`, `npm run build`.  Browser tests: from frontend run `npx playwright install chromium --no-shell`, then `npm run test:e2e`. Tests use channel chromium and start local services automatically unless existing services are running. Browser dependencies may need the OS packages listed by Playwright. Test reports must include environment, dependency versions and commit. The complete automated acceptance suite, lint and build have run locally and in hosted CI. Detailed evidence and current counts are in [[docs/TEST_EVIDENCE]]. Use `CI=1 npm run test:e2e` to require fresh services; stop existing instances first. In this coding sandbox, threaded TestClient requires the elevated execution path; normal local execution passes.

## 6. Troubleshooting
| Symptom | Check / recovery |
|---|---|
| Python or pip unavailable | Verify `python --version`; activate correct venv; use `python -m pip` |
| npm ci fails | Check Node compatibility, committed lockfile; do not remove lockfile to hide mismatch |
| Port already in use | Stop conflicting process or deliberately configure both proxy/API ports consistently |
| UI cannot reach API | Check health route and API terminal; verify proxy URL and CORS if direct |
| Missing source/manifests | Verify the checkout contains backend, frontend and contracts directories |
| Conversion hits limit | Reduce model, minimize DFA first; do not increase limits without profiling |

## 7. Local demo preparation
Start API and UI, check health, run test suite, open D01 example or build it manually, run acceptance/rejection and verified export. Keep local fixtures available in case partner team is unavailable. Follow [Test Plan](07_TEST_PLAN.md) and [User Guide](USER_GUIDE.md). Public deployment, TLS, rate limiting and account management are not specified for MVP; if needed, design separately before exposure.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]

## Contract and CI maintenance

From the repository root, run:

```bash
backend/.venv/bin/ruff check backend scripts
backend/.venv/bin/ruff format --check backend scripts
backend/.venv/bin/python scripts/contracts.py check
python3 -m unittest discover -s scripts -p 'test_*.py' -q
python3 scripts/memory.py check
```

After an intentional DTO change, run `backend/.venv/bin/python scripts/contracts.py refresh`, review both JSON diffs, update clients/docs and rerun checks. `contracts/machine.schema.json` and `contracts/openapi.json` are generated from strict Pydantic DTOs. Semantic machine validation remains an engine responsibility; draft frontend models intentionally allow incomplete edits. API response tests protect explicit null fields and omitted optional machine properties.

`.github/workflows/ci.yml` runs the same checks plus Chromium browser tests on pushes to main and pull requests. It uses read-only repository permissions and does not deploy or commit. Official action references: [checkout](https://github.com/actions/checkout), [setup-python](https://github.com/actions/setup-python), [setup-node](https://github.com/actions/setup-node). Hosted execution is separate from local verification.

## Reproducible demonstration

With the current API running on loopback, run `python3 scripts/demo.py` from the repository root. It fails on any fixture mismatch and prints curated JSON for 12 simulation samples across all five machine kinds, seven exactly certified operations, equivalent and shortest-witness comparisons, and the actual verified D01 artifact. The recorded run is [demo.json](artifacts/demo.json); its source commit identifies the application snapshot. This script does not contact the partner simulator or create a learner-study result.
