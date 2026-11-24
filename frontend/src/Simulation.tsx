import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { api } from "./api";
import type { Kind, Machine, Transition } from "./model";

export type TraceStep = {
  index: number;
  symbol: string | null;
  activeStates: string[];
  movedStates: string[] | null;
  traversed: Transition[];
  epsilonTraversed: Transition[];
  outputPrefix: string[] | null;
};
export type SimulationResult = {
  steps: TraceStep[];
  accepted: boolean | null;
  output: string[] | null;
  normalizedOutput: string[] | null;
  initialOutput: string | null;
};
export type Highlight = { states: string[]; edges: Transition[] };

export default function Simulation({
  machine,
  valid,
  onStep,
  onRun,
}: {
  machine: Machine;
  valid: boolean;
  onStep: (value: Highlight) => void;
  onRun?: (input: string, result: SimulationResult) => void;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  useEffect(
    () => () => {
      requestId.current++;
    },
    [],
  );
  function invalidate(value: string) {
    requestId.current++;
    setInput(value);
    setResult(null);
    onStep({ states: [], edges: [] });
    setPending(false);
    setError("");
  }
  async function run(value = input) {
    const id = ++requestId.current;
    setInput(value);
    setPending(true);
    setResult(null);
    onStep({ states: [], edges: [] });
    setError("");
    try {
      const response = await api<SimulationResult>("simulate", {
        machine,
        input: [...value],
      });
      if (id === requestId.current) {
        setResult(response);
        onRun?.(value, response);
      }
    } catch (e) {
      if (id === requestId.current) setError((e as Error).message);
    } finally {
      if (id === requestId.current) setPending(false);
    }
  }
  return (
    <section className="panel simulation">
      <div className="panel-heading">
        <div>
          <h2>Simulate input</h2>
          <p>Follow every symbol, starting from the initial configuration.</p>
        </div>
      </div>
      <div className="simulation-body">
        <form
          className="run-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !pending) void run();
          }}
        >
          <label>
            Input string
            <input
              value={input}
              onChange={(e) => invalidate(e.target.value)}
              placeholder="For example, 101"
              maxLength={513}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <button className="primary" disabled={!valid || pending}>
            <Play size={16} />
            {pending ? "Running…" : "Run input"}
          </button>
          <button
            type="button"
            disabled={!valid || pending}
            onClick={() => void run("")}
          >
            Run empty input
          </button>
        </form>
        {!valid && (
          <p className="field-hint simulation-hint">
            Validate the current machine before running input.
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {result && (
          <>
            <TracePlayback
              result={result}
              input={input}
              kind={machine.kind}
              onStep={onStep}
            />
          </>
        )}
        {!result && !pending && !error && (
          <p className="simulation-hint">
            Empty input is supported. Spaces and symbols outside the alphabet
            produce an input error.
          </p>
        )}
      </div>
    </section>
  );
}

const ignoreHighlight = () => {};

export function TracePlayback({
  result,
  input,
  kind,
  onStep = ignoreHighlight,
}: {
  result: SimulationResult;
  input: string;
  kind: Kind;
  onStep?: (value: Highlight) => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = result?.steps[cursor];
  useEffect(() => {
    onStep({
      states: step?.activeStates ?? [],
      edges: [...(step?.traversed ?? []), ...(step?.epsilonTraversed ?? [])],
    });
  }, [step, onStep]);
  useEffect(() => {
    if (!playing || !result) return;
    const timer = setInterval(
      () =>
        setCursor((c) => {
          if (c >= result.steps.length - 1) {
            setPlaying(false);
            return c;
          }
          return c + 1;
        }),
      850,
    );
    return () => clearInterval(timer);
  }, [playing, result]);
  const ended = cursor === result.steps.length - 1;
  return (
    <>
      <div className="trace-toolbar">
        <div className="playback-controls">
          <button
            aria-label="Reset trace"
            onClick={() => {
              setCursor(0);
              setPlaying(false);
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            aria-label="Previous step"
            disabled={cursor === 0}
            onClick={() => {
              setCursor((c) => c - 1);
              setPlaying(false);
            }}
          >
            <SkipBack size={16} />
          </button>
          <button
            aria-label={playing ? "Pause playback" : "Play trace"}
            disabled={ended && !playing}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            aria-label="Next step"
            disabled={ended}
            onClick={() => {
              setCursor((c) => c + 1);
              setPlaying(false);
            }}
          >
            <SkipForward size={16} />
          </button>
        </div>
        <span>
          Step {cursor} of {result.steps.length - 1}
        </span>
        <span
          className={`status ${ended ? (result.accepted !== false ? "valid" : "invalid") : "draft"}`}
        >
          {ended
            ? result.accepted === null
              ? "Completed"
              : result.accepted
                ? "Accepted"
                : "Rejected"
            : "In progress"}
        </span>
      </div>
      <div className="trace-current" aria-live="polite">
        {step?.outputPrefix && (
          <>
            <p>
              Output prefix:{" "}
              <output aria-label="Output prefix">
                <code>{step.outputPrefix.join("") || "ε (empty output)"}</code>
              </output>
            </p>
            <p>
              Normalized output:{" "}
              <output aria-label="Normalized output">
                <code>
                  {(kind === "moore"
                    ? step.outputPrefix.slice(1)
                    : step.outputPrefix
                  ).join("") || "ε (empty output)"}
                </code>
              </output>
            </p>
            {result.initialOutput !== null && (
              <p>
                Initial Moore output:{" "}
                <output aria-label="Initial Moore output">
                  <code>{result.initialOutput}</code>
                </output>{" "}
                · Excluded from normalized output.
              </p>
            )}
          </>
        )}
        <p>
          Active states:{" "}
          <strong>
            {step?.activeStates.join(", ") || "∅ (no active states)"}
          </strong>
        </p>
        <p>
          Consumed input: <code>{input.slice(0, cursor) || "ε"}</code>
          {cursor < input.length && (
            <>
              {" "}
              · Next symbol: <code>{input[cursor]}</code>
            </>
          )}
        </p>
        {kind === "enfa" && (
          <p>
            Move before closure:{" "}
            <code>{step?.movedStates?.join(", ") || "∅"}</code> · Epsilon edges
            visited: {step?.epsilonTraversed.length}
          </p>
        )}
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Execution trace"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Symbol</th>
              <th>Active states</th>
              <th>Configuration</th>
              {result.output !== null && <th>Output prefix</th>}
            </tr>
          </thead>
          <tbody>
            {result.steps.map((s, i) => (
              <tr key={i} className={i === cursor ? "trace-selected" : ""}>
                <td>
                  <button
                    className="trace-jump"
                    aria-label={`Go to step ${i}`}
                    onClick={() => {
                      setCursor(i);
                      setPlaying(false);
                    }}
                  >
                    {i}
                  </button>
                </td>
                <td>
                  <code>{s.symbol ?? "—"}</code>
                </td>
                <td>
                  <code>{s.activeStates.join(", ") || "∅"}</code>
                </td>
                <td>
                  {i === 0
                    ? "Initial configuration"
                    : `${i} symbol${i === 1 ? "" : "s"} consumed`}
                </td>
                {s.outputPrefix !== null && (
                  <td>
                    <code>{s.outputPrefix.join("") || "ε"}</code>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
