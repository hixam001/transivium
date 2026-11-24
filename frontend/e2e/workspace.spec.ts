import { expect, test } from "@playwright/test";

test("DFA validation and playback use the live engine; edits invalidate the trace", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page.getByLabel("Input string").fill("101");
  await page.getByRole("button", { name: "Run input" }).click();
  await expect(page.getByText("Step 0 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Go to step 3", exact: true }).click();
  await expect(page.getByText("Accepted", { exact: true })).toBeVisible();
  await expect(page.locator(".machine-node.active")).toContainText("q2");
  await page
    .locator(".simulation")
    .screenshot({ path: "/tmp/transivium-trn06-playback.png" });
  await page.getByRole("button", { name: "Reset trace" }).click();
  await expect(page.getByText("Step 0 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Add state" }).click();
  await expect(page.getByText("Step 0 of 3")).toHaveCount(0);
  await expect(page.getByText("Editable draft", { exact: true })).toBeVisible();
});

test("epsilon closure handles empty input and invalid tokens without draft loss", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Epsilon cycle" }).click();
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page.getByRole("button", { name: "Run empty input" }).click();
  await expect(page.getByText("Accepted", { exact: true })).toBeVisible();
  await expect(page.getByText("Step 0 of 0")).toBeVisible();
  await expect(page.locator(".machine-node.active")).toHaveCount(2);
  await page.getByLabel("Input string").fill(" ");
  await page.getByRole("button", { name: "Run input" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "outside the declared alphabet",
  );
  await expect(page.getByText("Rejected", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Machine type")).toHaveValue("enfa");
});

test("mobile workspace stays within the viewport and exposes table editing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  await expect(page.getByLabel("Destination from q0 on 0")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
