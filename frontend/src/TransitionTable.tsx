import { useId } from "react";
import type { Machine } from "./model";
import { isNondeterministic } from "./model";

export default function TransitionTable({
  machine,
  update,
  tableId,
}: {
  tableId?: string;
  machine: Machine;
  update: (m: Machine) => void;
}) {
  const generatedId = useId();
  const columns: (string | null)[] = [
    ...machine.alphabet,
    ...(machine.kind === "enfa" ? [null] : []),
  ];
  function setTargets(from: string, symbol: string | null, targets: string[]) {
    const oldOutput = machine.transitions.find(
      (t) => t.from === from && t.symbol === symbol,
    )?.output;
    update({
      ...machine,
      transitions: [
        ...machine.transitions.filter(
          (t) => t.from !== from || t.symbol !== symbol,
        ),
        ...targets.map((to) => ({
          from,
          symbol,
          to,
          ...(machine.kind === "mealy"
            ? { output: oldOutput ?? machine.outputAlphabet?.[0] ?? "" }
            : {}),
        })),
      ],
    });
  }
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Transition table</h2>
          <p>
            {isNondeterministic(machine)
              ? "Select multiple destinations with Ctrl / ⌘. Missing moves lead to the empty set."
              : "One destination for every state and input symbol."}
          </p>
        </div>
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Editable transition table"
        id={tableId ?? generatedId}
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">State</th>
              {columns.map((s) => (
                <th scope="col" key={s ?? "epsilon"}>
                  {s ?? "ε"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {machine.states.map((state) => (
              <tr key={state.id}>
                <th scope="row">
                  <span className="state-id">
                    {state.id === machine.startState ? "→ " : ""}
                    {machine.finalStates?.includes(state.id) ? "* " : ""}
                    {state.label || state.id}
                  </span>
                  {state.output !== undefined ? (
                    <small>output {state.output}</small>
                  ) : null}
                </th>
                {columns.map((symbol) => {
                  const edges = machine.transitions.filter(
                    (t) => t.from === state.id && t.symbol === symbol,
                  );
                  return (
                    <td key={symbol ?? "epsilon"}>
                      <select
                        aria-label={`Destination from ${state.id} on ${symbol ?? "epsilon"}`}
                        multiple={isNondeterministic(machine)}
                        size={
                          isNondeterministic(machine)
                            ? Math.min(3, machine.states.length) + 1
                            : undefined
                        }
                        value={
                          isNondeterministic(machine)
                            ? edges.map((t) => t.to)
                            : (edges[0]?.to ?? "")
                        }
                        onChange={(e) =>
                          setTargets(
                            state.id,
                            symbol,
                            isNondeterministic(machine)
                              ? [...e.target.selectedOptions].map(
                                  (o) => o.value,
                                )
                              : e.target.value
                                ? [e.target.value]
                                : [],
                          )
                        }
                      >
                        {!isNondeterministic(machine) && (
                          <option value="">No transition</option>
                        )}
                        {machine.states.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label || s.id}
                          </option>
                        ))}
                      </select>
                      {machine.kind === "mealy" && edges[0] ? (
                        <label className="edge-output">
                          Output
                          <select
                            aria-label={`Output from ${state.id} on ${symbol}`}
                            value={edges[0].output ?? ""}
                            onChange={(e) =>
                              update({
                                ...machine,
                                transitions: machine.transitions.map((t) =>
                                  t.from === state.id && t.symbol === symbol
                                    ? { ...t, output: e.target.value }
                                    : t,
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
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="panel-footnote">
        → start state &nbsp; * accepting state · Changes update the graph
        immediately.
      </p>
    </section>
  );
}
