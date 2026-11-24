---
id: "doc-00-prd"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Product Requirements Document — Transivium

**Full name:** Transivium — Finite Automata & Transducer Simulation Studio\
**Tagline:** Construct. Convert. Simulate. Verify.\
**Version:** 0.1 — proposed baseline for review\
**Project:** University Theory of Automata course\
**Status:** Scope previously agreed; implementation decisions and numerical targets proposed, not approved or tested.

## 1. Problem statement
Students often learn finite automata through static diagrams, handwritten tables and isolated conversion exercises. These methods make it difficult to observe nondeterministic branching, epsilon closure, state equivalence and output-producing machines. They also make it difficult to verify that an expression derived from a DFA describes precisely the same language rather than merely matching a few example strings.

Transivium provides a single interactive educational environment for constructing, simulating, converting and verifying finite automata and finite-state transducers. Its distinguishing requirement is export of a mathematically equivalent regular expression from a DFA for reconstruction by an independent simulator.

## 2. Goals and objectives
| ID | Objective | Proposed target by release |
|---|---|---|
| G1 | Make all five machine types visually constructible and executable | Support DFA, NFA, ε-NFA, Mealy and Moore in one editor |
| G2 | Make conversion algorithms understandable | All seven required conversion/minimization operations display meaningful derivation steps |
| G3 | Guarantee correctness of successful regex exports | Every successful export passes exact language-equivalence verification against a reconstructed DFA |
| G4 | Provide actionable feedback | Invalid machines, input symbols and unsupported/oversized operations produce explicit errors without destroying the source |
| G5 | Deliver a reproducible university demonstration | All P0 acceptance tests pass; a fresh setup can run the scripted demonstration |

## 3. Success metrics
These are release targets, not measured outcomes.

| Metric | Target / measurement |
|---|---|
| Core feature coverage | 100% of P0 acceptance criteria verified |
| Regex export correctness | 100% of successful exports equivalent by exact product-automaton search; include empty and universal languages |
| Conversion correctness | 100% of required reference fixtures pass, plus generated tests within bounds |
| Interactive responsiveness | p95 ≤ 2 s for ordinary operations on reference demo hardware (≤ 20 states, ≤ 4 symbols, ≤ 100 input tokens); record hardware and sample size |
| Usability | At least 4 of 5 volunteer students complete construction, simulation and export with no developer assistance; if unavailable, record limitation |

## 4. Target personas
### Student — primary
Undergraduate studying Theory of Automata; familiar with binary strings, state diagrams and basic formal notation but not necessarily implementation algorithms. Pain points: manually computing closures, tracking branches, and checking conversion answers. Goal: build a machine and see every intermediate step with actionable explanations.

### Instructor / teaching assistant — secondary
University educator with formal automata knowledge and moderate technical proficiency. Pain points: demonstrating nontrivial examples and objectively checking equivalent machines. Goal: construct examples, reproduce conversions and show why acceptance or rejection occurs. This is a usage persona, not a privileged application role.

## 5. Features and requirements
Priority P0 = mandatory release scope, P1 = recommended after core functionality, P2 = optional future work. IDs are stable across documents.

| ID / priority | Feature and user story (as a learner/instructor, I want...) | Testable acceptance criteria | Success measure |
|---|---|---|---|
| FR-01 P0 | Visual construction, so I can model a machine | Add/edit/delete states and transitions; set start/finals or outputs as appropriate; edits update diagram and table; delete references safely | All five models constructible |
| FR-02 P0 | DFA simulation, so I can follow a deterministic computation | Consume one symbol per step; show current state; report acceptance iff final state reached after all symbols | DFA fixtures pass |
| FR-03 P0 | NFA simulation, so I can see all branches | Track active-state sets; handle missing edges as empty moves; accept iff at least one final state remains | NFA fixtures pass |
| FR-04 P0 | ε-NFA simulation, so I can understand epsilon transitions | Show initial and subsequent closures; handle epsilon cycles without hanging; accept empty input where closure reaches a final | ε-NFA fixtures pass |
| FR-05 P0 | Mealy simulation, so I can observe transition outputs | Produce one output per consumed symbol; show output prefix; handle empty input as empty output | Output fixtures pass |
| FR-06 P0 | Moore simulation, so I can observe state outputs | Show initial state's output separately; show reached-state output per input; present full and post-input streams | Output fixtures pass |
| FR-07 P0 | ε-NFA → NFA, so I can eliminate epsilon edges | Compute closure-based transitions; propagate final status via closures; preserve language | Exact equivalence passes |
| FR-08 P0 | NFA → DFA, so I can understand subset construction | Start with singleton; enumerate reachable subsets; include empty subset if needed; emit complete equivalent DFA | Exact equivalence passes |
| FR-09 P0 | ε-NFA → DFA, so I can determinize directly | Start at epsilon closure; close every move; output complete equivalent DFA | Exact equivalence passes |
| FR-10 P0 | DFA minimization, so I can remove redundancy | Remove unreachable states; refine final/nonfinal partitions; emit complete equivalent minimal DFA | Reference state counts pass |
| FR-11 P0 | Mealy → Moore, so I can compare models | Split states by incoming output; create a synthetic initial state; preserve output after each input, ignoring initial Moore output | Exact normalized output equivalence passes |
| FR-12 P0 | Moore → Mealy, so I can compare models | Label transitions with target-state output; preserve normalized output; do not claim initial Moore output is preserved | Exact normalized output equivalence passes |
| FR-13 P0 | DFA → regex, so I can share a language | Derive using GNFA elimination; emit formal grammar; verify equivalent language before marking success | All successful exports verified |
| FR-14 P0 | Language equivalence, so I can check independent solutions | Compare DFA/NFA/ε-NFA over same declared alphabet; use reachable product search; return a shortest distinguishing string if unequal | Exact decisions and witnesses pass |
| FR-15 P0 | Transition tables, so I can inspect the formal definition | Generate deterministic/nondeterministic tables; display ε column where appropriate; display output information for transducers | Table and graph stay synchronized |
| FR-16 P0 | Execution visualization, so I can learn step by step | Show initial configuration; support next/back/reset and playback; highlight consumed symbol and current states/outputs | Trace navigation fixtures pass |
| FR-17 P0 | Validation, so I can identify mistakes | Detect undefined references, illegal symbols, invalid determinism and missing required fields; distinguish editable draft from valid runnable machine; preserve draft on error | Validation fixtures pass |
| FR-18 P0 | Regex export, so I can use another simulator | Copy plain regex; export regex plus alphabet metadata as JSON; show syntax guidance and verification result | Copy/download matches verified artifact |
| FR-19 P1 | Machine import/export, so I can reuse examples | Validate versioned JSON; round-trip preserves semantics; reject invalid or unsupported schema without replacing draft | JSON round-trip passes |
| FR-20 P1 | Execution history, so I can revisit results | Retain recent session traces; reopen without modifying source; clearly identify stale snapshots after edits | History fixtures pass |
| FR-21 P2 | Saved projects and example library | Optional persistence and curated examples beyond basic demo fixtures | Deferred |
| FR-22 P2 | Advanced editing and diagram image export | Optional layout presets, undo/redo and SVG/PNG export | Deferred |

