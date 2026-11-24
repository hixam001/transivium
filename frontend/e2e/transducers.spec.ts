import { expect, test } from "@playwright/test";

for (const [example, full] of [
  ["Bit inverter", "1010"],
  ["State outputs", "01010"],
]) {
  test(`${example} playback separates normalized outputs and empty input`, async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: example }).click();
    await page.getByRole("button", { name: "Validate machine" }).click();
    await expect(page.getByText("All formal checks passed.")).toBeVisible();
    await page.getByLabel("Input string").fill("0101");
    await page.getByRole("button", { name: "Run input" }).click();
    await page
      .getByRole("button", { name: "Go to step 4", exact: true })
      .click();
    await expect(page.getByLabel("Output prefix", { exact: true })).toHaveText(
      full,
    );
    await expect(
      page.getByLabel("Normalized output", { exact: true }),
    ).toHaveText("1010");
    await expect(page.getByText("Completed", { exact: true })).toBeVisible();
    await expect(page.getByText("Accepted", { exact: true })).toHaveCount(0);
    if (example === "State outputs") {
      await expect(page.getByLabel("Initial Moore output")).toHaveText("0");
      await page
        .locator(".simulation")
        .screenshot({ path: "/tmp/transivium-trn13-moore.png" });
    }
    await page.getByRole("button", { name: "Run empty input" }).click();
    await expect(page.getByText("Step 0 of 0")).toBeVisible();
    await expect(
      page.getByLabel("Normalized output", { exact: true }),
    ).toHaveText("ε (empty output)");
    await expect(page.getByLabel("Output prefix", { exact: true })).toHaveText(
      example === "State outputs" ? "0" : "ε (empty output)",
    );
  });
}
