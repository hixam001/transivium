---
id: "nfr-01"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
requirement_id: "NFR-01"
priority: "P0"
implementation_status: "Exact runtime certification implemented; automated correctness gate passed"
test_status: "NOT RUN"
owners: ["TRN-20", "TRN-15", "TRN-17"]
tests: ["TC-08", "TC-09", "TC-10", "TC-11", "TC-12", "TC-13", "TC-14", "TC-15", "TC-16", "TC-17", "TC-18", "TC-19", "TC-20", "TC-21", "TC-22", "TC-23", "TC-24", "TC-33", "TC-34", "TC-35"]
---

# NFR-01 — Correctness

## Requirement

Correctness

## Acceptance criteria

exact algorithmic checks and explicit formal conventions; no approximation passed off as equivalence.

Success measure: Release evidence in docs/07_TEST_PLAN.md.

## Verification and scope

Planned evidence: TC-08, TC-09, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15, TC-16, TC-17, TC-18, TC-19, TC-20, TC-21, TC-22, TC-23, TC-24, TC-33, TC-34, TC-35. Application test status: **NOT RUN**.
Priority P0; P1 begins only after the P0 release gate; P2 remains deferred.
Exact checks are implemented and exercised across all seven operations. See [[docs/TEST_EVIDENCE]]; external review and partner exchange remain explicitly pending. Proposed numerical targets retain proposed status.

## Sources and delivery

- [[docs/00_PRD#9. Non-functional requirements]]
- [[docs/01_SRD]]
- [[docs/07_TEST_PLAN]]
- [[memory/Issues/TRN-20]]
- [[memory/Issues/TRN-15]]
- [[memory/Issues/TRN-17]]
- [[memory/Requirements/Index]]
