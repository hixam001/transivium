---
id: "trn-11"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-11"
issue_type: "Story"
summary: "Independent regex parser/Thompson verifier (FR-13)"
issue_status: "To Do"
priority: "P0"
epic: "TRN-102"
depends_on: ["TRN-07", "TRN-09", "TRN-10"]
requirements: ["FR-13"]
tests: ["TC-16", "TC-17", "TC-18", "TC-19", "TC-20", "TC-33", "TC-35"]
estimate_person_days: 4
---

# TRN-11 — Independent regex parser/Thompson verifier (FR-13)

## User story / outcome

As a learner or instructor, I want independent regex parser/thompson verifier (fr-13), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Parse emitted text independently of the generator AST, Thompson-construct, determinize and compare exactly to the original.
- [ ] Catch mutated expressions; empty, universal, epsilon and omitted-alphabet-symbol cases pass; failed verification yields no verified artifact.

Baseline done condition: Exact round-trip fixtures, negative mutation detected
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-07]]
- [[memory/Issues/TRN-09]]
- [[memory/Issues/TRN-10]]




## Test and delivery evidence

Planned cases: TC-16, TC-17, TC-18, TC-19, TC-20, TC-33, TC-35
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
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
