---
id: "doc-01-srd"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Software Requirements Specification (SRD/SRS) — Transivium

Version 0.1 | Implemented P0 baseline; evidence and limitations in [[docs/TEST_EVIDENCE]] | Reference: 00_PRD.md

## Goal
Provide an interactive, mathematically correct environment for finite automata and transducers, including independently verifiable DFA-to-regex export for cross-simulator use.

## Users
- Student: builds, runs and converts machines, checks language equivalence.
- Instructor/TA: demonstrates algorithms and verifies examples.
- Local maintainer: installs and operates the application; not an app administrator. No account system in MVP.

## MVP workflow
1. Open editor and choose DFA, NFA, ε-NFA, Mealy or Moore.
2. Define alphabet, states, initial state, transitions, and finals/outputs as relevant.
3. View synchronized diagram/table; validate draft.
4. Enter input (including empty string); inspect execution trace and result.
5. Select eligible conversion or minimization; inspect derivation and result without modifying source.
6. For DFA, export verified regex and alphabet; view canonical minimal DFA reference.
7. Compare acceptors over the same alphabet; obtain equivalence decision and shortest distinguishing string if needed.

## Must-have requirements
| ID | Requirement |
|---|---|
| FR-01 | Visual machine construction and editing |
| FR-02–06 | DFA, NFA, ε-NFA, Mealy, Moore simulation respectively |
| FR-07 | ε-NFA → NFA |
| FR-08 | NFA → DFA |
| FR-09 | ε-NFA → DFA |
| FR-10 | DFA minimization |
| FR-11 | Mealy → Moore |
| FR-12 | Moore → Mealy |
| FR-13 | DFA → formal regex with exact round-trip verification |
| FR-14 | Acceptor language equivalence and shortest counterexample |
| FR-15–18 | Transition tables, trace visualization, validation, verified regex export respectively |

All P0 details and individual criteria are in the PRD. P1: versioned machine import/export (FR-19), session history (FR-20). P2 not required for release.

## Formal requirements
- Alphabet is a finite, possibly empty set of distinct ASCII alphanumeric symbols for acceptors. Transducers require nonempty input and output alphabets (MVP convention).
- DFA has exactly one transition for every state/symbol pair; incomplete drafts cannot run until corrected. Explicit sink completion can be offered with user consent, never silently on input validation.
- NFA/ε-NFA may omit transitions; only ε-NFA accepts epsilon edges, encoded as null in JSON. Multiple initial states are not supported; one initial state required. Final set may be empty or contain start.
- Transducers are complete deterministic machines. Mealy outputs are attached to transitions; Moore outputs are attached to states. The Moore initial output is displayed separately; conversion equivalence means one output per consumed symbol, excluding initial Moore output.
- Simulation consumes input tokens in order and rejects invalid alphabet symbols as invalid input, not language rejection.
- Acceptor equivalence requires identical declared alphabet sets; mismatches return a validation error. State names/layout do not define language equality.
- Regex grammar is formal union/concatenation/star/grouping plus ε and ∅. Successful export means exact language equality against independently reconstructed DFA. Minimal reference is complete and reachable; canonical state IDs are assigned by BFS from start using sorted alphabet.
- Every bounded operation either completes correctly or returns a limit/deadline error; no unverified result is labeled equivalent or exported as verified.

## Non-functional requirements
NFR-01–07 apply as defined in PRD. Proposed limits and error behavior are in API contract and SAD. A local stateless API validates untrusted JSON; no external runtime service required. Preserve machine on error; support keyboard and table-based operation.

## Not in MVP
Accounts, RBAC, cloud persistence, collaboration, PDA/CFG/Turing machines, programming regex extensions, public regex-to-DFA UI, guarantees of external implementation behavior. Machine import/export and session history are P1 only.

## Acceptance check
A student builds a complete three-state DFA recognizing binary strings ending in `01`, simulates `101` (accepted) and `10` (rejected), converts it to a verified formal regex, and compares its internally reconstructed DFA with the source using exact equivalence. An independently reconstructed minimal complete DFA over `{0,1}` must be isomorphic to the minimized source if the external simulator obeys the exchange contract. Also demonstrate all other P0 conversions and simulation types and the negative counterexample path.

## Build notes
Proposed: React/TypeScript UI, React Flow diagram, Python/FastAPI stateless engine; local browser session, no database. Confirm stack, deadline, team size, and exchange syntax with stakeholders before declaring version 1.0 requirements locked. No implementation or test results are asserted in this pack.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
