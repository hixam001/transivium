"""Deterministic GNFA generation. This module never certifies its own text."""

from app.engine.acceptors import minimize
from app.engine.budget import Budget
from app.engine.regex_ast import EMPTY, EPSILON, Factory


def generate_regex(machine: dict, budget: Budget, steps: list) -> tuple[str, dict]:
    reference = minimize(machine, budget, steps)
    budget.check(len(reference["states"]) + 2, budget.limits.states, "GNFA state")
    factory = Factory(budget)
    labels = {}
    for edge in reference["transitions"]:
        key = (edge["from"], edge["to"])
        labels[key] = factory.union(labels.get(key, EMPTY), factory.literal(edge["symbol"]))
    labels["@start", reference["startState"]] = EPSILON
    for state in reference["finalStates"]:
        labels[state, "@final"] = EPSILON
    original = [s["id"] for s in reference["states"]]
    states = ["@start", *original, "@final"]
    budget.step(
        steps,
        "gnfa_init",
        "Add fresh start and final states",
        states=states[:],
        edges=[dict(from_=a, to=b, regex=node.text) for (a, b), node in sorted(labels.items())],
    )
    # JSON trace uses the reserved wire key "from", not a Python identifier.
    steps[-1]["details"]["edges"] = [
        {"from": e["from_"], "to": e["to"], "regex": e["regex"]}
        for e in steps[-1]["details"]["edges"]
    ]
    for eliminated in original:
        budget.check()
        remaining = [s for s in states if s != eliminated]
        incoming = {s: labels[s, eliminated] for s in remaining if (s, eliminated) in labels}
        outgoing = {s: labels[eliminated, s] for s in remaining if (eliminated, s) in labels}
        loop = factory.star(labels.get((eliminated, eliminated), EMPTY))
        updates = []
        update_bytes = 0
        for source, left in incoming.items():
            for target, right in outgoing.items():
                budget.check()
                before = labels.get((source, target), EMPTY)
                after = factory.union(before, factory.concat(left, loop, right))
                if after.text != before.text:
                    update_bytes += (
                        len(before.text.encode("utf-8")) + len(after.text.encode("utf-8")) + 150
                    )
                    budget.check(
                        budget.trace_bytes + update_bytes,
                        budget.limits.response_bytes,
                        "GNFA trace response",
                    )
                    updates.append(
                        {"from": source, "to": target, "before": before.text, "after": after.text}
                    )
                    labels[source, target] = after
        labels = {key: value for key, value in labels.items() if eliminated not in key}
        states = remaining
        budget.step(
            steps, "eliminate", f"Eliminate {eliminated}", state=eliminated, updates=updates
        )
    text = labels.get(("@start", "@final"), EMPTY).text
    budget.check(len(text.encode("utf-8")), budget.limits.regex_bytes, "Serialized regex")
    return text, reference
