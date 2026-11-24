---
id: "trn-05"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-05"
issue_type: "Story"
summary: "DFA/NFA/ε-NFA simulation (FR-02–04)"
issue_status: "To Do"
priority: "P0"
epic: "TRN-101"
depends_on: ["TRN-03"]
requirements: ["FR-02", "FR-03", "FR-04"]
tests: ["TC-03", "TC-04", "TC-05"]
estimate_person_days: 3
---

# TRN-05 — DFA/NFA/ε-NFA simulation (FR-02–04)

## User story / outcome

As a learner or instructor, I want dfa/nfa/ε-nfa simulation (fr-02–04), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Return exactly input length + 1 configurations, including empty input, empty NFA branches and finite epsilon-cycle closure.
- [ ] Reject invalid input as input error, with no acceptance result; use the agreed trace DTOs.

Baseline done condition: Acceptance/closure traces correct
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-03]]




## Test and delivery evidence

Planned cases: TC-03, TC-04, TC-05
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-02]]
- [[memory/Requirements/FR-03]]
- [[memory/Requirements/FR-04]]
- [[memory/Issues/TRN-101]]
- [[memory/Issues/Backlog]]

## Sources

- [[docs/06_PROJECT_PLAN]]
- [[docs/02_SAD]]
- [[docs/03_DATA_MODEL]]
- [[docs/04_API_CONTRACT]]
- [[docs/05_ALGORITHMS]]
- [[docs/APP_FLOW]]
- [[docs/07_TEST_PLAN]]
