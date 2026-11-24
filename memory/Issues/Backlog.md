---
id: "backlog"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
---

# Jira-style backlog

## Scope and identifiers

These are **local planning IDs**, not issues created in a connected Jira project. TRN-01–17 preserve the original plan. TRN-18–19 capture the original P2 scope for FR-21–22. TRN-20–26 are explicit NFR verification tasks; they add no invented effort to the 53-person-day P0 estimate. TRN-100–105 are grouping epics. No assignees, deadlines, stakeholder approvals or test passes are invented.

| Issue | Type | Priority | Initial status | Proposed person-days |
|---|---|---|---|---|
| [[memory/Issues/TRN-01\|TRN-01: Agree formal semantics, schema and regex exchange format]] | Task | P0 | To Do | 1 |
| [[memory/Issues/TRN-02\|TRN-02: Bootstrap repo, lint, test, local setup]] | Task | P0 | To Do | 2 |
| [[memory/Issues/TRN-03\|TRN-03: Formal models and validator (FR-17)]] | Story | P0 | To Do | 3 |
| [[memory/Issues/TRN-04\|TRN-04: Graph/table editor (FR-01,15)]] | Story | P0 | To Do | 5 |
| [[memory/Issues/TRN-05\|TRN-05: DFA/NFA/ε-NFA simulation (FR-02–04)]] | Story | P0 | To Do | 3 |
| [[memory/Issues/TRN-06\|TRN-06: Playback and simulation UI (FR-16)]] | Story | P0 | To Do | 3 |
| [[memory/Issues/TRN-07\|TRN-07: ε removal and determinization (FR-07–09)]] | Story | P0 | To Do | 4 |
| [[memory/Issues/TRN-08\|TRN-08: Minimization and canonicalization (FR-10)]] | Story | P0 | To Do | 3 |
| [[memory/Issues/TRN-09\|TRN-09: Exact equivalence and shortest witness (FR-14)]] | Story | P0 | To Do | 3 |
| [[memory/Issues/TRN-10\|TRN-10: GNFA AST, simplifier, serializer (FR-13)]] | Story | P0 | To Do | 4 |
| [[memory/Issues/TRN-11\|TRN-11: Independent regex parser/Thompson verifier (FR-13)]] | Story | P0 | To Do | 4 |
| [[memory/Issues/TRN-12\|TRN-12: Conversion/equivalence UI and regex export (FR-18)]] | Story | P0 | To Do | 5 |
| [[memory/Issues/TRN-13\|TRN-13: Mealy/Moore simulation (FR-05,06)]] | Story | P0 | To Do | 2 |
| [[memory/Issues/TRN-14\|TRN-14: Transducer conversions (FR-11,12)]] | Story | P0 | To Do | 3 |
| [[memory/Issues/TRN-15\|TRN-15: Limits, errors, accessibility and integration]] | Task | P0 | To Do | 4 |
| [[memory/Issues/TRN-16\|TRN-16: Optional machine JSON and history (FR-19,20)]] | Story | P1 | To Do | 3 |
| [[memory/Issues/TRN-17\|TRN-17: QA, guides, release candidate, demo]] | Task | P0 | To Do | 4 |
| [[memory/Issues/TRN-18\|TRN-18: Saved projects and example library]] | Task | P2 | Deferred | Unestimated |
| [[memory/Issues/TRN-19\|TRN-19: Advanced editing and diagram image export]] | Task | P2 | Deferred | Unestimated |
| [[memory/Issues/TRN-20\|TRN-20: Verify correctness]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-21\|TRN-21: Verify responsiveness]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-22\|TRN-22: Verify safety]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-23\|TRN-23: Verify accessibility]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-24\|TRN-24: Verify reliability]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-25\|TRN-25: Verify maintainability]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-26\|TRN-26: Verify scalability]] | Task | P0 | To Do | Unestimated |
| [[memory/Issues/TRN-27\|TRN-27: Security, correctness and interface review]] | Task | P0 | To Do | Unestimated |

## Epics

- [[memory/Issues/TRN-100]]
- [[memory/Issues/TRN-101]]
- [[memory/Issues/TRN-102]]
- [[memory/Issues/TRN-103]]
- [[memory/Issues/TRN-104]]
- [[memory/Issues/TRN-105]]

## Sequencing corrections

- The shared exact checker was brought forward into TRN-07 to certify conversions immediately. TRN-08 reuses it; TRN-09 retains public endpoint and witness acceptance. This resolves the implicit verification cycle without substituting sampling for proof.
- TRN-16 now names TRN-17's evidenced P0 gate as prerequisite. P1 remains optional after P0, not a release blocker.
- NFR verification tasks contribute evidence to TRN-15, then TRN-17. Their effort is included in existing integration/QA estimates pending re-estimation.
- TRN-01 stakeholder/external agreement remains open; the first implementation handoff is [[memory/Handoffs/TRN-01]].

## Jira import

Run `python3 scripts/memory.py refresh` to produce `memory/Generated/jira-import.csv`. Import using Jira's CSV importer after choosing the real project and mapping fields. Columns: local ID, issue type, summary, description, priority and labels. Local IDs are not uploaded as reserved Jira issue keys. Map CSV Issue ID as the import reference ID, not Issue Key. Map Highest/High/Low to actual project priorities as needed.

Each Description carries the local key, epic and dependency keys, requirements, test references and full acceptance criteria. Jira editions differ in parent/epic/link mappings; create epics first and map their resulting real issue keys to children in a second pass if needed. This portable CSV intentionally does not pretend to create native relationships or assign workflow statuses. Every imported issue starts in the project's configured initial status; Deferred is carried as a label. Repeated imports can create duplicates: retain the local-to-real key mapping and use Jira's update import workflow deliberately.

No Jira API write has occurred. Do not claim uploaded issues without evidence.

## Links

- [[docs/06_PROJECT_PLAN]]
- [[memory/Requirements/Index]]
- [[memory/References/Documentation-Review]]
- [[memory/Home]]
