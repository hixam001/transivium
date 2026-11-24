from copy import deepcopy

import pytest

from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.engine.validation import validate
from app.schemas import MACHINE


@pytest.mark.parametrize(
    "fixture_name,operation",
    [
        ("E01", "enfa_to_nfa"),
        ("N01", "nfa_to_dfa"),
        ("E01", "enfa_to_dfa"),
        ("D02", "minimize_dfa"),
        ("D01", "dfa_to_regex"),
        ("M01", "mealy_to_moore"),
        ("O01", "moore_to_mealy"),
    ],
)
def test_every_required_operation_returns_a_valid_certified_snapshot(
    client, fixture, fixture_name, operation
):
    source = fixture(fixture_name)["machine"]
    before = deepcopy(source)
    response = client.post("/api/v1/convert", json={"machine": source, "operation": operation})
    assert response.status_code == 200
    data = response.json()
    assert data["operation"] == operation
    assert data["verification"]["equivalent"] is True
    assert data["verification"]["mode"] == (
        "normalized_output" if source["kind"] in {"mealy", "moore"} else "language"
    )
    assert data["steps"][-1]["phase"] == "verify"
    target = (
        data["machine"] if operation != "dfa_to_regex" else data["regexArtifact"]["canonicalDfa"]
    )
    assert validate(MACHINE.validate_python(target), Budget()) == []
    assert source == before


@pytest.mark.parametrize("code,status", [("LIMIT_EXCEEDED", 422), ("DEADLINE_EXCEEDED", 503)])
def test_verification_resource_failure_never_returns_a_success_artifact(
    client, fixture, monkeypatch, code, status
):
    import app.engine.conversion as conversion

    def interrupted(*_):
        raise EngineError(code, "Injected verification budget failure.", status)

    monkeypatch.setattr(conversion, "verify_regex", interrupted)
    response = client.post(
        "/api/v1/convert", json={"machine": fixture("D01")["machine"], "operation": "dfa_to_regex"}
    )
    assert response.status_code == status
    assert response.json()["error"]["code"] == code
    assert "verification" not in response.json() and "regexArtifact" not in response.json()


@pytest.mark.parametrize("kind", ["dfa", "nfa", "enfa"])
@pytest.mark.parametrize("accepting", [False, True])
def test_empty_alphabet_acceptor_semantics_are_consistent_at_api_boundary(client, kind, accepting):
    machine = dict(
        kind=kind,
        alphabet=[],
        states=[{"id": "s"}],
        startState="s",
        finalStates=["s"] if accepting else [],
        transitions=[],
    )
    response = client.post("/api/v1/simulate", json={"machine": machine, "input": []})
    assert response.status_code == 200 and response.json()["accepted"] is accepting
    assert len(response.json()["steps"]) == 1


def test_nondeterministic_witness_is_shortest_and_replayable(client, fixture):
    right = fixture("D04")["machine"]
    left = fixture("N01")["machine"]
    result = client.post("/api/v1/equivalence", json={"left": left, "right": right}).json()
    assert result["counterexample"] == ["0"]
    outcomes = [
        client.post(
            "/api/v1/simulate", json={"machine": machine, "input": result["counterexample"]}
        ).json()["accepted"]
        for machine in [left, right]
    ]
    assert outcomes == [True, False]
