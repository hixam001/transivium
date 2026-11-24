import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, Check, Copy, Download } from "lucide-react";
import { api } from "./api";
import Graph from "./Diagram";
import type { Kind, Machine } from "./model";

export type ConversionResult = {
  operation: string;
  machine: Machine | null;
  steps: {
    index: number;
    phase: string;
    description: string;
    details: Record<string, unknown>;
  }[];
  verification: { equivalent: boolean; mode: string; method: string };
  regexArtifact: {
    schemaVersion: number;
    syntax: string;
    regex: string;
    alphabet: string[];
    canonicalDfa: Machine;
  } | null;
};
const operations: Partial<Record<Kind, [string, string][]>> = {
  mealy: [["mealy_to_moore", "Mealy → Moore"]],
  moore: [["moore_to_mealy", "Moore → Mealy"]],
  dfa: [
    ["minimize_dfa", "Minimize DFA"],
    ["dfa_to_regex", "DFA → regular expression"],
  ],
  nfa: [["nfa_to_dfa", "NFA → DFA"]],
  enfa: [
    ["enfa_to_nfa", "ε-NFA → NFA"],
    ["enfa_to_dfa", "ε-NFA → DFA"],
  ],
};
const noop = () => {};
function detailText(value: unknown): string {
  if (Array.isArray(value))
    return value.length
      ? value
          .map((v) => (Array.isArray(v) ? `{${v.join(", ")}}` : detailText(v)))
          .join("\n")
      : "∅";
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if ("before" in v)
      return `${v.from} → ${v.to}: ${v.before} becomes ${v.after}`;
    if ("from" in v)
      return `${v.from} → ${v.to}${v.regex !== undefined ? ` : ${v.regex}` : ""}`;
    if ("symbol" in v) return `${v.symbol} → ${v.to}`;
    return Object.entries(v)
      .map(([k, x]) => `${k}: ${detailText(x)}`)
      .join(", ");
  }
  return String(value);
}
export default function Conversion({
  machine,
  valid,
  onAdopt,
}: {
  machine: Machine;
  valid: boolean;
  onAdopt: (m: Machine) => void;
}) {
  const available = operations[machine.kind] ?? [];
  const [operation, setOperation] = useState(available[0]?.[0] ?? "");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  function choose(value: string) {
    generation.current++;
    setOperation(value);
    setResult(null);
    setPending(false);
    setError("");
    setFeedback("");
  }
  async function convert() {
    const id = ++generation.current;
    setPending(true);
    setResult(null);
    setError("");
    setFeedback("");
    try {
      const response = await api<ConversionResult>("convert", {
        machine,
        operation,
      });
      if (id !== generation.current) return;
      if (response.verification?.equivalent !== true)
        throw new Error(
          "The conversion was not verified. Your source is unchanged.",
        );
      setResult(response);
    } catch (e) {
      if (id === generation.current) setError((e as Error).message);
    } finally {
      if (id === generation.current) setPending(false);
    }
  }
  async function copy() {
    if (!result?.regexArtifact || !result.verification.equivalent) return;
    try {
      await navigator.clipboard.writeText(result.regexArtifact.regex);
      setFeedback("Expression copied. Share the declared alphabet too.");
    } catch {
      setFeedback(
        "Clipboard unavailable. Select the expression below and copy it manually.",
      );
    }
  }
  function download() {
    if (!result?.regexArtifact || !result.verification.equivalent) return;
    const data = { ...result.regexArtifact, verification: result.verification };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "transivium-regex.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback(
      "Downloaded expression, alphabet, canonical DFA and verification.",
    );
  }
  if (!available.length) return null;
  const artifact = result?.regexArtifact;
  const target = result?.machine ?? artifact?.canonicalDfa;
  return (
    <section className="panel conversion">
      <div className="panel-heading">
        <div>
          <h2>Convert &amp; verify</h2>
          <p>
            Inspect the derivation while keeping your source machine intact.
          </p>
        </div>
      </div>
      <div className="conversion-body">
        <div className="conversion-form">
          <label>
            Conversion
            <select
              aria-label="Conversion"
              value={operation}
              onChange={(e) => choose(e.target.value)}
            >
              {available.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="primary"
            disabled={!valid || pending}
            onClick={() => void convert()}
          >
            <ArrowRightLeft size={16} />
            {pending ? "Converting…" : "Convert machine"}
          </button>
        </div>
        {!valid && (
          <p className="simulation-hint">
            Validate the current revision before converting.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {result && (
          <>
            <div className="result-heading">
              <span className="status valid">
                <Check size={14} />
                Exactly verified
              </span>
              <p>
                {artifact
                  ? "Independently reconstructed from the emitted expression and checked by exact language comparison."
                  : result.verification.mode === "normalized_output"
                    ? "Post-input output streams are exactly equal. The initial Moore output is excluded."
                    : "The source and result have exactly the same language."}
              </p>
            </div>
            {artifact && (
              <div className="regex-export">
                <h3>Verified regular expression</h3>
                <label>
                  Expression
                  <textarea
                    aria-label="Expression"
                    readOnly
                    value={artifact.regex}
                    rows={3}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <p>
                  Declared alphabet:{" "}
                  <code>
                    {artifact.alphabet.length
                      ? `{${artifact.alphabet.join(", ")}}`
                      : "∅ (empty alphabet)"}
                  </code>
                </p>
                <div className="export-actions">
                  <button onClick={() => void copy()}>
                    <Copy size={15} />
                    Copy expression
                  </button>
                  <button onClick={download}>
                    <Download size={15} />
                    Download regex JSON
                  </button>
                </div>
                <p className="feedback" role="status">
                  {feedback}
                </p>
                <p className="simulation-hint">
                  Syntax: | union, concatenation, * star, parentheses, ε empty
                  string, ∅ empty language. Send the full alphabet separately.
                  External state names and layout may differ; compare complete
                  minimal DFAs.
                </p>
              </div>
            )}
            {target && (
              <>
                <div className="result-pair">
                  <div>
                    <h3>Source · {machine.states.length} states</h3>
                    <Graph
                      machine={machine}
                      select={noop}
                      connect={noop}
                      readOnly
                    />
                  </div>
                  <div>
                    <h3>
                      {artifact ? "Canonical minimal DFA" : "Result"} ·{" "}
                      {target.states.length} states
                    </h3>
                    <Graph
                      machine={target}
                      select={noop}
                      connect={noop}
                      readOnly
                    />
                  </div>
                </div>
                {result.machine && (
                  <button onClick={() => onAdopt(result.machine!)}>
                    Adopt result as draft
                  </button>
                )}
              </>
            )}
            <details className="derivation">
              <summary>Derivation · {result.steps.length} steps</summary>
              <ol>
                {result.steps.map((s) => (
                  <li key={s.index}>
                    <details>
                      <summary>{s.description}</summary>
                      <dl>
                        {Object.entries(s.details).map(([key, value]) => (
                          <div key={key}>
                            <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                            <dd>
                              <code>{detailText(value)}</code>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  </li>
                ))}
              </ol>
            </details>
          </>
        )}
      </div>
    </section>
  );
}
