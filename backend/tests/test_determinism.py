from copy import deepcopy

import pytest


@pytest.mark.parametrize(
    "name,operation",
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
def test_operation_results_are_deterministic_across_input_array_order(
    client, fixture, name, operation
):
    source = fixture(name)["machine"]
    reordered = deepcopy(source)
    for field in ["states", "transitions", "alphabet", "finalStates", "outputAlphabet"]:
        if field in reordered:
            reordered[field].reverse()
    first = client.post("/api/v1/convert", json={"machine": source, "operation": operation})
    repeated = client.post("/api/v1/convert", json={"machine": source, "operation": operation})
    permuted = client.post("/api/v1/convert", json={"machine": reordered, "operation": operation})
    assert first.status_code == repeated.status_code == permuted.status_code == 200
    assert first.json() == repeated.json() == permuted.json()


@pytest.mark.parametrize(
    "name,input_value",
    [("D01", "101"), ("N01", "01"), ("E01", "aa"), ("M01", "0101"), ("O01", "0101")],
)
def test_execution_traces_do_not_depend_on_transition_order(client, fixture, name, input_value):
    source = fixture(name)["machine"]
    reverse = deepcopy(source)
    reverse["transitions"].reverse()
    reverse["states"].reverse()
    results = [
        client.post(
            "/api/v1/simulate", json={"machine": machine, "input": list(input_value)}
        ).json()
        for machine in [source, reverse]
    ]
    assert results[0] == results[1]
