"""Local HTTP boundary. Formal engine modules remain framework independent."""

from fastapi import FastAPI

app = FastAPI(title="Transivium", version="0.1.0")


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok", "apiVersion": "v1"}
