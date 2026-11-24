import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";
import type { Machine } from "./model";

vi.mock("./Diagram", () => ({
  default: ({ machine }: { machine: Machine }) => (
    <div data-testid="graph-model">{JSON.stringify(machine)}</div>
  ),
}));
afterEach(() => vi.restoreAllMocks());
const graph = () =>
  JSON.parse(screen.getByTestId("graph-model").textContent!) as Machine;

test("the application entry is accessible", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Machine workspace" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
});

test("table edits change the graph model and delete clears every reference", () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<App />);
  fireEvent.change(screen.getByLabelText("Destination from q0 on 0"), {
    target: { value: "q2" },
  });
  expect(
    graph().transitions.find((t) => t.from === "q0" && t.symbol === "0")?.to,
  ).toBe("q2");
  fireEvent.click(screen.getByRole("button", { name: "Delete state" }));
  expect(graph().states.map((s) => s.id)).not.toContain("q0");
  expect(graph().startState).toBe("");
  expect(
    graph().transitions.every((t) => t.from !== "q0" && t.to !== "q0"),
  ).toBe(true);
});

test("cancelled deletion and dirty replacement preserve the draft", () => {
  vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<App />);
  fireEvent.change(screen.getByLabelText("Display label"), {
    target: { value: "Retain this" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Delete state" }));
  fireEvent.click(screen.getByRole("button", { name: "New machine" }));
  expect(graph().states[0].label).toBe("Retain this");
  expect(graph().states.length).toBe(3);
});

test("all machine kinds have the right editing controls", () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<App />);
  for (const kind of ["nfa", "enfa", "mealy", "moore", "dfa"]) {
    fireEvent.change(screen.getByLabelText("Machine type"), {
      target: { value: kind },
    });
    expect(graph().kind).toBe(kind);
    expect(!!screen.queryByLabelText("Output alphabet")).toBe(
      ["mealy", "moore"].includes(kind),
    );
    if (kind === "enfa")
      expect(
        screen.getByLabelText("Destination from q0 on epsilon"),
      ).toBeInTheDocument();
    if (kind === "moore")
      expect(screen.getByLabelText("State output")).toBeInTheDocument();
  }
});

test("editing during validation discards a stale successful response", async () => {
  let resolve!: (value: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Validate machine" }));
  fireEvent.click(screen.getByRole("button", { name: "Add state" }));
  await act(async () =>
    resolve(
      new Response(JSON.stringify({ valid: true, issues: [] }), {
        status: 200,
      }),
    ),
  );
  expect(
    screen.queryByText("All formal checks passed."),
  ).not.toBeInTheDocument();
  expect(screen.getByText("Editable draft")).toBeInTheDocument();
});

test("validation errors keep editable values and render labels as text", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        valid: false,
        issues: [
          {
            code: "MISSING_TRANSITION",
            path: "machine.transitions",
            message: "Choose a destination.",
          },
        ],
      }),
      { status: 200 },
    ),
  );
  render(<App />);
  fireEvent.change(screen.getByLabelText("Display label"), {
    target: { value: "<img src=x onerror=alert(1)>" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Validate machine" }));
  await waitFor(() =>
    expect(screen.getByText("Choose a destination.")).toBeInTheDocument(),
  );
  expect(screen.getByLabelText("Display label")).toHaveValue(
    "<img src=x onerror=alert(1)>",
  );
  expect(document.querySelector("img")).toBeNull();
});
