---
id: "doc-app-flow"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Application Flow — Transivium

Version 0.1 | Core editor/help/compare routes implemented through TRN-12; the flow below remains the release acceptance target. No accounts.

## 1. Entry points
Direct local URL `/` opens welcome screen with machine choices and demo examples. `/editor`, `/compare`, `/help` are direct routes. A refresh/revisit opens a new in-memory session unless P1 file import is used. No email notifications, OAuth, search indexing, marketing or account onboarding in MVP. Local maintainer starts services outside app.

## 2. Core user flows
### Flow A — Create/edit/validate machine
| Step / screen | Action and UI | System response / validation | Next |
|---|---|---|---|
| 1 Home | Select DFA/NFA/ε-NFA/Mealy/Moore | Initialize draft; explain chosen model | Editor |
| 2 Editor | Define alphabet, add named states, set start and finals or output alphabet/state outputs | Form checks symbols and IDs; draft may be incomplete | Editor |
| 3 Editor | Draw edge or edit table cell, add symbol/output | Update single draft, table and graph; warn on illegal edge | Editor |
| 4 Editor | Click Validate | API validates; issues link to fields; mark valid only if complete | Editor ready |
| 5 Editor | Select Simulate/Convert | Enabled when valid current revision; revalidate on server | Panel |
Success: all required fields supplied, graph and table agree. Errors: malformed fields highlight; API offline shows retry; draft preserved. Delete referenced state with explicit confirmation and clear dependent refs. Change machine kind or adopt conversion with unsaved edits: confirm before replacing. Leaving route warns about unsaved draft; full refresh loses P0 session.

### Flow B — Simulate
| Step | Action | Response |
|---|---|---|
| 1 Editor/Simulation | Enter text or choose empty input; click Run | Validate tokens, snapshot revision, show loading |
| 2 Trace | Backend returns result | Render initial state(s), closure/move edges, output where applicable |
| 3 Trace | Next, Previous, Play/Pause, Reset | Move trace cursor locally; show consumed index and current configuration |
| 4 Result | Reach final step | Display accepted/rejected for acceptor or output stream for transducer; Moore initial output clearly separate |
Invalid symbol: show exact invalid token, no language result. Empty active set: continue to final step, reject. Timeout/offline: retry/reduce input; no result label. Edit mid-request: revision mismatch discards response and resets current trace; cancel playback on route exit. Empty input trace contains only initial config.

### Flow C — Convert/minimize
Choose allowed operation from source kind; snapshot and submit. Show processing, then source/result diagrams with trace (closures, subsets, partitions or transducer mappings), verification indicator and explicit Adopt Result. Adopt updates draft only after confirmation; cancel/back keeps source. If resource limit, show typed error and suggestion to reduce machine; no partial certified output. Repeated clicks disabled while pending; late response discarded on revision change. For empty work, still show verification/initial step.

### Flow D — DFA-to-regex and external exchange
1. From valid DFA, select DFA → Regex; show formal syntax help and same-alphabet/minimal-DFA caveat.
2. Compute minimized source, GNFA steps and verification on backend; show loading.
3. Display verified expression, alphabet, elimination trace and canonical minimal DFA only on success.
4. Copy plain regex or download UTF-8 JSON artifact; show copy/download feedback (handle clipboard denied with selectable text).
5. User manually gives regex and declared alphabet to external simulator. It is outside Transivium's navigation; external structure comparison requires minimization and same alphabet.
Errors: unverified, limit or mismatch → error, no enabled verified export. If source edited, old artifact marked stale and disabled until rerun; source unchanged. No external network integration.

### Flow E — Compare acceptors
Open Compare, select/edit two acceptor snapshots (can copy current draft to either side; second side editable). Display each alphabet and validation status. Compare enabled only for valid acceptors with same alphabet set. On result, equivalent=true displays exact product check; false displays shortest witness, including ε for [] and both acceptance outcomes. Allow run witness on each side using simulation endpoint. Errors: invalid machines or alphabet mismatch require correction; no witness if computation failed. Editing either invalidates result. Back retains current editor draft in same session.

### Flow F — P1 reuse (not release blocker)
Import versioned JSON via file chooser, validate schema and machine; show preview, then confirm replace. Export current valid machine to JSON. Open recent history entry using immutable source snapshot; do not overwrite active draft. Reject oversized/invalid/unsupported files; cancel preserves draft. No account management or admin UI.

### Flow G — Recover from failures
On connection error, show disconnected message and retry; no successful state until actual response. Invalid machine keeps issues visible and focus links to editor; correct and rerun. Deadline/limit advises smaller model. Internal error shows request ID and retry; maintainer can inspect sanitized logs. Back/route changes stop playback; pending requests may complete but stale responses ignored. No session expiry because no authentication.

## 3. Navigation map
```text
/ Home [local/public]
├── /editor [local/public]
│   ├── Machine editor + transition table
│   ├── Simulation panel
│   ├── Conversion panel → regex export panel (DFA only)
│   └── Import/export & history (P1)
├── /compare [local/public] ↔ editor snapshots
└── /help [local/public] → syntax, conventions, limitations
```
Local/public means any user of running local instance, not internet-hosted. Panels are tabs within route, not separate mandatory URLs.

## 4. Screen inventory
| Route/panel | Purpose | Elements/actions | Variants |
|---|---|---|---|
| `/` | Entry | Machine types, examples, help | Ready, API offline notice |
| `/editor` | Construct | Graph, table, state form, alphabet, validate | Empty, dirty, valid, invalid, loading |
| `/editor` simulation | Execute | Input, trace cursor, controls, output/result | Idle, loading, accepted/rejected/output, error, stale |
| `/editor` conversion | Transform | Operation selector, trace, side-by-side, adopt | Idle, loading, verified, error, stale |
| `/editor` regex | Exchange | Expression, alphabet, canonical DFA, copy/download | Loading, verified, error, stale |
| `/compare` | Compare | Left/right editors, alphabet checks, witness | Empty, invalid, loading, equivalent/different, error |
| `/help` | Learn | Model conventions, grammar, constraints, setup link | Static |
| P1 editor file/history | Reuse | File picker, preview, history | Empty, success, invalid, canceled |

## 5. Decision points
- IF kind is acceptor THEN show finals/acceptance, ELSE output alphabet and outputs; IF enfa THEN allow epsilon.
- IF DFA/transducer missing edge or nondeterministic THEN block execution; IF NFA lacks edge THEN move set empty.
- IF draft changes THEN clear validation and invalidate results, not erase source.
- IF input blank THEN use []; IF invalid token THEN show error, do not report rejection.
- IF operation source incompatible THEN disable; IF verified THEN show adopt/export; ELSE preserve draft and show error.
- IF comparing mismatched alphabet THEN require correction; IF witness [] THEN render ε, not blank.
- IF user opts to replace dirty draft THEN confirm; IF declined THEN return unchanged.
- IF API unavailable THEN editing remains available in already loaded UI; computation disabled/retry; no offline engine promised.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
