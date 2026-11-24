---
id: "doc-06-project-plan"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Project Plan & Scope Statement — Transivium

Version 0.1 | Proposed six-week plan; no fixed dates, staffing or budget approved

## 1. Scope baseline
Deliver a browser-based local educational studio supporting all FR-01–18. Core deliverables: model/editor, simulation engine, seven conversion/minimization operations, exact equivalence and shortest witness, verified DFA-to-regex export, tests, documentation, reproducible live demo. P1 FR-19–20 may follow only after P0 gate. Exclusions in PRD apply. Other team's implementation is outside scope; only an agreed exchange format and reference fixtures are our responsibility.

## 2. Work breakdown (Jira-style)
Estimates are proposed person-days, not commitments. Dependencies must meet acceptance before downstream work. Parallelize UI/backend where interfaces are stable.

| Key | Story / deliverable | Depends on | Est. days | Done when |
|---|---|---|---:|---|
| TRN-01 | Agree formal semantics, schema and regex exchange format | — | 1 | ADRs and fixtures reviewed; external agreement tracked |
| TRN-02 | Bootstrap repo, lint, test, local setup | 01 | 2 | Clean checkout starts both services and tests |
| TRN-03 | Formal models and validator (FR-17) | 01,02 | 3 | All validation fixtures pass |
| TRN-04 | Graph/table editor (FR-01,15) | 01,02 | 5 | Five kinds editable; synchronized views |
| TRN-05 | DFA/NFA/ε-NFA simulation (FR-02–04) | 03 | 3 | Acceptance/closure traces correct |
| TRN-06 | Playback and simulation UI (FR-16) | 04,05 | 3 | Step/back/play/reset and errors work |
| TRN-07 | ε removal and determinization (FR-07–09) | 03,05 | 4 | Verified equivalent conversions, sink handling |
| TRN-08 | Minimization and canonicalization (FR-10) | 03,07 | 3 | Reachability, partition and canonical fixtures |
| TRN-09 | Exact equivalence and shortest witness (FR-14) | 07 | 3 | Positive and negative cases, ε witness |
| TRN-10 | GNFA AST, simplifier, serializer (FR-13) | 08 | 4 | Correct elimination traces and grammar output |
| TRN-11 | Independent regex parser/Thompson verifier (FR-13) | 07,09,10 | 4 | Exact round-trip fixtures, negative mutation detected |
| TRN-12 | Conversion/equivalence UI and regex export (FR-18) | 04,07–11 | 5 | Side-by-side results, verified copy/download |
| TRN-13 | Mealy/Moore simulation (FR-05,06) | 03,06 | 2 | Full and normalized outputs correct |
| TRN-14 | Transducer conversions (FR-11,12) | 13 | 3 | Exact normalized-output checks pass |
| TRN-15 | Limits, errors, accessibility and integration | 03–14 | 4 | Stress/error and keyboard flows pass |
| TRN-16 | Optional machine JSON and history (FR-19,20) | P0 gate | 3 | Valid round-trip and snapshot history |
| TRN-17 | QA, guides, release candidate, demo | 15 | 4 | Release gates met, test evidence recorded |

P0 effort estimate: 53 person-days (sum of all except TRN-16; revise after team capacity known). Actual schedule may require parallel contributors or longer duration. No features silently removed to meet a deadline; rebaseline with instructor/team.

## 3. Milestones
| Week | Focus | Exit criteria |
|---|---|---|
| W1 | TRN-01–04 foundation | Formal contract reviewed, local setup, editor skeleton and validation |
| W2 | TRN-04–06,13 | All five machine simulation paths integrated |
| W3 | TRN-07–09 | Acceptor conversions, minimization and exact equivalence pass |
| W4 | TRN-10–12 | Verified regex export demonstrated; external fixture exchange prepared |
| W5 | TRN-12,14–15 | All P0 paths integrated and error states addressed |
| W6 | TRN-17, optional TRN-16 only if spare capacity | Acceptance gates passed, demo and docs reproducible |

MVP = all P0 functionality at end W5 target. V1.0 = tested and documented release at end W6 target, not an already released version. Actual deadline [DECIDE].

## 4. Responsibilities and dependencies
Proposed responsibility areas (assign actual names in kickoff): product/theory lead (formal requirements and external syntax), engine developer(s), UI developer(s), QA/integration/documentation lead. A contributor may hold multiple roles. Peer review algorithm changes; no one approves their own critical correctness claim without reproducible test evidence. Other team not a staffing dependency; instructor/course rules and access to demo machine are external dependencies.

## 5. Budget and resources
Local development uses open-source frameworks and existing laptops; proposed incremental software/cloud budget PKR 0 (no paid services required, not an approved budget). Internet, electricity, equipment and optional hosting excluded from estimate; confirm available resources and any paid expenses before commitment. Team size, deadline, OS compatibility and instructor requirements [DECIDE].

## 6. Risks
| Risk | Impact | Mitigation / owner area |
|---|---|---|
| Regex expansion and determinization blow-up | High | Guard limits; minimize first; engine |
| External simulator expects different syntax | High | Share grammar and alphabet/fixture package early; theory lead |
| Mistaking isomorphism for original graph recovery | High | Document minimal DFA guarantee and example; theory lead |
| UI editing complexity | Medium | Table editor first; graph as projection; UI |
| Unclear Moore output convention | Medium | Separate initial output; exact comparison; engine |
| Deadline or staffing shortage | High | Re-estimate W1; defer P1; project lead |

## 7. Quality gates and change control
Every story has requirement IDs, reproducible tests and review evidence. P0 gate: all FR-01–18 and NFR release targets evaluated; no unresolved critical correctness/security defects; known limitations documented. External demonstration is a separate integration milestone if partner simulator available; do not claim it passed without evidence. Changes to formal semantics, regex syntax, scope or limits require PRD/SRD/API/data/test updates in same review. Use issue keys in commits and PRs, document deferred items; approval by project team/instructor where required.

## Linked delivery backlog

See [[memory/Issues/Backlog]] for full Jira-style issue notes, requirement/test traceability and CSV import. TRN-07/08 primitives precede TRN-09, but their final exact-verification acceptance depends on its integration. TRN-16 begins only after TRN-17 records the P0 gate. Added NFR verification tasks share existing integration/QA effort; no extra estimates are asserted.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
