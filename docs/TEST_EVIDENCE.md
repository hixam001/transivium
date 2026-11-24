---
id: "docs-test_evidence"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "implementation-and-executed-checks"
tags: ["transivium", "reference"]
---

# Executed acceptance evidence

## Evidence policy

This file records executed checks, not a release announcement. Each task links its commands, outcomes and limitations in memory; Git history identifies the delivered snapshots. Automated checks do not substitute for external partner agreement or a human learner study. Tests use deterministic fixtures and fixed seeds.

## Correctness gate — TRN-20

`cd backend && .venv/bin/python -m pytest -q`: **140 passed** on Python 3.14.10. `ruff check backend`: passed. The cross-operation API gate exercises all seven required operations, checks generated machine validity and exact certification modes, tests empty-alphabet acceptors and replays an NFA's shortest witness. Injected verification limit/deadline failures return 422/503 without an artifact or verification claim.

Existing suites cover independent parser/Thompson reconstruction, mutated text and output detection, DFA minimization state counts and pairwise distinguishability, sorted shortest witnesses, generated NFAs/epsilon-NFAs/transducers and bounded failure. Runtime certification uses exact product search, not finite enumeration; bounded word oracles supplement tests only.

Frontend baseline: 17 component tests and ten live Chromium cases passed through TRN-14, including all five simulations, verified export/download, comparison and both transducer adoptions. Test logs are not stored as memory.

## Outstanding evidence

Performance, privacy/boundaries, accessibility, reliability, reproducible setup and resource-cap acceptance are evaluated by TRN-21–26 and consolidated at TRN-15/17. Partner exchange TC-35 and volunteer study TC-39 remain NOT RUN. No external reviewer approval is claimed.

## Links

- [[docs/07_TEST_PLAN]]
- [[memory/Issues/TRN-20]]
- [[memory/Issues/TRN-15]]
- [[memory/Issues/TRN-17]]
- [[memory/Project]]

## Responsiveness — TRN-21

On the recorded Linux x86_64 / Intel i5-13420H host (12 logical CPUs), 30 measured requests per ten API workloads (300 requests; three warmups each) all succeeded. Worst API p95 was **4.867 ms**, including a 20-state/four-symbol/100-token reference workload. See [API measurements](artifacts/performance.json).

Production-browser measurements used Chromium 159 at 1440×1050: 20 samples each, two warmups, with another acceptance-browser suite active on the same host. D01 100-token click-to-trace p95: **80.225 ms**; D01 regex click-to-verified-artifact-and-diagrams p95: **83.681 ms**. No page errors. See [browser measurements](artifacts/browser-performance.json). These warmed loopback observations meet the proposed 2 s reference target; they do not establish cold-start, public-network or worst-case exponential capacity.

The production entry JavaScript bundle decreased from 515.75 kB to 259.67 kB; graph code (250.34 kB) and comparison code (7.80 kB) load separately. This reduces the entry bundle, not the total transfer for an editor that immediately loads its graph. Lint/build, 17 component checks and ten live browser checks passed after splitting.

Reproduce with the local API running: `python3 scripts/benchmark.py --samples 30`. Build the frontend and serve `npm run preview -- --port 4173`, with API on 8000, then run `node scripts/benchmark-browser.mjs --samples 20`. Dependencies and browser setup are in [[docs/SETUP_GUIDE]].

## Local boundary safety — TRN-22

Backend: **146 tests passed**. Added malformed UTF-8, deeply nested schema-invalid JSON, untrusted Content-Length with chunked oversized bodies, typed response overflow, strict wire aliases, CORS preflight rejection and unexpected-exception privacy checks. Response overflow is buffered/discarded before publication and returns 422 LIMIT_EXCEEDED rather than a partial result. Invalid UTF-8 maps to 400 MALFORMED_JSON; parsed but schema-invalid nested data maps to 422 SCHEMA_ERROR. CORS rejections now use the uniform error envelope and generated request IDs.

A live Chromium test confirmed markup-like state labels remain literal text in the graph/table/forms and create no image element or executable handler. The installed memory skill privacy scan found no patterns in documentation/memory/source text it supports. Runtime defaults stay local, with configured-origin CORS, strict JSON schemas and no account/database or code evaluation. This is scoped implementation acceptance, not a comprehensive codebase audit or a public-deployment approval.

## Accessibility — TRN-23

Four live browser cases passed, including seven axe scans of editor/compare/help, keyboard-completed execution, both transducer forms/conversion results and an actual verified regex artifact. The configured WCAG A/AA tags reported zero violations after correcting footer contrast (previously 4.47:1), strengthening focus outlines, naming landmarks/graph regions and adding a skip link and state descriptions. This is tested coverage, not a claim of complete WCAG certification.

