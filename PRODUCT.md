---
id: "product"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "implementation-and-executed-checks"
tags: ["transivium", "reference"]
---

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

University students constructing and inspecting finite automata; instructors demonstrating formal computations. Based on the supplied PRD/SRS, not a new interview.

## Product Purpose

Construct DFA/NFA/epsilon-NFA/Mealy/Moore machines, observe execution and conversions, and export independently verified regular expressions with declared alphabets.

## Operating Context

Local browser and stateless local FastAPI service. In-memory drafts may be lost on refresh. No accounts, cloud persistence or public deployment. User instructed continuous implementation without stopping for task approval; design details not specified by the PRD are implementation assumptions, not claimed user preferences.

## Capabilities and Constraints

Exact product search proves language equality; post-input outputs define transducer equivalence. Graph and keyboard/table editor share one draft. Preserve source and invalidate stale results. P1/P2 remain deferred.

## Evidence on Hand

Canonical specifications and ten JSON fixtures. No partner signoff, completed usability study or software release claims.

## Accessibility & Inclusion

Keyboard editing, visible focus, text/table alternative, reduced motion and textual outcomes.

## Links

- [[docs/00_PRD]]
- [[docs/APP_FLOW]]
- [[memory/Issues/TRN-04]]
