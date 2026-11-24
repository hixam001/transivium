---
id: "doc-contributing"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Contributing to Transivium

Workflow for the implementation repository. Read [AGENTS.md](AGENTS.md) and [[memory/Workflow]] first. The user-authorized main delivery workflow supersedes the original feature-branch default.

1. Choose a TRN issue in [Project Plan](docs/06_PROJECT_PLAN.md); link relevant FR/NFR and clarify acceptance criteria.
2. Read relevant memory and write a task handoff before implementation. Work on `main`, keep changes focused, and use commit messages such as `TRN-10: implement GNFA elimination`.
3. Implement core algorithms in pure engine modules; keep diagram/layout concerns in frontend. Do not use external automata conversion libraries in place of coursework algorithms without explicit scope approval.
4. Add tests for standard, empty, invalid and resource-bound cases. For language changes use exact equivalence and hand-calculated fixtures. For Mealy/Moore use normalized-output comparison. Test serialized regex via independent parser, not just AST.
5. Run actual checks ([Setup Guide](docs/SETUP_GUIDE.md)); attach commit/environment/results. Use NOT RUN if not executed.
6. Record review evidence, scope, tests, known risks and screenshots for visual changes. Require peer review for formal algorithms and exchange contract changes. Stage task-owned files, commit with the configured identity and no added contributor/Co-authored-by attribution, then push normally to `main`; preserve remote protection rules.
7. Update docs in same PR when changing API, schemas, semantics, UI flow, requirements or limits; note changes in Unreleased CHANGELOG.

Never commit secrets, venv, node_modules, generated build outputs or private data. Use dependency lockfiles and documented setup. License and branch protection settings are [DECIDE].

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
