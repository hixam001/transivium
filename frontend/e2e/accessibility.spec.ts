import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 120; i++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Control was not reachable in keyboard tab order.");
}
async function noViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("editor, comparison and guide pass automated accessibility checks", async ({
  page,
}) => {
  for (const route of ["/editor", "/compare", "/help"]) {
    await page.goto(route);
    if (route !== "/help")
      await page.locator(".machine-node").first().waitFor();
    await noViolations(page);
  }
});

test("keyboard can construct and run a complete DFA without graph gestures", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to workspace" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await tabTo(page, page.getByRole("button", { name: "New machine" }));
  await page.keyboard.press("Enter");
  for (const symbol of ["0", "1"]) {
    const target = page.getByLabel(`Destination from q0 on ${symbol}`, {
      exact: true,
    });
    await tabTo(page, target);
    await page.keyboard.press("ArrowDown");
    await expect(target).toHaveValue("q0");
  }
  await tabTo(page, page.getByRole("checkbox", { name: "Accepting state" }));
  await page.keyboard.press("Space");
  await tabTo(page, page.getByRole("button", { name: "Validate machine" }));
  await page.keyboard.press("Enter");
  await expect(page.getByText("All formal checks passed.")).toBeVisible();
  await tabTo(page, page.getByLabel("Input string"));
  await page.keyboard.type("101");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Step 0 of 3")).toBeVisible();
  await tabTo(
    page,
    page.getByRole("button", { name: "Go to step 3", exact: true }),
  );
  await page.keyboard.press("Enter");
  await expect(page.getByText("Accepted", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.activeElement!).outlineStyle,
    ),
  ).not.toBe("none");
  await page.screenshot({
    path: "/tmp/transivium-trn23-keyboard.png",
    fullPage: true,
  });
  await noViolations(page);
});

test("alphabet editing preserves backspace and reduced-motion preference", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/editor");
  const alphabet = page.getByLabel("Input alphabet", { exact: true });
  await alphabet.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Backspace");
  await expect(alphabet).toHaveValue("0, ");
  await page.keyboard.press("Backspace");
  await expect(alphabet).toHaveValue("0,");
  await page.keyboard.press("Backspace");
  await expect(alphabet).toHaveValue("0");
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  expect(
    await page
      .getByRole("button", { name: "Validate machine" })
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
});

test("transducer forms and verified export are labelled and accessible", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/editor");
  for (const example of ["Bit inverter", "State outputs", "Ends in 01"]) {
    await page.getByRole("button", { name: example }).click();
    await page.getByRole("button", { name: "Validate machine" }).click();
    await expect(page.getByText("All formal checks passed.")).toBeVisible();
    if (example === "Ends in 01")
      await page
        .getByLabel("Conversion", { exact: true })
        .selectOption("dfa_to_regex");
    await page.getByRole("button", { name: "Convert machine" }).click();
    await expect(
      page.getByText("Exactly verified", { exact: true }),
    ).toBeVisible();
    await noViolations(page);
  }
});
