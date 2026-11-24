import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  CircleHelp,
  GitBranch,
  Network,
  Plus,
  ShieldCheck,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import type { Connection } from "@xyflow/react";
import { api, ApiError } from "./api";
import Graph from "./Diagram";
import TransitionTable from "./TransitionTable";
import Simulation from "./Simulation";
import Conversion from "./Conversion";
const Compare = lazy(() => import("./Compare"));
import type { Highlight } from "./Simulation";
import type { Issue, Kind, Machine } from "./model";
import {
  blank,
  examples,
  exampleNames,
  isAcceptor,
  kinds,
  removeState,
} from "./model";
import AlphabetInput from "./AlphabetInput";
import "./styles.css";
const currentPage = () =>
  location.pathname === "/help"
    ? "help"
    : location.pathname === "/compare"
      ? "compare"
      : "editor";

export default function App() {
  const [machine, setMachine] = useState<Machine>(() =>
    structuredClone(examples.find((e) => e.id === "D01")!.machine),
  );
  const [title, setTitle] = useState("Ends in 01");
  const [selected, setSelected] = useState("q0");
  const [dirty, setDirty] = useState(false);
  const [compareDirty, setCompareDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [highlight, setHighlight] = useState<Highlight>({
    states: [],
    edges: [],
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [validation, setValidation] = useState<
    "draft" | "pending" | "valid" | "invalid"
  >("draft");
  const [error, setError] = useState("");
  const [page, setPage] = useState(currentPage);
  const generation = useRef(0);
  const state = machine.states.find((s) => s.id === selected);
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (dirty || compareDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, compareDirty]);
  useEffect(() => {
    const changed = () => {
      if (
        page === "compare" &&
        compareDirty &&
        !window.confirm(
          "Leave comparison? Unsaved comparison edits will be lost.",
        )
      ) {
        history.pushState({}, "", "/compare");
        return;
      }
      setCompareDirty(false);
      setPage(currentPage());
    };
    window.addEventListener("popstate", changed);
    return () => window.removeEventListener("popstate", changed);
  }, [compareDirty, page]);
  function update(next: Machine) {
    setHighlight({ states: [], edges: [] });
    generation.current++;
    setMachine(next);
    setRevision((r) => r + 1);
    setDirty(true);
    setIssues([]);
    setValidation("draft");
    setError("");
  }
  function replace(next: Machine, name: string) {
    if (
      (dirty || compareDirty) &&
      !window.confirm(
        "Replace the current draft? Unsaved editor or comparison edits will be lost.",
      )
    )
      return false;
    setCompareDirty(false);
    update(structuredClone(next));
    setTitle(name);
    setSelected(next.states[0]?.id ?? "");
    setDirty(false);
    return true;
  }
  function navigate(next: string) {
    if (
      (dirty || compareDirty) &&
      !window.confirm(
        compareDirty
          ? "Leave comparison? Unsaved comparison edits will be lost; the editor draft stays in this session."
          : "Leave the editor? Your draft stays in this session, but refreshing will lose it.",
      )
    )
      return;
    setCompareDirty(false);
    history.pushState({}, "", `/${next}`);
    setPage(next);
  }
  function addState() {
    let n = 0;
    while (machine.states.some((s) => s.id === `q${n}`)) n++;
    const id = `q${n}`;
    update({
      ...machine,
      states: [
        ...machine.states,
        {
          id,
          ...(machine.kind === "moore"
            ? { output: machine.outputAlphabet?.[0] ?? "" }
            : {}),
        },
      ],
    });
    setSelected(id);
  }
  function adopt(next: Machine) {
    if (
      !window.confirm(
        "Adopt the verified result and replace the current draft?",
      )
    )
      return;
    update(structuredClone(next));
    setTitle("Converted machine");
    setSelected(next.states[0]?.id ?? "");
  }
  function connect(c: Connection) {
    if (!c.source || !c.target) return;
    const symbol =
      machine.alphabet[0] ?? (machine.kind === "enfa" ? null : undefined);
    if (symbol === undefined) {
      setError("Define an input alphabet before connecting states.");
      return;
    }
    const edge = {
      from: c.source,
      to: c.target,
      symbol,
      ...(machine.kind === "mealy"
        ? { output: machine.outputAlphabet?.[0] ?? "" }
        : {}),
    };
    if (
      machine.transitions.some(
        (t) => t.from === edge.from && t.to === edge.to && t.symbol === symbol,
      )
    )
      return;
    update({ ...machine, transitions: [...machine.transitions, edge] });
  }
  async function validate() {
    const request = ++generation.current;
    setValidation("pending");
    setError("");
    try {
      const result = await api<{ valid: boolean; issues: Issue[] }>(
        "validate",
        { machine },
      );
      if (request !== generation.current) return;
      setIssues(result.issues);
      setValidation(result.valid ? "valid" : "invalid");
    } catch (e) {
      if (request !== generation.current) return;
      setError((e as Error).message);
      setIssues(e instanceof ApiError ? e.issues : []);
      setValidation("invalid");
    }
  }
  function focusIssue(issue: Issue) {
    const field = issue.path.split(".")[1];
    const label =
      field === "alphabet"
        ? "Input alphabet"
        : field === "outputAlphabet"
          ? "Output alphabet"
          : field === "startState"
            ? "Start state"
            : "Selected state";
    if (field === "transitions")
      document.getElementById("transition-table")?.focus();
    else
      [
        ...document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          "input, select",
        ),
      ]
        .find(
          (e) =>
            e.getAttribute("aria-label") === label ||
            e.closest("label")?.textContent?.startsWith(label),
        )
        ?.focus();
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-workspace">
        Skip to workspace
      </a>
      <aside className="sidebar" aria-label="Workspace navigation">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("editor");
          }}
        >
          <Network size={27} strokeWidth={1.8} />
          <span>
            Transivium<small>Automata studio</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            className={page === "editor" ? "nav-item selected" : "nav-item"}
            onClick={() => navigate("editor")}
          >
            <GitBranch size={18} />
            Workspace
          </button>
          <button
            className={page === "compare" ? "nav-item selected" : "nav-item"}
            onClick={() => navigate("compare")}
          >
            <ArrowRightLeft size={18} />
            Compare languages
          </button>
          <button
            className={page === "help" ? "nav-item selected" : "nav-item"}
            onClick={() => navigate("help")}
          >
            <BookOpen size={18} />
            Guide &amp; notation
          </button>
        </nav>
        <section className="examples">
          <h2>Explore examples</h2>
          {examples
            .filter((e) => ["D01", "N01", "E01", "M01", "O01"].includes(e.id))
            .map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  if (!replace(e.machine, exampleNames[e.id])) return;
                  if (page !== "editor") {
                    history.pushState({}, "", "/editor");
                    setPage("editor");
                  }
                }}
              >
                <span>{exampleNames[e.id]}</span>
                <small>{kinds[e.machine.kind]}</small>
              </button>
            ))}
        </section>
        <div className="session-notice">
          <CircleHelp size={18} />
          <p>
            Work stays in this session.
            <br />
            Refreshing clears your draft.
          </p>
        </div>
      </aside>
      <main className="workspace" id="main-workspace" tabIndex={-1}>
        <header className="page-heading">
          <div>
            <h1>
              {page === "help"
                ? "Guide & notation"
                : page === "compare"
                  ? "Compare languages"
                  : "Machine workspace"}
            </h1>
            <p>
              {page === "help"
                ? "The formal conventions behind your machines."
                : "Construct, inspect and understand finite machines."}
            </p>
          </div>
          <span className="local-status">
            <span />
            Local workspace
          </span>
        </header>
        {page === "help" ? (
          <section className="panel guide">
            <h2>From a machine to an explanation</h2>
            <p>
              Choose a machine kind, define the alphabet, then add states and
              edit the transition table. The graph and table describe the same
              machine.
            </p>
            <h2>Five ways to model a computation</h2>
            <dl>
              <dt>DFA</dt>
              <dd>
                Exactly one move per state and symbol. All transitions are
                required.
              </dd>
              <dt>NFA</dt>
              <dd>
                Zero or more moves per symbol. Acceptance requires at least one
                final active state after all input.
              </dd>
              <dt>ε-NFA</dt>
              <dd>Also permits epsilon edges, which consume no input.</dd>
              <dt>Mealy</dt>
              <dd>Outputs are attached to transitions.</dd>
              <dt>Moore</dt>
              <dd>
                Outputs are attached to states. The initial output is separate
                from post-input outputs.
              </dd>
            </dl>
            <h2>Notation &amp; keyboard editing</h2>
            <p>
              Input symbols are single ASCII letters or digits. An empty input
              is the empty string ε; it is never typed as a literal input
              symbol. The start arrow marks the initial state; a double ring
              marks an accepting state.
            </p>
            <p>
              The state form and transition table support all edits without
              graph gestures. For NFA destinations, use Ctrl or ⌘ to select
              multiple states. Use the blank destination option to remove a
              deterministic edge.
            </p>
            <h2>Exact comparisons</h2>
            <p>
              Language equality is defined over the same declared alphabet. A
              regular expression preserves a language, not the original state
              names or layout. Only completed exact verification can certify an
              export.
            </p>
          </section>
        ) : page === "compare" ? (
          <Suspense
            fallback={<p role="status">Loading comparison workspace…</p>}
          >
            <Compare
              editorMachine={machine}
              onEdit={() => setCompareDirty(true)}
            />
          </Suspense>
        ) : (
          <>
            <section className="machine-toolbar">
              <div>
                <h2>{title}</h2>
                <span>
                  {machine.states.length} states · {machine.transitions.length}{" "}
                  transitions · revision {revision}
                </span>
              </div>
              <div className="toolbar-actions">
                <label className="inline-field">
                  Machine type
                  <select
                    aria-label="Machine type"
                    value={machine.kind}
                    onChange={(e) =>
                      replace(blank(e.target.value as Kind), "Untitled machine")
                    }
                  >
                    {Object.entries(kinds).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() =>
                    replace(blank(machine.kind), "Untitled machine")
                  }
                >
                  New machine
                </button>
                <button
                  className="primary"
                  onClick={validate}
                  disabled={validation === "pending"}
                >
                  <ShieldCheck size={17} />
                  {validation === "pending"
                    ? "Validating…"
                    : "Validate machine"}
                </button>
              </div>
            </section>
            <div className="editor-grid">
              <div className="editor-main">
                <section className="panel graph-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>State diagram</h2>
                      <p>Choose a state to edit its properties.</p>
                    </div>
                    <div className="diagram-actions">
                      <span className={`status ${validation}`}>
                        {validation === "valid" ? <Check size={14} /> : null}
                        {validation === "valid"
                          ? "Valid machine"
                          : validation === "invalid"
                            ? "Needs attention"
                            : validation === "pending"
                              ? "Checking"
                              : "Editable draft"}
                      </span>
                      <button
                        onClick={addState}
                        disabled={machine.states.length >= 256}
                      >
                        <Plus size={16} />
                        Add state
                      </button>
                    </div>
                  </div>
                  <Graph
                    machine={machine}
                    select={setSelected}
                    connect={connect}
                    activeStates={highlight.states}
                    activeTransitions={highlight.edges}
                  />
                </section>
                <TransitionTable machine={machine} update={update} />
                <Conversion
                  key={`convert-${revision}`}
                  machine={machine}
                  valid={validation === "valid"}
                  onAdopt={adopt}
                />
                <Simulation
                  key={revision}
                  machine={machine}
                  valid={validation === "valid"}
                  onStep={setHighlight}
                />
              </div>
              <section
                className="inspector panel"
                aria-label="Machine inspector"
              >
                <h2>Machine definition</h2>
                <label>
                  Input alphabet
                  <AlphabetInput
                    label="Input alphabet"
                    placeholder="0, 1"
                    value={machine.alphabet}
                    onChange={(alphabet) => update({ ...machine, alphabet })}
                  />
                </label>
                <p className="field-hint">Separate symbols with commas.</p>
                {!isAcceptor(machine) && (
                  <label>
                    Output alphabet
                    <AlphabetInput
                      label="Output alphabet"
                      value={machine.outputAlphabet ?? []}
                      onChange={(outputAlphabet) =>
                        update({ ...machine, outputAlphabet })
                      }
                    />
                  </label>
                )}
                <label>
                  Start state
                  <select
                    value={machine.startState}
                    onChange={(e) =>
                      update({ ...machine, startState: e.target.value })
                    }
                  >
                    <option value="">Choose start state</option>
                    {machine.states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label || s.id}
                      </option>
                    ))}
                  </select>
                </label>
                <hr />
                <h2>State properties</h2>
                <label>
                  Selected state
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Choose state</option>
                    {machine.states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}
                      </option>
                    ))}
                  </select>
                </label>
                {state ? (
                  <>
                    <label>
                      Display label
                      <input
                        maxLength={80}
                        value={state.label ?? ""}
                        placeholder={state.id}
                        onChange={(e) =>
                          update({
                            ...machine,
                            states: machine.states.map((s) =>
                              s.id === state.id
                                ? { ...s, label: e.target.value }
                                : s,
                            ),
                          })
                        }
                      />
                    </label>
                    {isAcceptor(machine) ? (
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={
                            machine.finalStates?.includes(state.id) ?? false
                          }
                          onChange={(e) =>
                            update({
                              ...machine,
                              finalStates: e.target.checked
                                ? [...(machine.finalStates ?? []), state.id]
                                : machine.finalStates?.filter(
                                    (id) => id !== state.id,
                                  ),
                            })
                          }
                        />
                        Accepting state
                      </label>
                    ) : null}
                    {machine.kind === "moore" ? (
                      <label>
                        State output
                        <select
                          value={state.output ?? ""}
                          onChange={(e) =>
                            update({
                              ...machine,
                              states: machine.states.map((s) =>
                                s.id === state.id
                                  ? { ...s, output: e.target.value }
                                  : s,
                              ),
                            })
                          }
                        >
                          <option value="">Choose output</option>
                          {machine.outputAlphabet?.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <button
                      className="danger quiet"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${state.id} and its transitions? Start/final references will be cleared.`,
                          )
                        ) {
                          update(removeState(machine, state.id));
                          setSelected("");
                        }
                      }}
                    >
                      <Trash2 size={15} />
                      Delete state
                    </button>
                  </>
                ) : (
                  <p className="field-hint">
                    Select a state in the graph or form.
                  </p>
                )}
                <div className="validation-summary" aria-live="polite">
                  {validation === "valid" ? (
                    <p className="success">All formal checks passed.</p>
                  ) : (
                    <p>Validate this revision before running an operation.</p>
                  )}
                  {error && (
                    <p role="alert" className="error">
                      {error}
                    </p>
                  )}
                  {issues.length > 0 && (
                    <ul className="issues">
                      {issues.map((issue, i) => (
                        <li key={i}>
                          <button
                            className="issue-link"
                            onClick={() => focusIssue(issue)}
                          >
                            {issue.path}
                          </button>
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
        <footer>
          Construct. Convert. Simulate. Verify.
          <span>Formal machines, visible reasoning.</span>
        </footer>
      </main>
    </div>
  );
}
