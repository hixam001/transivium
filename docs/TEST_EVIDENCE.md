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

Performance, privacy/boundaries, accessibility, reliability, reproducible setup and resource-cap acceptance were evaluated by TRN-21–26 and consolidated at TRN-15/17. Partner exchange TC-35 and volunteer study TC-39 remain NOT RUN. No external reviewer approval is claimed.

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

## Local release-candidate case matrix — TRN-17

Run date: **2026-11-24 (Asia/Karachi)**. Application snapshot: `69645a6` (engine and frontend match `1162b32`; TRN-15 adds integration cases/memory). Environment: Linux x86_64, Python 3.14.10, Node 26.13.1, npm 12.2.3, Chromium 159.0.8154.6. Reviewer: automated implementation checks by Codex; independent human peer review **NOT RUN**. No assignee or stakeholder approval is invented.

Each PASS refers to the expected behavior in [[docs/07_TEST_PLAN]] and the actual result below. Paths are repository-relative; `demo.json` means [recorded HTTP demonstration](artifacts/demo.json). Exact runtime verification proves successful conversions; finite test samples remain supplemental.

| Case | Status | Actual result | Reproducible evidence |
|---|---|---|---|
| TC-01 | PASS | Shared draft updates via forms/table; graph reflects edits | frontend/src/App.test.tsx; frontend/e2e/accessibility.spec.ts |
| TC-02 | PASS | State deletion clears dependent references; invalid execution blocked | frontend/src/App.test.tsx |
| TC-03 | PASS | D01 101 accepted, 10 rejected; initial+n trace, playback/back/reset | backend/tests/test_simulation.py; frontend/e2e/workspace.spec.ts; demo.json |
| TC-04 | PASS | N01 branches/empty set; 01 accepts, 1 rejects | backend/tests/test_simulation.py; frontend/e2e/integration.spec.ts; demo.json |
| TC-05 | PASS | Finite cyclic closure, empty and aa accepted | backend/tests/test_simulation.py; frontend/e2e/workspace.spec.ts; demo.json |
| TC-06 | PASS | Mealy 0101→1010; empty output [], acceptance null | backend/tests/test_output_simulation.py; frontend/e2e/transducers.spec.ts; demo.json |
| TC-07 | PASS | Moore full01010/initial0, normalized1010; empty initial only | backend/tests/test_output_simulation.py; frontend/e2e/transducers.spec.ts; demo.json |
| TC-08 | PASS | Epsilon-free result and propagated finals exactly certified | backend/tests/test_acceptor_conversions.py; frontend/e2e/integration.spec.ts |
| TC-09 | PASS | Reachable subsets/empty sink and exact equality | backend/tests/test_acceptor_conversions.py; frontend/e2e/integration.spec.ts |
| TC-10 | PASS | Direct/indirect routes exactly equivalent | backend/tests/test_acceptor_conversions.py; frontend/e2e/integration.spec.ts |
| TC-11 | PASS | D01/D02 canonical minimal result has three states | backend/tests/test_minimization.py; demo.json |
| TC-12 | PASS | Empty/universal/empty alphabet canonical final status preserved | backend/tests/test_minimization.py |
| TC-13 | PASS | Normalized Mealy→Moore streams match; initial separate | backend/tests/test_transducer_conversions.py; frontend/e2e/transducers.spec.ts |
| TC-14 | PASS | Destination-state outputs become edge outputs; exact normalized equality | backend/tests/test_transducer_conversions.py; frontend/e2e/transducers.spec.ts |
| TC-15 | PASS | Incoming output splits tested; independent output enumerations | backend/tests/test_transducer_conversions.py |
| TC-16 | PASS | Independent parse/reconstruction, canonical equality, clipboard/download | backend/tests/test_regex_verification.py; frontend/e2e/conversion.spec.ts; demo.json |
| TC-17 | PASS | Universal/empty/epsilon export languages exactly verified | backend/tests/test_regex_verification.py |
| TC-18 | PASS | D06 full alphabet and complete sink retained | backend/tests/test_regex_verification.py |
| TC-19 | PASS | Empty alphabet ε/∅ export matches final status | backend/tests/test_regex_verification.py |
| TC-20 | PASS | Mutated serialized regex fails; no artifact | backend/tests/test_regex_verification.py |
| TC-21 | PASS | D01/D02 equivalent, null witness | backend/tests/test_equivalence.py; frontend/e2e/conversion.spec.ts; demo.json |
| TC-22 | PASS | D03/D04 witness[] and replay opposite outcomes | backend/tests/test_equivalence.py; frontend/e2e/conversion.spec.ts; demo.json |
| TC-23 | PASS | D01/D04 shortest01 and replay opposite outcomes | backend/tests/test_equivalence.py; frontend/e2e/integration.spec.ts; demo.json |
| TC-24 | PASS | Mismatched alphabets return422; UI compare disabled | backend/tests/test_equivalence.py; frontend/e2e/conversion.spec.ts |
| TC-25 | PASS | Structured formal failures and invalid execution blocking | backend/tests/test_validation.py; frontend/src/App.test.tsx |
| TC-26 | PASS | Whitespace/literal epsilon/unknown token are errors, not rejection | backend/tests/test_simulation.py; frontend/e2e/workspace.spec.ts |
| TC-27 | PASS | Absent/invalid transducer outputs rejected | backend/tests/test_validation.py; backend/tests/test_output_simulation.py |
| TC-28 | PASS | Request/state/work/trace/input/parser/UTF8/verification caps explicit | backend/tests/test_validation.py; backend/tests/test_boundary_safety.py; backend/tests/test_resource_bounds.py |
| TC-29 | PASS | Clock deadline503/internal500; offline/503 draft retention and retry | backend/tests/test_boundary_safety.py; backend/tests/test_correctness_gate.py; frontend/e2e/reliability.spec.ts |
| TC-30 | PASS | Malformed/schema/content/CORS errors sanitized; markup literal | backend/tests/test_boundary_safety.py; frontend/e2e/label-safety.spec.ts |
| TC-31 | PASS | Late simulate/convert ignored after edit; source preserved | frontend/e2e/reliability.spec.ts |
| TC-32 | PASS | Keyboard-completed construction/run; reduced motion; seven axe scans | frontend/e2e/accessibility.spec.ts |
| TC-33 | PASS | Fixed seeds; minimality/witness oracles; successful exports exact | backend/tests/test_regex_verification.py; backend/tests/test_minimization.py; backend/tests/test_equivalence.py |
| TC-34 | PASS | Generated NFA/enfa/transducers exactly checked + independent bounded outputs | backend/tests/test_acceptor_conversions.py; backend/tests/test_transducer_conversions.py |
| TC-35 | NOT RUN | Partner simulator/agreement unavailable; internal reconstruction is not this test | External follow-up; fixtures and formal-v1 contract ready |
| TC-36 P1 | PASS | Machine JSON and layout round-trip; rejected files and cancel retain the draft | frontend/e2e/reuse.spec.ts |
| TC-37 P1 | PASS | History keeps 20 completed runs; replay uses the original revision and retains the live draft | frontend/e2e/reuse.spec.ts |
| TC-38 | PASS | Fresh pinned installation and build; reference p95 below2s | TRN-25 fresh setup; TRN-21 performance artifacts; hosted CI |
| TC-39 | NOT RUN | Five volunteers not available; no completion-rate claim | Human learner-study follow-up |

