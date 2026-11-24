---
id: "doc-07-test-plan"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Test Plan & Test Cases — Transivium

Version 0.1 | Cases below define release acceptance; actual implementation evidence is recorded per issue in [[memory/Project]]. Do not infer full-case PASS from a partial unit check.

## 1. Strategy
Unit tests for pure algorithms, API contract tests for validation/errors, frontend component tests for editing/trace state, end-to-end demo tests for critical workflows. Exact product equivalence, independent parser and known reference fixtures are the release oracle; bounded sample strings are supplemental, never proof. Use generated small automata with fixed seeds; log seed and machine on failure. Include hand-calculated cases so shared algorithm defects are not hidden by round-trip checks.

## 2. Fixtures
- D01: complete DFA for ending `01` (DATA_MODEL example), three minimal states; ε rejected; `101` accepted, `10` rejected.
- N01: NFA states s,t, start s, final t, alphabet {0,1}; s on 0 → {s,t}; t on 1 → {t}; all other edges absent. `01` accepted, `1` rejected; empty subset reachable.
- E01: ε-NFA states s,t,u, start s, final t, alphabet {a}; s ε→t, t ε→s, t a→u, u ε→t. Accepts a* including ε.
- M01: Mealy bit inverter (DATA_MODEL), one state, output alphabet {0,1}; input 0101 → 1010.
- O01: Moore states s(output 0), t(output 1), start s; from either state 0→t, 1→s. Input 0101 → full 01010, normalized 1010.
- D02: nonminimal variant of D01 with unreachable state (all required transitions present), plus reachable duplicate equivalent state in dedicated fixture; exact language equals D01.
- D03: one accepting state looping on 0 and 1; D04: one rejecting state looping on 0 and 1.
- D05: complete DFA accepting only ε over {0,1}; accepting start, nonfinal sink for both symbols.
- D06: complete DFA for 0* over {0,1}, accepting start loops 0, moves on 1 to nonfinal looping sink.

## 3. Core test cases
All are P0 unless stated. Steps are concise and expected results explicit.

| ID | Req | Setup / action | Expected result |
|---|---|---|---|
| TC-01 | FR-01,15 | Create D01 with graph/form, edit edge via table | Diagram/table reflect same transition; no duplicate model |
| TC-02 | FR-17 | Delete state referenced by transitions/finals/start | Dependent references removed or user prompted; invalid draft cannot execute |
| TC-03 | FR-02,16 | Run D01 on 101 and 10; step back/reset | Accept/reject respectively; initial + n steps; state highlight accurate |
| TC-04 | FR-03 | Run N01 on 01 and 1 | Branch set shown; accept first, reject second; empty set visible |
| TC-05 | FR-04 | Run E01 on [] and aa | Finite closure despite cycle; both accepted; no epsilon input consumed |
| TC-06 | FR-05 | Run M01 on 0101 and [] | Output 1010 and []; acceptance null |
| TC-07 | FR-06 | Run O01 on 0101 and [] | Full 01010 / 0; normalized 1010 / []; acceptance null |
| TC-08 | FR-07 | Remove epsilon from E01 | No ε transitions; start final after closure; exact equivalent |
| TC-09 | FR-08 | Determinize N01 | Reachable subsets; empty sink loops; complete; exact equivalent |
| TC-10 | FR-09 | Directly determinize E01 and compare indirect route | Both complete and language-equivalent |
| TC-11 | FR-10 | Minimize D02 and D01 | Unreachable/redundant states removed; both canonical D01, three states |
| TC-12 | FR-10 | Minimize D03/D04; empty alphabet DFA | One reachable state each; final status preserved |
| TC-13 | FR-11 | Convert M01 to Moore; simulate 0101 and [] | Post-input streams 1010 / []; synthetic initial output separate; exact verification |
| TC-14 | FR-12 | Convert O01 to Mealy | Each edge emits target output; exact normalized equivalence |
| TC-15 | FR-11 | Mealy two edges to same target with distinct outputs | Separate Moore target states by output; normalized equivalence |
| TC-16 | FR-13,18 | Convert D01 to regex, parse independently, determinize | Successful verification; canonical minimal DFA equals D01; copy/download same regex |
| TC-17 | FR-13 | Export D03, D04, D05 | Universal, ∅, ε languages respectively; exact verification; no text-equality assumption except literal syntax validity |
| TC-18 | FR-13,18 | Export D06 | Explicit alphabet includes 1 even if absent in regex; reconstructed complete minimal sink retained |
| TC-19 | FR-13 | Empty alphabet, accepting/nonfinal start | Equivalent ε/∅ respectively; metadata alphabet [] |
| TC-20 | FR-13 | Inject incorrect emitted regex for D01 (e.g. 0*) | Independent verifier catches mismatch; no verified export, VERIFICATION_FAILED |
| TC-21 | FR-14 | Compare D01 and D02 | Equivalent true, witness null |
| TC-22 | FR-14 | Compare D03 vs D04 | Equivalent false; witness []; left true/right false |
| TC-23 | FR-14 | Compare D01 vs D04 | Shortest witness 01; simulate witness on both confirms difference |
| TC-24 | FR-14 | Compare different declared alphabets | 422 ALPHABET_MISMATCH; no guessed alphabet |
| TC-25 | FR-17 | Duplicate IDs, unknown targets, illegal ε edge, missing DFA edge, duplicate deterministic edge | Correct structured validation errors; invalid execution blocked |
| TC-26 | FR-17 | Invalid input token, whitespace or literal ε typed | INVALID_INPUT; not ordinary rejection |
| TC-27 | FR-17 | Missing Mealy/Moore outputs or out-of-Γ output | INVALID_MACHINE; no partial output |
| TC-28 | NFR-02,07 | Force small injected state/AST/trace limit, 513-token input, oversize request | Typed limit/413 error; no partial certified result |
| TC-29 | NFR-02,05 | Inject clock deadline and server failure | 503/500 typed response; source preserved; retry possible |
| TC-30 | NFR-03 | Invalid JSON, wrong content type, unknown fields; label with markup | 400/415/422 as applicable; labels rendered as text; no stack traces |
| TC-31 | FR-16,NFR-05 | Change machine while simulation response pending | Old revision response ignored; draft intact |
| TC-32 | NFR-04 | Build/run via keyboard and table; reduced motion | Essential controls usable; result text present; no color-only meaning |
| TC-33 | FR-13,14 | Random small complete DFAs, fixed seeds; minimize/export and exact compare | Every successful export equivalent; resource failures counted separately, never success |
| TC-34 | FR-07–12 | Generate small NFAs/ε-NFAs/transducers, verify with exact checks and independent small bounded enumerations | Correct conversion or explicit limit; fixtures reproduce failures |
| TC-35 | FR-18 | External team imports reference regex + alphabet, minimizes result | Isomorphic canonical minimal DFA if external contract followed; mark NOT RUN if unavailable |
| TC-36 P1 | FR-19 | Export/import valid machine; malformed JSON/unknown version | Semantic round-trip; invalid import preserves current draft |
| TC-37 P1 | FR-20 | Run twice, edit source, reopen old trace | History tied to snapshot; current draft unchanged |
| TC-38 | NFR-02,06 | Fresh setup; measure ordinary workload latency | Setup works; record p95, machine specs, sample size; target ≤2 s |
| TC-39 | NFR-04, G5 | Five learners execute core workflow if available | At least 4 complete without developer assistance; record limitations |

