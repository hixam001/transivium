"""Strict structural schemas; formal invariants are checked separately."""

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class State(StrictModel):
    id: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    label: str | None = Field(default=None, max_length=80)
    output: str | None = None


class Transition(StrictModel):
    from_: str = Field(alias="from")
    to: str
    symbol: str | None
    output: str | None = None


class MachineBase(StrictModel):
    alphabet: list[str]
    states: list[State] = Field(min_length=1)
    startState: str
    transitions: list[Transition]

    def as_dict(self) -> dict:
        return self.model_dump(by_alias=True, exclude_unset=True)


class Acceptor(MachineBase):
    kind: Literal["dfa", "nfa", "enfa"]
    finalStates: list[str]


class Transducer(MachineBase):
    kind: Literal["mealy", "moore"]
    outputAlphabet: list[str]


Machine = Annotated[Acceptor | Transducer, Field(discriminator="kind")]
MACHINE = TypeAdapter(Machine)


class MachineRequest(StrictModel):
    machine: Machine


class SimulationRequest(MachineRequest):
    input: list[str]


class ConversionRequest(MachineRequest):
    operation: str


class EquivalenceRequest(StrictModel):
    left: Machine
    right: Machine


class Issue(StrictModel):
    code: str
    path: str
    message: str


class ErrorDetail(StrictModel):
    code: str
    message: str
    issues: list[Issue]
    requestId: str


class ErrorEnvelope(StrictModel):
    error: ErrorDetail


class HealthResult(StrictModel):
    status: Literal["ok"]
    apiVersion: Literal["v1"]


class ValidationResult(StrictModel):
    valid: bool
    issues: list[Issue]


class TraceStep(StrictModel):
    index: int
    symbol: str | None
    activeStates: list[str]
    movedStates: list[str] | None
    traversed: list[Transition]
    epsilonTraversed: list[Transition]
    outputPrefix: list[str] | None


class SimulationResult(StrictModel):
    steps: list[TraceStep]
    accepted: bool | None
    output: list[str] | None
    normalizedOutput: list[str] | None
    initialOutput: str | None


class DerivationStep(StrictModel):
    index: int
    phase: str
    description: str
    details: dict[str, Any]


class Verification(StrictModel):
    equivalent: Literal[True]
    mode: Literal["language", "normalized_output"]
    method: Literal["product_bfs"]


class RegexArtifact(StrictModel):
    schemaVersion: Literal[1]
    syntax: Literal["formal-v1"]
    regex: str
    alphabet: list[str]
    canonicalDfa: Acceptor


class ConversionResult(StrictModel):
    operation: Literal[
        "enfa_to_nfa",
        "nfa_to_dfa",
        "enfa_to_dfa",
        "minimize_dfa",
        "dfa_to_regex",
        "mealy_to_moore",
        "moore_to_mealy",
    ]
    machine: Machine | None
    steps: list[DerivationStep]
    verification: Verification
    regexArtifact: RegexArtifact | None


class EquivalenceResult(StrictModel):
    equivalent: bool
    counterexample: list[str] | None
    leftAccepts: bool | None
    rightAccepts: bool | None
    visitedPairs: int
