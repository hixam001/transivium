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

## [Unreleased] — local P0 release candidate, 2026-11-24

- Implemented all five machine kinds, seven exactly certified operations, step playback, shortest language witnesses and independent serialized-regex reconstruction/verification.
- Added responsive graph/table editing, explicit adoption, stale-response and navigation protection, request IDs and recoverable diagram/route loading errors.
- Added strict typed request/response schemas, bounded JSON/algorithm/trace/regex work, deterministic results and exact contract drift checks.
- Added generated Jira-style requirement coverage, Obsidian memory/handoffs/graph, pinned setup, read-only CI, performance measurements and a reproducible HTTP demonstration.
- Verified engine/API, components, browser workflows, accessibility scans and fresh setup; full counts/case mapping are in [[docs/TEST_EVIDENCE]].
- Pending: independent peer review, external simulator agreement/exchange, five-learner study, license and actual schedule decisions. No v1.0 tag or public deployment is claimed.
- Added versioned machine JSON, session run history, named browser projects, practice examples, layout presets, undo/redo and SVG/PNG export.

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
