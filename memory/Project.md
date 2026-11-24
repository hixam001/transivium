---
id: "project"
type: "project"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "project"]
goal: "Verified educational automata workflows"
current_state: "Version 1 machine JSON, validated import preview, layout round-trip and 20 immutable session traces are implemented. Replaying a snapshot preserves the live draft and identifies older revisions."
next_actions: ["TRN-18"]
---

# Project state

## Context

Transivium is a university finite automata/transducer studio. P0 covers all five machine kinds, seven conversion/minimization operations, exact language equivalence with shortest witness, and independently verified DFA-to-regex export. P1 import/export and history follow P0; P2 persistence/library and advanced editing stay deferred.

## Current state

The repository began with specifications only. All P0 application features and internal automated gates are now implemented; the local release candidate, evidence and external limitations are recorded in [[docs/TEST_EVIDENCE]]. No public or externally approved v1.0 release is claimed. The original proposed P0 estimate is 53 person-days, not an approved timeline.

## Durable decisions

- [[memory/Decisions/Working-Agreement]] — memory first, pre-implementation handoff, main commits/pushes, no added contributor.
- [[memory/Decisions/Formal-Conventions]] — exact formal language/output conventions.
- [[memory/Decisions/Open-Decisions]] — stack, capacity, deadline, exchange agreement, license and release decisions remain open.

## Next actions

1. Follow the active [[memory/Handoffs/Current]] and latest implementation progress below.
2. Use the pinned scaffold and formal fixtures; do not invent stakeholder approval.
3. Follow [[memory/Issues/Backlog]]; close conversions only after exact verification integration.

## Evidence and limitations

Documentation checks are separate from application tests. Full TC-01–39 workflow completion is tracked in the test plan and individual issues; unit checks alone do not establish full-case acceptance. External simulator exchange is untested. No user accounts, cloud DB, deployment or public regex-to-DFA studio are in scope. Proposed numerical limits need runtime testing and profiling.

## Links

- [[memory/Home]]
- [[memory/Handoffs/Current]]
- [[memory/References/Documentation-Review]]
- [[docs/00_PRD]]
- [[docs/02_SAD]]

## Implementation progress

- [[memory/Issues/TRN-01]]: Formal contracts and ten reference fixtures implemented; architecture selected for local implementation, with partner agreement explicitly pending. Next: [[memory/Issues/TRN-02]].

- [[memory/Issues/TRN-02]]: Runnable React/Vite and FastAPI scaffold implemented with exact package pins and lockfile, local proxy and health endpoint. Next: [[memory/Issues/TRN-03]].

- [[memory/Issues/TRN-03]]: Strict schemas, all-five-kind semantic validation, input guards, shared budgets and bounded HTTP/error boundary implemented. Generated machine JSON Schema added. Next: [[memory/Issues/TRN-04]].

- [[memory/Issues/TRN-04]]: Responsive five-kind graph/table editor implemented with state/edge editing, safe deletion/replacement, sample machines, keyboard forms and revision-aware validation. Product/design context recorded from the supplied brief. Next: [[memory/Issues/TRN-05]].

- [[memory/Issues/TRN-05]]: DFA/NFA/epsilon-NFA simulation and POST /simulate implemented with immutable initial-plus-n traces, closure edges and bounded response construction. Next: [[memory/Issues/TRN-06]].

- [[memory/Issues/TRN-06]]: Acceptor playback implemented with initial/next/back/reset/play/pause controls, state/edge highlights, trace navigation, explicit empty input and safe error/stale handling. Next: [[memory/Issues/TRN-07]].

- [[memory/Issues/TRN-07]]: Epsilon removal and reachable subset construction implemented with final propagation, empty sinks, deterministic derivations and exact product certification. Shared checker brought forward to satisfy certification dependency. Next: [[memory/Issues/TRN-08]].

- [[memory/Issues/TRN-08]]: DFA minimization and canonical BFS numbering implemented with unreachable removal, partition traces and exact language certification. Next: [[memory/Issues/TRN-09]].

