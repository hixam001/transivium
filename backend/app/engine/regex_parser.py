"""Independent formal-v1 text parser; no dependency on the generator AST."""

from app.engine.budget import Budget
from app.engine.errors import EngineError


def parse(text: str, alphabet: list[str], budget: Budget) -> list[str]:
    budget.check(len(text.encode("utf-8")), budget.limits.regex_bytes, "Regex text")
    output = []
    operators = []
    expect_atom = True
    depth = 0
    precedence = {"|": 1, ".": 2}

    def invalid():
        raise EngineError("INVALID_REGEX", "Expression does not follow formal-v1 syntax.")

    def push_operator(operator):
        while (
            operators and operators[-1] != "(" and precedence[operators[-1]] >= precedence[operator]
        ):
            output.append(operators.pop())
            budget.allocate()
        operators.append(operator)

    for token in text:
        budget.check()
        is_literal = len(token) == 1 and token.isascii() and token.isalnum() and token in alphabet
        if is_literal or token in {"ε", "∅", "("}:
            if not expect_atom:
                push_operator(".")
            if token == "(":
                depth += 1
                budget.check(depth, budget.limits.parser_depth, "Regex nesting")
                operators.append("(")
                expect_atom = True
            else:
                output.append(token)
                budget.allocate()
                expect_atom = False
        elif token == ")":
            if expect_atom:
                invalid()
            while operators and operators[-1] != "(":
                output.append(operators.pop())
                budget.allocate()
            if not operators:
                invalid()
            operators.pop()
            depth -= 1
            expect_atom = False
        elif token == "|":
            if expect_atom:
                invalid()
            push_operator(token)
            expect_atom = True
        elif token == "*":
            if expect_atom:
                invalid()
            output.append(token)
            budget.allocate()
        else:
            invalid()
    if expect_atom or depth:
        invalid()
    while operators:
        output.append(operators.pop())
        budget.allocate()
    return output
