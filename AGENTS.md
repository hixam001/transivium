---
id: agent-task-contract
type: reference
status: active
created: 2026-11-24
updated: 2026-11-24
confidence: high
source: user-working-agreement
tags: [transivium, workflow]
---

# Transivium task contract

This repository is an Obsidian-compatible Markdown vault and the application repository. The vault root is this directory. Follow the user's memory-first workflow on every meaningful task.

## Start every task

1. Read [[memory/Home]], [[memory/Project]], [[memory/Workflow]], [[memory/Handoffs/Current]], and [[memory/Decisions/Working-Agreement]]. Follow their links to the selected issue, requirements, decisions, and latest relevant session. Search memory for the issue ID and affected components. Treat archived/superseded notes as historical context.
2. Inspect Git status and relevant application/documentation sources. Memory summarizes evidence; source files and executed checks determine current implementation truth. Note missing coverage or conflicts before relying on assumptions.
3. **Before implementation**, create or update `memory/Handoffs/<issue-key>.md` with the read set, current state, scope, acceptance criteria, plan, risks and next steps. Link it from `memory/Handoffs/Current.md`. Keep one current handoff; retain completed handoffs as history.
4. Implement the selected task. Do not mark other backlog work complete or implement deferred P1/P2 work implicitly. Preserve source machines on errors and certify language/output equivalence only with exact checks.

## Close every implemented task

1. Run appropriate implementation checks; record commands, outcomes and limitations. Application tests that have not run stay NOT RUN.
2. Update the issue, curated project memory, relevant docs/decisions, and task handoff. Write a linked session summary for significant work. Never store raw conversations, credentials or noisy logs.
3. Run `python3 scripts/memory.py refresh` and `python3 scripts/memory.py check`. Follow privacy checks in [[memory/Workflow]]. Markdown notes are canonical; CSV and graph JSON are derived.
4. Inspect `git status`, stage only task-owned files with explicit paths, and inspect the staged diff. Never include local agent installs, secrets, unexpected deletions, or unrelated changes.
5. User authorization: add, commit and push each implemented task to **main**, without adding a contributor or `Co-authored-by` trailer. Use the existing configured Git identity. Do not change attribution, force-push, bypass branch protection, or erase others' work. If remote main has advanced, reconcile safely; if rejected or unavailable, report the precise blocker and retain a concrete handoff.
6. Push normally with `git push origin main` and verify the remote commit. Report what changed, checks, remaining work and push status. Avoid a second commit solely to record its own commit hash; Git history is the publication record.

## Memory skill

Use `obsidian-memory-closeout` when available, installed from https://github.com/Nova1390/obsidian-memory-closeout/tree/main/skill/obsidian-memory-closeout. It is available on the next turn after installation. The repository workflow remains usable without the global skill installation. Existing TRN-01–17 keys and FR/NFR/TC identifiers must remain stable.