- [[memory/Issues/TRN-09]]: Public exact equivalence endpoint implemented with same-alphabet validation, sorted shortest witnesses, epsilon-vs-null semantics and explicit resource failures. Next: [[memory/Issues/TRN-10]].

- [[memory/Issues/TRN-10]]: Bounded formal regex AST, sound simplifier, precedence-aware deterministic serialization and GNFA elimination traces implemented. No regex export is certified or exposed yet. Next: [[memory/Issues/TRN-11]].

- [[memory/Issues/TRN-11]]: Independent iterative formal-v1 parser and Thompson constructor implemented; DFA-to-regex API now emits artifacts only after exact reconstruction and canonical-reference checks. Next: [[memory/Issues/TRN-12]].

- [[memory/Issues/TRN-12]]: Conversion/results and educational derivations implemented with confirmed adoption, independently verified regex copy/JSON download, canonical reference diagrams, and a two-sided editable comparison workspace with witness replay. Navigation protects unsaved comparison edits. Next: [[memory/Issues/TRN-13]].

- [[memory/Issues/TRN-13]]: Mealy/Moore simulation and playback implemented with full/prefix outputs, separate initial Moore output, normalized post-input streams and no acceptance label for transducers. Next: [[memory/Issues/TRN-14]].

- [[memory/Issues/TRN-14]]: Both transducer conversions implemented and integrated, with reachable incoming-output splitting, synthetic initial Moore output, destination-state Mealy outputs and exact normalized-output certification. Next: [[memory/Issues/TRN-20]].

- [[memory/Issues/TRN-20]]: Cross-operation correctness gate implemented and documented; all seven API operations return valid exactly certified results, and interrupted verification returns no artifact. Next: [[memory/Issues/TRN-21]].

- [[memory/Issues/TRN-21]]: Lazy graph/comparison loading and reproducible API/browser responsiveness benchmarks implemented. Recorded reference workloads meet the proposed 2 s p95 target. Next: [[memory/Issues/TRN-22]].

- [[memory/Issues/TRN-22]]: Local API boundary safety hardened: typed response-overflow errors, malformed UTF-8 handling, uniform CORS failures and generated request IDs. Browser labels remain literal text. Next: [[memory/Issues/TRN-23]].

- [[memory/Issues/TRN-23]]: Keyboard/table accessibility improved with skip navigation, named landmarks/graph regions, state descriptions, stronger focus/contrast and natural alphabet-field editing. Next: [[memory/Issues/TRN-24]].

- [[memory/Issues/TRN-24]]: Reliability hardened with protected same-page/browser-Back navigation, visible request IDs, isolated diagram/route load failures and preserved drafts. Deterministic operation and trace ordering verified. Next: [[memory/Issues/TRN-25]].

- [[memory/Issues/TRN-25]]: Typed API response DTOs and generated OpenAPI/machine contracts now have drift checks; root lint/format configuration, read-only CI and dependency-free Obsidian graph filters are established. Next: [[memory/Issues/TRN-26]].

- [[memory/Issues/TRN-26]]: Resource bounds now include both synthetic GNFA states before construction. Cap tests cover generation, UTF-8 regex bytes, trace append, exact verification and shared deadlines without returning partial certified artifacts. Next: [[memory/Issues/TRN-15]].

- [[memory/Issues/TRN-15]]: P0 integration gate evaluated all seven NFR tasks and current-source browser/API workflows. Added six browser cases for remaining acceptor conversions, empty-branch rejection and nonempty shortest-witness replay; all pass. Next: [[memory/Issues/TRN-17]].

- [[memory/Issues/TRN-17]]: All P0 implementation tasks are complete as an internally verified local release candidate. Guides match the running app; TC-01–39 have explicit evidence/status; the executable HTTP demo passes all five machine kinds and seven operations. Next: [[memory/Issues/TRN-16]].

- [[memory/Issues/TRN-16]]: Version 1 machine JSON, validated import preview, layout round-trip and 20 immutable session traces are implemented. Replaying a snapshot preserves the live draft and identifies older revisions. Next: [[memory/Issues/TRN-18]].
