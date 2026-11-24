---
id: "trn-07"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-07"
issue_type: "Story"
summary: "ε removal and determinization (FR-07–09)"
issue_status: "To Do"
priority: "P0"
epic: "TRN-102"
depends_on: ["TRN-03", "TRN-05"]
requirements: ["FR-07", "FR-08", "FR-09"]
tests: ["TC-08", "TC-09", "TC-10", "TC-34"]
estimate_person_days: 4
---

# TRN-07 — ε removal and determinization (FR-07–09)

## User story / outcome

As a learner or instructor, I want ε removal and determinization (fr-07–09), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Generate complete reachable subset DFAs including the empty sink when reached; epsilon removal propagates finals using closures.
- [ ] Implement primitives before TRN-09 if needed; final completion is blocked until TRN-09 exact product verification is integrated.

Baseline done condition: Verified equivalent conversions, sink handling
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-03]]
- [[memory/Issues/TRN-05]]

Verification integration with TRN-09 is an additional completion blocker, not a prerequisite to writing the primitive algorithms.


## Test and delivery evidence

Planned cases: TC-08, TC-09, TC-10, TC-34
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 4 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-07]]
- [[memory/Requirements/FR-08]]
- [[memory/Requirements/FR-09]]
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
