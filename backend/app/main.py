"""Local HTTP boundary. Formal engine modules remain framework independent."""

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException

from app.boundary import Boundary, error_response
from app.engine.acceptors import equivalent
from app.engine.budget import Budget
from app.engine.conversion import convert
from app.engine.errors import EngineError
from app.engine.simulation import simulate
from app.engine.validation import require_valid, validate
from app.schemas import (
    Acceptor,
    ConversionRequest,
    ConversionResult,
    EquivalenceRequest,
    EquivalenceResult,
    ErrorEnvelope,
    HealthResult,
    MachineRequest,
    SimulationRequest,
    SimulationResult,
    ValidationResult,
)

app = FastAPI(
    title="Transivium",
    version="1.0.0",
    responses={code: {"model": ErrorEnvelope} for code in [400, 408, 413, 415, 422, 500, 503]},
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("TRANSIVIUM_ALLOWED_ORIGIN", "http://127.0.0.1:5173")],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.add_middleware(Boundary)


@app.exception_handler(EngineError)
async def engine_error(request: Request, exc: EngineError):
    return error_response(exc.code, exc.message, exc.status, exc.issues, request.state.request_id)


@app.exception_handler(RequestValidationError)
async def schema_error(request: Request, exc: RequestValidationError):
    invalid_json = any(e["type"] == "json_invalid" for e in exc.errors())
    issues = [
        dict(code="SCHEMA_ERROR", path=".".join(map(str, e["loc"][1:])), message=e["msg"])
        for e in exc.errors()
    ]
    return error_response(
        "MALFORMED_JSON" if invalid_json else "SCHEMA_ERROR",
        "Use a valid JSON request matching the machine schema.",
        400 if invalid_json else 422,
        issues,
        request.state.request_id,
    )


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    code = {400: "MALFORMED_JSON", 404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED"}.get(
        exc.status_code, "INTERNAL_ERROR"
    )
    return error_response(
        code,
        "Use valid UTF-8 JSON."
        if exc.status_code == 400
        else "Requested route or method is unavailable.",
        exc.status_code,
        request_id=request.state.request_id,
    )


@app.get("/api/v1/health", response_model=HealthResult)
def health() -> dict[str, str]:
    return {"status": "ok", "apiVersion": "v1"}


@app.post("/api/v1/validate", response_model=ValidationResult)
def validate_machine(request: MachineRequest):
    issues = validate(request.machine)
    return {"valid": not issues, "issues": issues}


@app.post("/api/v1/simulate", response_model=SimulationResult, response_model_exclude_unset=True)
def simulate_machine(request: SimulationRequest):
    return simulate(request.machine, request.input)


@app.post("/api/v1/convert", response_model=ConversionResult, response_model_exclude_unset=True)
def convert_machine(request: ConversionRequest):
    return convert(request.machine, request.operation)


@app.post("/api/v1/equivalence", response_model=EquivalenceResult)
def compare_machines(request: EquivalenceRequest):
    budget = Budget()
    if not isinstance(request.left, Acceptor) or not isinstance(request.right, Acceptor):
        raise EngineError(
            "INVALID_OPERATION", "Language comparison accepts DFA, NFA and epsilon-NFA only."
        )
    require_valid(request.left, budget)
    require_valid(request.right, budget)
    return equivalent(request.left.as_dict(), request.right.as_dict(), budget)