An actual Tab/Enter/Space/Arrow-key workflow created a complete one-state DFA using forms/table, marked it accepting, validated and ran input, navigated the trace and observed textual acceptance. Alphabet fields now preserve raw focused input so Backspace works normally; reduced-motion preference was exercised. Frontend lint, production build and 17 component checks passed. TC-39 volunteer study remains NOT RUN; no student completion rate is invented.

## Reliability — TRN-24

Backend **158 tests passed**, including deterministic repeated/permuted-array results for all seven operations and all five simulation types. Seven browser reliability cases passed: offline/API deadline failure with retained draft and input plus retry/request ID, delayed simulation/conversion responses after source edits, protected same-page and browser-Back navigation, cancelled transducer adoption, failed diagram loading with table editing still usable, and failed comparison loading with return to the retained editor.

Fixed a same-page navigation path that could clear the comparison dirty flag, added browser-Back guards, surfaced server request IDs, and isolated lazy-load failures so they do not destroy editor state. Asset-load fallbacks preserve the table/editor; they do not silently refresh the page or promise a cached failed module will retry. Frontend lint/build and 17 component checks passed; both fallback renders were inspected.

## Maintainability — TRN-25

Typed API response DTOs and generated OpenAPI/machine contracts now have drift checks; root lint/format configuration, read-only CI and dependency-free Obsidian graph filters are established.

Fresh /tmp checkout copy installed pinned Python/npm dependencies successfully: 160 backend tests, 17 component tests, frontend lint/build, root Ruff/check-format, contract check and nine script tests passed. Hosted CI execution remains unverified. Existing Starlette TestClient deprecation and upstream bundler directive warnings remain documented.

The fresh environment excluded local dependencies, ignored host configuration and credentials. The engine remains independent of FastAPI; unit tests call pure algorithms while integration tests exercise strict HTTP contracts. Privacy scanning now includes explicitly selected application/test/config trees without indexing dependencies or credential directories. Duplicate comparison table IDs were replaced by React-generated IDs while keeping the editor error-focus target stable.

## Resource bounds — TRN-26

Resource bounds now include both synthetic GNFA states before construction. Cap tests cover generation, UTF-8 regex bytes, trace append, exact verification and shared deadlines without returning partial certified artifacts.

169 backend tests passed, including a 256-state/16-symbol/512-token DFA execution and nine new resource cases; Ruff passed. Existing request/response/chunk/input/parser/subset/split limits remain covered. Limits are cooperative local-operation bounds, not production capacity or hard real-time guarantees.

| Resource | Enforced bound |
|---|---|
| Machine / generated intermediate states | 256 (GNFA includes synthetic start/final) |
| Input/output alphabet | 16 symbols each |
| Transitions | 16,384 |
| Input / derivation | 512 tokens / 2,000 derivation steps |
| Request / response | 512 KiB / 2 MiB UTF-8 JSON |
| Regex / parser nesting | 64 KiB UTF-8 / 128 levels |
| AST work / product pairs | 50,000 / 65,536 |
| Deadline | 5 seconds, shared generation and verification budget |

A valid input may exceed an intermediate, trace or verification cap. Such requests return an explicit limit/deadline error, never a partially certified success. Backend tests inject small limits to deterministically exercise pre-growth checks; maximum-size simulation coverage does not imply all maximum-size conversions succeed.

## Integration gate — TRN-15

P0 integration gate evaluated all seven NFR tasks and current-source browser/API workflows. Added six browser cases for remaining acceptor conversions, empty-branch rejection and nonempty shortest-witness replay; all pass.

169 backend and 17 component tests pass; 22 existing browser cases passed together and six new integration cases passed together after correcting selectors and accepting intentional replacement prompts. Frontend lint/build, root Ruff/format, contracts and nine script checks pass. Hosted Verify run 45357334513 passed at 1162b32. No runtime defects found by expanded gate; partner TC-35, learner TC-39 and independent peer review remain unperformed.

Browser tests used freshly started API and Vite services with `CI=1`, preventing reuse of an old server process. The new witness case explicitly accepts replacement confirmation: Playwright otherwise dismisses dialogs and correctly retains the original equivalent machine. Initial selector/confirmation failures were test defects, corrected before counting the cases as passing.

[Hosted verification for 1162b32](https://github.com/hixam001/transivium/actions/runs/45357334513) completed successfully on 2026-11-24. That run includes 22 browser cases; the six added cases are verified locally here and will run in subsequent CI. Final case mapping, guides and release scope are consolidated in TRN-17.
