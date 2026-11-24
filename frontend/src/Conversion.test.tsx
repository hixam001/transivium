import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import Conversion from "./Conversion";
import type { ConversionResult } from "./Conversion";
import { examples } from "./model";

vi.mock("./Diagram", () => ({ default: () => <div>Machine diagram</div> }));
const machine = examples.find((e) => e.id === "D01")!.machine;
const artifact = {
  schemaVersion: 1,
  syntax: "formal-v1",
  regex: "(0|1)*01",
  alphabet: ["0", "1"],
  canonicalDfa: machine,
};
function result(): ConversionResult {
  return {
    operation: "dfa_to_regex",
    machine: null,
    steps: [],
    verification: { equivalent: true, mode: "language", method: "product_bfs" },
    regexArtifact: artifact,
  };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("verified expression retains full metadata and clipboard denial has a usable fallback", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(result())),
  );
  vi.stubGlobal("navigator", {
    clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
  });
  render(<Conversion machine={machine} valid onAdopt={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Conversion"), {
    target: { value: "dfa_to_regex" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Convert machine" }));
  await screen.findByText("Exactly verified");
  expect(screen.getByLabelText("Expression")).toHaveValue("(0|1)*01");
  expect(screen.getByText("{0, 1}")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Copy expression" }));
  await screen.findByText(
    "Clipboard unavailable. Select the expression below and copy it manually.",
  );
});

test("unverified response never enables export", async () => {
  const response = result();
  response.verification.equivalent = false;
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(response)),
  );
  render(<Conversion machine={machine} valid onAdopt={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Convert machine" }));
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Copy expression" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Download regex JSON" }),
  ).toBeNull();
});

test("changing operation while pending discards the old artifact", async () => {
  let resolve!: (r: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  render(<Conversion machine={machine} valid onAdopt={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Convert machine" }));
  fireEvent.change(screen.getByLabelText("Conversion"), {
    target: { value: "dfa_to_regex" },
  });
  await act(async () => resolve(new Response(JSON.stringify(result()))));
  expect(screen.queryByText("Exactly verified")).toBeNull();
});

test("conversion adoption is an explicit action with source unchanged beforehand", async () => {
  const response = result();
  response.machine = machine;
  response.regexArtifact = null;
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(response)),
  );
  const adopt = vi.fn();
  render(<Conversion machine={machine} valid onAdopt={adopt} />);
  fireEvent.click(screen.getByRole("button", { name: "Convert machine" }));
  await screen.findByText("Exactly verified");
  expect(adopt).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Adopt result as draft" }),
  );
  expect(adopt).toHaveBeenCalledWith(machine);
});
