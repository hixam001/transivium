---
id: "trn-08"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-08"
issue_type: "Story"
summary: "Minimization and canonicalization (FR-10)"
issue_status: "Done"
priority: "P0"
epic: "TRN-102"
depends_on: ["TRN-03", "TRN-07"]
requirements: ["FR-10"]
tests: ["TC-11", "TC-12", "TC-34"]
estimate_person_days: 3
---

# TRN-08 — Minimization and canonicalization (FR-10)

## User story / outcome

As a learner or instructor, I want minimization and canonicalization (fr-10), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Remove unreachable states, refine partitions, handle empty alphabet, and emit complete minimal DFA with sorted-symbol BFS IDs.
- [x] Use the shared exact product checker implemented in TRN-07 before certifying minimization.

Baseline done condition: Reachability, partition and canonical fixtures
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-03]]
- [[memory/Issues/TRN-07]]

The shared exact product checker was brought forward into TRN-07 and is integrated before conversion success. TRN-09 retains public comparison endpoint and witness acceptance work.


## Test and delivery evidence

Planned cases: TC-11, TC-12, TC-34
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-10]]
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

DFA minimization and canonical BFS numbering implemented with unreachable removal, partition traces and exact language certification.

58 backend tests passed. D01/D02 reduce to the same three-state canonical machine; universal/empty and empty-alphabet cases pass. Renaming/order/labels do not affect canonical output. 25 fixed-seed complete DFAs preserve language, minimize idempotently and have pairwise distinguishable result states. Ruff passed.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
