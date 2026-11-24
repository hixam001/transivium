from copy import deepcopy
from dataclasses import replace

import pytest
from pydantic import ValidationError

from app.engine.budget import LIMITS, Budget
from app.engine.errors import EngineError
from app.engine.validation import validate, validate_input
from app.schemas import MACHINE


@pytest.mark.parametrize(
    "name", ["D01", "D02", "D03", "D04", "D05", "D06", "N01", "E01", "M01", "O01"]
)
def test_reference_fixtures_valid(fixture, name):
    assert validate(MACHINE.validate_python(fixture(name)["machine"])) == []


@pytest.mark.parametrize(
    "change,code",
    [
        (lambda m: m["states"].append(deepcopy(m["states"][0])), "DUPLICATE_STATE"),
        (lambda m: m.update(startState="missing"), "INVALID_START_STATE"),
        (lambda m: m.update(finalStates=["missing"]), "INVALID_FINAL_STATE"),
        (lambda m: m.update(alphabet=["0", "0"]), "INVALID_ALPHABET"),
        (lambda m: m["transitions"][0].update(to="missing"), "UNKNOWN_STATE"),
        (lambda m: m["transitions"][0].update(symbol=None), "INVALID_EPSILON"),
        (lambda m: m["transitions"][0].update(symbol="2"), "INVALID_SYMBOL"),
        (lambda m: m["transitions"].pop(), "MISSING_TRANSITION"),
        (
            lambda m: m["transitions"].append(deepcopy(m["transitions"][0])),
            "NONDETERMINISTIC_TRANSITION",
        ),
        (lambda m: m["states"][0].update(output="0"), "INVALID_OUTPUT"),
    ],
)
def test_formal_errors_are_actionable(fixture, change, code):
    machine = fixture("D01")["machine"]
    change(machine)
    issues = validate(MACHINE.validate_python(machine))
    assert code in {i["code"] for i in issues}
    assert all(set(i) == {"code", "path", "message"} for i in issues)


@pytest.mark.parametrize(
    "name,edit",
    [
        ("M01", lambda m: m["transitions"][0].pop("output")),
        ("O01", lambda m: m["states"][0].update(output="9")),
        ("M01", lambda m: m.update(outputAlphabet=[])),
    ],
)
def test_missing_or_illegal_transducer_outputs(fixture, name, edit):
    machine = fixture(name)["machine"]
    edit(machine)
    assert validate(MACHINE.validate_python(machine))


def test_unknown_fields_and_wrong_json_types_rejected(fixture):
    data = fixture("D01")["machine"]
    data["anything"] = True
    with pytest.raises(ValidationError):
        MACHINE.validate_python(data)
    del data["anything"]
    data["alphabet"] = "01"
    with pytest.raises(ValidationError):
        MACHINE.validate_python(data)


def test_empty_acceptors_and_input_boundary(fixture):
    data = fixture("D03")["machine"]
    data.update(alphabet=[], transitions=[])
    assert validate(MACHINE.validate_python(data)) == []
    machine = MACHINE.validate_python(fixture("D01")["machine"])
    for tokens in [[" "], ["ε"], ["2"]]:
        with pytest.raises(EngineError, match="outside"):
            validate_input(machine, tokens, Budget())
    with pytest.raises(EngineError) as exc:
        validate_input(machine, ["0"] * 513, Budget())
    assert exc.value.code == "LIMIT_EXCEEDED"


def test_injected_caps_and_deadline(fixture):
    machine = MACHINE.validate_python(fixture("D01")["machine"])
    with pytest.raises(EngineError) as exc:
        validate(machine, Budget(replace(LIMITS, states=2)))
    assert exc.value.code == "LIMIT_EXCEEDED"
    clock = iter([0, 6])
    budget = Budget(clock=lambda: next(clock))
    with pytest.raises(EngineError) as exc:
        budget.check()
    assert exc.value.code == "DEADLINE_EXCEEDED"


def test_validate_http_semantic_and_schema_split(client, fixture):
    data = fixture("D01")["machine"]
    data["transitions"].pop()
    r = client.post("/api/v1/validate", json={"machine": data})
    assert r.status_code == 200 and not r.json()["valid"]
    data["unknown"] = True
    r = client.post("/api/v1/validate", json={"machine": data})
    assert r.status_code == 422 and r.json()["error"]["code"] == "SCHEMA_ERROR"


@pytest.mark.parametrize(
    "method,path,kwargs,status,code",
    [
        (
            "post",
            "/api/v1/validate",
            {"content": "{", "headers": {"content-type": "application/json"}},
            400,
            "MALFORMED_JSON",
        ),
        ("post", "/api/v1/validate", {"content": "{}"}, 415, "UNSUPPORTED_MEDIA_TYPE"),
        (
            "post",
            "/api/v1/validate",
            {"content": " " * (524288 + 1), "headers": {"content-type": "application/json"}},
            413,
            "PAYLOAD_TOO_LARGE",
        ),
        ("get", "/missing", {}, 404, "NOT_FOUND"),
        ("get", "/api/v1/validate", {}, 405, "METHOD_NOT_ALLOWED"),
    ],
)
def test_http_error_envelope(client, method, path, kwargs, status, code):
    r = getattr(client, method)(path, **kwargs)
    assert r.status_code == status
    error = r.json()["error"]
    assert error["code"] == code
    assert set(error) == {"code", "message", "issues", "requestId"}
    assert error["requestId"]


def test_cors_is_restricted(client):
    r = client.get("/api/v1/health", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in r.headers
