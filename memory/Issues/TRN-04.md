---
id: "trn-04"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-04"
issue_type: "Story"
summary: "Graph/table editor (FR-01,15)"
issue_status: "Done"
priority: "P0"
epic: "TRN-101"
depends_on: ["TRN-01", "TRN-02"]
requirements: ["FR-01", "FR-15"]
tests: ["TC-01", "TC-02"]
estimate_person_days: 5
---

# TRN-04 — Graph/table editor (FR-01,15)

## User story / outcome

As a learner or instructor, I want graph/table editor (fr-01,15), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Support all five kinds using one draft model with table/graph projections, safe reference deletion and keyboard form alternatives.
- [x] Dirty replacement requires confirmation; revision increments invalidate obsolete results.

Baseline done condition: Five kinds editable; synchronized views
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-01]]
- [[memory/Issues/TRN-02]]




## Test and delivery evidence

Planned cases: TC-01, TC-02
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 5 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-01]]
- [[memory/Requirements/FR-15]]
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

Responsive five-kind graph/table editor implemented with state/edge editing, safe deletion/replacement, sample machines, keyboard forms and revision-aware validation. Product/design context recorded from the supplied brief.

Six frontend behavioral tests, lint and production build passed. Real Chromium at 1440px and 390px: no page errors or horizontal page overflow; real validation passed. Inspected both renders and corrected graph framing, reverse edges and zoom controls. Impeccable shot lacked a system Chrome; used installed Playwright Chromium. External signoff and learner study remain pending.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
