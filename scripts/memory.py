#!/usr/bin/env python3
"""Validate canonical vault notes and deterministically export graph/Jira data.

Standard library only. Frontmatter uses JSON-compatible YAML scalar/list values;
plain scalar values (including ISO dates) are also accepted. No YAML execution.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {"id", "type", "status", "created", "updated", "confidence", "source", "tags"}
LINK = re.compile(r"\[\[([^\]\n]+)\]\]")
SECRETS = {
    "private key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}"),
    "OpenAI key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "credential assignment": re.compile(r"(?i)\b(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[^'\"\s]{12,}"),
}
EXPECTED_REQS = {f"FR-{i:02}" for i in range(1, 23)} | {f"NFR-{i:02}" for i in range(1, 8)}
ISSUE_FIELDS = {"issue_type", "summary", "issue_status", "priority", "depends_on", "requirements", "tests", "estimate_person_days"}


def note_paths(root: Path) -> list[Path]:
    paths = [root / name for name in ("README.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "PRODUCT.md", "DESIGN.md")]
    paths += list((root / "docs").rglob("*.md"))
    paths += [p for p in (root / "memory").rglob("*.md")
              if not ({"Generated", "raw"} & set(p.relative_to(root / "memory").parts))]
    return sorted(p for p in paths if p.is_file())


def parse_note(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        raise ValueError("missing YAML frontmatter")
    raw, body = text[4:].split("\n---\n", 1)
    fields: dict = {}
    for line in raw.splitlines():
        if not line.strip():
            continue
        key, sep, value = line.partition(":")
        if not sep or not re.fullmatch(r"[a-z][a-z0-9_]*", key):
            raise ValueError(f"unsupported frontmatter line: {line}")
        if key in fields:
            raise ValueError(f"duplicate frontmatter field: {key}")
        value = value.strip()
        try:
            fields[key] = json.loads(value)
        except json.JSONDecodeError:
            # Accept plain YAML lists like [memory, handoff], never objects/code.
            if value.startswith("[") and value.endswith("]"):
                fields[key] = [v.strip() for v in value[1:-1].split(",") if v.strip()]
            elif not value or value.startswith(("[", "{", '"', "'", "|", ">", "&", "*", "!")):
                raise ValueError(f"use JSON-compatible YAML for field {key}")
            else:
                fields[key] = value
    return fields, body


def target_of(link: str) -> str:
    target = link.replace("\\|", "|").split("|", 1)[0].split("#", 1)[0].strip()
    return target.removesuffix(".md")


def collect(root: Path) -> tuple[dict, list[str]]:
    notes = {}
    errors = []
    for path in note_paths(root):
        key = path.relative_to(root).as_posix().removesuffix(".md")
        try:
            text = path.read_text(encoding="utf-8")
            fields, body = parse_note(text)
            notes[key] = {"fields": fields, "body": body, "text": text}
        except (ValueError, OSError) as exc:
            errors.append(f"{key}: {exc}")
    return notes, errors


def validate(notes: dict) -> list[str]:
    errors = []
    ids = {}
    issues = {}
    reqs = {}
    for key, note in notes.items():
        f = note["fields"]
        missing = REQUIRED - f.keys()
        if missing:
            errors.append(f"{key}: missing fields {sorted(missing)}")
        for field in ("id", "source"):
            if not isinstance(f.get(field), str) or not f.get(field):
                errors.append(f"{key}: {field} must be a nonempty string")
        identity = str(f.get("id"))
        if identity in ids:
            errors.append(f"{key}: duplicate id {identity} also in {ids[identity]}")
        ids[identity] = key
        if f.get("type") not in {"project", "area", "person", "decision", "session", "reference", "proposal"}:
            errors.append(f"{key}: invalid memory type")
        if f.get("status") not in {"draft", "active", "complete", "superseded", "archived"}:
            errors.append(f"{key}: invalid memory status")
        if f.get("confidence") not in {"low", "medium", "high"}:
            errors.append(f"{key}: invalid confidence")
        if not isinstance(f.get("tags"), list) or not all(isinstance(t, str) for t in f["tags"]):
            errors.append(f"{key}: tags must be a string list")
        for field in ("created", "updated"):
            try:
                date.fromisoformat(f.get(field, ""))
            except (ValueError, TypeError):
                errors.append(f"{key}: invalid {field} date")
        if str(f.get("updated", "")) < str(f.get("created", "")):
            errors.append(f"{key}: updated precedes created")
        out = LINK.findall(note["body"])
        if not out:
            errors.append(f"{key}: orphan note has no outgoing wikilinks")
        for link in out:
            target = target_of(link) or key
            if target not in notes:
                errors.append(f"{key}: broken wikilink {link}")
        for label, pattern in SECRETS.items():
            if pattern.search(note["text"]):
                errors.append(f"{key}: possible {label}; inspect privately")
        if "issue_key" in f:
            issue = f["issue_key"]
            if not isinstance(issue, str) or not re.fullmatch(r"TRN-\d+", issue):
                errors.append(f"{key}: invalid issue key")
            if issue in issues:
                errors.append(f"{key}: duplicate issue key {issue}")
            issues[issue] = f
            if not ISSUE_FIELDS <= f.keys():
                errors.append(f"{key}: missing issue fields {sorted(ISSUE_FIELDS - f.keys())}")
            if f.get("issue_type") not in {"Epic", "Story", "Task"}:
                errors.append(f"{key}: invalid issue type")
            if f.get("issue_status") not in {"To Do", "In Progress", "Blocked", "Done", "Deferred"}:
                errors.append(f"{key}: invalid issue status")
            if f.get("priority") not in {"P0", "P1", "P2"}:
                errors.append(f"{key}: invalid issue priority")
            for field in ("depends_on", "requirements", "tests"):
                if not isinstance(f.get(field), list) or not all(isinstance(v, str) for v in f[field]):
                    errors.append(f"{key}: {field} must be a string list")
            estimate = f.get("estimate_person_days")
            if estimate is not None and (isinstance(estimate, bool) or not isinstance(estimate, (int, float)) or estimate < 0):
                errors.append(f"{key}: estimate must be nonnegative or null")
        if "requirement_id" in f:
            req = f["requirement_id"]
            if req in reqs:
                errors.append(f"{key}: duplicate requirement {req}")
            reqs[req] = f
    if set(reqs) != EXPECTED_REQS:
        errors.append(f"requirement coverage mismatch: missing={sorted(EXPECTED_REQS-set(reqs))}, extra={sorted(set(reqs)-EXPECTED_REQS)}")
    expected_stories = {f"TRN-{i:02}" for i in range(1, 18)}
    if not expected_stories <= issues.keys():
        errors.append("missing original TRN-01–17 issue coverage")
    for issue, f in issues.items():
        for dep in f.get("depends_on", []):
            if dep not in issues:
                errors.append(f"{issue}: unknown dependency {dep}")
        epic = f.get("epic")
        if f.get("issue_type") != "Epic" and (epic not in issues or issues[epic].get("issue_type") != "Epic"):
            errors.append(f"{issue}: missing or invalid parent epic")
        for req in f.get("requirements", []):
            if req not in reqs:
                errors.append(f"{issue}: unknown requirement {req}")
            elif issue not in reqs[req].get("owners", []):
                errors.append(f"{issue}: requirement owner mismatch for {req}")
        for test in f.get("tests", []):
            if not re.fullmatch(r"TC-(0[1-9]|[12][0-9]|3[0-9])", test):
                errors.append(f"{issue}: unknown test case {test}")
    for req, f in reqs.items():
        if not f.get("owners"):
            errors.append(f"{req}: missing delivery owner")
        for owner in f.get("owners", []):
            if owner not in issues or req not in issues[owner].get("requirements", []):
                errors.append(f"{req}: missing reciprocal issue mapping {owner}")
    # Hard prerequisites only; TRN-07/08 exact-check integration is a separate
    # documented completion gate, avoiding a false algorithm scheduling cycle.
    visited = set()
    active = set()

    def visit(issue: str) -> None:
        if issue in active:
            errors.append(f"dependency cycle includes {issue}")
            return
        if issue in visited or issue not in issues:
            return
        active.add(issue)
        for dep in issues[issue].get("depends_on", []):
            visit(dep)
        active.remove(issue)
        visited.add(issue)

    for issue in issues:
        visit(issue)
    return errors


def outputs(notes: dict) -> dict[str, str]:
    nodes = [{"id": key, "type": n["fields"]["type"], "status": n["fields"]["status"],
              "tags": n["fields"]["tags"]} for key, n in sorted(notes.items())]
    edges = sorted({(key, target_of(link) or key) for key, n in notes.items() for link in LINK.findall(n["body"])})
    graph = {"schemaVersion": 1, "vaultRoot": ".", "nodes": nodes,
             "edges": [{"source": a, "target": b} for a, b in edges]}
    stream = io.StringIO(newline="")
    writer = csv.writer(stream, lineterminator="\n")
    writer.writerow(["Issue ID", "Issue Type", "Summary", "Description", "Priority", "Labels"])
    issue_notes = [n for n in notes.values() if "issue_key" in n["fields"]]
    issue_notes.sort(key=lambda n: (n["fields"]["issue_type"] != "Epic", int(n["fields"]["issue_key"].split("-")[1])))
    for note in issue_notes:
        f = note["fields"]
        header = f'Local planning key: {f["issue_key"]}\nPlanning status: {f["issue_status"]}\n'
        header += f'Epic: {f.get("epic", "None (epic)")}\nDepends on: {", ".join(f["depends_on"]) or "None"}\n'
        header += f'Requirements: {", ".join(f["requirements"]) or "See linked source contracts"}\n'
        header += f'Estimate (proposed person-days): {f["estimate_person_days"] if f["estimate_person_days"] is not None else "Unestimated"}\n\n'
        body = LINK.sub(lambda m: m.group(1).replace("\\|", "|").replace("|", " — "), note["body"])
        label = "transivium-" + f["priority"].lower() + ("-deferred" if f["issue_status"] == "Deferred" else "")
        writer.writerow([int(f["issue_key"].split("-")[1]), f["issue_type"], f["summary"], header+body,
                         {"P0": "Highest", "P1": "High", "P2": "Low"}[f["priority"]], label])
    return {"graph.json": json.dumps(graph, indent=2, ensure_ascii=False)+"\n", "jira-import.csv": stream.getvalue()}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["refresh", "check"])
    args = parser.parse_args()
    notes, errors = collect(ROOT)
    errors += validate(notes)
    # Scan code/config as well as notes; never print matching secret values.
    extra = list((ROOT / "scripts").glob("*.py")) + list((ROOT / ".obsidian").glob("*.json"))
    for path in extra:
        text = path.read_text(encoding="utf-8")
        for label, pattern in SECRETS.items():
            if pattern.search(text):
                errors.append(f"{path.relative_to(ROOT)}: possible {label}; inspect privately")
        if path.suffix == ".json":
            try:
                json.loads(text)
            except ValueError:
                errors.append(f"{path.relative_to(ROOT)}: invalid JSON")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    folder = ROOT / "memory/Generated"
    for name, value in outputs(notes).items():
        path = folder / name
        if args.command == "refresh":
            folder.mkdir(parents=True, exist_ok=True)
            path.write_text(value, encoding="utf-8", newline="")
        elif not path.exists() or path.read_text(encoding="utf-8") != value:
            errors.append(f"{path.relative_to(ROOT)} is stale; run refresh")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    issue_count = sum("issue_key" in n["fields"] for n in notes.values())
    print(f'{args.command}: OK — {len(notes)} notes, {len(EXPECTED_REQS)} requirements, {issue_count} Jira-style issues; graph/CSV current')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
