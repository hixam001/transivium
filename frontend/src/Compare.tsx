import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { api, ApiError } from "./api";
import Graph from "./Graph";
import TransitionTable from "./TransitionTable";
import {
  blank,
  examples,
  exampleNames,
  isAcceptor,
  kinds,
  removeState,
} from "./model";
import type { Kind, Machine } from "./model";
import type { SimulationResult } from "./Simulation";

type Side = "left" | "right";
type Comparison = {
  equivalent: boolean;
  counterexample: string[] | null;
  leftAccepts: boolean | null;
  rightAccepts: boolean | null;
  visitedPairs: number;
};
type Validation = "draft" | "pending" | "valid" | "invalid";
const acceptors = examples.filter((e) => isAcceptor(e.machine));
const noop = () => {};
function SideEditor({
  side,
  machine,
  update,
  validate,
  status,
  issue,
  copyDraft,
}: {
  side: Side;
  machine: Machine;
  update: (m: Machine) => void;
  validate: () => void;
  status: Validation;
  issue: string;
  copyDraft: () => void;
}) {
  const [selected, setSelected] = useState(machine.states[0]?.id ?? "");
  const current =
    machine.states.find((s) => s.id === selected) ?? machine.states[0];
  function replace(m: Machine) {
    if (window.confirm(`Replace the ${side} comparison machine?`))
      update(structuredClone(m));
  }
  function add() {
    let n = 0;
    while (machine.states.some((s) => s.id === `q${n}`)) n++;
    const id = `q${n}`;
    update({ ...machine, states: [...machine.states, { id }] });
    setSelected(id);
  }
  return (
    <section className="panel compare-side" aria-label={`${side} machine`}>
      <div className="panel-heading">
        <h2>{side === "left" ? "Left machine" : "Right machine"}</h2>
        <span className={`status ${status}`}>
          {status === "valid"
            ? "Valid machine"
            : status === "pending"
              ? "Validating…"
              : status === "invalid"
                ? "Needs attention"
                : "Editable draft"}
        </span>
      </div>
      <div className="compare-fields">
        <div className="compare-options">
          <button onClick={copyDraft}>Copy editor draft</button>
          <select
            aria-label={`Load ${side} example`}
            value=""
            onChange={(e) => {
              const ex = acceptors.find((x) => x.id === e.target.value);
              if (ex) replace(ex.machine);
            }}
          >
            <option value="">Load an example</option>
            {acceptors.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id} · {exampleNames[e.id]}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <label>
            Machine type
            <select
              aria-label={`${side} machine type`}
              value={machine.kind}
              onChange={(e) => replace(blank(e.target.value as Kind))}
            >
              {(["dfa", "nfa", "enfa"] as Kind[]).map((k) => (
                <option key={k} value={k}>
                  {kinds[k]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Alphabet
            <input
              aria-label={`${side} alphabet`}
              value={machine.alphabet.join(", ")}
              onChange={(e) =>
                update({
                  ...machine,
                  alphabet:
                    e.target.value === ""
                      ? []
                      : e.target.value.split(",").map((s) => s.trim()),
                })
              }
            />
          </label>
          <label>
            Start state
            <select
              aria-label={`${side} start state`}
              value={machine.startState}
              onChange={(e) =>
                update({ ...machine, startState: e.target.value })
              }
            >
              <option value="">Choose state</option>
              {machine.states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || s.id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            Selected state
            <select
              aria-label={`${side} selected state`}
              value={current?.id ?? ""}
              onChange={(e) => setSelected(e.target.value)}
            >
              {machine.states.map((s) => (
                <option key={s.id}>{s.id}</option>
              ))}
            </select>
          </label>
          <label>
            Display label
            <input
              aria-label={`${side} state label`}
              disabled={!current}
              maxLength={80}
              value={current?.label ?? ""}
              onChange={(e) =>
                update({
                  ...machine,
                  states: machine.states.map((s) =>
                    s.id === current.id ? { ...s, label: e.target.value } : s,
                  ),
                })
              }
            />
          </label>
        </div>
        <div className="compare-options">
          {current && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                aria-label={`${side} accepting state`}
                checked={machine.finalStates?.includes(current.id) ?? false}
                onChange={(e) =>
                  update({
                    ...machine,
                    finalStates: e.target.checked
                      ? [...(machine.finalStates ?? []), current.id]
                      : machine.finalStates?.filter((id) => id !== current.id),
                  })
                }
              />
              Accepting state
            </label>
          )}
          <button disabled={machine.states.length >= 256} onClick={add}>
            <Plus size={14} />
            Add state
          </button>
          <button
            className="danger"
            disabled={!current}
            aria-label={`Delete ${side} state`}
            onClick={() => {
              if (
                current &&
                window.confirm(`Delete ${current.id} and clear its references?`)
              )
                update(removeState(machine, current.id));
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <Graph machine={machine} select={setSelected} connect={noop} readOnly />
      <TransitionTable machine={machine} update={update} />
      <div className="compare-validation">
        <button onClick={validate} disabled={status === "pending"}>
          <ShieldCheck size={15} />
          Validate {side}
        </button>
        <p
          className={issue ? "error" : "simulation-hint"}
          role={issue ? "alert" : undefined}
        >
          {issue ||
            (status === "valid"
              ? "Snapshot validated. Editing invalidates this check."
              : "Validate this snapshot before comparing.")}
        </p>
      </div>
    </section>
  );
}
export default function Compare({
  editorMachine,
  onEdit,
}: {
  editorMachine: Machine;
  onEdit?: () => void;
}) {
  const [machines, setMachines] = useState<Record<Side, Machine>>(() => ({
    left: structuredClone(
      isAcceptor(editorMachine)
        ? editorMachine
        : acceptors.find((e) => e.id === "D01")!.machine,
    ),
    right: structuredClone(acceptors.find((e) => e.id === "D02")!.machine),
  }));
  const [status, setStatus] = useState<Record<Side, Validation>>({
    left: "draft",
    right: "draft",
  });
  const [issues, setIssues] = useState({ left: "", right: "" });
  const [result, setResult] = useState<Comparison | null>(null);
  const [pending, setPending] = useState(false);
  const [witnessPending, setWitnessPending] = useState(false);
  const [witnessRuns, setWitnessRuns] = useState<SimulationResult[] | null>(
    null,
  );
  const [error, setError] = useState("");
  const versions = useRef({ left: 0, right: 0, compare: 0 });
  useEffect(
    () => () => {
      versions.current.left++;
      versions.current.right++;
      versions.current.compare++;
    },
    [],
  );
  function update(side: Side, machine: Machine) {
    onEdit?.();
    versions.current[side]++;
    versions.current.compare++;
    setMachines((m) => ({ ...m, [side]: machine }));
    setStatus((s) => ({ ...s, [side]: "draft" }));
    setIssues((s) => ({ ...s, [side]: "" }));
    setResult(null);
    setWitnessRuns(null);
    setPending(false);
    setWitnessPending(false);
    setError("");
  }
  async function validate(side: Side) {
    const id = ++versions.current[side];
    setStatus((s) => ({ ...s, [side]: "pending" }));
    setIssues((s) => ({ ...s, [side]: "" }));
    try {
      const response = await api<{
        valid: boolean;
        issues: { message: string }[];
      }>("validate", { machine: machines[side] });
      if (id !== versions.current[side]) return;
      setStatus((s) => ({
        ...s,
        [side]: response.valid ? "valid" : "invalid",
      }));
      setIssues((s) => ({
        ...s,
        [side]: response.issues.map((i) => i.message).join(" "),
      }));
    } catch (e) {
      if (id === versions.current[side]) {
        setStatus((s) => ({ ...s, [side]: "invalid" }));
        setIssues((s) => ({
          ...s,
          [side]:
            e instanceof ApiError
              ? `${e.message} ${e.issues.map((i) => i.message).join(" ")}`
              : (e as Error).message,
        }));
      }
    }
  }
  async function compare() {
    const id = ++versions.current.compare;
    setPending(true);
    setResult(null);
    setWitnessRuns(null);
    setError("");
    try {
      const data = await api<Comparison>("equivalence", machines);
      if (id === versions.current.compare) setResult(data);
    } catch (e) {
      if (id === versions.current.compare) setError((e as Error).message);
    } finally {
      if (id === versions.current.compare) setPending(false);
    }
  }
  async function runWitness() {
    if (!result || result.counterexample === null) return;
    const id = versions.current.compare;
    setWitnessPending(true);
    try {
      const data = await Promise.all(
        (["left", "right"] as Side[]).map((side) =>
          api<SimulationResult>("simulate", {
            machine: machines[side],
            input: result.counterexample,
          }),
        ),
      );
      if (id === versions.current.compare) setWitnessRuns(data);
    } catch (e) {
      if (id === versions.current.compare) setError((e as Error).message);
    } finally {
      if (id === versions.current.compare) setWitnessPending(false);
    }
  }
  const sameAlphabet =
    [...machines.left.alphabet].sort().join("\0") ===
    [...machines.right.alphabet].sort().join("\0");
  return (
    <div className="compare-workspace">
      <p className="compare-intro">
        Build two acceptors over the same alphabet. Exact comparison returns a
        shortest distinguishing input when their languages differ.
      </p>
      <div className="compare-pair">
        {(["left", "right"] as Side[]).map((side) => (
          <SideEditor
            key={side}
            side={side}
            machine={machines[side]}
            update={(m) => update(side, m)}
            validate={() => void validate(side)}
            status={status[side]}
            issue={issues[side]}
            copyDraft={() => {
              if (!isAcceptor(editorMachine)) {
                setError("The editor draft must be an acceptor.");
                return;
              }
              if (
                window.confirm(
                  `Replace the ${side} machine with the editor draft?`,
                )
              )
                update(side, structuredClone(editorMachine));
            }}
          />
        ))}
      </div>
      <section className="panel compare-result">
        <div className="compare-result-actions">
          <button
            className="primary"
            disabled={
              pending ||
              status.left !== "valid" ||
              status.right !== "valid" ||
              !sameAlphabet
            }
            onClick={() => void compare()}
          >
            <ArrowRightLeft size={16} />
            {pending ? "Comparing…" : "Compare languages"}
          </button>
          <p>
            {!sameAlphabet
              ? "Use identical declared alphabets before comparing."
              : status.left === "valid" && status.right === "valid"
                ? "Both snapshots are valid and use the same alphabet."
                : "Validate both snapshots to enable exact comparison."}
          </p>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {result && (
          <div aria-live="polite">
            <h2>
              {result.equivalent
                ? "Equivalent languages"
                : "Different languages"}
            </h2>
            <p>
              Exact product search · {result.visitedPairs} reachable pairs
              checked.
            </p>
            {!result.equivalent && (
              <>
                <p className="witness">
                  Shortest distinguishing input:{" "}
                  <code>
                    {result.counterexample?.length
                      ? result.counterexample.join("")
                      : "ε (empty string)"}
                  </code>
                </p>
                <p>
                  Left:{" "}
                  <strong>{result.leftAccepts ? "accepts" : "rejects"}</strong>{" "}
                  · Right:{" "}
                  <strong>{result.rightAccepts ? "accepts" : "rejects"}</strong>
                </p>
                <button
                  onClick={() => void runWitness()}
                  disabled={witnessPending}
                >
                  {witnessPending ? "Running witness…" : "Run witness on both"}
                </button>
                {witnessRuns && (
                  <p className="witness-replay">
                    Simulation confirms: left{" "}
                    {witnessRuns[0].accepted ? "accepted" : "rejected"}, right{" "}
                    {witnessRuns[1].accepted ? "accepted" : "rejected"}.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
