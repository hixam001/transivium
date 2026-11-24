---
id: "trn-10"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-10"
issue_type: "Story"
summary: "GNFA AST, simplifier, serializer (FR-13)"
issue_status: "Done"
priority: "P0"
epic: "TRN-102"
depends_on: ["TRN-08"]
requirements: ["FR-13"]
tests: ["TC-16", "TC-17", "TC-18", "TC-19", "TC-20", "TC-33", "TC-35"]
estimate_person_days: 4
---

# TRN-10 — GNFA AST, simplifier, serializer (FR-13)

## User story / outcome

As a learner or instructor, I want gnfa ast, simplifier, serializer (fr-13), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Use GNFA state elimination with snapshot labels, formal AST identities and deterministic precedence-aware text serialization.
- [x] Check AST/work/UTF-8 size budgets while generating; generation alone does not certify export.

Baseline done condition: Correct elimination traces and grammar output
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-08]]




## Test and delivery evidence

Planned cases: TC-16, TC-17, TC-18, TC-19, TC-20, TC-33, TC-35
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 4 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-13]]
- [[memory/Issues/TRN-102]]
- [[memory/Issues/Backlog]]

## Sources

- [[docs/06_PROJECT_PLAN]]
- [[docs/02_SAD]]
- [[docs/03_DATA_MODEL]]
- [[docs/04_API_CONTRACT]]
- [[docs/05_ALGORITHMS]]
- [[docs/APP_FLOW]]
- [[docs/07_TEST_PLAN]]

## Executed implementation evidence

Bounded formal regex AST, sound simplifier, precedence-aware deterministic serialization and GNFA elimination traces implemented. No regex export is certified or exposed yet.

74 backend tests passed. Algebraic identities/precedence, D01 and empty/universal/epsilon/omitted-symbol languages, empty alphabet, deterministic generation and work/UTF-8 size guards checked. Test-only bounded host-regex comparisons supplement fixture checks; runtime never uses host regex for automata. Independent exact verification is TRN-11.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
