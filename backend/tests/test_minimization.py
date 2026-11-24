from copy import deepcopy
from random import Random

import pytest

from app.engine.acceptors import equivalent
from app.engine.budget import Budget
from app.engine.conversion import convert
from app.schemas import MACHINE


def minimized(raw):
    return convert(MACHINE.validate_python(raw), "minimize_dfa")["machine"]


def test_known_minimal_count_and_canonical_form(fixture):
    result = minimized(fixture("D02")["machine"])
    reference = minimized(fixture("D01")["machine"])
    assert result == reference
    assert len(result["states"]) == 3
    assert "unreachable" not in str(result)


@pytest.mark.parametrize("name,finals", [("D03", ["q0"]), ("D04", [])])
def test_uniform_finality_and_empty_alphabet(fixture, name, finals):
    raw = fixture(name)["machine"]
    assert len(minimized(raw)["states"]) == 1
    raw.update(alphabet=[], transitions=[], states=[{"id": "s"}, {"id": "unreachable"}])
    result = minimized(raw)
    assert result["states"] == [{"id": "q0"}]
    assert result["transitions"] == [] and result["finalStates"] == finals


def test_ids_labels_and_array_order_do_not_affect_canonical_result(fixture):
    raw = fixture("D01")["machine"]
    expected = minimized(raw)
    mapping = {"q0": "z", "q1": "a", "q2": "other"}
    renamed = deepcopy(raw)
    renamed["alphabet"].reverse()
    renamed["states"] = [
        {"id": mapping[s["id"]], "label": "Display only"} for s in reversed(raw["states"])
    ]
    renamed["startState"] = mapping[raw["startState"]]
    renamed["finalStates"] = [mapping[s] for s in raw["finalStates"]]
    renamed["transitions"] = [
        {"from": mapping[t["from"]], "symbol": t["symbol"], "to": mapping[t["to"]]}
        for t in reversed(raw["transitions"])
    ]
    assert minimized(renamed) == expected


def test_generated_minimal_states_are_pairwise_distinguishable():
    random = Random(801)
    for _ in range(25):
        raw = dict(
            kind="dfa",
            alphabet=["0", "1"],
            states=[{"id": str(i)} for i in range(6)],
            startState="0",
            finalStates=[str(i) for i in range(6) if random.randrange(2)],
            transitions=[
                {"from": str(i), "symbol": symbol, "to": str(random.randrange(6))}
                for i in range(6)
                for symbol in "01"
            ],
        )
        result = minimized(raw)
        assert minimized(result) == result
        assert equivalent(raw, result, Budget())["equivalent"]
        ids = [s["id"] for s in result["states"]]
        for i, left in enumerate(ids):
            for right in ids[i + 1 :]:
                a = dict(result, startState=left)
                b = dict(result, startState=right)
                assert not equivalent(a, b, Budget())["equivalent"]


def test_minimize_api_contains_partition_derivation(client, fixture):
    r = client.post(
        "/api/v1/convert", json={"machine": fixture("D02")["machine"], "operation": "minimize_dfa"}
    )
    assert r.status_code == 200
    assert r.json()["verification"]["equivalent"]
    assert {step["phase"] for step in r.json()["steps"]} >= {"reachable", "partition", "verify"}
