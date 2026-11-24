"""Strict structural schemas; formal invariants are checked separately."""

from typing import Annotated, Literal

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
