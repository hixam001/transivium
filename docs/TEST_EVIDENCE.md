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
