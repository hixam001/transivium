---
id: "project"
type: "project"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "project"]
goal: "Verified educational automata workflows"
current_state: "Strict schemas, all-five-kind semantic validation, input guards, shared budgets and bounded HTTP/error boundary implemented. Generated machine JSON Schema added."
next_actions: ["TRN-04"]
---

# Project state

## Context

Transivium is a university finite automata/transducer studio. P0 covers all five machine kinds, seven conversion/minimization operations, exact language equivalence with shortest witness, and independently verified DFA-to-regex export. P1 import/export and history follow P0; P2 persistence/library and advanced editing stay deferred.

## Current state

The initial repository contained specifications and guides only, no application source, manifests, executable tests or commits. The Obsidian vault and formal fixtures are implemented; application implementation progress and actual evidence are recorded below. No full release is claimed. The original proposed P0 estimate is 53 person-days, not an approved timeline.

## Durable decisions

- [[memory/Decisions/Working-Agreement]] — memory first, pre-implementation handoff, main commits/pushes, no added contributor.
- [[memory/Decisions/Formal-Conventions]] — exact formal language/output conventions.
- [[memory/Decisions/Open-Decisions]] — stack, capacity, deadline, exchange agreement, license and release decisions remain open.

## Next actions

1. Follow the active [[memory/Handoffs/Current]] and latest implementation progress below.
2. Use the pinned scaffold and formal fixtures; do not invent stakeholder approval.
3. Follow [[memory/Issues/Backlog]]; close conversions only after exact verification integration.

## Evidence and limitations

Documentation checks are separate from application tests. Full TC-01–39 workflow completion is tracked in the test plan and individual issues; unit checks alone do not establish full-case acceptance. External simulator exchange is untested. No user accounts, cloud DB, deployment or public regex-to-DFA studio are in scope. Proposed numerical limits need runtime testing and profiling.

## Links

- [[memory/Home]]
- [[memory/Handoffs/Current]]
- [[memory/References/Documentation-Review]]
- [[docs/00_PRD]]
- [[docs/02_SAD]]

## Implementation progress

- [[memory/Issues/TRN-01]]: Formal contracts and ten reference fixtures implemented; architecture selected for local implementation, with partner agreement explicitly pending. Next: [[memory/Issues/TRN-02]].

- [[memory/Issues/TRN-02]]: Runnable React/Vite and FastAPI scaffold implemented with exact package pins and lockfile, local proxy and health endpoint. Next: [[memory/Issues/TRN-03]].

- [[memory/Issues/TRN-03]]: Strict schemas, all-five-kind semantic validation, input guards, shared budgets and bounded HTTP/error boundary implemented. Generated machine JSON Schema added. Next: [[memory/Issues/TRN-04]].
