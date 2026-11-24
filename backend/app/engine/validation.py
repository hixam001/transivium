"""Formal checks independent of HTTP and rendering."""

import re
from collections import Counter

from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.schemas import Acceptor, MachineBase

SYMBOL = re.compile(r"^[A-Za-z0-9]$")


def validate(machine: MachineBase, budget: Budget | None = None) -> list[dict]:
    budget = budget or Budget()
    limits = budget.limits
    budget.check(len(machine.states), limits.states, "State")
    budget.check(len(machine.transitions), limits.transitions, "Transition")
    budget.check(len(machine.alphabet), limits.symbols, "Alphabet")
    issues = []

    def issue(code, path, message):
        issues.append(dict(code=code, path="machine." + path, message=message))

    def alphabet_ok(values, path, nonempty=False):
        if (
            len(set(values)) != len(values)
            or any(not SYMBOL.fullmatch(s) for s in values)
            or (nonempty and not values)
        ):
            issue(
                "INVALID_ALPHABET",
                path,
                "Use distinct single ASCII letters or digits; transducer alphabets cannot be empty.",
            )

    deterministic = machine.kind in {"dfa", "mealy", "moore"}
    is_transducer = machine.kind in {"mealy", "moore"}
    alphabet_ok(machine.alphabet, "alphabet", is_transducer)
    outputs = set()
    if is_transducer:
        budget.check(len(machine.outputAlphabet), limits.symbols, "Output alphabet")
        alphabet_ok(machine.outputAlphabet, "outputAlphabet", True)
        outputs = set(machine.outputAlphabet)
    ids = {s.id for s in machine.states}
    if len(ids) != len(machine.states):
        issue("DUPLICATE_STATE", "states", "State IDs must be unique.")
    if machine.startState not in ids:
        issue("INVALID_START_STATE", "startState", "Choose an existing start state.")
    if isinstance(machine, Acceptor):
        if (
            len(set(machine.finalStates)) != len(machine.finalStates)
            or not set(machine.finalStates) <= ids
        ):
            issue(
                "INVALID_FINAL_STATE",
                "finalStates",
                "Final states must be unique existing state IDs.",
            )
    for i, state in enumerate(machine.states):
        budget.check()
        if machine.kind == "moore":
            if state.output not in outputs:
                issue(
                    "INVALID_OUTPUT",
                    f"states.{i}.output",
                    "Each Moore state needs an output from the output alphabet.",
                )
        elif "output" in state.model_fields_set:
            issue(
                "INVALID_OUTPUT",
                f"states.{i}.output",
                "State outputs are allowed only for Moore machines.",
            )
    pairs = Counter()
    edges = set()
    for i, edge in enumerate(machine.transitions):
        budget.check()
        path = f"transitions.{i}"
        if edge.from_ not in ids or edge.to not in ids:
            issue("UNKNOWN_STATE", path, "Both transition endpoints must exist.")
        if edge.symbol is None:
            if machine.kind != "enfa":
                issue("INVALID_EPSILON", path + ".symbol", "Only epsilon-NFAs allow epsilon edges.")
        elif edge.symbol not in machine.alphabet:
            issue(
                "INVALID_SYMBOL",
                path + ".symbol",
                "Transition symbol must belong to the input alphabet.",
            )
        if machine.kind == "mealy":
            if edge.output not in outputs:
                issue(
                    "INVALID_OUTPUT",
                    path + ".output",
                    "Every Mealy edge needs an output from the output alphabet.",
                )
        elif "output" in edge.model_fields_set:
            issue(
                "INVALID_OUTPUT",
                path + ".output",
                "Transition outputs are allowed only for Mealy machines.",
            )
        pairs[edge.from_, edge.symbol] += 1
        identity = (edge.from_, edge.symbol, edge.to, edge.output)
        if identity in edges:
            issue("DUPLICATE_TRANSITION", path, "Duplicate edges are not allowed.")
        edges.add(identity)
    if deterministic:
        for state in sorted(ids):
            for symbol in sorted(set(machine.alphabet)):
                count = pairs[state, symbol]
                if count == 0:
                    issue(
                        "MISSING_TRANSITION",
                        "transitions",
                        f"Missing transition from {state} on {symbol}.",
                    )
                elif count > 1:
                    issue(
                        "NONDETERMINISTIC_TRANSITION",
                        "transitions",
                        f"More than one transition from {state} on {symbol}.",
                    )
    return issues


def require_valid(machine: MachineBase, budget: Budget | None = None):
    issues = validate(machine, budget)
    if issues:
        raise EngineError(
            "INVALID_MACHINE", "Correct the machine before running this operation.", issues=issues
        )


def validate_input(machine: MachineBase, tokens: list[str], budget: Budget):
    budget.check(len(tokens), budget.limits.input_tokens, "Input token")
    for i, token in enumerate(tokens):
        if token not in machine.alphabet:
            raise EngineError(
                "INVALID_INPUT",
                "Input contains a symbol outside the declared alphabet.",
                issues=[
                    dict(
                        code="INVALID_INPUT",
                        path=f"input.{i}",
                        message="Use a declared input symbol; leave input blank for epsilon.",
                    )
                ],
            )
