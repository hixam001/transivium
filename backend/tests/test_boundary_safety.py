import asyncio
import json
from dataclasses import replace

import pytest

from app.boundary import Boundary
from app.engine.budget import LIMITS


@pytest.mark.parametrize(
    "content,status,code",
    [
        (b"\xff", 400, "MALFORMED_JSON"),
        (b'{"machine":' + b"[" * 2000 + b"0" + b"]" * 2000 + b"}", 422, "SCHEMA_ERROR"),
    ],
)
def test_malformed_utf8_and_deep_json_are_sanitized(client, content, status, code):
    response = client.post(
        "/api/v1/validate", content=content, headers={"Content-Type": "application/json"}
    )
    assert response.status_code == status
    assert response.json()["error"]["code"] == code
    assert "Traceback" not in response.text


def test_response_cap_returns_typed_error_before_sending_partial_body(client, fixture, monkeypatch):
    import app.boundary as boundary

    monkeypatch.setattr(boundary, "LIMITS", replace(LIMITS, response_bytes=50))
    response = client.post(
        "/api/v1/simulate", json={"machine": fixture("D01")["machine"], "input": ["0"]}
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "LIMIT_EXCEEDED"
    assert "steps" not in response.json()
    assert response.headers["x-request-id"] == response.json()["error"]["requestId"]


def test_unexpected_exception_does_not_disclose_internal_message(client, fixture, monkeypatch):
    import app.main as main

    def broken(*_):
        raise RuntimeError("Private implementation diagnostic")

    monkeypatch.setattr(main, "validate", broken)
    response = client.post("/api/v1/validate", json={"machine": fixture("D01")["machine"]})
    assert response.status_code == 500
    assert response.json()["error"]["code"] == "INTERNAL_ERROR"
    assert "Private implementation" not in response.text
    assert "Traceback" not in response.text


def test_chunked_request_cap_does_not_trust_content_length():
    async def scenario():
        called = False

        async def inner(scope, receive, send):
            nonlocal called
            called = True

        chunks = iter(
            [
                {"type": "http.request", "body": b" " * 300000, "more_body": True},
                {"type": "http.request", "body": b" " * 300000, "more_body": False},
            ]
        )
        sent = []

        async def receive():
            return next(chunks)

        async def send(message):
            sent.append(message)

        scope = {
            "type": "http",
            "method": "POST",
            "headers": [(b"content-type", b"application/json"), (b"content-length", b"1")],
        }
        await Boundary(inner)(scope, receive, send)
        assert not called
        assert sent[0]["status"] == 413
        assert json.loads(sent[1]["body"])["error"]["code"] == "PAYLOAD_TOO_LARGE"

    asyncio.run(scenario())


def test_strict_wire_fields_and_configured_origin(client, fixture):
    raw = fixture("D01")["machine"]
    raw["transitions"][0]["from_"] = raw["transitions"][0].pop("from")
    response = client.post("/api/v1/validate", json={"machine": raw})
    assert response.status_code == 422 and response.json()["error"]["code"] == "SCHEMA_ERROR"
    response = client.options(
        "/api/v1/validate",
        headers={"Origin": "https://untrusted.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in response.headers
    assert response.json()["error"]["code"] == "CORS_REJECTED"
    response = client.get("/api/v1/health", headers={"Origin": "http://127.0.0.1:5173"})
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
