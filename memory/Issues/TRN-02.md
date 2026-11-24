---
id: "trn-02"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-02"
issue_type: "Task"
summary: "Bootstrap repo, lint, test, local setup"
issue_status: "To Do"
priority: "P0"
epic: "TRN-100"
depends_on: ["TRN-01"]
requirements: []
tests: []
estimate_person_days: 2
---

# TRN-02 — Bootstrap repo, lint, test, local setup

## User story / outcome

As a maintainer, I want bootstrap repo, lint, test, local setup, so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [ ] Create backend/frontend manifests and lockfiles, pin tested runtime/dependency versions, and document a clean local checkout.
- [ ] Implement health endpoint and runnable lint/test/build commands with local proxy/bind configuration.

Baseline done condition: Clean checkout starts both services and tests
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-01]]




## Test and delivery evidence

Planned cases: Scaffold/contract checks or detailed cases to be defined from the source plan.
Application checks: **NOT RUN**. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 2 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic


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