## Gate decision and limits

The **internal local P0 implementation gate passes**: FR-01–18 are implemented; all seven NFR targets have been evaluated; no unresolved critical correctness defect is known from the executed checks. Reference responsiveness meets the proposed target. 35 automated P0 cases pass; TC-35 and TC-39 remain NOT RUN, and TRN-16 later verified the two P1 cases. This is a local release candidate, not a claim that every planned test or human review passed. External exchange is a separate milestone under the project plan; the unavailable learner study is a recorded limitation under the PRD. No v1.0 tag, license selection, external communication or public deployment was performed.

The API is stateless and local. Refresh clears the live draft and history. Saved projects and exported machine files can restore machines. Exponential conversion growth can fail within documented caps even for valid input. Cooperative deadlines are not hard real-time cancellation. Automated axe/keyboard coverage is not full accessibility certification. Windows/macOS and other browser/runtime versions have not been tested. Default access logs contain route/status, not a persistent correlated telemetry service.

Known toolchain observations: Starlette warns that httpx-backed TestClient is deprecated; tests still pass with the pinned dependencies. The React Flow dependency's react-compiler-runtime emits a Vite module-directive warning during build; builds/browser checks pass. A development ResizeObserver notification occurred once during graph layout in expanded testing; no lost draft or failed operation was observed. No warning was suppressed to obtain a pass.

Remaining release work outside autonomous local implementation: independent formal-algorithm review, partner syntax agreement/TC-35, volunteer TC-39, and license/governance decisions. These remain visible in [[memory/Decisions/Open-Decisions]].

Hosted integration run [45357991995](https://github.com/hixam001/transivium/actions/runs/45357991995) passed for `69645a6`, including all **28 browser cases together**, 169 backend tests, 17 component tests, nine script tests, lint/build, generated contracts and memory checks. The HTTP demo separately passed 12 simulation samples, seven operations and three comparisons; its fixture-only results are saved in `docs/artifacts/demo.json`.

## v1.0.0 verification

TRN-16, TRN-18 and TRN-19 passed feature checks for portable machine files, history, browser projects, the practice library, undo/redo, layout presets and image downloads. The combined audit run passed 171 backend tests, 17 component tests, 35 Chromium cases and nine script tests. See [[docs/QUALITY_REVIEW]] for the verified improvements and [[docs/RELEASE_VALIDATION]] for TC-35, TC-39 and human review.
