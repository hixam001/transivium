from dataclasses import replace
from itertools import product
from random import Random

import pytest

from app.engine.acceptors import equivalent
from app.engine.budget import LIMITS, Budget
from app.engine.conversion import convert
from app.engine.errors import EngineError
from app.engine.simulation import simulate
from app.schemas import MACHINE


@pytest.mark.parametrize(
    "name,operation", [("E01", "enfa_to_nfa"), ("N01", "nfa_to_dfa"), ("E01", "enfa_to_dfa")]
)
def test_exact_conversions_and_reference_behavior(fixture, name, operation):
    source = MACHINE.validate_python(fixture(name)["machine"])
    output = convert(source, operation)
    target = MACHINE.validate_python(output["machine"])
    assert output["verification"] == {
        "equivalent": True,
        "mode": "language",
        "method": "product_bfs",
    }
    assert output["steps"][-1]["phase"] == "verify"
    assert [s["index"] for s in output["steps"]] == list(range(len(output["steps"])))
    assert all(t["symbol"] is not None for t in output["machine"]["transitions"])
    for length in range(5):
        for tokens in product(source.alphabet, repeat=length):
            assert (
                simulate(source, list(tokens))["accepted"]
                == simulate(target, list(tokens))["accepted"]
            )


def test_empty_subset_is_complete_sink(fixture):
    output = convert(MACHINE.validate_python(fixture("N01")["machine"]), "nfa_to_dfa")
    sink = next(
        s["details"]["state"]
        for s in output["steps"]
        if s["phase"] == "subset" and s["details"]["members"] == []
    )
    outgoing = [t for t in output["machine"]["transitions"] if t["from"] == sink]
    assert len(outgoing) == 2 and all(t["to"] == sink for t in outgoing)


def test_epsilon_removal_preserves_initial_final_and_direct_route(fixture):
    source = MACHINE.validate_python(fixture("E01")["machine"])
    nfa = convert(source, "enfa_to_nfa")["machine"]
    assert nfa["startState"] in nfa["finalStates"]
    indirect = convert(MACHINE.validate_python(nfa), "nfa_to_dfa")["machine"]
    direct = convert(source, "enfa_to_dfa")["machine"]
    assert equivalent(indirect, direct, Budget())["equivalent"]


def test_incompatible_operation_and_generation_cap(fixture):
    source = MACHINE.validate_python(fixture("N01")["machine"])
    with pytest.raises(EngineError) as e:
        convert(source, "enfa_to_nfa")
    assert e.value.code == "INVALID_OPERATION"
    with pytest.raises(EngineError) as e:
        convert(source, "nfa_to_dfa", Budget(replace(LIMITS, states=2)))
    assert e.value.code == "LIMIT_EXCEEDED"


def test_convert_api_has_certified_result_and_preserves_source(client, fixture):
    source = fixture("N01")["machine"]
    r = client.post("/api/v1/convert", json={"machine": source, "operation": "nfa_to_dfa"})
    assert r.status_code == 200 and r.json()["verification"]["equivalent"] is True
    assert source["kind"] == "nfa"


def test_generated_small_nondeterministic_machines_match_direct_simulation():
    random = Random(724)
    for kind in ["nfa", "enfa"]:
        for _ in range(12):
            symbols = ["0", "1"] + ([None] if kind == "enfa" else [])
            raw = dict(
                kind=kind,
                alphabet=["0", "1"],
                states=[{"id": str(i)} for i in range(3)],
                startState="0",
                finalStates=[str(i) for i in range(3) if random.randrange(2)],
                transitions=[
                    {"from": str(i), "symbol": symbol, "to": str(j)}
                    for i in range(3)
                    for symbol in symbols
                    for j in range(3)
                    if random.randrange(4) == 0
                ],
            )
            source = MACHINE.validate_python(raw)
            result = convert(source, "nfa_to_dfa" if kind == "nfa" else "enfa_to_dfa")
            target = MACHINE.validate_python(result["machine"])
            for length in range(5):
                for tokens in product("01", repeat=length):
                    assert (
                        simulate(source, list(tokens))["accepted"]
                        == simulate(target, list(tokens))["accepted"]
                    )
