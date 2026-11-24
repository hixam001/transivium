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
