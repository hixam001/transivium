"""One cooperative budget shared by generation, traces and verification."""

import json
import time
from dataclasses import dataclass
from typing import Callable

from app.engine.errors import EngineError


@dataclass(frozen=True)
class Limits:
    states: int = 256
    symbols: int = 16
    transitions: int = 16_384
    input_tokens: int = 512
    request_bytes: int = 512 * 1024
    regex_bytes: int = 64 * 1024
    ast_work: int = 50_000
    product_pairs: int = 65_536
    derivation_steps: int = 2_000
    response_bytes: int = 2 * 1024 * 1024
    parser_depth: int = 128
    deadline_seconds: float = 5


LIMITS = Limits()


class Budget:
    def __init__(self, limits: Limits = LIMITS, clock: Callable[[], float] = time.monotonic):
        self.limits = limits
        self.clock = clock
        self.deadline = clock() + limits.deadline_seconds
        self.work = 0
        self.trace_bytes = 1024

    def check(self, amount: int = 0, maximum: int | None = None, label: str = "Work"):
        if self.clock() >= self.deadline:
            raise EngineError(
                "DEADLINE_EXCEEDED", "Operation deadline exceeded; reduce the machine.", 503
            )
        if maximum is not None and amount > maximum:
            raise EngineError("LIMIT_EXCEEDED", f"{label} limit exceeded; reduce the machine.")

    def allocate(self, amount: int = 1):
        self.work += amount
        self.check(self.work, self.limits.ast_work, "AST/work")

    def step(self, steps: list, phase: str, description: str, **details):
        self.check(len(steps) + 1, self.limits.derivation_steps, "Derivation trace")
        step = dict(index=len(steps), phase=phase, description=description, details=details)
        self.trace_bytes += (
            len(json.dumps(step, ensure_ascii=False, separators=(",", ":")).encode("utf-8")) + 1
        )
        self.check(self.trace_bytes, self.limits.response_bytes, "Derivation response")
        steps.append(step)
