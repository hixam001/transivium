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


def canonicalize(machine: dict, budget: Budget) -> dict:
    alphabet = sorted(machine["alphabet"])
    table = {(t["from"], t["symbol"]): t["to"] for t in machine["transitions"]}
    names = {machine["startState"]: "q0"}
    queue = deque([machine["startState"]])
    edges = []
    while queue:
        budget.check()
        source = queue.popleft()
        for symbol in alphabet:
            target = table[source, symbol]
            if target not in names:
                budget.check(len(names) + 1, budget.limits.states, "Canonical state")
                names[target] = f"q{len(names)}"
                queue.append(target)
            add_edge(edges, names[source], symbol, names[target], budget)
    finals = set(machine["finalStates"])
    return dict(
        kind="dfa",
        alphabet=alphabet,
        states=[{"id": n} for n in names.values()],
        startState="q0",
        finalStates=[n for old, n in names.items() if old in finals],
        transitions=edges,
    )


def minimize(machine: dict, budget: Budget, steps: list | None = None) -> dict:
    alphabet = sorted(machine["alphabet"])
    table = {(t["from"], t["symbol"]): t["to"] for t in machine["transitions"]}
    reachable = {machine["startState"]}
    queue = deque(reachable)
    while queue:
        budget.check()
        source = queue.popleft()
        for symbol in alphabet:
            target = table[source, symbol]
            if target not in reachable:
                reachable.add(target)
                queue.append(target)
    record(budget, steps, "reachable", "Remove unreachable states", states=sorted(reachable))
    finals = reachable & set(machine["finalStates"])
    blocks = [sorted(group) for group in [reachable - finals, finals] if group]
    record(budget, steps, "partition", "Partition final and nonfinal states", blocks=blocks)
    while True:
        membership = {s: i for i, block in enumerate(blocks) for s in block}
        refined = []
        for block in blocks:
            groups = {}
            for state in block:
                budget.check()
                signature = tuple(membership[table[state, symbol]] for symbol in alphabet)
                groups.setdefault(signature, []).append(state)
            refined.extend(groups.values())
        if len(refined) == len(blocks):
            break
        blocks = refined
        record(
            budget, steps, "partition", "Split states with different future behavior", blocks=blocks
        )
    membership = {s: f"b{i}" for i, block in enumerate(blocks) for s in block}
    edges = []
    for block in blocks:
        source = block[0]
        for symbol in alphabet:
            add_edge(edges, membership[source], symbol, membership[table[source, symbol]], budget)
    quotient = dict(
        kind="dfa",
        alphabet=alphabet,
        states=[{"id": f"b{i}"} for i in range(len(blocks))],
        startState=membership[machine["startState"]],
        finalStates=sorted({membership[s] for s in finals}),
        transitions=edges,
    )
    return canonicalize(quotient, budget)
