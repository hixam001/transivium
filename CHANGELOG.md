---
id: "doc-changelog"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Changelog — Transivium

Track actual changes here; planned functionality is not a released feature.

## [Unreleased]
- Implemented: certified acceptor conversions/minimization, shortest distinguishing strings, bounded GNFA regex generation and independent parser/Thompson exact export verification.
- Implemented: strict machine validation, bounded API errors, responsive five-kind graph/table editor, and DFA/NFA/epsilon-NFA simulation with finite closure traces.
- Added: repository-root Obsidian vault, linked FR/NFR requirement notes, Jira-style backlog/export, task handoffs, decision memory and deterministic documentation checks.
- Changed: contribution workflow now reads memory, writes a pre-implementation handoff, and commits/pushes task-owned changes to main without added contributor attribution.
- Clarified: exact verification integration dependencies and P1 gate; application remains unimplemented and application tests remain NOT RUN.
- Planned: implementation scaffold, formal machine models, editor, all five simulation types, required conversions, exact equivalence, verified DFA-to-regex export.
- Planned: test execution, UI integration, local setup verification, cross-team regex exchange demonstration.
- Decisions pending: final stack/dependency versions, team capacity/deadline, exchange syntax agreement, deployment policy, license.

## [0.1-docs] — 2026-11-24
Documentation baseline only.

### Added
- PRD and SRS, architecture and design, data model, API contract, formal algorithm/interoperability specification.
- Relative project plan with Jira-style backlog, proposed test cases, application flows.
- README, proposed setup, user and maintainer guides, contribution workflow.

### Clarified
- Successful DFA-to-regex exports must be verified for exact language equality. Structural equality requires minimal complete DFAs over the same alphabet and is up to renaming.
- Moore initial output excluded from Mealy/Moore normalized equivalence.

### Known limitations
- Application source is not included; tests have not been executed. No v1.0 software release or external simulator compatibility test is claimed.

## Future release entry template
`[version] — YYYY-MM-DD`: Added / Changed / Fixed / Removed / Security / Known limitations / Test evidence. Publish only for actual changes.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
