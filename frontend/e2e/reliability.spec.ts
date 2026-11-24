import { expect, test } from "@playwright/test";

test("offline and server failures retain input/draft and allow retry with request ID", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByLabel("Display label", { exact: true })
    .fill("Retained draft");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await page.getByLabel("Input string").fill("101");
  await page.route("**/api/v1/simulate", (route) =>
    route.abort("connectionrefused"),
  );
  await page.getByRole("button", { name: "Run input" }).click();
  await expect(page.getByRole("alert")).toContainText("your draft is safe");
  await expect(page.getByLabel("Display label", { exact: true })).toHaveValue(
    "Retained draft",
  );
  await expect(page.getByLabel("Input string")).toHaveValue("101");
  await page.unroute("**/api/v1/simulate");
  await page.route("**/api/v1/simulate", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "DEADLINE_EXCEEDED",
          message: "Reduce input and retry.",
          issues: [],
          requestId: "test-deadline-id",
        },
      }),
    }),
  );
  await page.getByRole("button", { name: "Run input" }).click();
  await expect(page.getByRole("alert")).toContainText("test-deadline-id");
  await expect(page.getByText("Rejected", { exact: true })).toHaveCount(0);
  await page.unroute("**/api/v1/simulate");
  await page.getByRole("button", { name: "Run input" }).click();
  await page.getByRole("button", { name: "Go to step 3", exact: true }).click();
  await expect(page.getByText("Accepted", { exact: true })).toBeVisible();
});

for (const endpoint of ["simulate", "convert"]) {
  test(`late ${endpoint} response never replaces an edited source`, async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: "Validate machine" }).click();
    await expect(page.getByText("All formal checks passed.")).toBeVisible();
    let release!: () => void;
    let arrived!: () => void;
    const ready = new Promise<void>((resolve) => {
      arrived = resolve;
    });
    await page.route(`**/api/v1/${endpoint}`, async (route) => {
      const response = await route.fetch();
      await new Promise<void>((resolve) => {
        release = resolve;
        arrived();
      });
      await route.fulfill({ response });
    });
    if (endpoint === "simulate") {
      await page.getByLabel("Input string").fill("101");
      await page.getByRole("button", { name: "Run input" }).click();
    } else {
      await page
        .getByLabel("Conversion", { exact: true })
        .selectOption("dfa_to_regex");
      await page.getByRole("button", { name: "Convert machine" }).click();
    }
    await ready;
    await page.getByRole("button", { name: "Add state" }).click();
    const delivered = page.waitForResponse((response) =>
      response.url().endsWith(`/api/v1/${endpoint}`),
    );
    release();
    await delivered;
    await expect(
      page.getByText("Editable draft", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Step 0 of 3")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Download regex JSON" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Convert machine" }),
    ).toBeDisabled();
    await expect(
      page.getByLabel("Selected state", { exact: true }),
    ).toHaveValue("q3");
  });
}

test("same-page navigation keeps comparison dirty protection and browser Back can be cancelled", async ({
  page,
}) => {
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs++;
    await dialog.dismiss();
  });
  await page.goto("/editor");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByRole("button", { name: "Compare languages" }).click();
  await page.getByLabel("left state label").fill("Keep comparison edits");
  await navigation.getByRole("button", { name: "Compare languages" }).click();
  expect(dialogs).toBe(0);
  await navigation.getByRole("button", { name: "Guide & notation" }).click();
  await expect(page.getByLabel("left state label")).toHaveValue(
    "Keep comparison edits",
  );
  expect(dialogs).toBe(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/compare$/);
  await expect(page.getByLabel("left state label")).toHaveValue(
    "Keep comparison edits",
  );
  expect(dialogs).toBe(2);
});

test("cancelled adoption preserves the original transducer", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.dismiss());
  await page.goto("/editor");
  await page.getByRole("button", { name: "Bit inverter" }).click();
  await page.getByRole("button", { name: "Validate machine" }).click();
  await page.getByRole("button", { name: "Convert machine" }).click();
  await expect(
    page.getByText("Exactly verified", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Adopt result as draft" }).click();
  await expect(page.getByLabel("Machine type", { exact: true })).toHaveValue(
    "mealy",
  );
  await expect(
    page.getByRole("heading", { name: "Bit inverter", exact: true }),
  ).toBeVisible();
});

test("failed diagram chunk leaves the transition editor usable", async ({
  page,
}) => {
  await page.route("**/src/Graph.tsx*", (route) => route.abort("failed"));
  await page.goto("/editor");
  await expect(page.getByRole("alert")).toContainText(
    "Continue editing in the transition table",
  );
  await page
    .locator(".graph-unavailable")
    .screenshot({ path: "/tmp/transivium-trn24-diagram-fallback.png" });
  await page
    .getByLabel("Destination from q0 on 0", { exact: true })
    .selectOption("q2");
  await expect(
    page.getByLabel("Destination from q0 on 0", { exact: true }),
  ).toHaveValue("q2");
  await page.getByRole("button", { name: "Validate machine" }).click();
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
});

test("failed comparison chunk can return to the preserved editor draft", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/src/Compare.tsx*", (route) => route.abort("failed"));
  await page.goto("/editor");
  await page
    .getByLabel("Display label", { exact: true })
    .fill("Keep editor draft");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Compare languages" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Comparison workspace could not load" }),
  ).toBeVisible();
  await page
    .locator(".guide")
    .screenshot({ path: "/tmp/transivium-trn24-route-fallback.png" });
  await page.getByRole("button", { name: "Return to workspace" }).click();
  await expect(page.getByLabel("Display label", { exact: true })).toHaveValue(
    "Keep editor draft",
  );
});
