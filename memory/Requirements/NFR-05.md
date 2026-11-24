---
id: "nfr-05"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
requirement_id: "NFR-05"
priority: "P0"
implementation_status: "Not implemented"
test_status: "NOT RUN"
owners: ["TRN-24", "TRN-15", "TRN-17"]
tests: ["TC-29", "TC-31"]
---

# NFR-05 — Reliability

## Requirement

Reliability

## Acceptance criteria

conversions never overwrite source silently; errors preserve draft; repeated identical operations deterministic in ordering where specified.

Success measure: Release evidence in docs/07_TEST_PLAN.md.

## Verification and scope

Planned evidence: TC-29, TC-31. Application test status: **NOT RUN**.
Priority P0; P1 begins only after the P0 release gate; P2 remains deferred.
The requirement is documented, not implemented. Proposed numerical targets retain proposed status.

## Sources and delivery

- [[docs/00_PRD#9. Non-functional requirements]]
- [[docs/01_SRD]]
- [[docs/07_TEST_PLAN]]
- [[memory/Issues/TRN-24]]
- [[memory/Issues/TRN-15]]
- [[memory/Issues/TRN-17]]
- [[memory/Requirements/Index]]
