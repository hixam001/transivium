---
id: "home"
type: "project"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "project"]
goal: "Build a correct finite automata and transducer studio"
current_state: "Bounded formal regex AST, sound simplifier, precedence-aware deterministic serialization and GNFA elimination traces implemented. No regex export is certified or exposed yet."
next_actions: ["TRN-11"]
---

# Transivium memory home

## Read before work

1. [[memory/Project]] — current state and next actions.
2. [[memory/Workflow]] and [[memory/Decisions/Working-Agreement]] — required task lifecycle.
3. [[memory/Handoffs/Current]] — the active handoff and next implementation task.
4. [[memory/Issues/Backlog]] → selected issue → linked requirements, decisions and source documents.

## Knowledge graph

Open this repository folder as a vault in Obsidian, then use **Open graph view** or a note's local graph. Shared graph settings color requirements, issues, decisions, handoffs and documentation. Wikilinks/backlinks are the live graph; no community plugin is required. The Markdown sources remain usable without Obsidian.

For a portable deterministic graph export, run `python3 scripts/memory.py refresh`; `memory/Generated/graph.json` lists nodes and directed wikilink edges. `python3 scripts/memory.py check` checks that it matches the notes. The JSON is a derived artifact, not an Obsidian plugin or independent source of truth.

## Index

- [[README]]
- [[memory/Requirements/Index]]
- [[memory/Issues/Backlog]]
- [[memory/Decisions/Formal-Conventions]]
- [[memory/Decisions/Open-Decisions]]
- [[memory/References/Documentation-Review]]
- [[memory/Sessions/2026-11-24-Memory-Bootstrap]]
- [[memory/Templates/Task-Handoff]]
- [[memory/Templates/Jira-Issue]]

## Coverage

All baseline documents reviewed; 22 functional and 7 nonfunctional requirements linked. No prior memory was present. Runtime evidence is recorded per issue in [[memory/Project]]; external exchange remains NOT RUN.
