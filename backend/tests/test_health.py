from fastapi.testclient import TestClient

from app.main import app


def test_local_readiness_contract():
    response = TestClient(app, base_url="http://127.0.0.1").get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "apiVersion": "v1"}
