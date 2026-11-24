---
id: "trn-16"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-16"
issue_type: "Story"
summary: "Optional machine JSON and history (FR-19,20)"
issue_status: "To Do"
priority: "P1"
epic: "TRN-105"
depends_on: ["TRN-17"]
requirements: ["FR-19", "FR-20"]
tests: ["TC-36", "TC-37"]
estimate_person_days: 3
---

# TRN-16 — Optional machine JSON and history (FR-19,20)

## User story / outcome

As a learner or instructor, I want optional machine json and history (fr-19,20), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Start only after recorded P0 gate evidence from TRN-17, not merely a scheduled date.
- [ ] Versioned machine JSON round-trips; invalid/oversized/unknown-version files preserve the draft; history retains up to 20 immutable session snapshots.

Baseline done condition: Valid round-trip and snapshot history
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-17]]




## Test and delivery evidence

Planned cases: TC-36, TC-37
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-19]]
- [[memory/Requirements/FR-20]]
- [[memory/Issues/TRN-105]]
- [[memory/Issues/Backlog]]

## Sources

- [[docs/06_PROJECT_PLAN]]
- [[docs/02_SAD]]
- [[docs/03_DATA_MODEL]]
- [[docs/04_API_CONTRACT]]
- [[docs/05_ALGORITHMS]]
- [[docs/APP_FLOW]]
- [[docs/07_TEST_PLAN]]
