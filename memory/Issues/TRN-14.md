---
id: "trn-14"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
issue_key: "TRN-14"
issue_type: "Story"
summary: "Transducer conversions (FR-11,12)"
issue_status: "Done"
priority: "P0"
epic: "TRN-102"
depends_on: ["TRN-13"]
requirements: ["FR-11", "FR-12"]
tests: ["TC-13", "TC-14", "TC-15", "TC-34"]
estimate_person_days: 3
---

# TRN-14 — Transducer conversions (FR-11,12)

## User story / outcome

As a learner or instructor, I want transducer conversions (fr-11,12), so that the documented Transivium workflow is reliable and reproducible.

## Acceptance criteria

- [x] Split Mealy target states by incoming output with synthetic initial state; Moore-to-Mealy emits destination output.
- [x] Exact normalized-output product search verifies conversions, including empty input and multiple incoming outputs.

Baseline done condition: Exact normalized-output checks pass
All linked requirement acceptance criteria also apply; their links below are part of this issue's scope.

## Dependencies and sequencing

- [[memory/Issues/TRN-13]]




## Test and delivery evidence

Planned cases: TC-13, TC-14, TC-15, TC-34
Application checks: executed evidence below; full release acceptance remains separate. Assignee: Unassigned. Actual effort: unrecorded.
Proposed estimate: 3 person-days.
Record actual commands, environment, evidence, limitations and review before marking Done.
External partner results must be recorded separately from internal verification.

## Requirements and epic

- [[memory/Requirements/FR-11]]
- [[memory/Requirements/FR-12]]
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

Both transducer conversions implemented and integrated, with reachable incoming-output splitting, synthetic initial Moore output, destination-state Mealy outputs and exact normalized-output certification.

124 backend tests passed, including generated transducers, all short binary input streams, empty input, split states, ignored synthetic initial output, mutation detection and state/product caps. Frontend lint/build and 17 component checks passed; ten browser checks passed, including explicit adoption and replay in both directions. Inspected converted Moore result. NFR acceptance tasks precede the TRN-15 integration gate.

Git history and remote tracking record publication. No external stakeholder review or partner test is implied.
