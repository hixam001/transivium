---
id: "doc-05-algorithms"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "documentation-baseline-v0.1"
tags: ["transivium", "documentation"]
---

# Algorithm & Regex Interoperability Specification

Version 0.1 | Mathematical baseline / proposed implementation

## 1. Notation
Acceptor M = (Q, Σ, δ, q0, F); Q finite nonempty, Σ finite, one start, F subset Q. DFA δ: Q×Σ→Q (total); NFA δ: Q×Σ→P(Q); ε-NFA adds ε to transition labels. Mealy has output alphabet Γ and output λ: Q×Σ→Γ. Moore λ: Q→Γ. Both transducers total; compare post-input output streams. No literal epsilon input token; epsilon edges consume nothing.

## 2. Simulation
DFA: start q0, follow δ for each input; accept iff ending state is final. NFA: active S={q0}; S←union of δ(q,a) for q∈S; accept iff S∩F nonempty. ε-NFA: S←E({q0}); each input S←E(move(S,a)); accept iff S∩F nonempty. E(S) computed with DFS/BFS and visited set including S; show closure edges once, cycles terminate. Empty input evaluated at initial configuration. Mealy: emit λ(current,a), then move. Moore: emit λ(q0) initially, then λ(reached) after each transition; output normalized by removing initial element. Never treat transducer outputs as acceptance flags.

## 3. ε-NFA → NFA
For each q, compute E(q). For each a∈Σ set δ'(q,a)=E(move(E(q),a)). F'={q | E(q)∩F≠∅}; same Q, Σ and start; remove all ε edges. Preserve empty input behavior. Trace closures and computed targets. Complexity polynomial in states/edges/symbols plus output size.

## 4. NFA / ε-NFA → DFA
Use reachable subset BFS. Initial subset {q0} for NFA or E({q0}) for ε-NFA. For each subset S and symbol a compute move(S,a), additionally close for ε-NFA. Canonicalize subset as sorted ID tuple; create one new state per distinct reachable subset. Include empty subset with self-loops if reached. Mark final iff subset intersects F. Sort alphabet to make enumeration deterministic. Worst case 2^|Q|; stop on budget before adding excess state. Trace mapping from subset to DFA state.

## 5. DFA minimization and canonicalization
First traverse reachable states and remove unreachable. Initial partition consists of nonempty F and Q\F blocks. Iteratively split each block by signature of destination block IDs for sorted symbols; preserve previous block distinctions. Stop when no split. Build quotient, start block and final blocks. Empty alphabet works: reachable start only. Canonicalize using BFS from start and sorted alphabet, assign q0, q1, ...; labels omitted. Complete reachable minimal DFAs over same alphabet are unique up to isomorphism. Canonical numbering makes their formal JSON structurally comparable independent of original names/layout.

## 6. Exact acceptor equivalence and witnesses
Require same alphabet set. Determinize nondeterministic inputs; compare complete DFA pairs. Queue starts at (sA,sB), mark visited and store parent pair/edge. If final membership differs, return path symbols reconstructed from parents; start mismatch returns empty array. Otherwise explore paired transitions in sorted symbol order. Exhaustion proves equivalence. Time O(|QA|·|QB|·|Σ|), space O(|QA|·|QB|); reachable product only. Bounded failures are errors, not equality. Use this for all acceptor conversions including minimization and regex export. For ε-removal, determinize both source and result for comparison.

## 7. Transducer conversions
### Moore → Mealy
Keep state set/start/transition destinations; each edge q --a--> r gets output λ(r). Remove state outputs. Initial Moore output is not reproduced; compare one output per input symbol.

### Mealy → Moore
For every incoming edge with target r and output o, create state pair (r,o) (deduplicate). For each pair (q,o), assign output o and transitions on a to (δ(q,a),λ(q,a)). Add a fresh initial state representing original q0 before input, with arbitrary deterministic output (first sorted Γ symbol); its outgoing transitions follow original start's behavior. Show its initial output separately, explicitly not semantically equivalent to a Mealy output. Only keep reachable states; generated IDs safe and deterministic. Synthetic initial state may be unnecessary in some cases but is always allowed in this design. State bound applies before generation. For exact internal verification, BFS reachable paired states; for each input symbol compare emitted normalized output (Mealy edge vs Moore target output) and then traverse paired destinations. Any difference fails conversion; exhausting pairs proves equality for all finite input strings. Empty input normalized output is [] on both sides.

## 8. DFA → regex via GNFA
### 8.1 Setup
Validate and minimize complete DFA. Add fresh start S (no incoming) and final T (no outgoing). Add S→oldStart labelled ε; every old final→T labelled ε. Combine parallel symbol edges using union. All absent edge labels are ∅. No direct incoming to S or outgoing from T. Use sparse maps for labels and an AST, not text substitution.

