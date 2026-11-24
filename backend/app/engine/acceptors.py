"""Reachable constructions and exact language checks, independent of the UI."""

from collections import deque

from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.engine.simulation import closure, transition_index


def record(budget, steps, phase, description, **details):
    if steps is not None:
        budget.step(steps, phase, description, **details)


def add_edge(edges, source, symbol, target, budget):
    budget.check(len(edges) + 1, budget.limits.transitions, "Generated transition")
    edges.append({"from": source, "symbol": symbol, "to": target})


def remove_epsilon(machine: dict, budget: Budget, steps: list | None = None) -> dict:
    index = transition_index(machine)
    alphabet = sorted(machine["alphabet"])
    closures = {}
    for state in sorted(s["id"] for s in machine["states"]):
        closures[state], _ = closure({state}, index, budget)
        record(
            budget,
            steps,
            "closure",
            f"Epsilon closure of {state}",
            state=state,
            closure=sorted(closures[state]),
        )
    edges = []
    for source in sorted(closures):
        for symbol in alphabet:
            targets = set()
            for state in sorted(closures[source]):
                budget.check()
                for edge in index.get((state, symbol), []):
                    targets.update(closures[edge["to"]])
            for target in sorted(targets):
                add_edge(edges, source, symbol, target, budget)
            record(
                budget,
                steps,
                "epsilon_removal",
                f"Compute moves from {source} on {symbol}",
                state=source,
                symbol=symbol,
                targets=sorted(targets),
            )
    finals = set(machine["finalStates"])
    return dict(
        kind="nfa",
        alphabet=alphabet,
        states=[{"id": s} for s in sorted(closures)],
        startState=machine["startState"],
        finalStates=[s for s in sorted(closures) if closures[s] & finals],
        transitions=edges,
    )


def determinize(machine: dict, budget: Budget, steps: list | None = None) -> dict:
    if machine["kind"] == "dfa":
        return machine
    index = transition_index(machine)
    alphabet = sorted(machine["alphabet"])
    initial = {machine["startState"]}
    if machine["kind"] == "enfa":
        initial, _ = closure(initial, index, budget)
    initial = tuple(sorted(initial))
    names = {initial: "q0"}
    queue = deque([initial])
    edges = []
    finals = []
    source_finals = set(machine["finalStates"])
    while queue:
        budget.check()
        subset = queue.popleft()
        name = names[subset]
        if set(subset) & source_finals:
            finals.append(name)
        outgoing = []
        for symbol in alphabet:
            moved = {edge["to"] for state in subset for edge in index.get((state, symbol), [])}
            if machine["kind"] == "enfa":
                moved, _ = closure(moved, index, budget)
            target = tuple(sorted(moved))
            if target not in names:
                budget.check(len(names) + 1, budget.limits.states, "Generated state")
                names[target] = f"q{len(names)}"
                queue.append(target)
            add_edge(edges, name, symbol, names[target], budget)
            outgoing.append(dict(symbol=symbol, to=names[target]))
        record(
            budget,
            steps,
            "subset",
            f"Expand subset {name}",
            state=name,
            members=list(subset),
            edges=outgoing,
        )
    return dict(
        kind="dfa",
        alphabet=alphabet,
        states=[{"id": name} for name in names.values()],
        startState="q0",
        finalStates=finals,
        transitions=edges,
    )


def equivalent(left: dict, right: dict, budget: Budget) -> dict:
    if set(left["alphabet"]) != set(right["alphabet"]):
        raise EngineError("ALPHABET_MISMATCH", "Compare machines with the same declared alphabet.")
    left, right = determinize(left, budget), determinize(right, budget)
    alphabet = sorted(left["alphabet"])
    lt = {(e["from"], e["symbol"]): e["to"] for e in left["transitions"]}
    rt = {(e["from"], e["symbol"]): e["to"] for e in right["transitions"]}
    lf, rf = set(left["finalStates"]), set(right["finalStates"])
    initial = (left["startState"], right["startState"])
    parents = {initial: None}
    budget.check(1, budget.limits.product_pairs, "Product pair")
    queue = deque([initial])
    while queue:
        budget.check()
        pair = queue.popleft()
        la, ra = pair[0] in lf, pair[1] in rf
        if la != ra:
            witness = []
            cursor = pair
            while parents[cursor] is not None:
                previous, symbol = parents[cursor]
                witness.append(symbol)
                cursor = previous
            return dict(
                equivalent=False,
                counterexample=list(reversed(witness)),
                leftAccepts=la,
                rightAccepts=ra,
                visitedPairs=len(parents),
            )
        for symbol in alphabet:
            target = (lt[pair[0], symbol], rt[pair[1], symbol])
            if target not in parents:
                budget.check(len(parents) + 1, budget.limits.product_pairs, "Product pair")
                parents[target] = (pair, symbol)
                queue.append(target)
    return dict(
        equivalent=True,
        counterexample=None,
        leftAccepts=None,
        rightAccepts=None,
        visitedPairs=len(parents),
    )
