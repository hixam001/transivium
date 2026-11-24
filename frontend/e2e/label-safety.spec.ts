import { expect, test } from "@playwright/test";

test("machine labels render as literal text in the graph, table and forms", async ({
  page,
}) => {
  await page.goto("/editor");
  const label = '<img src=x onerror="window.labelExecuted=1">';
  await page.getByLabel("Display label", { exact: true }).fill(label);
  await expect(page.locator(".machine-node").first()).toContainText(label);
  await expect(
    page.getByRole("rowheader").filter({ hasText: label }),
  ).toBeVisible();
  await expect(page.locator(".workspace img")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      Object.prototype.hasOwnProperty.call(window, "labelExecuted"),
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
});
