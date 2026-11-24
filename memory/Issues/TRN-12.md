---
id: "trn-12"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-12"
issue_type: "Story"
summary: "Conversion/equivalence UI and regex export (FR-18)"
issue_status: "Done"
priority: "P0"
epic: "TRN-103"
depends_on: ["TRN-04", "TRN-07", "TRN-08", "TRN-09", "TRN-10", "TRN-11"]
requirements: ["FR-18"]
tests: ["TC-16", "TC-18", "TC-35"]
estimate_person_days: 5
---

# TRN-12 — Conversion/equivalence UI and regex export (FR-18)

## User story / outcome

As a learner or instructor, I want conversion/equivalence ui and regex export (fr-18), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Integrate conversion, compare and help routes, source/result panels, meaningful derivations and explicit adopt confirmation.
- [x] Enable copy/download only for current verified artifacts; include full alphabet, canonical minimal DFA and verification envelope.
- [x] Show shortest witnesses including epsilon; allow running them on both inputs; handle clipboard denial and stale/offline/errors.

Baseline done condition: Side-by-side results, verified copy/download
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-04]]
- [[memory/Issues/TRN-07]]
- [[memory/Issues/TRN-08]]
- [[memory/Issues/TRN-09]]
- [[memory/Issues/TRN-10]]
- [[memory/Issues/TRN-11]]




## Test and delivery evidence

Planned cases: TC-16, TC-18, TC-35
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 5 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-18]]
- [[memory/Issues/TRN-103]]
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

Conversion/results and educational derivations implemented with confirmed adoption, independently verified regex copy/JSON download, canonical reference diagrams, and a two-sided editable comparison workspace with witness replay. Navigation protects unsaved comparison edits.

17 frontend component tests, lint and build passed. Six live Chromium checks passed, including real clipboard copy, JSON download metadata, exact comparison of downloaded canonical DFA, epsilon witness replay, stale export removal and mobile overflow checks. Inspected desktop/export/compare and mobile export screenshots. Existing backend suite: 108 passed. External integration remains NOT RUN.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