## 4. Regex parser-specific unit tests
Accept `ε`, `∅`, `0`, `(0|1)*01`, `0**`, `ε|0`, and nested valid groups within limits; reject empty source, unbalanced parentheses, `0|`, `|0`, `*0`, whitespace, `0+`, `[01]`, `0?`, unknown alphabet literal, and oversized nesting. Check precedence with `0|10*` versus `(0|1)0*`. Check each AST simplification identity using independently constructed small fixtures and exact language comparisons. Mutate generated expressions and verify known different languages fail. Test UTF-8 preservation and original alphabet metadata.

## 5. Traceability / release checklist
FR-01–18 mapped above; NFR-01 correctness TC-08–24,33–35; NFR-02 performance TC-28–29,38; NFR-03 security TC-30; NFR-04 accessibility TC-32,39; NFR-05 reliability TC-29,31; NFR-06 maintainability review + TC-38; NFR-07 bounded scale TC-28. No authorization test for accounts (not in scope); validate local CORS and bind address in setup review.

- [x] Fresh setup, lint, build and all required automated tests pass.
- [x] Build and simulate each machine kind, run seven operations and compare languages.
- [x] Show verified D01 regex, negative equivalence witness, empty/universal/ε cases.
- [x] Validate errors, offline recovery, limit/deadline behavior and no stale UI response.
- [x] Confirm keyboard/table access, no secrets or server tracebacks.
- [x] Record performance/usability targets and known limitations; external fixture test status explicit.
- [x] Record test run date, commit, environment, pass/fail/skipped, defects and reviewer.

The checklist records internal candidate evaluation; partner TC-35, learner TC-39 and independent human review remain NOT RUN. No full external-release approval is implied.

## 6. Test evidence template
`case ID | commit | environment | expected | actual | status (PASS/FAIL/BLOCKED/NOT RUN) | issue | evidence`. The original baseline started all cases NOT RUN. Current case-by-case status is in [[docs/TEST_EVIDENCE]]; this plan does not replace executed evidence. Fix blocking mathematical correctness issues before release; no production-readiness claim.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
