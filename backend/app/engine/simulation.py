"""Deterministic and nondeterministic traces over validated snapshots."""

import json
from collections import defaultdict, deque

from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.engine.validation import require_valid, validate_input
from app.schemas import MachineBase


def transition_index(machine: dict) -> dict:
    index = defaultdict(list)
    for edge in sorted(
        machine["transitions"],
        key=lambda t: (t["from"], t["symbol"] or "", t["to"], t.get("output", "")),
    ):
        index[edge["from"], edge["symbol"]].append(edge)
    return index


def closure(seeds: set[str], index: dict, budget: Budget) -> tuple[set[str], list[dict]]:
    active = set(seeds)
    queue = deque(sorted(seeds))
    traversed = []
    while queue:
        budget.check()
        state = queue.popleft()
        for edge in index.get((state, None), []):
            budget.check()
            traversed.append(edge)
            if edge["to"] not in active:
                active.add(edge["to"])
                queue.append(edge["to"])
    return active, traversed


def simulate(model: MachineBase, tokens: list[str], budget: Budget | None = None) -> dict:
    budget = budget or Budget()
    require_valid(model, budget)
    validate_input(model, tokens, budget)
    if model.kind not in {"dfa", "nfa", "enfa"}:
        raise EngineError(
            "INVALID_OPERATION", "This simulation engine currently accepts acceptors only."
        )
    machine = model.as_dict()
    index = transition_index(machine)
    active = {machine["startState"]}
    epsilon = []
    if model.kind == "enfa":
        active, epsilon = closure(active, index, budget)
    steps = []
    response_bytes = 1024  # reserve envelope/array overhead before allocating result

    def add_step(consumed, symbol, current, moved, traversed, epsilon_edges):
        nonlocal response_bytes
        budget.check()
        step = dict(
            index=consumed,
            symbol=symbol,
            activeStates=sorted(current),
            movedStates=moved,
            traversed=traversed,
            epsilonTraversed=epsilon_edges,
            outputPrefix=None,
        )
        response_bytes += (
            len(json.dumps(step, ensure_ascii=False, separators=(",", ":")).encode("utf-8")) + 1
        )
        budget.check(response_bytes, budget.limits.response_bytes, "Simulation response")
        steps.append(step)

    add_step(
        0, None, active, [machine["startState"]] if model.kind == "enfa" else None, [], epsilon
    )
    for consumed, symbol in enumerate(tokens, 1):
        budget.check()
        traversed = [edge for state in sorted(active) for edge in index.get((state, symbol), [])]
        moved = {edge["to"] for edge in traversed}
        active, epsilon = closure(moved, index, budget) if model.kind == "enfa" else (moved, [])
        add_step(
            consumed,
            symbol,
            active,
            sorted(moved) if model.kind == "enfa" else None,
            traversed,
            epsilon,
        )
    return dict(
        steps=steps,
        accepted=bool(active & set(machine["finalStates"])),
        output=None,
        normalizedOutput=None,
        initialOutput=None,
    )