### 8.2 Elimination
For each original state k in canonical BFS order (proposed deterministic policy), for every remaining pair i,j update:
`R_ij ← R_ij | R_ik (R_kk)* R_kj`
Use snapshot of labels involving k before deletion. Remove k and its incident labels only after all updates. Once only S,T remain, result is R_ST (∅ if absent). Proof invariant: label from i to j denotes all paths whose interior states have been eliminated, including repetitions handled by star. Inductively final label recognizes exactly original language. Worst-case expression size exponential; check budget throughout.

### 8.3 AST and sound simplification
Nodes: Empty, Epsilon, Literal, Union(list), Concat(list), Star(child). Apply identities `∅|R=R`, `R|R=R`, `εR=Rε=R`, `∅R=R∅=∅`, `∅*=ε*=ε`, `(R*)*=R*`; flatten associative nodes, deduplicate union branches and deterministically sort. Never apply invalid identities such as `(AB)*=A*B*`. Count AST nodes and serialized UTF-8 character allocations as work units; guard length before allocating text and bound expression depth. Cached serialization therefore cannot grow without consuming the 50,000-work budget. Serializer uses precedence (star > concat > union), parentheses where needed; no shorthand constructs.

## 9. Formal-v1 regex exchange contract
Grammar (EBNF; literal metacharacters quoted):
```text
regex  = union ;
union  = concat , { "|" , concat } ;
concat = repeat , { repeat } ;
repeat = atom , { "*" } ;
atom   = literal | "ε" | "∅" | "(" , union , ")" ;
literal = one ASCII alphanumeric symbol belonging to declared alphabet ;
```
Nonempty serialized expression; empty string is represented by `ε`, empty language by `∅`. No spaces, escapes, dot, character classes, `+`, `?`, anchors or backreferences. `|` means union, juxtaposition concat, `*` Kleene closure. `ε` and `∅` are reserved Unicode characters. Declare alphabet independently (sorted JSON array). Empty alphabet valid for acceptors; regex then reduces semantically to ε or ∅. A regex may mention only a subset of Σ. External simulator must receive full Σ; it cannot infer symbols absent from text. Copy plain expression or download JSON artifact (schema in data model); UTF-8 encoding.

### 9.1 Independent internal verification
1. Parse the emitted string (do not reuse generator AST); reject unsupported syntax or literals outside declared alphabet.
2. Thompson construction: literal fragment has symbol edge; epsilon fragment epsilon edge; empty fragment disconnected endpoints; concat links with epsilon; union fresh start/end joins branches with epsilon; star fresh start/end with bypass and loop via epsilon.
3. Build ε-NFA with one start/final and declared original alphabet; determinize using closure/subset method, minimize and canonicalize.
4. Compare reconstructed DFA to original using exact reachable product BFS, not just sample strings. If mismatch return `VERIFICATION_FAILED` (internal diagnostic may include witness; user gets no verified artifact). If limits/deadline exceeded return typed resource error. Never certify unverified regex.
5. Return verified expression plus canonical minimal source DFA reference; confirm canonical reconstruction matches in tests.

### 9.2 Cross-team acceptance
Other team receives regex and alphabet manually. They may use any correct algorithm. Required outcome L(Doriginal)=L(Dexternal) for any successful export. For structural comparison, minimize both over identical Σ, remove unreachable states and require complete transitions (explicit sink where needed). Then compare isomorphism, or canonical BFS IDs if both implement that convention. Arbitrary original nonminimal structure, names and graph coordinates cannot be recovered from language alone. No dependency on external implementation. Agree on grammar and epsilon/empty notation with other team before integration demo; if they support another notation, adapt via agreed syntax mapping and verify again, not silent substitution.

### 9.3 Exchange fixtures
| Language | Alphabet | One equivalent regex | Accept examples | Reject examples |
|---|---|---|---|---|
| Binary ending 01 | 0,1 | `(0|1)*01` | 01, 101, 0001 | ε, 10, 011 |
| Even number of 0s | 0,1 | `1*(01*01*)*` | ε, 11, 00, 010 | 0, 10, 000 |
| Only epsilon | 0,1 | `ε` | ε | 0, 1 |
| Empty | 0,1 | `∅` | none | ε, 0, 1 |
| Universal | 0,1 | `(0|1)*` | ε, 0, 101 | none over Σ |
| Zero or more zeros | 0,1 | `0*` | ε, 0, 00 | 1, 01 |

Expressions are reference examples, not expected exact emitted text. Use exact equivalence, not text equality. Missing alphabet symbol case `0*` over {0,1} must have rejecting sink after reconstruction/minimization.

## 10. Algorithm acceptance and limits
Algorithms must be implemented as independently testable pure functions; libraries may support infrastructure and graph rendering, not replace core coursework algorithms. Share stable trace DTOs; verify reference fixtures plus generated small machines. SAD/API limits apply to all intermediates and verification work. Do not claim arbitrary machine support, polynomial regex output size, or success on timeout.

## Memory links

- [[memory/Home]]
- [[memory/References/Documentation-Review]]
