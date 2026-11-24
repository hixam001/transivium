from dataclasses import replace
from itertools import product
from random import Random

import pytest

from app.engine.budget import LIMITS, Budget
from app.engine.conversion import convert
from app.engine.errors import EngineError
from app.engine.regex_parser import parse
from app.engine.regex_verifier import reconstruct, verify_regex
from app.engine.simulation import simulate
from app.schemas import MACHINE


@pytest.mark.parametrize(
    "text", ["ε", "∅", "0", "(0|1)*01", "0**", "ε|0", "((0))", "0|10*", "(0|1)0*"]
)
def test_supported_grammar(text):
    assert reconstruct(text, ["0", "1"], Budget())["kind"] == "dfa"


@pytest.mark.parametrize(
    "text", ["", "(", "0)", "()", "0|", "|0", "*0", "0 1", "0+", "[01]", "0?", "2", "\\0", "."]
)
def test_unsupported_or_malformed_grammar(text):
    with pytest.raises(EngineError) as exc:
        parse(text, ["0", "1"], Budget())
    assert exc.value.code == "INVALID_REGEX"


def test_parser_nesting_and_thompson_state_caps():
    assert reconstruct("(" * 128 + "0" + ")" * 128, ["0"], Budget())
    with pytest.raises(EngineError) as exc:
        parse("(" * 129 + "0" + ")" * 129, ["0"], Budget())
    assert exc.value.code == "LIMIT_EXCEEDED"
    with pytest.raises(EngineError) as exc:
        reconstruct("01", ["0", "1"], Budget(replace(LIMITS, states=2)))
    assert exc.value.code == "LIMIT_EXCEEDED"


def test_precedence_and_repeated_star_have_independent_expected_languages():
    for text, predicate in [
        ("0|10*", lambda s: s == "0" or (s.startswith("1") and set(s[1:]) <= {"0"})),
        ("(0|1)0*", lambda s: bool(s) and set(s[1:]) <= {"0"}),
        ("0**", lambda s: set(s) <= {"0"}),
    ]:
        model = MACHINE.validate_python(reconstruct(text, ["0", "1"], Budget()))
        for length in range(5):
            for tokens in product("01", repeat=length):
                assert simulate(model, list(tokens))["accepted"] == predicate("".join(tokens))


@pytest.mark.parametrize("name", ["D01", "D02", "D03", "D04", "D05", "D06"])
def test_export_artifacts_are_independently_exact_and_keep_full_alphabet(fixture, name):
    raw = fixture(name)["machine"]
    result = convert(MACHINE.validate_python(raw), "dfa_to_regex")
    artifact = result["regexArtifact"]
    assert result["verification"]["equivalent"] is True and result["machine"] is None
    assert artifact["alphabet"] == ["0", "1"]
    assert (
        reconstruct(artifact["regex"], artifact["alphabet"], Budget()) == artifact["canonicalDfa"]
    )


def test_empty_alphabet_export():
    for finals, text in [(["s"], "ε"), ([], "∅")]:
        raw = dict(
            kind="dfa",
            alphabet=[],
            states=[{"id": "s"}],
            startState="s",
            finalStates=finals,
            transitions=[],
        )
        artifact = convert(MACHINE.validate_python(raw), "dfa_to_regex")["regexArtifact"]
        assert artifact["regex"] == text and artifact["alphabet"] == []


def test_mutated_serialized_text_is_detected_and_no_artifact_returned(client, fixture, monkeypatch):
    import app.engine.conversion as conversion

    raw = fixture("D01")["machine"]
    monkeypatch.setattr(conversion, "generate_regex", lambda *args: ("0*", raw))
    r = client.post("/api/v1/convert", json={"machine": raw, "operation": "dfa_to_regex"})
    assert r.status_code == 500 and r.json()["error"]["code"] == "VERIFICATION_FAILED"
    assert "regexArtifact" not in r.json()
    with pytest.raises(EngineError) as exc:
        verify_regex("0|", raw, Budget())
    assert exc.value.code == "VERIFICATION_FAILED"


def test_fixed_seed_export_round_trips_with_limits_counted_separately():
    random = Random(1101)
    successes = failures = 0
    for _ in range(35):
        n = random.choice([2, 3, 4])
        raw = dict(
            kind="dfa",
            alphabet=["0", "1"],
            states=[{"id": str(i)} for i in range(n)],
            startState="0",
            finalStates=[str(i) for i in range(n) if random.randrange(2)],
            transitions=[
                {"from": str(i), "symbol": symbol, "to": str(random.randrange(n))}
                for i in range(n)
                for symbol in "01"
            ],
        )
        try:
            result = convert(MACHINE.validate_python(raw), "dfa_to_regex")
            assert result["verification"]["equivalent"] is True
            successes += 1
        except EngineError as exc:
            assert exc.code in {"LIMIT_EXCEEDED", "DEADLINE_EXCEEDED"}
            failures += 1
    assert successes >= 20 and successes + failures == 35
