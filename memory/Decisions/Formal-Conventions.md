---
id: "formal-conventions"
type: "decision"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "decision"]
decision: "Preserve the baseline exact semantics"
alternatives: ["Sampling-only verification is incompatible with requirements"]
reason: "PRD/SRS formal correctness and interoperability requirements"
---

# Formal conventions

## Required outcomes

- Acceptors use one start, a possibly empty alphabet, total DFA transitions, and optional NFA edges. Epsilon is null on ε-NFA edges, never an input token.
- Mealy/Moore are complete deterministic machines with nonempty input/output alphabets. Compare post-input streams; show Moore's initial output separately.
- Acceptor equality requires identical declared alphabets and exact reachable product BFS. An empty witness [] differs from no witness null.
- Every successful conversion is exactly checked. Limits/deadlines fail explicitly; sampling never establishes equality.
- Regex export uses formal-v1 syntax, independent parsing of emitted text, Thompson reconstruction and exact comparison. Supply the full alphabet even if the expression omits symbols.
- Canonical references are reachable, minimal complete DFAs numbered by sorted-symbol BFS. Regex does not preserve arbitrary source labels, unreachable states or layout.

## Status and evidence

These conventions are stated requirements. Architecture choices implementing them remain proposed, not demonstrated correct. Read the linked algorithms and API before coding; test independently using hand-calculated fixtures.

## Links

- [[docs/01_SRD]]
- [[docs/02_SAD]]
- [[docs/03_DATA_MODEL]]
- [[docs/04_API_CONTRACT]]
- [[docs/05_ALGORITHMS]]
- [[memory/Issues/TRN-01]]
- [[memory/Decisions/Open-Decisions]]
