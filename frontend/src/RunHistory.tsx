import { useState } from "react";
import type { Machine } from "./model";
import { kinds } from "./model";
import { TracePlayback } from "./Simulation";
import type { SimulationResult } from "./Simulation";

export type RunSnapshot = {
  id: number;
  revision: number;
  title: string;
  machine: Machine;
  input: string;
  result: SimulationResult;
  createdAt: string;
};

export default function RunHistory({
  entries,
  revision,
}: {
  entries: RunSnapshot[];
  revision: number;
}) {
  const [selected, setSelected] = useState<number>();
  const entry = entries.find((item) => item.id === selected);
  return (
    <section
      className="panel reuse-panel"
      aria-labelledby="run-history-heading"
    >
      <div className="panel-heading">
        <div>
          <h2 id="run-history-heading">Run history</h2>
          <p>Review up to 20 simulations from this session.</p>
        </div>
      </div>
      <div className="reuse-body">
        {entries.length === 0 ? (
          <p>Run a validated machine to add its trace here.</p>
        ) : (
          <label>
            Saved run
            <select
              value={entry?.id ?? ""}
              onChange={(event) => setSelected(Number(event.target.value))}
            >
              <option value="">Choose a run</option>
              {entries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}. {item.title} · {item.input.slice(0, 24) || "ε"}
                  {item.input.length > 24 ? "…" : ""} ·{" "}
                  {item.revision === revision
                    ? "Current revision"
                    : "Earlier revision"}
                </option>
              ))}
            </select>
          </label>
        )}
        {entry && (
          <div className="reuse-preview">
            <p>
              <strong>{entry.title}</strong> · {kinds[entry.machine.kind]} ·{" "}
              {entry.machine.states.length} states ·{" "}
              <time dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleTimeString()}
              </time>
            </p>
            <p>
              {entry.revision === revision
                ? "Recorded from the current machine revision."
                : "Earlier machine revision. This trace uses its original machine and input."}
            </p>
            <TracePlayback
              key={entry.id}
              result={entry.result}
              input={entry.input}
              kind={entry.machine.kind}
            />
          </div>
        )}
      </div>
    </section>
  );
}
