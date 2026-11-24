import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("machine JSON round-trips its model and layout while rejected imports retain the draft", async ({
  page,
}) => {
  await page.goto("/editor");
  const picker = page.getByLabel("Machine JSON file");
  const machine = JSON.parse(
    await readFile("../contracts/fixtures/O01.json", "utf8"),
  ).machine;
  const layout = { s: { x: 25, y: 50 }, t: { x: 210, y: 80 } };
  const file = { schemaVersion: 1, machine, layout };
  const pick = (buffer: Buffer) =>
    picker.setInputFiles({
      name: "moore.json",
      mimeType: "application/json",
      buffer,
    });
  for (const [buffer, message] of [
    [Buffer.from("{"), "valid JSON"],
    [Buffer.from(JSON.stringify({ ...file, schemaVersion: 2 })), "unsupported"],
    [Buffer.alloc(512 * 1024 + 1), "512 KiB"],
    [
      Buffer.from(
        JSON.stringify({ ...file, machine: { ...machine, transitions: [] } }),
      ),
      "Missing transition",
    ],
    [
      Buffer.from(
        JSON.stringify({ ...file, layout: { missing: { x: 0, y: 0 } } }),
      ),
      "known state IDs",
    ],
  ] as const) {
    await pick(buffer);
    await expect(page.getByRole("alert")).toContainText(message);
    await expect(page.getByLabel("Machine type")).toHaveValue("dfa");
  }
  await pick(Buffer.from(JSON.stringify(file)));
  await expect(
    page.getByRole("button", { name: "Replace draft with file" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel import" }).click();
  await expect(page.getByLabel("Machine type")).toHaveValue("dfa");
  await pick(Buffer.from(JSON.stringify(file)));
  await page.getByRole("button", { name: "Replace draft with file" }).click();
  await expect(page.getByLabel("Machine type")).toHaveValue("moore");
  await page.getByRole("button", { name: "Validate machine" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download machine JSON" }).click();
  const download = await downloadPromise;
  expect(JSON.parse(await readFile((await download.path())!, "utf8"))).toEqual(
    file,
  );
});

test("history retains 20 completed runs and replays an earlier revision without changing the draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  await page.getByRole("button", { name: "Validate machine" }).click();
  const run = page.getByRole("button", { name: "Run empty input" });
  const history = page.getByRole("region", { name: "Run history" });
  for (let count = 1; count <= 21; count++) {
    await run.click();
    await expect(history.getByRole("option").nth(1)).toContainText(`${count}.`);
  }
  await expect(history.getByRole("option")).toHaveCount(21);
  await expect(history.getByRole("option", { name: /^1\./ })).toHaveCount(0);
  await page.getByRole("button", { name: "Add state" }).click();
  await history.getByRole("combobox").selectOption("21");
  await expect(history.getByText(/Earlier machine revision/)).toBeVisible();
  await expect(history.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(page.getByText(/4 states ·/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
