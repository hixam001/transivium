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
| Stack/runtime | React/TypeScript/Vite/React Flow and Python/FastAPI/Pydantic selected for implementation | Versions pinned and fresh setup/CI verified; no stakeholder approval invented |
| Engine design | Pure coursework algorithms; independent parser/Thompson implemented | Automated gate passed; independent human review pending |
| External exchange | formal-v1 grammar and fixtures documented; partner agreement absent | Track agreement and external test separately; do not contact others without authorization |
| Schedule/capacity | Relative six weeks and 53 P0 person-days proposed | Confirm team size/deadline; no invented dates or assignees |
| Resource limits | SAD/API caps enforced; API/browser measurements recorded | Retain limits and reference-workload caveats; see [[docs/TEST_EVIDENCE]] |
| Release policy | User requested GitHub Releases for the local application | Versioned MIT source release under TRN-28 |
| Governance | MIT license selected under delegated user authorization | Keep normal main pushes subject to remote rules |
| P2 scope | FR-21/22 implemented and verified | See [[memory/Issues/TRN-18]] and [[memory/Issues/TRN-19]] |
| Verification dependency | Shared checker implemented in TRN-07 | TRN-08/09 and integration gates pass; preserve independent text verification |

## Links

- [[docs/00_PRD]]
- [[docs/02_SAD]]
- [[docs/06_PROJECT_PLAN]]
- [[memory/Issues/Backlog]]
- [[memory/Handoffs/TRN-01]]
- [[memory/Project]]
