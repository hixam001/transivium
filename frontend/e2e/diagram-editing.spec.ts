import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("undo and redo restore formal changes and invalidate old traces", async ({
  page,
}) => {
  await page.goto("/editor");
  const validate = page.getByRole("button", { name: "Validate machine" });
  const transition = page.getByLabel("Destination from q0 on 0");
  const undo = page.getByRole("button", { name: "Undo edit" });
  const redo = page.getByRole("button", { name: "Redo edit" });
  await validate.click();
  await page.getByRole("button", { name: "Run empty input" }).click();
  await expect(page.getByText("Step 0 of 0")).toBeVisible();
  await transition.selectOption("q2");
  await expect(page.getByText("Step 0 of 0")).toHaveCount(0);
  await undo.click();
  await expect(transition).toHaveValue("q1");
  await redo.click();
  await expect(transition).toHaveValue("q2");
  await undo.click();
  await page.getByRole("button", { name: "Add state" }).click();
  await expect(redo).toBeDisabled();
});

test("layout presets retain validation and produce labelled SVG and raster PNG downloads", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  await page.getByLabel("Display label").fill("Start <state>");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page.getByLabel("Layout preset").selectOption("circle");
  await page.getByRole("button", { name: "Apply layout" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  for (const format of ["SVG", "PNG"] as const) {
    const event = page.waitForEvent("download");
    await page.getByRole("button", { name: `Download ${format}` }).click();
    const download = await event;
    const bytes = await readFile((await download.path())!);
    if (format === "SVG") {
      const contents = bytes.toString();
      expect(contents).toContain("Start &lt;state&gt;");
      expect(contents).toContain("marker-end");
      expect(contents).not.toContain("<state>");
    } else {
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(bytes.readUInt32BE(16)).toBeGreaterThan(200);
      expect(bytes.readUInt32BE(20)).toBeGreaterThan(200);
    }
  }
  await page.getByRole("button", { name: "Undo edit" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page
    .getByRole("region", { name: "Machine graph" })
    .screenshot({ path: "/tmp/transivium-trn19-graph.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
