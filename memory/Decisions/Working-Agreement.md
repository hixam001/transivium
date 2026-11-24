---
id: "working-agreement"
type: "decision"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "decision"]
decision: "Repository-root Obsidian vault and memory-first delivery to main"
alternatives: ["Separate vault", "Unlinked session logs", "Feature branches per original guide"]
reason: "Explicit user direction; portable inspectable memory"
---

# Memory and delivery working agreement

## Decision

The user explicitly requested repository-local Markdown memory and documentation in Obsidian format. Read relevant memory at the start of every task, write a pre-implementation handoff into memory, implement the task, update curated memory and documentation, then add, commit and push task-owned files to main. Do not add a contributor, change attribution or append a Co-authored-by trailer. Use the existing Git identity.

## Reason and alternatives

Linked Markdown keeps task context, requirements, decisions and handoffs inspectable in version control and in Obsidian's graph. Repository-root vault avoids copying source documentation into a separate database or vault. Separate feature branches from the original contribution guide are superseded for this user's workflow; peer review and evidence requirements still apply.

## Consequences

Stage explicit task paths, protect secrets and unrelated changes, never force-push, and report push failures or branch protection accurately. The user authorized ordinary main commits and pushes; do not ask again for routine authorized delivery. Do not promise automated future execution beyond these repository instructions.

## Links

- [[AGENTS]]
- [[memory/Workflow]]
- [[CONTRIBUTING]]
- [[memory/Home]]
