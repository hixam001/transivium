#!/usr/bin/env python3
"""Reproduce the local five-kind/seven-operation demonstration using real HTTP."""

import argparse
import json
import subprocess
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def source_revision() -> str | None:
    if not (ROOT / ".git").exists():
        return None
    return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()


def run(base: str) -> dict:
    parsed = urlsplit(base)
    if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("Use a loopback HTTP API address for the local demonstration.")

    def call(route, body=None):
        data = None if body is None else json.dumps(body).encode()
        request = Request(
            base.rstrip("/") + "/api/v1/" + route,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urlopen(request, timeout=15) as response:
            return json.load(response)

    def require(condition, description):
        if not condition:
            raise RuntimeError("Demo failed: " + description)

    fixtures = {
        p.stem: json.loads(p.read_text()) for p in (ROOT / "contracts/fixtures").glob("*.json")
    }
    require(call("health") == {"status": "ok", "apiVersion": "v1"}, "health contract")
    simulations = []
    for key in ("D01", "N01", "E01", "M01", "O01"):
        machine = fixtures[key]["machine"]
        require(call("validate", {"machine": machine})["valid"], key + " validation")
        for sample in fixtures[key]["samples"]:
            actual = call("simulate", {"machine": machine, "input": sample["input"]})
            require(len(actual["steps"]) == len(sample["input"]) + 1, key + " trace length")
            for field in ("accepted", "output", "normalizedOutput"):
                if field in sample:
                    require(actual[field] == sample[field], key + " " + field)
            simulations.append(
                {
                    "fixture": key,
                    "input": sample["input"],
                    **{
                        field: actual[field]
                        for field in ("accepted", "output", "normalizedOutput", "initialOutput")
                    },
                }
            )
    conversions = []
    artifact = None
    for key, operation in (
        ("E01", "enfa_to_nfa"),
        ("N01", "nfa_to_dfa"),
        ("E01", "enfa_to_dfa"),
        ("D02", "minimize_dfa"),
        ("D01", "dfa_to_regex"),
        ("M01", "mealy_to_moore"),
        ("O01", "moore_to_mealy"),
    ):
        result = call("convert", {"machine": fixtures[key]["machine"], "operation": operation})
        require(result["verification"]["equivalent"] is True, operation + " certification")
        require(result["steps"][-1]["phase"] == "verify", operation + " final verification")
        conversions.append(
            {
                "fixture": key,
                "operation": operation,
                "verification": result["verification"],
                "derivationSteps": len(result["steps"]),
            }
        )
        if result["regexArtifact"]:
            artifact = result["regexArtifact"]
            require(
                artifact["alphabet"] == ["0", "1"] and len(artifact["canonicalDfa"]["states"]) == 3,
                "D01 canonical reference",
            )
    comparisons = []
    for left, right, expected in (
        ("D01", "D02", None),
        ("D03", "D04", []),
        ("D01", "D04", ["0", "1"]),
    ):
        result = call(
            "equivalence", {"left": fixtures[left]["machine"], "right": fixtures[right]["machine"]}
        )
        require(
            result["counterexample"] == expected and result["equivalent"] == (expected is None),
            "comparison witness",
        )
        if expected is not None:
            outcomes = [
                call("simulate", {"machine": fixtures[key]["machine"], "input": expected})[
                    "accepted"
                ]
                for key in (left, right)
            ]
            require(outcomes == [True, False], "witness replay")
        comparisons.append({"left": left, "right": right, **result})
    return {
        "sourceCommit": source_revision(),
        "softwareVersion": json.loads((ROOT / "frontend/package.json").read_text())["version"],
        "status": "PASS",
        "simulations": simulations,
        "conversions": conversions,
        "comparisons": comparisons,
        "verifiedRegex": artifact,
        "externalExchange": "NOT RUN",
        "volunteerStudy": "NOT RUN",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="http://127.0.0.1:8000")
    args = parser.parse_args()
    print(json.dumps(run(args.base), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
