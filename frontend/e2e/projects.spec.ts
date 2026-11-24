import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("a named project survives refresh and protects newer edits during open and deletion", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByLabel("Display label").fill("Saved source");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await page.getByLabel("Project name").fill("Coursework");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page.getByText("Saved “Coursework” in this browser."),
  ).toBeVisible();
  await page.reload();
  await page.getByLabel("Display label").fill("Unsaved source");
  await page
    .getByLabel("Saved project", { exact: true })
    .selectOption("Coursework");
  await page.getByRole("button", { name: "Open project", exact: true }).click();
  const replace = page.getByRole("button", {
    name: "Replace draft with project",
  });
  await replace.click();
  await expect(page.getByLabel("Display label")).toHaveValue("Unsaved source");
  page.once("dialog", (dialog) => dialog.accept());
  await replace.click();
  await expect(page.getByLabel("Display label")).toHaveValue("Saved source");
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.getByLabel("Saved project", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.getByLabel("Saved project", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Display label")).toHaveValue("Saved source");
});

test("practice library loads and runs a new transducer example at mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  await page
    .getByLabel("Practice example", { exact: true })
    .selectOption({ label: "Running parity output · Mealy" });
  await page.getByRole("button", { name: "Load practice example" }).click();
  await page.getByRole("button", { name: "Validate machine" }).click();
  await page.getByLabel("Input string").fill("1011");
  await page.getByRole("button", { name: "Run input" }).click();
  await page.getByRole("button", { name: "Go to step 4" }).click();
  await expect(page.getByLabel("Normalized output")).toHaveText("1101");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .include('[aria-labelledby="projects-heading"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});
