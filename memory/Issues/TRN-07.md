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
issue_status: "Done"
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

- [x] Generate complete reachable subset DFAs including the empty sink when reached; epsilon removal propagates finals using closures.
- [x] Integrate the shared exact product checker before certifying results; its core lands here ahead of the TRN-09 public endpoint.

Baseline done condition: Verified equivalent conversions, sink handling
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-03]]
- [[memory/Issues/TRN-05]]

The shared exact product checker was brought forward into TRN-07 and is integrated before conversion success. TRN-09 retains public comparison endpoint and witness acceptance work.


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

## Executed implementation evidence

Epsilon removal and reachable subset construction implemented with final propagation, empty sinks, deterministic derivations and exact product certification. Shared checker brought forward to satisfy certification dependency.

52 backend tests passed, including 24 fixed-seed NFAs/epsilon-NFAs compared with direct simulation for every binary input through length four, direct/indirect conversion equality, sink completeness, incompatible operation and generated-state cap. Ruff passed. Public comparison endpoint remains TRN-09.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
