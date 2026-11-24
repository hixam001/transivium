---
id: "memory-handoffs-release-candidate"
type: "reference"
status: "superseded"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "implementation-and-executed-checks"
tags: ["transivium", "reference"]
---

# Local P0 release-candidate handoff

This is the historical P0 checkpoint. See [[memory/Handoffs/Release]] for the shipped version.

## Read before any next task

Read [[memory/Home]], [[memory/Project]], [[memory/Workflow]], [[memory/Decisions/Working-Agreement]], [[docs/TEST_EVIDENCE]] and the selected issue before implementation. Write its handoff first, verify and update memory, then commit/push main without contributor trailers.

## Delivered state

FR-01–18 and NFR-01–07 are implemented and internally evaluated. All five simulation kinds, seven exactly certified operations, public acceptor equivalence, shortest witnesses and independently reconstructed regex export are runnable. Source stays intact until explicit adoption. Full case matrix, performance and known limits: [[docs/TEST_EVIDENCE]]. Reproduce the HTTP demo using `python3 scripts/demo.py` against the local API.

## Verification

Hosted Verify run 45357991995 at 69645a6 passed: 169 backend, 17 component, 28 browser and nine script tests; lint, build, contracts and memory passed. TRN-17 adds guides, curated demo results and CI demo execution. Git history identifies publication; final CI status is available in GitHub Actions. Application changes were already covered; documentation/maintenance changes were checked locally.

## Remaining work

- Partner formal-v1 agreement and TC-35 exchange: NOT RUN. Fixtures/metadata ready; no authorization to contact the partner.
- Five-learner TC-39 study and independent formal-algorithm peer review: NOT RUN. Do not invent reviewers or completion rates.
- License, schedule/team and deployment governance: [[memory/Decisions/Open-Decisions]]. No v1.0 tag or public deployment.
- Optional P1 [[memory/Issues/TRN-16]] is eligible after this internal P0 gate but remains deferred until selected; P2 [[memory/Issues/TRN-18]] and [[memory/Issues/TRN-19]] stay deferred.

## Links

- [[memory/Handoffs/TRN-17]]
- [[memory/Issues/Backlog]]
- [[docs/SETUP_GUIDE]]
- [[docs/USER_GUIDE]]
