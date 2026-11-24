import re
from dataclasses import replace
from itertools import product

import pytest

from app.engine.budget import LIMITS, Budget
from app.engine.errors import EngineError
from app.engine.gnfa import generate_regex
from app.engine.regex_ast import EMPTY, EPSILON, Factory


def test_sound_simplification_and_precedence():
    f = Factory(Budget())
    a, b = f.literal("0"), f.literal("1")
    assert f.union(EMPTY, a, a).text == "0"
    assert f.concat(EPSILON, a, EPSILON).text == "0"
    assert f.concat(a, EMPTY).text == "∅"
    assert f.star(EMPTY).text == f.star(EPSILON).text == "ε"
    assert f.star(f.star(a)).text == "0*"
    assert f.concat(f.union(a, b), f.star(a)).text == "(0|1)0*"
    assert f.star(f.concat(a, b)).text == "(01)*"
    assert f.union(b, a).text == "0|1"


@pytest.mark.parametrize("name", ["D01", "D03", "D04", "D05", "D06"])
def test_generated_text_matches_known_fixture_languages_on_small_inputs(fixture, name):
    raw = fixture(name)["machine"]
    steps = []
    text, reference = generate_regex(raw, Budget(), steps)
    assert reference["kind"] == "dfa"
    assert any(s["phase"] == "gnfa_init" for s in steps)
    assert sum(s["phase"] == "eliminate" for s in steps) == len(reference["states"])
    # Test-only bounded Python-regex oracle on generated trusted fixture text.
    # Runtime never evaluates user regex in a host regex engine; TRN-11 adds
    # independent formal parsing and exact verification before export.
    expression = text.replace("ε", "(?:)").replace("∅", "(?!)")
    oracle = fixture(name)["regex"] if "regex" in fixture(name) else "(0|1)*01"
    oracle = oracle.replace("ε", "(?:)").replace("∅", "(?!)")
    for length in range(6):
        for word in product("01", repeat=length):
            value = "".join(word)
            assert bool(re.fullmatch(expression, value)) == bool(re.fullmatch(oracle, value))


def test_empty_alphabet_and_deterministic_serialization(fixture):
    for accepting, expected in [(True, "ε"), (False, "∅")]:
        raw = dict(
            kind="dfa",
            alphabet=[],
            states=[{"id": "s"}],
            startState="s",
            finalStates=["s"] if accepting else [],
            transitions=[],
        )
        assert generate_regex(raw, Budget(), [])[0] == expected
    raw = fixture("D01")["machine"]
    assert generate_regex(raw, Budget(), []) == generate_regex(raw, Budget(), [])


def test_expression_size_work_and_trace_guards(fixture):
    with pytest.raises(EngineError) as exc:
        generate_regex(fixture("D01")["machine"], Budget(replace(LIMITS, ast_work=3)), [])
    assert exc.value.code == "LIMIT_EXCEEDED"
    with pytest.raises(EngineError):
        Factory(Budget(replace(LIMITS, regex_bytes=1))).star(Factory(Budget()).literal("0"))
