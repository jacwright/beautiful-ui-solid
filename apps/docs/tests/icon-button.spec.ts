import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { accessible, withoutInterestInvokers } from "./interest.ts";
import { modes, open, themes } from "./settings.ts";

// From the APG button pattern, which asks that a button with no text be named:
// https://www.w3.org/WAI/ARIA/apg/patterns/button/ and the APG tooltip pattern for its tip:
// https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/. The tip is the name, so it is said once.

/** The live preview of the docs example with this title. */
function example(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) }).locator("beautiful-example-preview");
}

/** Counts clicks on an element, so a test can tell a key activated it. */
async function countClicks(target: Locator) {
  await target.evaluate((el) => {
    el.dataset.clicks = "0";
    el.addEventListener("click", (event) => {
      event.preventDefault();
      el.dataset.clicks = String(Number(el.dataset.clicks) + 1);
    });
  });
  return () => target.getAttribute("data-clicks").then(Number);
}

test.describe("Icon button keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/icon-button"));

  test("every icon button is named by its tip, once, and its icon adds nothing", async ({ page }) => {
    const buttons = page.locator("beautiful-example-preview [data-icon-button]");
    expect(await buttons.count()).toBeGreaterThan(0);
    for (const button of await buttons.all()) {
      await expect(button).not.toHaveAttribute("aria-label");
      const id = await button.getAttribute("interestfor");
      await expect(button).toHaveAttribute("aria-labelledby", id!);
      const tip = page.locator(`#${id}`);
      await expect(tip).toHaveAttribute("role", "tooltip");
      const words = (await tip.textContent())!.trim();
      expect(words).toBeTruthy();
      expect(await accessible(page, `[interestfor="${id}"]`)).toEqual({ name: words, description: undefined });
      await expect(button.locator("svg")).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("resting the pointer on an icon button shows its name, and leaving hides it", async ({ page }) => {
    const row = example(page, "A row of actions");
    const tip = row.locator("#tip-rename");
    await row.getByRole("button", { name: "Rename" }).hover();
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText("Rename");
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
  });

  test("keyboard focus shows the name, the next button's at once, and Escape hides it", async ({ page }) => {
    const row = example(page, "A row of actions");
    await row.getByRole("button", { name: "Rename" }).focus();
    await page.keyboard.press("Tab");
    await expect(row.locator("#tip-duplicate")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(row.locator("#tip-delete")).toBeVisible();
    await expect(row.locator("#tip-duplicate")).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(row.locator("#tip-delete")).toBeHidden();
    await expect(row.getByRole("button", { name: "Delete" })).toBeFocused();
  });

  test("Tab moves through a row of actions in order", async ({ page }) => {
    const row = example(page, "A row of actions");
    await row.getByRole("button", { name: "Rename" }).focus();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Duplicate" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Delete" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(row.getByRole("button", { name: "Duplicate" })).toBeFocused();
  });

  test("Enter and Space activate an icon button", async ({ page }) => {
    const button = example(page, "In each variant").getByRole("button", { name: "Site settings" });
    const clicks = await countClicks(button);
    await button.focus();
    await page.keyboard.press("Enter");
    expect(await clicks()).toBe(1);
    await page.keyboard.press("Space");
    expect(await clicks()).toBe(2);
  });

  test("Tab skips a disabled icon button", async ({ page }) => {
    const row = example(page, "Disabled");
    await expect(row.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(row.getByRole("button", { name: "Delete" })).toBeDisabled();
    const section = (title: string) => page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
    await section("A link that looks like an icon button").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Next page" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(section("Disabled").locator("summary").first()).toBeFocused();
  });

  test("Enter follows a link that looks like an icon button, and Space doesn't", async ({ page }) => {
    const link = example(page, "A link that looks like an icon button").getByRole("link", { name: "View site" });
    await link.focus();
    await page.keyboard.press("Space");
    await expect(page).not.toHaveURL(/#view-site$/);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#view-site$/);
  });
});

test.describe("Icon button size", () => {
  test("is square, and as tall as a Button beside it", async ({ page }) => {
    await open(page, "/icon-button");
    const row = example(page, "Beside a button");
    const publish = await row.getByRole("button", { name: "Publish" }).boundingBox();
    for (const name of ["Refresh preview", "Copy link"]) {
      const box = (await row.getByRole("button", { name }).boundingBox())!;
      expect(box.width).toBe(box.height);
      expect(box.height).toBe(publish!.height);
      expect(box.height).toBe(36);
    }
  });

  test("is a 44px square for a finger", async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await open(page, "/icon-button");
    const box = (await example(page, "In each variant").getByRole("button", { name: "Site settings" }).boundingBox())!;
    expect(box.width).toBe(44);
    expect(box.height).toBe(44);
    await context.close();
  });
});

test.describe("Icon button axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/icon-button", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // The docs page's gradient leaves axe unable to judge contrast, so it is checked on the harness.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/icon-button.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Icon button component", () => {
  test("the component's tip is the name, once, with the shortcut out of it", async ({ page }) => {
    await page.goto("/tests/harness/icon-button.html");
    const undo = page.locator('[data-example="form"]').getByRole("button", { name: "Undo" });
    await expect(undo).not.toHaveAttribute("aria-label");
    const id = await undo.getAttribute("interestfor");
    expect(await accessible(page, `[interestfor="${id}"]`)).toEqual({ name: "Undo", description: undefined });
    await expect(page.locator(`#${id}`)).toHaveAttribute("data-shortcut", "⌘Z");
    await expect(undo).toHaveAttribute("aria-keyshortcuts", "Meta+Z");
  });

  test("is named by its tip even when its icon has a title", async ({ page }) => {
    await page.goto("/tests/harness/icon-button.html");
    const button = page.locator('[data-example="form"] [data-icon-button]').last();
    const id = await button.getAttribute("interestfor");
    await expect(button).toHaveAttribute("aria-labelledby", id!);
    expect((await accessible(page, `[interestfor="${id}"]`)).name).toBe("Delete");
  });

  test("shows its name on hover and focus where the browser lacks interest invokers", async ({ page }) => {
    await withoutInterestInvokers(page);
    await page.goto("/tests/harness/icon-button.html");
    const row = page.locator('[data-example="row-actions"]');
    const rename = row.getByRole("button", { name: "Rename" });
    await expect(rename).not.toHaveAttribute("interestfor");
    await rename.hover();
    await expect(page.locator("#tip-rename")).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.locator("#tip-rename")).toBeHidden();
    await rename.focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#tip-duplicate")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#tip-duplicate")).toBeHidden();
  });

  test("is a submit button only when asked", async ({ page }) => {
    await page.goto("/tests/harness/icon-button.html");
    const form = page.locator('[data-example="form"]');
    await expect(form.getByRole("button", { name: "Refresh preview" })).toHaveAttribute("type", "button");
    await expect(form.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });
});