## 6. Mandatory interoperability constraint
For DFA D over alphabet Σ, successful export of R must satisfy L(D) = L(R). Transivium independently parses its emitted regex and reconstructs a DFA to verify this equality exactly, not by sample strings.

A regex cannot encode the original DFA's arbitrary state names, redundant/unreachable states, or graph layout. For the external simulator to reproduce the same transition structure, both results must be complete, reachable and minimized over the same alphabet. Such minimal DFAs are isomorphic; matching state labels additionally requires shared canonical numbering. Transivium supplies canonical minimal reference output, but cannot guarantee another team's implementation or exact raw diagram.

The exchange contract uses `|`, implicit concatenation, `*`, parentheses, `ε`, `∅`, and single ASCII alphanumeric alphabet symbols. The alphabet is explicitly supplied separately because a regex alone may omit symbols that always lead to rejection. The other team must agree on syntax, alphabet and minimization conventions; no dependency on their code.

## 7. Explicitly out of scope
- PDA, CFG, Turing machines and unrestricted grammars.
- General-purpose programming-language regex extensions (backreferences, lookaround, character classes, quantifier shorthand).
- User-facing regex-to-DFA construction studio (an internal verifier is required).
- Accounts, authentication, role management and administration dashboard.
- Cloud database, collaboration, payment or analytics tracking.
- Arbitrary-sized machine processing or unlimited regex expansion.
- Guaranteeing byte-identical external state names, coordinates or nonminimal graph reconstruction.
- Deployment or maintenance of the other team's software.

## 8. User scenarios
### A. Build and simulate an ε-NFA
A student creates states, a start, final states and ε/symbol transitions. The system generates the table and validates references. The student enters a string, steps through the closure and symbol moves, then sees acceptance or rejection. An epsilon cycle is processed finitely; malformed input blocks simulation without losing edits.

### B. Export a DFA as regex and verify elsewhere
An instructor builds a DFA for binary strings ending in `01`, selects minimization and DFA-to-regex. Transivium shows elimination steps, internally reconstructs and verifies the expression, and provides the regex and alphabet. The external simulator can use both to reconstruct a language-equivalent DFA. If the external output is not minimal, state counts can differ; if an internal verification cannot finish, the export is not marked verified.

### C. Convert a Mealy machine and compare outputs
A student builds a complete binary-output transducer, simulates `0101`, converts it to Moore, and runs the same input. The UI distinguishes Moore's initial output from outputs produced after each symbol. The post-input streams agree. Missing outputs or transitions are validation errors; empty input is supported.

## 9. Non-functional requirements
- NFR-01 Correctness: exact algorithmic checks and explicit formal conventions; no approximation passed off as equivalence.
- NFR-02 Responsiveness: proposed p95 ≤ 2 s for ordinary reference workloads; bounded expensive operations with a clear failure state.
- NFR-03 Safety: validate every backend request, reject oversized payloads, never execute user strings as code, avoid exposing stack traces; local-only binding by default.
- NFR-04 Accessibility: keyboard-operable essential controls, text/table alternative to graph, visible focus, semantic labels, acceptance not indicated by color alone.
- NFR-05 Reliability: conversions never overwrite source silently; errors preserve draft; repeated identical operations deterministic in ordering where specified.
- NFR-06 Maintainability: pure algorithm modules, versioned JSON contract, independent unit and integration tests.
- NFR-07 Scalability: bounded state/transition/trace/regex sizes; no claim of production-scale capacity.

## 10. Dependencies and constraints
University scope; standard finite-automata semantics; browser UI; local development/demo proposed. No external service required. Proposed stack: React + TypeScript, React Flow, Python/FastAPI, pytest and frontend tests; decision register in SAD. Instructor's actual deadline, team size, deployment policy and budget remain [DECIDE].

## 11. Timeline
Relative plan (proposed six weeks; adapt to actual deadline): W1 formal model and editor foundation; W2 simulation; W3 acceptor conversions/minimization/equivalence; W4 regex export and exact verification; W5 transducers and integration; W6 test, docs and demo. P1 only after P0 gate. See [Project Plan](06_PROJECT_PLAN.md).

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
