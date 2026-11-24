"""Output-preserving transducer conversions and exact paired-state checking."""

from collections import deque

from app.engine.acceptors import add_edge, record
from app.engine.budget import Budget
from app.engine.errors import EngineError


def moore_to_mealy(machine: dict, budget: Budget, steps: list | None = None) -> dict:
    outputs = {s["id"]: s["output"] for s in machine["states"]}
    edges = []
    for edge in sorted(machine["transitions"], key=lambda e: (e["from"], e["symbol"])):
        budget.check(len(edges) + 1, budget.limits.transitions, "Generated transition")
        output = outputs[edge["to"]]
        edges.append(dict(edge, output=output))
        record(
            budget,
            steps,
            "relabel",
            "Emit the destination state output",
            **{"from": edge["from"], "to": edge["to"], "symbol": edge["symbol"], "output": output},
        )
    return dict(
        kind="mealy",
        alphabet=sorted(machine["alphabet"]),
        outputAlphabet=sorted(machine["outputAlphabet"]),
        states=[{"id": s} for s in sorted(outputs)],
        startState=machine["startState"],
        transitions=edges,
    )


def mealy_to_moore(machine: dict, budget: Budget, steps: list | None = None) -> dict:
    alphabet = sorted(machine["alphabet"])
    gamma = sorted(machine["outputAlphabet"])
    table = {(e["from"], e["symbol"]): e for e in machine["transitions"]}
    initial = (machine["startState"], None)
    names = {initial: "q0"}
    states = [{"id": "q0", "output": gamma[0]}]
    edges = []
    queue = deque([initial])
    record(
        budget,
        steps,
        "initial",
        "Add a synthetic initial output; exclude it from normalized comparison",
        state="q0",
        output=gamma[0],
    )
    while queue:
        budget.check()
        pair = queue.popleft()
        for symbol in alphabet:
            edge = table[pair[0], symbol]
            target = (edge["to"], edge["output"])
            if target not in names:
                budget.check(len(states) + 1, budget.limits.states, "Output-split state")
                name = f"q{len(names)}"
                names[target] = name
                states.append({"id": name, "output": edge["output"]})
                queue.append(target)
                record(
                    budget,
                    steps,
                    "split",
                    "Split destination by incoming output",
                    sourceState=edge["to"],
                    output=edge["output"],
                    newState=name,
                )
            add_edge(edges, names[pair], symbol, names[target], budget)
    return dict(
        kind="moore",
        alphabet=alphabet,
        outputAlphabet=gamma,
        states=states,
        startState="q0",
        transitions=edges,
    )


def output_equivalent(left: dict, right: dict, budget: Budget) -> dict:
    if set(left["alphabet"]) != set(right["alphabet"]):
        raise EngineError("ALPHABET_MISMATCH", "Transducers need the same input alphabet.")
    alphabet = sorted(left["alphabet"])
    lt = {(e["from"], e["symbol"]): e for e in left["transitions"]}
    rt = {(e["from"], e["symbol"]): e for e in right["transitions"]}
    lo = {s["id"]: s.get("output") for s in left["states"]}
    ro = {s["id"]: s.get("output") for s in right["states"]}
    initial = (left["startState"], right["startState"])
    queue = deque([initial])
    parents = {initial: None}
    budget.check(1, budget.limits.product_pairs, "Output product pair")
    while queue:
        budget.check()
        pair = queue.popleft()
        for symbol in alphabet:
            a, b = lt[pair[0], symbol], rt[pair[1], symbol]
            a_output = a["output"] if left["kind"] == "mealy" else lo[a["to"]]
            b_output = b["output"] if right["kind"] == "mealy" else ro[b["to"]]
            if a_output != b_output:
                witness = [symbol]
                cursor = pair
                while parents[cursor] is not None:
                    previous, input_symbol = parents[cursor]
                    witness.append(input_symbol)
                    cursor = previous
                return dict(
                    equivalent=False,
                    counterexample=list(reversed(witness)),
                    visitedPairs=len(parents),
                )
            target = (a["to"], b["to"])
            if target not in parents:
                budget.check(len(parents) + 1, budget.limits.product_pairs, "Output product pair")
                parents[target] = (pair, symbol)
                queue.append(target)
    return dict(equivalent=True, counterexample=None, visitedPairs=len(parents))
