---
id: "doc-admin-guide"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Administrator / Local Maintainer Guide — Transivium

Version 0.1 | Proposed operational guide

## 1. Role boundary
The MVP has no administrator account, RBAC, dashboard, user database or server-side saved machines. This guide is for whoever runs the local instance (developer, instructor, demo operator). Administration means environment/configuration, updates, diagnostics and release checks, not managing user accounts.

## 2. Start, stop, verify
Follow SETUP_GUIDE. Run backend on 127.0.0.1:8000 and frontend on 127.0.0.1:5173; check health endpoint, then run D01 demo. Stop each service using Ctrl+C in its terminal. No machine persistence on server. Warn users before browser refresh or closing session because unsaved work can be lost. If P1 available, export machines before shutdown; verified regex export already P0.

## 3. Configuration and privacy
Pin dependencies and track configuration in repo without secrets. Use local bind by default; no public hosting without separate threat model, HTTPS, access controls/rate limits and deployment review. Keep exact resource limits in SAD/API aligned with runtime. Changing limits requires tests and profiling; never bypass equivalence verification. Restrict CORS to local configured origin if needed. Logs should contain request ID, route, status, duration and sanitized error code; don't log full machine/input by default. No account data backups required; user downloads are managed by user.

## 4. Diagnostics
| Incident | Action |
|---|---|
| Health fails | Inspect backend startup, venv and port; restart after fix |
| UI API error | Verify proxy/host/port, API status and request ID |
| 422 invalid machine/input | Inspect reported issue; correct machine, not server |
| 422 limit or 503 deadline | Reduce input, reproduce with fixture; evaluate cap only through reviewed change |
| 500 verification failure | Treat as correctness defect; preserve reproducible input, prevent verified artifact; file issue and block release if reproducible |
| External regex mismatch | Verify alphabet, formal grammar, completion and minimization; run internal exact check; document external limitation without assigning unverified blame |

## 5. Updates and releases
Review changes against requirement IDs, run fresh setup and full test plan, record test evidence; update README, API/schema/algorithm docs as appropriate and CHANGELOG. Tag release only after acceptance gate. Version 0.1 docs do not indicate operational readiness. If regression found, stop affected demo path or revert to last verified commit (if one exists); never advertise unverified regex as correct. No database migrations in MVP.

## 6. Demo operations
Before class: start services, check health, test all five machine types, run DFA-to-regex and witness examples, prepare external exchange fixtures, record whether partner integration was actually tested. Keep offline copies of docs and verified test artifacts once available. If external simulator unavailable, demonstrate internal exact reconstruction and state that cross-team test is pending. Do not claim a passed integration based on expected mathematical behavior alone.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
