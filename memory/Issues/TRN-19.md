---
id: "trn-19"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-19"
issue_type: "Task"
summary: "Advanced editing and diagram image export"
issue_status: "Done"
priority: "P2"
epic: "TRN-105"
depends_on: ["TRN-17"]
requirements: ["FR-22"]
tests: []
estimate_person_days: null
---

# TRN-19 — Advanced editing and diagram image export

## User story / outcome

As a learner or instructor, I want advanced editing and diagram image export, so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Optional layout presets, undo/redo and SVG/PNG export
- [x] Undo and redo restore formal edits and diagram arrangement. Layout changes preserve validation. SVG/PNG files contain readable states and transitions and stay within a bounded raster size.

Baseline done condition: Three layout presets, bounded undo/redo and both diagram formats are available in the editor.
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

- [[memory/Requirements/FR-22]]
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

Grid, row and circle layouts, bounded undo/redo and SVG/PNG downloads are implemented. Formal edits invalidate stale results and layout-only edits preserve validation.

Frontend lint, 17 component tests and two live Chromium cases passed. Undo, redo, branch reset, layout-only validation, escaped SVG labels, PNG bytes and narrow viewport were verified. The narrow graph render was inspected.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
