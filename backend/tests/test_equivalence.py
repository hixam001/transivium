from copy import deepcopy
from dataclasses import replace
from itertools import product
from random import Random

import pytest

from app.engine.acceptors import equivalent
from app.engine.budget import LIMITS, Budget
from app.engine.conversion import OPERATIONS, convert
from app.engine.errors import EngineError
from app.schemas import MACHINE


@pytest.mark.parametrize(
    "left,right,equal,witness",
    [("D01", "D02", True, None), ("D03", "D04", False, []), ("D01", "D04", False, ["0", "1"])],
)
def test_exact_http_decisions_and_shortest_witnesses(client, fixture, left, right, equal, witness):
    r = client.post(
        "/api/v1/equivalence",
        json={"left": fixture(left)["machine"], "right": fixture(right)["machine"]},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["equivalent"] is equal and data["counterexample"] == witness
    if equal:
        assert data["leftAccepts"] is None and data["rightAccepts"] is None
    else:
        assert data["leftAccepts"] is not data["rightAccepts"]


def test_alphabet_mismatch_and_transducer_are_explicit_errors(client, fixture):
    r = client.post(
        "/api/v1/equivalence",
        json={"left": fixture("D01")["machine"], "right": fixture("E01")["machine"]},
    )
    assert r.status_code == 422 and r.json()["error"]["code"] == "ALPHABET_MISMATCH"
    r = client.post(
        "/api/v1/equivalence",
        json={"left": fixture("M01")["machine"], "right": fixture("D01")["machine"]},
    )
    assert r.status_code == 422 and r.json()["error"]["code"] == "INVALID_OPERATION"


def test_sorted_alphabet_breaks_equal_length_witness_ties(fixture):
    left = dict(
        kind="dfa",
        alphabet=["1", "0"],
        states=[{"id": "s"}, {"id": "f"}],
        startState="s",
        finalStates=["f"],
        transitions=[{"from": q, "symbol": a, "to": "f"} for q in ["s", "f"] for a in "10"],
    )
    right = fixture("D04")["machine"]
    assert equivalent(left, right, Budget())["counterexample"] == ["0"]


def test_product_cap_is_never_an_equivalence_result(fixture):
    with pytest.raises(EngineError) as exc:
        equivalent(
            fixture("D01")["machine"],
            fixture("D04")["machine"],
            Budget(replace(LIMITS, product_pairs=1)),
        )
    assert exc.value.code == "LIMIT_EXCEEDED"


def test_bad_generated_machine_is_not_certified(fixture, monkeypatch):
    wrong = fixture("D04")["machine"]
    monkeypatch.setitem(OPERATIONS, "minimize_dfa", ("dfa", lambda *_: wrong))
    with pytest.raises(EngineError) as exc:
        convert(MACHINE.validate_python(fixture("D01")["machine"]), "minimize_dfa")
    assert exc.value.code == "VERIFICATION_FAILED" and exc.value.status == 500


def test_generated_witness_is_first_distinguishing_word_by_independent_enumeration():
    random = Random(903)

    def make():
        return dict(
            kind="dfa",
            alphabet=["1", "0"],
            states=[{"id": str(i)} for i in range(3)],
            startState="0",
            finalStates=[str(i) for i in range(3) if random.randrange(2)],
            transitions=[
                {"from": str(i), "symbol": a, "to": str(random.randrange(3))}
                for i in range(3)
                for a in "01"
            ],
        )

    def accepts(raw, word):
        table = {(e["from"], e["symbol"]): e["to"] for e in raw["transitions"]}
        state = raw["startState"]
        for symbol in word:
            state = table[state, symbol]
        return state in raw["finalStates"]

    for _ in range(40):
        left, right = make(), make()
        before = deepcopy((left, right))
        data = equivalent(left, right, Budget())
        assert (left, right) == before
        first = next(
            (
                list(word)
                for length in range(9)
                for word in product("01", repeat=length)
                if accepts(left, word) != accepts(right, word)
            ),
            None,
        )
        assert data["counterexample"] == first
        assert data["equivalent"] == (first is None)
