import { expect, test } from "@playwright/test";

for (const [example, kind, operation] of [
  ["Branching NFA", "nfa", "nfa_to_dfa"],
  ["Epsilon cycle", "enfa", "enfa_to_nfa"],
  ["Epsilon cycle", "enfa", "enfa_to_dfa"],
  ["Ends in 01", "dfa", "minimize_dfa"],
]) {
  test(`${operation} certifies without replacing source`, async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: example }).click();
    await page.getByRole("button", { name: "Validate machine" }).click();
    await expect(page.getByText("All formal checks passed.")).toBeVisible();
    await page
      .getByLabel("Conversion", { exact: true })
      .selectOption(operation);
    await page.getByRole("button", { name: "Convert machine" }).click();
    await expect(
      page.getByText("Exactly verified", { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Machine type")).toHaveValue(kind);
    await expect(
      page.getByRole("button", { name: "Adopt result as draft" }),
    ).toBeVisible();
  });
}

test("NFA rejection shows an empty active set", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Branching NFA" }).click();
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page.getByLabel("Input string").fill("1");
  await page.getByRole("button", { name: "Run input" }).click();
  await page.getByRole("button", { name: "Go to step 1", exact: true }).click();
  await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(page.locator(".machine-node.active")).toHaveCount(0);
});

test("nonempty shortest witness replays both language outcomes", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/compare");
  await page.getByLabel("Load left example").selectOption("D01");
  await page.getByLabel("Load right example").selectOption("D04");
  await page.getByRole("button", { name: "Validate left" }).click();
  await page.getByRole("button", { name: "Validate right" }).click();
  await page
    .getByRole("main")
    .getByRole("button", { name: "Compare languages", exact: true })
    .click();
  await expect(page.getByText("01", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Run witness on both" }).click();
  await expect(
    page.getByText("Simulation confirms: left accepted, right rejected."),
  ).toBeVisible();
});
