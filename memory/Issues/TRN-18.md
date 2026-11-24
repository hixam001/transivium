---
id: "trn-18"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-18"
issue_type: "Task"
summary: "Saved projects and example library"
issue_status: "Done"
priority: "P2"
epic: "TRN-105"
depends_on: ["TRN-17"]
requirements: ["FR-21"]
tests: []
estimate_person_days: null
---

# TRN-18 — Saved projects and example library

## User story / outcome

As a learner or instructor, I want saved projects and example library, so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Optional persistence and curated examples beyond basic demo fixtures
- [x] Named projects persist in the current browser. Opening validates the snapshot and requires explicit replacement. Deletion asks for confirmation and leaves the live draft intact.

Baseline done condition: Named projects reopen after refresh and the practice library contains runnable new examples.
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-17]]




## Test and delivery evidence

Planned cases: Scaffold/contract checks or detailed cases to be defined from the source plan.
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: Unestimated; do not interpret as zero.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-21]]
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

## Executed implementation evidence

Named local projects preserve validated machines and diagram layout across refresh. The practice library adds focused acceptor and transducer exercises.

Frontend lint and two live Chromium cases passed. Tests covered refresh, rejected and confirmed replacement/deletion, mobile parity transducer operation and a scoped axe scan. Storage stays in the current browser, up to 12 projects and 2 MiB of serialized browser storage.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
