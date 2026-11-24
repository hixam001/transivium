---
id: "doc-readme"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Transivium

**Finite Automata & Transducer Simulation Studio**\
Construct. Convert. Simulate. Verify.

> Documentation baseline v0.1 — proposed implementation. This package contains specifications and guides, not runnable application source. No test or release is represented as complete.

Transivium is an interactive Theory of Automata university project for constructing, simulating and converting DFA, NFA, ε-NFA, Mealy and Moore machines. Its signature feature is DFA-to-regular-expression export with exact language-equivalence verification and an exchange format for an independent simulator.

## Project memory and implementation backlog
Open this repository folder as an Obsidian vault and start at [[memory/Home]]. See [[memory/Issues/Backlog]] for Jira-style stories and CSV import guidance, [[memory/Requirements/Index]] for requirement traceability, and [[memory/Handoffs/Current]] for the next task. Follow [AGENTS.md](AGENTS.md) for the memory-first workflow. Validate with `python3 scripts/memory.py refresh` then `python3 scripts/memory.py check`.

## Planned features
- Visual graph and transition-table editor; formal validation.
- Step-by-step simulations for all five machine kinds.
- ε-NFA → NFA, NFA → DFA, ε-NFA → DFA, DFA minimization, Mealy ↔ Moore.
- DFA → formal regex with independent reconstruction and exact equivalence check.
- Acceptor equivalence and shortest distinguishing string.
- Verified regex copy/download with declared alphabet and canonical minimal DFA.
- Optional after P0: machine JSON import/export and session history.

## Proposed stack
React + TypeScript + Vite + React Flow; Python + FastAPI + Pydantic; pytest and frontend test tooling. Local stateless backend, no accounts or database. Exact dependency versions and platform prerequisites to be pinned during implementation.

## Quick start (planned, after scaffold exists)
See [Setup Guide](docs/SETUP_GUIDE.md) for prerequisites, commands and configuration. Once source and dependency manifests exist, install backend requirements in a virtual environment and frontend dependencies via npm, then run local API and Vite in separate terminals. The current documentation-only package does not include those manifests or services, so these commands cannot run yet.

## Documentation index
| Document | Purpose |
|---|---|
| [PRD](docs/00_PRD.md) | Product scope, personas, metrics, acceptance criteria |
| [SRS / SRD](docs/01_SRD.md) | Concise engineering requirements baseline |
| [SAD](docs/02_SAD.md) | Architecture, responsibilities, decisions and risks |
| [Data Model](docs/03_DATA_MODEL.md) | Versioned machine, trace and result schemas |
| [API Contract](docs/04_API_CONTRACT.md) | Endpoints, errors and limits |
| [Algorithm Specification](docs/05_ALGORITHMS.md) | Formal methods, regex exchange grammar, verification |
| [Project Plan](docs/06_PROJECT_PLAN.md) | Scope, milestones, Jira-style work breakdown and budget |
| [Test Plan](docs/07_TEST_PLAN.md) | Planned test cases and release gates |
| [Application Flow](docs/APP_FLOW.md) | Navigation, screens, state and recovery |
| [Setup Guide](docs/SETUP_GUIDE.md) | Installation and configuration target |
| [User Guide](docs/USER_GUIDE.md) | Learner and instructor usage, demo |
| [Maintainer Guide](docs/ADMIN_GUIDE.md) | Local operator responsibilities and troubleshooting |
| [Changelog](CHANGELOG.md) | Documentation baseline and future release tracking |
| [Contributing](CONTRIBUTING.md) | Development and review workflow |

## Correctness promise and limitation
A verified regex denotes exactly the language of the input DFA over its declared alphabet. The external simulator's minimal complete DFA over the same alphabet is unique up to renaming, assuming correct reconstruction. Arbitrary state labels, unreachable states, redundant states and layouts cannot be recovered from a regex alone. See the algorithm specification for the exchange contract.

## Contributing
Follow [CONTRIBUTING.md](CONTRIBUTING.md). Review PRD/SRD and ADRs before implementation, keep formal model and API consistent, and attach reproducible tests. Do not claim passing tests without evidence. License remains [DECIDE]. Use the configured Git author without adding contributor attribution.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
