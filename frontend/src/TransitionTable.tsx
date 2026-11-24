import { useId, useMemo, useState } from "react";
import type { Machine, Transition } from "./model";
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
  const [requestedPage, setPage] = useState(0);
  // Each native destination selector contains every state. Bound the option
  // count as machines approach the supported state and alphabet limits.
  const optionsPerRow = Math.max(
    1,
    columns.length * (machine.states.length + 1),
  );
  const rowsPerPage = Math.max(1, Math.floor(24_576 / optionsPerRow));
  const lastPage = Math.max(
    0,
    Math.ceil(machine.states.length / rowsPerPage) - 1,
  );
  const page = Math.min(requestedPage, lastPage);
  const start = page * rowsPerPage;
  const rows = machine.states.slice(start, start + rowsPerPage);
  const edgesByState = useMemo(() => {
    const index = new Map<string, Map<string | null, Transition[]>>();
    for (const edge of machine.transitions) {
      const bySymbol = index.get(edge.from) ?? new Map();
      const edges = bySymbol.get(edge.symbol) ?? [];
      edges.push(edge);
      bySymbol.set(edge.symbol, edges);
      index.set(edge.from, bySymbol);
    }
    return index;
  }, [machine.transitions]);
  function setTargets(from: string, symbol: string | null, targets: string[]) {
    const oldOutput = edgesByState.get(from)?.get(symbol)?.[0]?.output;
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
      {lastPage > 0 && (
        <div className="table-page">
          <p aria-live="polite">
            States {start + 1}–{start + rows.length} of {machine.states.length}
          </p>
          <label className="inline-field">
            Jump to state
            <select
              aria-label="Jump to state"
              value=""
              onChange={(event) =>
                setPage(Math.floor(Number(event.target.value) / rowsPerPage))
              }
            >
              <option value="" disabled>
                Choose a state
              </option>
              {machine.states.map(({ id, label }, index) => (
                <option key={id} value={index}>
                  {label || id}
                </option>
              ))}
            </select>
          </label>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous states
          </button>
          <button
            disabled={page === lastPage}
            onClick={() => setPage(page + 1)}
          >
            Next states
          </button>
        </div>
      )}
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
            {rows.map((state) => (
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
                  const edges = edgesByState.get(state.id)?.get(symbol) ?? [];
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
