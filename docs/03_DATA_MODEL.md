---
id: "doc-03-data-model"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Data Model — Transivium

Version 0.1 | Proposed schema | No database in MVP

## 1. Formal machine (Machine)
A discriminated JSON union keyed by `kind`. The same model is used by the editor, API and optional machine export. Drafts may be incomplete; only valid machines execute. IDs are opaque, case-sensitive strings of 1–64 ASCII letters/digits/underscore/hyphen; labels are optional display strings ≤ 80 characters. State order in arrays is not semantically significant.

| Field | Type | Validation |
|---|---|---|
| `kind` | enum | `dfa`, `nfa`, `enfa`, `mealy`, `moore` |
| `alphabet` | string[] | unique single ASCII alphanumeric symbols; ≤ 16; empty allowed only for acceptors |
| `states` | State[] | 1–256; IDs unique |
| `startState` | string | existing state ID |
| `transitions` | Transition[] | ≤ 16,384; unique edges; endpoints exist |
| `finalStates` | string[] | required for acceptors only; unique existing IDs; may be empty |
| `outputAlphabet` | string[] | required for transducers only; 1–16 distinct ASCII alphanumeric symbols |

### State
`id: string`, optional `label: string`, `output: string` required for Moore only (member of outputAlphabet). No output field for other machine kinds.

### Transition
`from: string`, `to: string`, `symbol: string|null`, `output: string` required only for Mealy. `null` is epsilon, valid only for `enfa`; literal `ε` is not a JSON input symbol. For acceptors output fields are forbidden. DFA/transducers require exactly one transition per `(from,symbol)`, including sink transitions. NFA/enfa allow multiple distinct targets and absent edges. Duplicate identical edges rejected. Unknown fields rejected at API boundary.

### Example: complete DFA for binary strings ending in 01
```json
{
  "kind": "dfa", "alphabet": ["0", "1"],
  "states": [{"id":"q0"},{"id":"q1"},{"id":"q2"}],
  "startState":"q0", "finalStates":["q2"],
  "transitions":[
    {"from":"q0","symbol":"0","to":"q1"},
    {"from":"q0","symbol":"1","to":"q0"},
    {"from":"q1","symbol":"0","to":"q1"},
    {"from":"q1","symbol":"1","to":"q2"},
    {"from":"q2","symbol":"0","to":"q1"},
    {"from":"q2","symbol":"1","to":"q0"}
  ]
}
```

### Example: Mealy bit inverter
```json
{
  "kind":"mealy", "alphabet":["0","1"], "outputAlphabet":["0","1"],
  "states":[{"id":"s"}], "startState":"s",
  "transitions":[
    {"from":"s","symbol":"0","to":"s","output":"1"},
    {"from":"s","symbol":"1","to":"s","output":"0"}
  ]
}
```

## 2. Input and simulation trace
Input: `string[]` of length 0–512, each token belongs to input alphabet. UI plain text is split into characters; no silent whitespace trimming; blank means `[]`. Input `ε` typed as a literal is invalid (UI offers Empty input button).

| Field | Type | Notes |
|---|---|---|
| `steps` | Step[] | Exactly input length + 1 on success |
| `accepted` | boolean/null | Boolean for acceptor; null for transducer |
| `output` | string[]/null | Full output for transducer; null for acceptor |
| `normalizedOutput` | string[]/null | Post-input outputs for transducer, null otherwise |
| `initialOutput` | string/null | Moore initial output, null otherwise |

Step: `index: integer` (consumed count, starts 0), `symbol: string|null` (null at initial), `activeStates: string[]` (deterministic machine exactly one; nondeterministic may be empty), `movedStates: string[]|null` (pre-closure targets for enfa step, null otherwise; initial enfa step uses singleton start), `traversed: Transition[]` (symbol edges taken; initial empty), `epsilonTraversed: Transition[]` (closure-reachable epsilon edges visited once per step; empty for non-enfa), `outputPrefix: string[]|null` (full transducer prefix; null for acceptor). Empty active set persists across remaining symbols.

## 3. Conversion results
- `operation`: enum `enfa_to_nfa`, `nfa_to_dfa`, `enfa_to_dfa`, `minimize_dfa`, `mealy_to_moore`, `moore_to_mealy`, `dfa_to_regex`.
- `machine`: resulting Machine for machine conversions; null for regex export.
- `steps`: ordered DerivationStep[] (max 2,000), each `index: integer` starting 0, `phase: string`, `description: string`, `details: object` with operation-specific fields described in API contract.
- `verification`: `{equivalent: true, mode: "language"|"normalized_output", method: "product_bfs"}`; emitted only after exact successful check.
- `regexArtifact`: RegexArtifact for DFA-to-regex; null for other conversions.

RegexArtifact: `schemaVersion: 1`, `syntax: "formal-v1"`, `regex: string`, `alphabet: string[]` (sorted), `canonicalDfa: Machine` (minimal complete canonical reference). Outer verification applies to artifact; UI download envelope includes `verification` in addition to artifact. Metadata is not part of regex text. No external state-layout guarantee.

## 4. Equivalence result
`equivalent: boolean`, `counterexample: string[]|null`, `leftAccepts: boolean|null`, `rightAccepts: boolean|null`, `visitedPairs: integer`. If equal, witness and acceptance fields are null. If unequal, witness may be `[]`; acceptance fields differ. For transducer internal check, witness compares normalized output instead; public equivalence endpoint accepts acceptors only.

## 5. UI-only records
Draft: machine fields plus optional incomplete editing values; `revision: integer` increments on formal edit, `positions: Record<stateId,{x:number,y:number}>`, selection and transient issue flags. Not sent as Machine. Results bound to request revision. P1 `MachineFile` envelope: `{schemaVersion:1,machine:Machine,layout?:Record<stateId,{x:number,y:number}>}`; finite coordinates, known IDs only. P1 `HistoryEntry`: local ID, created timestamp, immutable source snapshot, input, trace. Retain up to 20 entries in current session; no backend record.

## 6. Invariants and access
- No users, roles, project tables or server persistence. All inputs are untrusted; validate server-side independently of UI.
- Formal machine names/labels, coordinates and array ordering never determine language equality.
- Canonical DFA: BFS from initial ID `q0`, visit outgoing symbols sorted ASCII; assign sequential `q1`, etc.; sort transitions by BFS state order then symbol, finals by BFS order. Omit display labels. Alphabet sorted.
- Requests and generated structures must meet limits in SAD/API; a failed operation cannot update the draft.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
