import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import Simulation from "./Simulation";
import type { SimulationResult } from "./Simulation";
import { examples } from "./model";

const machine = examples.find((e) => e.id === "D01")!.machine;
function trace(): SimulationResult {
  return {
    steps: [0, 1, 2, 3].map((i) => ({
      index: i,
      symbol: i ? "101"[i - 1] : null,
      activeStates: [["q0", "q0", "q1", "q2"][i]],
      movedStates: null,
      traversed: [],
      epsilonTraversed: [],
      outputPrefix: null,
    })),
    accepted: true,
    output: null,
    normalizedOutput: null,
    initialOutput: null,
  };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("trace navigation starts at the initial state and reports acceptance only at the end", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(trace())),
  );
  render(<Simulation machine={machine} valid onStep={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Input string"), {
    target: { value: "101" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Run input" }));
  await screen.findByText("Step 0 of 3");
  expect(screen.queryByText("Accepted")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next step" }));
  expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Go to step 3" }));
  expect(screen.getByText("Accepted")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
  expect(screen.queryByText("Accepted")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Reset trace" }));
  expect(screen.getByText("Step 0 of 3")).toBeInTheDocument();
});

test("empty input submits zero tokens and displays one initial configuration", async () => {
  const empty = trace();
  empty.steps = empty.steps.slice(0, 1);
  empty.accepted = false;
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(empty)));
  render(<Simulation machine={machine} valid onStep={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Run empty input" }));
  await screen.findByText("Rejected");
  expect(JSON.parse(fetch.mock.calls[0][1]!.body as string).input).toEqual([]);
  expect(screen.getByText("Step 0 of 0")).toBeInTheDocument();
});

test("changing input during a request ignores its eventual result", async () => {
  let resolve!: (value: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  render(<Simulation machine={machine} valid onStep={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Run input" }));
  fireEvent.change(screen.getByLabelText("Input string"), {
    target: { value: "9" },
  });
  await act(async () => resolve(new Response(JSON.stringify(trace()))));
  expect(screen.queryByText("Step 0 of 3")).toBeNull();
  expect(screen.getByLabelText("Input string")).toHaveValue("9");
});

test("input errors preserve input and never become a rejection", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        error: {
          code: "INVALID_INPUT",
          message: "Use declared symbols.",
          issues: [],
        },
      }),
      { status: 422 },
    ),
  );
  render(<Simulation machine={machine} valid onStep={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Input string"), {
    target: { value: " " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Run input" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("Rejected")).toBeNull();
  expect(screen.getByLabelText("Input string")).toHaveValue(" ");
});

test("playback advances, pauses and stops at the final step", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(trace())),
  );
  render(<Simulation machine={machine} valid onStep={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Run input" }));
  await waitFor(() =>
    expect(screen.getByText("Step 0 of 3")).toBeInTheDocument(),
  );
  vi.useFakeTimers();
  fireEvent.click(screen.getByRole("button", { name: "Play trace" }));
  act(() => vi.advanceTimersByTime(850));
  expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Pause playback" }));
  act(() => vi.advanceTimersByTime(1700));
  expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Play trace" }));
  act(() => vi.advanceTimersByTime(2550));
  expect(screen.getByText("Accepted")).toBeInTheDocument();
});
