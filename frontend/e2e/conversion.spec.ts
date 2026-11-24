import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("verified regex copy/download retain full alphabet and an exactly equivalent canonical DFA", async ({
  page,
  request,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/editor");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page
    .getByLabel("Conversion", { exact: true })
    .selectOption("dfa_to_regex");
  await page.getByRole("button", { name: "Convert machine" }).click();
  await expect(
    page.getByText("Exactly verified", { exact: true }),
  ).toBeVisible();
  const expression = await page
    .getByLabel("Expression", { exact: true })
    .inputValue();
  await page.getByRole("button", { name: "Copy expression" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    expression,
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download regex JSON" }).click();
  const download = await downloadPromise;
  const artifact = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(artifact.regex).toBe(expression);
  expect(artifact.alphabet).toEqual(["0", "1"]);
  expect(artifact.verification.equivalent).toBe(true);
  const source = JSON.parse(
    await readFile("../contracts/fixtures/D01.json", "utf8"),
  ).machine;
  const comparison = await request.post(
    "http://127.0.0.1:8000/api/v1/equivalence",
    { data: { left: source, right: artifact.canonicalDfa } },
  );
  expect((await comparison.json()).equivalent).toBe(true);
  await page
    .locator(".conversion")
    .screenshot({ path: "/tmp/transivium-trn12-export.png" });
  await page.getByRole("button", { name: "Add state" }).click();
  await expect(
    page.getByRole("button", { name: "Download regex JSON" }),
  ).toHaveCount(0);
});

test("comparison supports equivalent machines and shortest empty witness replay", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/compare");
  await page.getByRole("button", { name: "Validate left" }).click();
  await page.getByRole("button", { name: "Validate right" }).click();
  const compare = page
    .locator(".compare-result")
    .getByRole("button", { name: "Compare languages", exact: true });
  await expect(compare).toBeEnabled();
  await compare.click();
  await expect(
    page.getByText("Equivalent languages", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Load left example").selectOption("D03");
  await page.getByLabel("Load right example").selectOption("D04");
  await page.getByRole("button", { name: "Validate left" }).click();
  await page.getByRole("button", { name: "Validate right" }).click();
  await expect(compare).toBeEnabled();
  await compare.click();
  await expect(
    page.getByText("ε (empty string)", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run witness on both" }).click();
  await expect(
    page.getByText("Simulation confirms: left accepted, right rejected."),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/transivium-trn12-compare.png",
    fullPage: true,
  });
  await page.getByLabel("left alphabet").fill("a");
  await expect(compare).toBeDisabled();
  await expect(
    page.getByText("Different languages", { exact: true }),
  ).toHaveCount(0);
});

test("mobile comparison and export controls do not overflow the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/compare");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.goto("/editor");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await page
    .getByLabel("Conversion", { exact: true })
    .selectOption("dfa_to_regex");
  await page.getByRole("button", { name: "Convert machine" }).click();
  await expect(
    page.getByText("Exactly verified", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page
    .locator(".conversion")
    .screenshot({ path: "/tmp/transivium-trn12-mobile-export.png" });
});
