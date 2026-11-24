"""Small injected limits exercise the same pre-growth guards as deployed caps."""

from copy import deepcopy
from dataclasses import replace

import pytest

from app.engine.budget import LIMITS, Budget
from app.engine.conversion import convert
from app.engine.errors import EngineError
from app.engine.gnfa import generate_regex
from app.engine.regex_parser import parse
from app.engine.simulation import simulate
from app.schemas import MACHINE


def test_gnfa_counts_both_synthetic_states_before_initial_trace(fixture):
    steps = []
    with pytest.raises(EngineError, match="GNFA state") as exc:
        generate_regex(fixture("D01")["machine"], Budget(replace(LIMITS, states=4)), steps)
    assert exc.value.code == "LIMIT_EXCEEDED"
    assert not any(step["phase"] == "gnfa_init" for step in steps)
    assert generate_regex(fixture("D01")["machine"], Budget(replace(LIMITS, states=5)), [])[0]


@pytest.mark.parametrize(
    "overrides",
    [
        {"ast_work": 1},
        {"regex_bytes": 1},
        {"derivation_steps": 1},
        {"response_bytes": 1024},
        {"product_pairs": 0},
    ],
)
def test_generation_or_verification_caps_never_return_artifact(fixture, overrides):
    source = fixture("D01")["machine"]
    before = deepcopy(source)
    with pytest.raises(EngineError) as exc:
        convert(
            MACHINE.validate_python(source), "dfa_to_regex", Budget(replace(LIMITS, **overrides))
        )
    assert exc.value.code == "LIMIT_EXCEEDED"
    assert source == before


def test_utf8_regex_limit_counts_bytes_including_formal_symbols():
    assert parse("ε", [], Budget(replace(LIMITS, regex_bytes=2))) == ["ε"]
    with pytest.raises(EngineError) as exc:
        parse("∅", [], Budget(replace(LIMITS, regex_bytes=2)))
    assert exc.value.code == "LIMIT_EXCEEDED"


def test_trace_rejected_before_append_and_deadline_shared_with_verification(fixture, monkeypatch):
    steps = []
    with pytest.raises(EngineError):
        Budget(replace(LIMITS, response_bytes=1030)).step(steps, "test", "too much", data="x" * 100)
    assert steps == []
    import app.engine.conversion as module

    budget = Budget(clock=lambda: 0)
    original = module.verify_regex

    def expired(text, source, actual):
        assert actual is budget
        actual.clock = lambda: 6
        return original(text, source, actual)

    monkeypatch.setattr(module, "verify_regex", expired)
    with pytest.raises(EngineError) as exc:
        convert(MACHINE.validate_python(fixture("D01")["machine"]), "dfa_to_regex", budget)
    assert exc.value.code == "DEADLINE_EXCEEDED"


def test_maximum_valid_states_alphabet_and_input_are_supported():
    alphabet = list("0123456789ABCDEF")
    raw = dict(
        kind="dfa",
        alphabet=alphabet,
        states=[{"id": str(i)} for i in range(256)],
        startState="0",
        finalStates=["0"],
        transitions=[
            {"from": str(i), "symbol": symbol, "to": str((i + 1) % 256)}
            for i in range(256)
            for symbol in alphabet
        ],
    )
    result = simulate(MACHINE.validate_python(raw), ["0"] * 512)
    assert result["accepted"] is True and len(result["steps"]) == 513
