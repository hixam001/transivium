import { expect, test } from "@playwright/test";

test("a large machine keeps the transition table bounded and every state editable", async ({
  page,
}) => {
  const alphabet = [..."0123456789ABCDEF"];
  const states = Array.from({ length: 128 }, (_, index) => ({
    id: `q${index}`,
  }));
  const machine = {
    kind: "dfa",
    alphabet,
    states,
    startState: "q0",
    finalStates: [],
    transitions: states.flatMap(({ id }) =>
      alphabet.map((symbol) => ({ from: id, to: id, symbol })),
    ),
  };
  await page.goto("/editor");
  await page.getByLabel("Machine JSON file").setInputFiles({
    name: "large-dfa.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, machine })),
  });
  await page.getByRole("button", { name: "Replace draft with file" }).click();
  const table = page.getByRole("region", { name: "Editable transition table" });
  await expect(page.getByText("States 1–11 of 128")).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(12);
  await page.getByLabel("Jump to state").selectOption("127");
  await table.getByLabel("Destination from q127 on F").selectOption("q0");
  await expect(table.getByLabel("Destination from q127 on F")).toHaveValue(
    "q0",
  );
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
});
