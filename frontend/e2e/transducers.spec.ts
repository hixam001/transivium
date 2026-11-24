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

for (const [example, sourceKind, targetKind] of [
  ["Bit inverter", "mealy", "moore"],
  ["State outputs", "moore", "mealy"],
]) {
  test(`${sourceKind} converts to ${targetKind} only on explicit adoption`, async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/editor");
    await page.getByRole("button", { name: example }).click();
    await page.getByRole("button", { name: "Validate machine" }).click();
    await page.getByRole("button", { name: "Convert machine" }).click();
    await expect(
      page.getByText("Exactly verified", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Post-input output streams are exactly equal. The initial Moore output is excluded.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Machine type", { exact: true })).toHaveValue(
      sourceKind,
    );
    await page
      .locator(".conversion")
      .screenshot({ path: `/tmp/transivium-trn14-${targetKind}.png` });
    await page.getByRole("button", { name: "Adopt result as draft" }).click();
    await expect(page.getByLabel("Machine type", { exact: true })).toHaveValue(
      targetKind,
    );
    await page.getByRole("button", { name: "Validate machine" }).click();
    await page.getByLabel("Input string").fill("0101");
    await page.getByRole("button", { name: "Run input" }).click();
    await page
      .getByRole("button", { name: "Go to step 4", exact: true })
      .click();
    await expect(
      page.getByLabel("Normalized output", { exact: true }),
    ).toHaveText("1010");
    await page.getByRole("button", { name: "Run empty input" }).click();
    await expect(
      page.getByLabel("Normalized output", { exact: true }),
    ).toHaveText("ε (empty output)");
  });
}
