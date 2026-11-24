"""Verify emitted TEXT by a separate parser/construction and exact search."""

from app.engine.acceptors import determinize, equivalent, minimize
from app.engine.budget import Budget
from app.engine.errors import EngineError
from app.engine.regex_parser import parse
from app.engine.thompson import construct


def reconstruct(text: str, alphabet: list[str], budget: Budget) -> dict:
    nfa = construct(parse(text, alphabet, budget), alphabet, budget)
    return minimize(determinize(nfa, budget), budget)


def verify_regex(text: str, original: dict, budget: Budget) -> dict:
    try:
        rebuilt = reconstruct(text, original["alphabet"], budget)
    except EngineError as exc:
        if exc.code != "INVALID_REGEX":
            raise
        raise EngineError(
            "VERIFICATION_FAILED", "Generated text failed independent parsing.", 500
        ) from exc
    if not equivalent(original, rebuilt, budget)["equivalent"]:
        raise EngineError(
            "VERIFICATION_FAILED", "Generated expression failed exact language verification.", 500
        )
    return rebuilt
