"""Certify every successful conversion within the same request budget."""

from app.engine.acceptors import determinize, equivalent, minimize, remove_epsilon
from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.engine.gnfa import generate_regex
from app.engine.regex_verifier import verify_regex
from app.engine.transducers import mealy_to_moore, moore_to_mealy, output_equivalent
from app.engine.validation import require_valid
from app.schemas import MACHINE, MachineBase

OPERATIONS = {
    "enfa_to_nfa": ("enfa", remove_epsilon),
    "nfa_to_dfa": ("nfa", determinize),
    "enfa_to_dfa": ("enfa", determinize),
    "minimize_dfa": ("dfa", minimize),
    "mealy_to_moore": ("mealy", mealy_to_moore),
    "moore_to_mealy": ("moore", moore_to_mealy),
}


def convert(model: MachineBase, operation: str, budget: Budget | None = None) -> dict:
    budget = budget or Budget()
    require_valid(model, budget)
    if operation == "dfa_to_regex" and model.kind == "dfa":
        source = model.as_dict()
        steps = []
        text, reference = generate_regex(source, budget, steps)
        reconstructed = verify_regex(text, source, budget)
        if reconstructed != reference:
            raise EngineError(
                "VERIFICATION_FAILED", "Canonical reconstructed reference differs.", 500
            )
        budget.step(
            steps,
            "verify",
            "Independent text reconstruction is exactly equivalent",
            mode="language",
            equivalent=True,
        )
        return dict(
            operation=operation,
            machine=None,
            steps=steps,
            verification=dict(equivalent=True, mode="language", method="product_bfs"),
            regexArtifact=dict(
                schemaVersion=1,
                syntax="formal-v1",
                regex=text,
                alphabet=sorted(source["alphabet"]),
                canonicalDfa=reference,
            ),
        )
    if operation not in OPERATIONS or model.kind != OPERATIONS[operation][0]:
        raise EngineError(
            "INVALID_OPERATION", "Choose an operation compatible with this machine kind."
        )
    source = model.as_dict()
    steps = []
    result = OPERATIONS[operation][1](source, budget, steps)
    require_valid(MACHINE.validate_python(result), budget)
    transducer = model.kind in {"mealy", "moore"}
    checker = output_equivalent if transducer else equivalent
    mode = "normalized_output" if transducer else "language"
    if not checker(source, result, budget)["equivalent"]:
        raise EngineError(
            "VERIFICATION_FAILED", "Generated machine failed exact verification.", 500
        )
    budget.step(steps, "verify", "Exact equivalence verified", mode=mode, equivalent=True)
    return dict(
        operation=operation,
        machine=result,
        steps=steps,
        verification=dict(equivalent=True, mode=mode, method="product_bfs"),
        regexArtifact=None,
    )
