import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import Compare from "./Compare";
import { examples } from "./model";

vi.mock("./Diagram", () => ({ default: () => <div>Machine diagram</div> }));
const machine = examples.find((e) => e.id === "D01")!.machine;
afterEach(() => vi.restoreAllMocks());
const valid = () => new Response(JSON.stringify({ valid: true, issues: [] }));

test("empty witness is visible and can be simulated on both machines", async () => {
  let replay = 0;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    if (String(url).endsWith("validate")) return valid();
    if (String(url).endsWith("equivalence"))
      return new Response(
        JSON.stringify({
          equivalent: false,
          counterexample: [],
          leftAccepts: true,
          rightAccepts: false,
          visitedPairs: 1,
        }),
      );
    return new Response(
      JSON.stringify({ accepted: replay++ === 0, steps: [] }),
    );
  });
  render(<Compare editorMachine={machine} />);
  expect(
    screen.getByRole("button", { name: "Compare languages" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Validate left" }));
  await screen.findByText("Valid machine");
  fireEvent.click(screen.getByRole("button", { name: "Validate right" }));
  await screen.findAllByText("Valid machine");
  await act(async () => {});
  fireEvent.click(screen.getByRole("button", { name: "Compare languages" }));
  await screen.findByText("Different languages");
  expect(screen.getByText("ε (empty string)")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Run witness on both" }));
  await screen.findByText(
    "Simulation confirms: left accepted, right rejected.",
  );
});

test("edits invalidate an in-flight comparison and mismatched alphabets disable comparison", async () => {
  let resolve!: (r: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementation((url) =>
    String(url).endsWith("validate")
      ? Promise.resolve(valid())
      : new Promise((r) => {
          resolve = r;
        }),
  );
  render(<Compare editorMachine={machine} />);
  fireEvent.click(screen.getByRole("button", { name: "Validate left" }));
  await screen.findByText("Valid machine");
  fireEvent.click(screen.getByRole("button", { name: "Validate right" }));
  await act(async () => {});
  fireEvent.click(screen.getByRole("button", { name: "Compare languages" }));
  fireEvent.change(screen.getByLabelText("left alphabet"), {
    target: { value: "a" },
  });
  await act(async () =>
    resolve(
      new Response(
        JSON.stringify({
          equivalent: true,
          counterexample: null,
          visitedPairs: 3,
        }),
      ),
    ),
  );
  expect(screen.queryByText("Equivalent languages")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Compare languages" }),
  ).toBeDisabled();
  expect(
    screen.getByText("Use identical declared alphabets before comparing."),
  ).toBeInTheDocument();
});
