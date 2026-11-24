---
id: "trn-06"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-06"
issue_type: "Story"
summary: "Playback and simulation UI (FR-16)"
issue_status: "Done"
priority: "P0"
epic: "TRN-101"
depends_on: ["TRN-04", "TRN-05"]
requirements: ["FR-16"]
tests: ["TC-03", "TC-31"]
estimate_person_days: 3
---

# TRN-06 — Playback and simulation UI (FR-16)

## User story / outcome

As a learner or instructor, I want playback and simulation ui (fr-16), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Provide Next, Previous, Play/Pause and Reset with initial state, consumed symbol, text result and closure visualization.
- [x] Ignore responses for old revisions, stop playback on route exit and retain the draft on network or server errors.

Baseline done condition: Step/back/play/reset and errors work
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-04]]
- [[memory/Issues/TRN-05]]




## Test and delivery evidence

Planned cases: TC-03, TC-31
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-16]]
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

## Executed implementation evidence

Acceptor playback implemented with initial/next/back/reset/play/pause controls, state/edge highlights, trace navigation, explicit empty input and safe error/stale handling.

11 frontend component tests, lint and build passed. Three live Chromium acceptance checks passed: D01 playback/graph highlight/edit invalidation, epsilon empty-input closure and invalid-token error recovery, and 390px table/layout. Inspected rendered playback. Backend suite remains 44 passing tests.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
