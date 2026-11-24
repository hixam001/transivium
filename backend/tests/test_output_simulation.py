from copy import deepcopy
from dataclasses import replace
from itertools import product

import pytest

from app.engine.budget import LIMITS, Budget
from app.engine.errors import EngineError
from app.engine.simulation import simulate
from app.schemas import MACHINE


@pytest.mark.parametrize("name", ["M01", "O01"])
def test_full_and_normalized_outputs_include_empty_input(fixture, name):
    record = fixture(name)
    model = MACHINE.validate_python(record["machine"])
    before = deepcopy(model.as_dict())
    for sample in record["samples"]:
        result = simulate(model, sample["input"])
        assert result["accepted"] is None
        assert result["output"] == sample["output"]
        assert result["normalizedOutput"] == sample["normalizedOutput"]
        assert len(result["steps"]) == len(sample["input"]) + 1
        assert len(result["normalizedOutput"]) == len(sample["input"])
        assert result["initialOutput"] == ("0" if name == "O01" else None)
        for i, step in enumerate(result["steps"]):
            assert len(step["outputPrefix"]) == i + (name == "O01")
            assert len(step["activeStates"]) == 1
            assert step["movedStates"] is None and step["epsilonTraversed"] == []
    assert model.as_dict() == before


@pytest.mark.parametrize("name", ["M01", "O01"])
def test_transducer_reference_prefixes_for_all_short_inputs(fixture, name):
    model = MACHINE.validate_python(fixture(name)["machine"])
    for length in range(6):
        for tokens in product("01", repeat=length):
            expected = ["1" if token == "0" else "0" for token in tokens]
            result = simulate(model, list(tokens))
            assert result["normalizedOutput"] == expected
            assert result["output"] == (["0"] if name == "O01" else []) + expected


@pytest.mark.parametrize("name", ["M01", "O01"])
def test_transducer_api_and_missing_output_errors(client, fixture, name):
    raw = fixture(name)["machine"]
    r = client.post("/api/v1/simulate", json={"machine": raw, "input": list("0101")})
    assert r.status_code == 200 and r.json()["normalizedOutput"] == list("1010")
    assert r.json()["accepted"] is None
    target = raw["transitions"][0] if name == "M01" else raw["states"][0]
    target.pop("output")
    r = client.post("/api/v1/simulate", json={"machine": raw, "input": []})
    assert r.status_code == 422 and r.json()["error"]["code"] == "INVALID_MACHINE"
    assert "output" not in r.json()


def test_output_response_guard(fixture):
    with pytest.raises(EngineError) as exc:
        simulate(
            MACHINE.validate_python(fixture("O01")["machine"]),
            list("0101"),
            Budget(replace(LIMITS, response_bytes=1200)),
        )
    assert exc.value.code == "LIMIT_EXCEEDED"
