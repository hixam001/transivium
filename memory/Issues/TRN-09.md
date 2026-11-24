---
id: "trn-09"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-09"
issue_type: "Story"
summary: "Exact equivalence and shortest witness (FR-14)"
issue_status: "To Do"
priority: "P0"
epic: "TRN-102"
depends_on: ["TRN-07"]
requirements: ["FR-14"]
tests: ["TC-21", "TC-22", "TC-23", "TC-24"]
estimate_person_days: 3
---

# TRN-09 — Exact equivalence and shortest witness (FR-14)

## User story / outcome

As a learner or instructor, I want exact equivalence and shortest witness (fr-14), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Require identical declared alphabets; product BFS returns shortest sorted-tie witness, including [] at initial mismatch.
- [ ] Prove equality by queue exhaustion; limits and deadlines produce errors, never equality. Integrate this checker into TRN-07 and TRN-08 before closing those stories.

Baseline done condition: Positive and negative cases, ε witness
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-07]]




## Test and delivery evidence

Planned cases: TC-21, TC-22, TC-23, TC-24
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-14]]
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
