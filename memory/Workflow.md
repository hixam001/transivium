---
id: "workflow"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
---

# Task and memory workflow

## Vault conventions

Open the repository root as the vault. `docs/` holds canonical specifications; `memory/Requirements/` links every FR/NFR to delivery issues; `memory/Issues/` holds Jira-style issue notes; `memory/Decisions/` distinguishes required semantics from proposals; `memory/Handoffs/` captures task state; `memory/Sessions/` stores curated closeouts. Shared Obsidian graph settings are versioned; local workspace/plugins/caches and raw inboxes are ignored.

Every note uses frontmatter with id, type, status, created, updated, confidence, source and tags. IDs are unique within the vault. Use root-relative wikilinks with optional heading/alias. Keep canonical notes concise, traceable and linked. Never copy raw transcripts, credentials, caches or full third-party articles into memory. Mark obsolete notes superseded/archived and link replacements instead of deleting history.

## Required lifecycle

1. Read [[memory/Home]], [[memory/Project]], [[memory/Handoffs/Current]], decisions, selected issue and relevant sources. Check Git status and implementation evidence; note coverage gaps.
2. Before implementation, create a handoff from [[memory/Templates/Task-Handoff]], capturing the actual read set, scope, acceptance, plan, risks and next actions. Point Current at it.
3. Implement only the selected task; keep issue dependencies, formal conventions and draft safety intact.
4. Verify implementation, update issue status only with evidence, update project/decisions/docs as needed, and close the handoff. Add one curated session note for significant work.
5. Run the documentation safety suite:

```bash
python3 scripts/memory.py refresh
python3 scripts/memory.py check
python3 -m unittest discover -s scripts -p 'test_*.py' -v
```

The checker validates frontmatter, privacy patterns, wikilinks, FR/NFR coverage, issue references, prerequisite cycles, and generated graph/CSV freshness. It does not validate runtime correctness or stakeholder approval. Run application checks appropriate to the task once the scaffold exists.

The optional installed skill privacy check is:

```bash
python3 /home/hixam/.codex/skills/obsidian-memory-closeout/scripts/secret_scan.py README.md AGENTS.md CONTRIBUTING.md CHANGELOG.md docs memory scripts
```

The portable repository checker includes equivalent secret-pattern checks. Inspect the actual staged files and diff as well; automated scans are not proof of absence of sensitive data.

6. Stage explicit task-owned paths, inspect `git diff --cached --stat` and `git diff --cached --check`, commit on main with the configured identity and no added contributor attribution, and push normally. Verify the remote. If rejected, keep the handoff accurate and report the blocker; never force-push.

## Graph and Jira outputs

`refresh` derives `memory/Generated/graph.json` and `memory/Generated/jira-import.csv` from canonical Markdown in README/AGENTS/CONTRIBUTING/CHANGELOG/PRODUCT/DESIGN, docs and memory. No timestamps or machine-specific absolute paths enter generated outputs. Obsidian builds its native graph live from wikilinks. [[memory/Issues/Backlog]] explains Jira import field mapping and relationship limitations.

## Links

- [[AGENTS]]
- [[memory/Decisions/Working-Agreement]]
- [[memory/Templates/Jira-Issue]]
- [[memory/Home]]
