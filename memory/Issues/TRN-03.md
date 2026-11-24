---
id: "trn-03"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-03"
issue_type: "Story"
summary: "Formal models and validator (FR-17)"
issue_status: "To Do"
priority: "P0"
epic: "TRN-100"
depends_on: ["TRN-01", "TRN-02"]
requirements: ["FR-17"]
tests: ["TC-02", "TC-25", "TC-26", "TC-27"]
estimate_person_days: 3
---

# TRN-03 — Formal models and validator (FR-17)

## User story / outcome

As a learner or instructor, I want formal models and validator (fr-17), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Validate all five discriminated machine schemas and reject unknown fields, invalid references, illegal epsilon/output fields and incomplete deterministic machines.
- [ ] Implement /validate structural versus semantic error behavior and preserve incomplete frontend drafts.

Baseline done condition: All validation fixtures pass
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-01]]
- [[memory/Issues/TRN-02]]




## Test and delivery evidence

Planned cases: TC-02, TC-25, TC-26, TC-27
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-17]]
- [[memory/Issues/TRN-100]]
- [[memory/Issues/Backlog]]

## Sources

- [[docs/06_PROJECT_PLAN]]
- [[docs/02_SAD]]
- [[docs/03_DATA_MODEL]]
- [[docs/04_API_CONTRACT]]
- [[docs/05_ALGORITHMS]]
- [[docs/APP_FLOW]]
- [[docs/07_TEST_PLAN]]
