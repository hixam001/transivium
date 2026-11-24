"""Canonical formal-v1 expressions with allocation and depth guards.

Serialized characters count as work allocations as well as AST nodes. This
keeps cached serialization bounded before allocating exponential expressions.
"""

from dataclasses import dataclass

from app.engine.budget import Budget


@dataclass(frozen=True)
class Regex:
    kind: str
    text: str
    precedence: int
    children: tuple = ()
    depth: int = 1


EMPTY = Regex("empty", "∅", 4)
EPSILON = Regex("epsilon", "ε", 4)


class Factory:
    def __init__(self, budget: Budget):
        self.budget = budget

    def make(self, kind: str, precedence: int, children: tuple, parts: list[str]) -> Regex:
        depth = 1 + max((c.depth for c in children), default=0)
        self.budget.check(depth, self.budget.limits.parser_depth, "Expression depth")
        byte_length = sum(len(p.encode("utf-8")) for p in parts)
        self.budget.check(byte_length, self.budget.limits.regex_bytes, "Serialized regex")
        self.budget.allocate(1 + byte_length)
        return Regex(kind, "".join(parts), precedence, children, depth)

    def literal(self, symbol: str) -> Regex:
        return self.make("literal", 4, (), [symbol])

    def union(self, *values: Regex) -> Regex:
        self.budget.check()
        branches = {}
        for node in values:
            for child in node.children if node.kind == "union" else (node,):
                if child.kind != "empty":
                    branches[child.text] = child
        ordered = tuple(branches[key] for key in sorted(branches))
        if not ordered:
            return EMPTY
        if len(ordered) == 1:
            return ordered[0]
        parts = []
        for i, child in enumerate(ordered):
            if i:
                parts.append("|")
            parts.append(child.text)
        return self.make("union", 1, ordered, parts)

    def concat(self, *values: Regex) -> Regex:
        self.budget.check()
        if any(node.kind == "empty" for node in values):
            return EMPTY
        children = []
        for node in values:
            children.extend(
                node.children
                if node.kind == "concat"
                else (() if node.kind == "epsilon" else (node,))
            )
        if not children:
            return EPSILON
        if len(children) == 1:
            return children[0]
        parts = []
        for child in children:
            parts.extend(["(", child.text, ")"] if child.precedence < 2 else [child.text])
        return self.make("concat", 2, tuple(children), parts)

    def star(self, node: Regex) -> Regex:
        self.budget.check()
        if node.kind in {"empty", "epsilon"}:
            return EPSILON
        if node.kind == "star":
            return node
        return self.make(
            "star",
            3,
            (node,),
            (["(", node.text, ")"] if node.precedence < 3 else [node.text]) + ["*"],
        )
