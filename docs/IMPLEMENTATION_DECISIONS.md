---
id: "docs-implementation_decisions"
type: "decision"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "implementation-and-executed-checks"
tags: ["transivium", "decision"]
---

# Implementation decisions

## Selected for local implementation

React + TypeScript + Vite with @xyflow/react for the graph; Python 3.12+ with FastAPI and Pydantic v2; pytest for engine/API tests, Vitest/Testing Library for components and Playwright for browser flows. The current build host is Python 3.14.10, Node 26.13.1 and npm 12.2.3; exact packages and lockfiles are pinned and tested at TRN-02. No database, accounts or external runtime services.

Pure functions implement the coursework algorithms. Generation and independent text parsing/Thompson reconstruction are separate modules. One request owns a shared cooperative budget across conversion and verification; a failure returns no certified artifact. Model JSON is shared through generated backend OpenAPI plus matching frontend types; incomplete editor drafts are intentionally broader than validated API models.

## Contract artifacts

`contracts/formal-v1.json` records syntax, conventions and bounded operation targets. `contracts/fixtures/*.json` supplies D01–D06/N01/E01/M01/O01, sample expectations and minimal/equivalent references. D02 includes both an unreachable state and a reachable duplicate of q0; it must minimize to three states.

## Review status

These are implementation choices under the user's instruction to start work, not claimed stakeholder or partner signoff. Formal conventions remain mandatory. External syntax agreement, demonstration and the five-learner usability study remain pending. Staffing/deadline and license do not block local coding. Runtime caps and measured reference latency are verified in [[docs/TEST_EVIDENCE]]. Human peer review remains pending.

## Upstream references

- [Vite prerequisites](https://vite.dev/guide/)
- [React Flow installation](https://reactflow.dev/learn)
- [FastAPI runtime support](https://github.com/fastapi/fastapi/blob/master/pyproject.toml)

## Links

- [[docs/02_SAD]]
- [[docs/03_DATA_MODEL]]
- [[docs/05_ALGORITHMS]]
- [[memory/Decisions/Formal-Conventions]]
- [[memory/Issues/TRN-01]]
