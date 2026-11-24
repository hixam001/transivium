#!/usr/bin/env python3
"""Generate or check the versioned machine JSON Schema and complete API schema."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.main import app  # noqa: E402
from app.schemas import MACHINE  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["refresh", "check"])
    args = parser.parse_args()
    outputs = {"machine.schema.json": MACHINE.json_schema(), "openapi.json": app.openapi()}
    failed = []
    for filename, data in outputs.items():
        path = ROOT / "contracts" / filename
        if args.command == "refresh":
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        elif not path.exists() or json.loads(path.read_text()) != data:
            failed.append(filename)
    if failed:
        print("Stale contracts: " + ", ".join(failed) + "; run refresh", file=sys.stderr)
        return 1
    print(f"contracts {args.command}: machine and OpenAPI schemas current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
