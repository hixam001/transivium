from copy import deepcopy
from dataclasses import replace
from itertools import product
from random import Random

import pytest

from app.engine.budget import LIMITS, Budget
from app.engine.conversion import OPERATIONS, convert
from app.engine.errors import EngineError
from app.engine.simulation import simulate
from app.engine.transducers import output_equivalent
from app.schemas import MACHINE


@pytest.mark.parametrize("name,operation", [("M01", "mealy_to_moore"), ("O01", "moore_to_mealy")])
def test_transducer_conversions_preserve_normalized_outputs(fixture, name, operation):
    source = MACHINE.validate_python(fixture(name)["machine"])
    before = deepcopy(source.as_dict())
    result = convert(source, operation)
    target = MACHINE.validate_python(result["machine"])
    assert result["verification"]["mode"] == "normalized_output"
    assert result["verification"]["equivalent"] is True
    for length in range(6):
        for tokens in product("01", repeat=length):
            assert (
                simulate(source, list(tokens))["normalizedOutput"]
                == simulate(target, list(tokens))["normalizedOutput"]
            )
    assert source.as_dict() == before


def test_incoming_outputs_split_same_target_and_synthetic_initial_is_separate(fixture):
    source = fixture("M01")["machine"]
    result = convert(MACHINE.validate_python(source), "mealy_to_moore")
    target = result["machine"]
    assert len(target["states"]) == 3
    splits = [step["details"] for step in result["steps"] if step["phase"] == "split"]
    assert {s["output"] for s in splits} == {"0", "1"}
    assert {s["sourceState"] for s in splits} == {"s"}
    assert simulate(MACHINE.validate_python(target), [])["output"] == ["0"]
    assert simulate(MACHINE.validate_python(target), [])["normalizedOutput"] == []
    # No edge reaches the synthetic initial state; its output is semantically ignored.
    assert all(edge["to"] != target["startState"] for edge in target["transitions"])
    target["states"][0]["output"] = "1"
    assert output_equivalent(source, target, Budget())["equivalent"]


def test_moore_to_mealy_uses_destination_not_source_output(fixture):
    source = fixture("O01")["machine"]
    target = convert(MACHINE.validate_python(source), "moore_to_mealy")["machine"]
    outputs = {s["id"]: s["output"] for s in source["states"]}
    assert all(t["output"] == outputs[t["to"]] for t in target["transitions"])
    assert all("output" not in s for s in target["states"])


def test_wrong_output_fails_exact_verification(fixture, monkeypatch):
    source = MACHINE.validate_python(fixture("M01")["machine"])
    original = OPERATIONS["mealy_to_moore"][1]

    def mutated(raw, budget, steps):
        target = original(raw, budget, steps)
        target["states"][1]["output"] = "0"
        return target

    monkeypatch.setitem(OPERATIONS, "mealy_to_moore", ("mealy", mutated))
    with pytest.raises(EngineError) as exc:
        convert(source, "mealy_to_moore")
    assert exc.value.code == "VERIFICATION_FAILED"


def test_output_split_and_product_caps(fixture):
    raw = fixture("M01")["machine"]
    with pytest.raises(EngineError) as exc:
        convert(MACHINE.validate_python(raw), "mealy_to_moore", Budget(replace(LIMITS, states=1)))
    assert exc.value.code == "LIMIT_EXCEEDED"
    target = convert(MACHINE.validate_python(raw), "mealy_to_moore")["machine"]
    with pytest.raises(EngineError) as exc:
        output_equivalent(raw, target, Budget(replace(LIMITS, product_pairs=1)))
    assert exc.value.code == "LIMIT_EXCEEDED"


def test_generated_complete_transducer_conversions():
    random = Random(1401)
    for kind in ["mealy", "moore"]:
        for _ in range(12):
            states = [
                {"id": str(i), **({"output": str(random.randrange(2))} if kind == "moore" else {})}
                for i in range(3)
            ]
            edges = [
                {
                    "from": str(i),
                    "symbol": a,
                    "to": str(random.randrange(3)),
                    **({"output": str(random.randrange(2))} if kind == "mealy" else {}),
                }
                for i in range(3)
                for a in "01"
            ]
            source = MACHINE.validate_python(
                dict(
                    kind=kind,
                    alphabet=["0", "1"],
                    outputAlphabet=["0", "1"],
                    states=states,
                    startState="0",
                    transitions=edges,
                )
            )
            result = convert(source, "mealy_to_moore" if kind == "mealy" else "moore_to_mealy")
            target = MACHINE.validate_python(result["machine"])
            for length in range(5):
                for tokens in product("01", repeat=length):
                    assert (
                        simulate(source, list(tokens))["normalizedOutput"]
                        == simulate(target, list(tokens))["normalizedOutput"]
                    )


@pytest.mark.parametrize("name,operation", [("M01", "mealy_to_moore"), ("O01", "moore_to_mealy")])
def test_transducer_conversion_api(client, fixture, name, operation):
    r = client.post(
        "/api/v1/convert", json={"machine": fixture(name)["machine"], "operation": operation}
    )
    assert r.status_code == 200
    assert r.json()["verification"] == {
        "equivalent": True,
        "mode": "normalized_output",
        "method": "product_bfs",
    }
