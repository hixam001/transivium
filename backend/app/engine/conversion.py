"""Certify every successful conversion within the same request budget."""

from app.engine.acceptors import determinize, equivalent, remove_epsilon
from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.engine.validation import require_valid
from app.schemas import MACHINE, MachineBase

OPERATIONS = {
    "enfa_to_nfa": ("enfa", remove_epsilon),
    "nfa_to_dfa": ("nfa", determinize),
    "enfa_to_dfa": ("enfa", determinize),
}


def convert(model: MachineBase, operation: str, budget: Budget | None = None) -> dict:
    budget = budget or Budget()
    require_valid(model, budget)
    if operation not in OPERATIONS or model.kind != OPERATIONS[operation][0]:
        raise EngineError(
            "INVALID_OPERATION", "Choose an operation compatible with this machine kind."
        )
    source = model.as_dict()
    steps = []
    result = OPERATIONS[operation][1](source, budget, steps)
    require_valid(MACHINE.validate_python(result), budget)
    if not equivalent(source, result, budget)["equivalent"]:
        raise EngineError(
            "VERIFICATION_FAILED", "Generated machine failed exact verification.", 500
        )
    budget.step(
        steps, "verify", "Exact language equivalence verified", mode="language", equivalent=True
    )
    return dict(
        operation=operation,
        machine=result,
        steps=steps,
        verification=dict(equivalent=True, mode="language", method="product_bfs"),
        regexArtifact=None,
    )
