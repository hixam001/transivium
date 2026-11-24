---
id: "doc-user-guide"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# User Guide — Transivium

Version 0.1 | Local P0 release candidate. All five machine kinds and seven operations are available; Machine files and session history are available. See [[docs/TEST_EVIDENCE]] for validation and known limitations.

## 1. Start and choose a machine
Open the local application after setup. `/` and `/editor` open the workspace with the Ends in 01 example. Use the sidebar examples or the Machine type selector to choose a type: DFA (one next state per symbol), NFA (multiple or absent next states), ε-NFA (NFA plus non-consuming epsilon moves), Mealy (outputs on edges), Moore (outputs on states). No registration or login required. The editor holds a single working draft in memory; refresh may lose work. Machine files let you keep and reopen a validated model.

## 2. Build a machine
1. Set input alphabet using unique single ASCII letters/digits (e.g. 0,1). For transducers also define nonempty output alphabet.
2. Add states and choose exactly one start. For acceptors, mark final states (can be none). For Moore, assign each state's output.
3. Connecting diagram state handles adds an edge for the first declared input symbol (and first output for Mealy). Use the transition table to choose destinations for every symbol, including epsilon for ε-NFA, and edit Mealy edge outputs. For Mealy, specify each edge's output. Only ε-NFA permits epsilon transitions. Large tables offer state pages and a **Jump to state** selector.
4. Check completeness for DFA/transducers: every state needs exactly one destination per symbol. Add sink explicitly where appropriate. NFA may omit edges.
5. Select Validate. Resolve reported issues before running. Graph and table reflect the same machine; coordinates do not affect results.

## 3. Simulate
Enter a string of allowed symbols without spaces, or choose empty input. Click Run. Use Next, Previous, Play/Pause, Reset to inspect the initial configuration and each consumed symbol. DFA displays one active state; NFA/ε-NFA displays sets and closures. If no branches remain, the machine rejects after all input. Acceptance occurs only after full input, even if a final state appears earlier. Moore shows initial output separately; use normalized outputs for comparison with Mealy. A transducer does not report accepted/rejected.

## 4. Convert and compare
Choose a compatible operation in Conversion: ε-NFA → NFA, NFA → DFA, ε-NFA → DFA, minimize DFA, Mealy → Moore, Moore → Mealy, DFA → regex. Inspect derivation and exact verification status. Adopt a machine result only if you want to replace draft; otherwise leave source intact. For equivalence, open Compare and supply two acceptors over the same alphabet. A negative result gives shortest distinguishing input and each outcome; ε means the empty string, not a literal symbol. Limits/errors are not equivalence results.

## 5. Signature demo: DFA → regular expression
Build this DFA (alphabet 0,1; start q0; only final q2):
| State | 0 | 1 |
|---|---|---|
| → q0 | q1 | q0 |
| q1 | q1 | q2 |
| * q2 | q1 | q0 |

Run `101` (accept), `10` (reject) and empty input (reject). Select DFA → Regex. Inspect GNFA elimination steps and independent verification. A possible equivalent regex is `(0|1)*01`; actual emitted text may differ. Copy verified expression and separately share alphabet `{0,1}` or download JSON containing both and canonical minimal DFA. In the other team's simulator, use agreed syntax and same full alphabet, reconstruct, complete and minimize. Compare resulting minimal state structure (three states in this example) independent of state names. If the external tool does not minimize, more states may be correct. Transivium cannot guarantee the external implementation.

Regex syntax: `|` union, juxtaposition concat, `*` star, parentheses grouping, `ε` empty string, `∅` empty language. No whitespace or programming-specific regex extensions. If export verification fails or is stale, correct/retry; never share it as verified.

## 6. Transducer demo
Build Mealy with a single start state s, input/output alphabets 0,1; loop on 0 emitting 1 and on 1 emitting 0. Run 0101 → 1010. Convert to Moore and run same input. The full Moore output includes an arbitrary initial output (chosen deterministically); normalized output is 1010. For empty input, Mealy emits nothing, Moore emits initial output only; normalized streams are empty.

## 7. Errors and limitations
- Invalid machine or symbol: read field-specific errors, fix and validate. Invalid input is not a language rejection.
- Resource cap/deadline: reduce states, alphabet or input; no successful certified result from partial work.
- API offline: editing may continue in loaded UI; run/convert require API. Start service and retry.
- Changed draft: earlier trace/export is stale; rerun before adopting/exporting.
- No account, cloud save, PDA, CFG or Turing machine support.
- Use table/forms if graph interaction is difficult; keyboard controls, visible focus and text statuses are implemented and acceptance-tested.

## 8. Reuse machines and runs

Under **Machine files**, validate the draft and download its JSON. To reopen a file, choose it, review the preview and confirm replacement. The file retains the machine and any saved graph coordinates.

**Run history** keeps the latest 20 completed simulations in this browser session. Select a run to replay its original input and trace. Runs from earlier revisions carry a label. Refreshing clears session history.

## 9. Save projects and practice

In **Projects and examples**, validate the current machine, enter a name and save. To reopen it after a refresh, select the saved project, choose **Open project** and confirm replacement. Saving under an existing name or deleting a project asks for confirmation.

Projects stay in this browser and are subject to its storage settings. You can save up to 12 projects. Download JSON to keep a portable copy. The practice selector offers guided examples for minimization, regex export, language comparison and parity.

## 10. Arrange and download diagrams

Choose a grid, row or circle in **Layout preset**, then select **Apply layout**. Moving states leaves the machine's transitions and validation intact. **Undo edit** and **Redo edit** step through up to 30 editor changes. Undoing or redoing a formal edit clears validation and any trace from the previous revision.

**Download SVG** produces a scalable diagram. **Download PNG** produces a raster image up to 4,096 pixels per side. The images include state labels and transition symbols, plus outputs for transducers.

## 11. Support
Report issue with application version/commit, operation, minimal reproducible machine and input, expected vs actual outcome, request ID if shown. Do not send credentials or unnecessary personal data. Local operator guide covers startup issues.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
