from app.main import app


def test_openapi_matches_custom_errors_and_typed_successes():
    schema = app.openapi()
    expected = {
        "/health": "HealthResult",
        "/validate": "ValidationResult",
        "/simulate": "SimulationResult",
        "/convert": "ConversionResult",
        "/equivalence": "EquivalenceResult",
    }
    for path, model in expected.items():
        operation = schema["paths"]["/api/v1" + path]["get" if path == "/health" else "post"]
        assert operation["responses"]["200"]["content"]["application/json"]["schema"][
            "$ref"
        ].endswith("/" + model)
        assert operation["responses"]["422"]["content"]["application/json"]["schema"][
            "$ref"
        ].endswith("/ErrorEnvelope")


def test_typed_serialization_preserves_required_nulls_without_inventing_output_fields(
    client, fixture
):
    raw = fixture("D01")["machine"]
    result = client.post("/api/v1/simulate", json={"machine": raw, "input": ["0"]}).json()
    assert result["output"] is None and result["initialOutput"] is None
    assert result["steps"][0]["symbol"] is None and result["steps"][0]["outputPrefix"] is None
    assert "output" not in result["steps"][1]["traversed"][0]
    converted = client.post(
        "/api/v1/convert", json={"machine": raw, "operation": "minimize_dfa"}
    ).json()
    assert converted["regexArtifact"] is None
    assert all("output" not in state for state in converted["machine"]["states"])
    assert all("output" not in edge for edge in converted["machine"]["transitions"])
