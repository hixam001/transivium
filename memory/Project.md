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
current_state: "Planning and memory ready; application not implemented"
next_actions: ["TRN-01 formal contracts", "TRN-02 scaffold"]
---

# Project state

## Context

Transivium is a university finite automata/transducer studio. P0 covers all five machine kinds, seven conversion/minimization operations, exact language equivalence with shortest witness, and independently verified DFA-to-regex export. P1 import/export and history follow P0; P2 persistence/library and advanced editing stay deferred.

## Current state

The initial repository contained specifications and guides only, no application source, manifests, executable tests or commits. This bootstrap adds an Obsidian vault, Jira-style requirements/backlog, repeatable validation and task instructions. It does not implement the application. No FR/NFR is marked delivered. The original proposed P0 estimate is 53 person-days, not an approved timeline.

## Durable decisions

- [[memory/Decisions/Working-Agreement]] — memory first, pre-implementation handoff, main commits/pushes, no added contributor.
- [[memory/Decisions/Formal-Conventions]] — exact formal language/output conventions.
- [[memory/Decisions/Open-Decisions]] — stack, capacity, deadline, exchange agreement, license and release decisions remain open.

## Next actions

1. Start [[memory/Handoffs/TRN-01]] and [[memory/Issues/TRN-01]]; record decisions/fixtures without inventing stakeholder approval.
2. Implement [[memory/Issues/TRN-02]] once its contract prerequisite is satisfied; pin and verify actual dependencies.
3. Follow [[memory/Issues/Backlog]]; close conversions only after exact verification integration.

## Evidence and limitations

Documentation checks are separate from application tests. TC-01–39 remain NOT RUN. External simulator exchange is untested. No user accounts, cloud DB, deployment or public regex-to-DFA studio are in scope. Proposed numerical limits need runtime testing and profiling.

## Links

- [[memory/Home]]
- [[memory/Handoffs/Current]]
- [[memory/References/Documentation-Review]]
- [[docs/00_PRD]]
- [[docs/02_SAD]]
