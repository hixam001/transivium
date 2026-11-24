#!/usr/bin/env python3
"""Measure loopback API latency; never equate failed operations with successes."""

import argparse
import json
import math
import os
import platform
import statistics
import subprocess
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


def workloads():
    def fixture(name):
        return json.loads((ROOT / f"contracts/fixtures/{name}.json").read_text())["machine"]

    cycle = dict(
        kind="dfa",
        alphabet=list("abcd"),
        states=[{"id": f"s{i}"} for i in range(20)],
        startState="s0",
        finalStates=["s19"],
        transitions=[
            {"from": f"s{i}", "symbol": a, "to": f"s{(i + 1) % 20}"}
            for i in range(20)
            for a in "abcd"
        ],
    )
    cases = [
        ("validate-20-states-4-symbols", "validate", {"machine": cycle}),
        (
            "simulate-20-states-100-tokens",
            "simulate",
            {"machine": cycle, "input": list("abcd" * 25)},
        ),
        (
            "minimize-20-states",
            "convert",
            {"machine": cycle, "operation": "minimize_dfa"},
        ),
    ]
    for name, op in [
        ("E01", "enfa_to_nfa"),
        ("N01", "nfa_to_dfa"),
        ("E01", "enfa_to_dfa"),
        ("D01", "dfa_to_regex"),
        ("M01", "mealy_to_moore"),
        ("O01", "moore_to_mealy"),
    ]:
        cases.append((op, "convert", {"machine": fixture(name), "operation": op}))
    cases.append(
        (
            "exact-equivalence",
            "equivalence",
            {"left": fixture("D01"), "right": fixture("D02")},
        )
    )
    return cases


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--samples", type=int, default=30)
    parser.add_argument("--output", type=Path, default=ROOT / "docs/artifacts/performance.json")
    args = parser.parse_args()
    if args.samples < 10:
        parser.error("Use at least 10 measured samples per workload.")
    parsed = urlsplit(args.base_url)
    if (
        parsed.scheme != "http"
        or parsed.hostname not in {"127.0.0.1", "localhost"}
        or parsed.username
        or parsed.password
        or parsed.path not in {"", "/"}
    ):
        parser.error("Only a local development API is supported.")

    def request(path, body):
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            args.base_url + "/api/v1/" + path,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        started = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.load(response)
            if "error" in result:
                return None, result["error"]["code"]
            if path == "convert" and result.get("verification", {}).get("equivalent") is not True:
                return None, "UNCERTIFIED_RESULT"
            return (time.perf_counter() - started) * 1000, None
        except urllib.error.HTTPError as exc:
            return None, json.load(exc).get("error", {}).get("code", f"HTTP_{exc.code}")

    results = []
    for name, path, body in workloads():
        for _ in range(3):
            _, error = request(path, body)
            if error:
                raise RuntimeError(f"Warmup {name} failed: {error}")
        samples = []
        errors = Counter()
        for _ in range(args.samples):
            elapsed, error = request(path, body)
            if error:
                errors[error] += 1
            else:
                samples.append(elapsed)
        samples.sort()
        p95 = samples[math.ceil(0.95 * len(samples)) - 1] if samples else None
        result = dict(
            workload=name,
            states=len(body.get("machine", {}).get("states", [])) or None,
            measuredRequests=args.samples,
            successfulRequests=len(samples),
            errors=dict(errors),
            p50Ms=round(statistics.median(samples), 3) if samples else None,
            p95Ms=round(p95, 3) if p95 is not None else None,
            maxMs=round(max(samples), 3) if samples else None,
            targetMs=2000,
            targetMet=not errors and p95 is not None and p95 <= 2000,
        )
        results.append(result)
        print(f"{name}: {len(samples)}/{args.samples} succeeded; p95={result['p95Ms']} ms")
    cpu = "Unknown"
    cpuinfo = Path("/proc/cpuinfo")
    if cpuinfo.exists():
        cpu = next(
            (
                line.split(":", 1)[1].strip()
                for line in cpuinfo.read_text().splitlines()
                if line.startswith("model name")
            ),
            cpu,
        )
    report = dict(
        schemaVersion=1,
        sourceCommit=subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
        ).strip(),
        environment=dict(
            os=platform.system(),
            kernel=platform.release(),
            architecture=platform.machine(),
            cpu=cpu,
            logicalCpus=os.cpu_count(),
            clientPython=platform.python_version(),
        ),
        methodology="Sequential loopback HTTP requests, full JSON response read; 3 warmups then measured requests per workload; nearest-rank p95. Timing does not include browser render or public-network latency.",
        coverageLimitation="Reference fixtures plus a 20-state/4-symbol/100-token cyclic machine; not every bounded automaton or exponential regex expansion.",
        workloads=results,
        allTargetsMet=all(row["targetMet"] for row in results),
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    return 0 if report["allTargetsMet"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
