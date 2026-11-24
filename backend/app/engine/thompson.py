"""Build an epsilon-NFA from independent postfix parser output."""

from app.engine.budget import Budget
from app.engine.errors import EngineError


def construct(postfix: list[str], alphabet: list[str], budget: Budget) -> dict:
    states = []
    edges = []
    fragments = []

    def state():
        budget.check(len(states) + 1, budget.limits.states, "Thompson state")
        budget.allocate()
        name = f"v{len(states)}"
        states.append({"id": name})
        return name

    def edge(source, target, symbol=None):
        budget.check(len(edges) + 1, budget.limits.transitions, "Thompson transition")
        budget.allocate()
        edges.append({"from": source, "to": target, "symbol": symbol})

    for token in postfix:
        budget.check()
        if token in {".", "|", "*"}:
            arity = 1 if token == "*" else 2
            if len(fragments) < arity:
                raise EngineError("INVALID_REGEX", "Malformed expression fragments.")
            right = fragments.pop()
            if token == ".":
                left = fragments.pop()
                edge(left[1], right[0])
                fragments.append((left[0], right[1]))
            elif token == "|":
                left = fragments.pop()
                start, end = state(), state()
                edge(start, left[0])
                edge(start, right[0])
                edge(left[1], end)
                edge(right[1], end)
                fragments.append((start, end))
            else:
                start, end = state(), state()
                edge(start, right[0])
                edge(start, end)
                edge(right[1], right[0])
                edge(right[1], end)
                fragments.append((start, end))
        else:
            start, end = state(), state()
            if token != "∅":
                edge(start, end, None if token == "ε" else token)
            fragments.append((start, end))
    if len(fragments) != 1:
        raise EngineError("INVALID_REGEX", "Expression has incomplete fragments.")
    start, end = fragments[0]
    return dict(
        kind="enfa",
        alphabet=sorted(alphabet),
        states=states,
        startState=start,
        finalStates=[end],
        transitions=edges,
    )
