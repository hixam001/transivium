---
id: "open-decisions"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
---

# Open decisions and blockers

## Pending decisions

| Area | Current evidence | Next action |
|---|---|---|
| Stack/runtime | React/TypeScript/Vite/React Flow and Python/FastAPI/Pydantic selected for implementation | TRN-02 pins and tests versions; no stakeholder approval invented |
| Engine design | Pure coursework algorithms; independent parser/Thompson design proposed | Implement and test; retain exact verification requirement |
| External exchange | formal-v1 grammar and fixtures documented; partner agreement absent | Track agreement and external test separately; do not contact others without authorization |
| Schedule/capacity | Relative six weeks and 53 P0 person-days proposed | Confirm team size/deadline; no invented dates or assignees |
| Resource limits | SAD/API caps proposed; no profiling | Test boundaries and latency on recorded hardware |
| Release policy | Local stateless MVP, no public deployment | Separate decision/review if public hosting is requested |
| Governance | License and branch protection unspecified | Resolve before a release; follow authorized normal main pushes subject to remote rules |
| P2 scope | FR-21/22 have no detailed tests or estimates | Keep deferred; elaborate only when authorized |
| Verification dependency | TRN-07/08 need downstream TRN-09 for completion | Build primitives first; integrate exact checker before closing conversions |

## Links

- [[docs/00_PRD]]
- [[docs/02_SAD]]
- [[docs/06_PROJECT_PLAN]]
- [[memory/Issues/Backlog]]
- [[memory/Handoffs/TRN-01]]
- [[memory/Project]]
