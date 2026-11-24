---
id: "trn-13"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-13"
issue_type: "Story"
summary: "Mealy/Moore simulation (FR-05,06)"
issue_status: "Done"
priority: "P0"
epic: "TRN-101"
depends_on: ["TRN-03", "TRN-06"]
requirements: ["FR-05", "FR-06"]
tests: ["TC-06", "TC-07"]
estimate_person_days: 2
---

# TRN-13 — Mealy/Moore simulation (FR-05,06)

## User story / outcome

As a learner or instructor, I want mealy/moore simulation (fr-05,06), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Produce one Mealy output per input and show Moore initial output separately from normalized post-input output.
- [x] Empty input emits [] for Mealy and initial-only full Moore output; transducer acceptance is null.

Baseline done condition: Full and normalized outputs correct
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-03]]
- [[memory/Issues/TRN-06]]




## Test and delivery evidence

Planned cases: TC-06, TC-07
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 2 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-05]]
- [[memory/Requirements/FR-06]]
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

Mealy/Moore simulation and playback implemented with full/prefix outputs, separate initial Moore output, normalized post-input streams and no acceptance label for transducers.

115 backend tests passed, including all binary inputs through length five against independent bit-inverter expectations, missing output errors, empty streams and response caps. Frontend lint/build and 17 component tests passed; eight live browser checks passed, including both transducers on 0101 and empty input. Inspected rendered Moore output/trace.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
