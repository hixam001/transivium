from copy import deepcopy
from dataclasses import replace
from itertools import product

import pytest

from app.engine.budget import LIMITS, Budget
from app.engine.errors import EngineError
from app.engine.simulation import simulate
from app.schemas import MACHINE


@pytest.mark.parametrize("name", ["D01", "N01", "E01"])
def test_reference_acceptance_and_trace_shape(fixture, name):
    record = fixture(name)
    machine = MACHINE.validate_python(record["machine"])
    for sample in record["samples"]:
        result = simulate(machine, sample["input"])
        assert result["accepted"] is sample["accepted"]
        assert len(result["steps"]) == len(sample["input"]) + 1
        assert [s["index"] for s in result["steps"]] == list(range(len(sample["input"]) + 1))
        assert result["steps"][0]["symbol"] is None
        assert result["output"] is None and result["normalizedOutput"] is None


def test_epsilon_cycle_records_each_reachable_edge_once(fixture):
    m = MACHINE.validate_python(fixture("E01")["machine"])
    result = simulate(m, ["a", "a"])
    initial = result["steps"][0]
    assert initial["activeStates"] == ["s", "t"]
    assert initial["movedStates"] == ["s"]
    assert len(initial["epsilonTraversed"]) == 2
    assert result["steps"][1]["movedStates"] == ["u"]
    assert result["steps"][1]["activeStates"] == ["s", "t", "u"]


def test_dead_nfa_branch_is_preserved_through_remaining_input(fixture):
    m = MACHINE.validate_python(fixture("N01")["machine"])
    result = simulate(m, list("111"))
    assert result["accepted"] is False
    assert len(result["steps"]) == 4
    assert all(s["activeStates"] == [] for s in result["steps"][1:])


def test_dfa_matches_independent_language_predicate(fixture):
    model = MACHINE.validate_python(fixture("D01")["machine"])
    for length in range(7):
        for tokens in product("01", repeat=length):
            assert simulate(model, list(tokens))["accepted"] == "".join(tokens).endswith("01")


def test_initial_acceptance_does_not_accept_before_end(fixture):
    m = MACHINE.validate_python(fixture("D05")["machine"])
    assert simulate(m, [])["accepted"] is True
    assert simulate(m, ["0"])["accepted"] is False


def test_input_and_machine_errors_are_not_rejection(client, fixture):
    data = fixture("D01")["machine"]
    before = deepcopy(data)
    for tokens in [[" "], ["ε"], ["9"]]:
        r = client.post("/api/v1/simulate", json={"machine": data, "input": tokens})
        assert r.status_code == 422
        assert r.json()["error"]["code"] == "INVALID_INPUT"
        assert "accepted" not in r.json()
    data["transitions"].pop()
    r = client.post("/api/v1/simulate", json={"machine": data, "input": []})
    assert r.json()["error"]["code"] == "INVALID_MACHINE"
    assert before["states"] == data["states"]


def test_simulation_budget_fails_without_partial_trace(fixture):
    model = MACHINE.validate_python(fixture("D01")["machine"])
    with pytest.raises(EngineError) as exc:
        simulate(model, ["0"] * 512, Budget(replace(LIMITS, response_bytes=1500)))
    assert exc.value.code == "LIMIT_EXCEEDED"
    with pytest.raises(EngineError) as exc:
        simulate(model, ["0"] * 513)
    assert exc.value.code == "LIMIT_EXCEEDED"


def test_simulation_endpoint_contract(client, fixture):
    r = client.post(
        "/api/v1/simulate", json={"machine": fixture("D01")["machine"], "input": list("101")}
    )
    assert r.status_code == 200 and r.json()["accepted"] is True
    assert r.json()["steps"][-1]["activeStates"] == ["q2"]
