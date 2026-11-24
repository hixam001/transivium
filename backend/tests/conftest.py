import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

FIXTURES = Path(__file__).resolve().parents[2] / "contracts/fixtures"


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


@pytest.fixture
def fixture():
    def load(name):
        return json.loads((FIXTURES / f"{name}.json").read_text())

    return load
