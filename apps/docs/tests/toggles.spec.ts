import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { settings } from "../src/settings.ts";
import { open } from "./settings.ts";

// The docs site's theme and mode toggles: two buttons fixed at the bottom right, each showing its
// setting's value, flipped by a click or by its key from anywhere on the page.

function toggles(page: Page) {
  return page.getByRole("complementary", { name: "Theme and mode" });
}

function root(page: Page) {
  return page.locator("html");
}

test.describe("theme and mode toggles", () => {
  test.beforeEach(({ page }) => open(page, "/button", "glass", "light"));

  test("each button shows its value and a click flips it", async ({ page }) => {
    const theme = toggles(page).getByRole("button", { name: "Theme Glass" });
    await expect(theme).toHaveAttribute("aria-keyshortcuts", "T");
    await theme.click();
    await expect(root(page)).toHaveAttribute("data-theme", "classic");
    await expect(toggles(page).getByRole("button", { name: "Theme Classic" })).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), settings.theme.key)).toBe("classic");

    await toggles(page).getByRole("button", { name: "Mode Light" }).click();
    await expect(root(page)).toHaveAttribute("data-mode", "dark");
    await expect(toggles(page).getByRole("button", { name: "Mode Dark" })).toBeVisible();
  });

  test("T and M flip the settings from anywhere on the page", async ({ page }) => {
    await page.mouse.wheel(0, 4000);
    await page.locator("main").click({ position: { x: 4, y: 4 } });
    await page.keyboard.press("t");
    await expect(root(page)).toHaveAttribute("data-theme", "classic");
    await page.keyboard.press("m");
    await expect(root(page)).toHaveAttribute("data-mode", "dark");
    await page.keyboard.press("t");
    await expect(root(page)).toHaveAttribute("data-theme", "modern");
    await page.keyboard.press("t");
    await expect(root(page)).toHaveAttribute("data-theme", "glass");
    await expect(toggles(page).getByRole("button", { name: "Theme Glass" })).toBeVisible();
    await expect(toggles(page).getByRole("button", { name: "Mode Dark" })).toBeVisible();
  });

  test("a letter typed into a field or held with a modifier is left alone", async ({ page }) => {
    await page.goto("/input");
    await page.locator("main input[type=text], main input:not([type])").first().focus();
    await page.keyboard.press("t");
    await page.keyboard.press("m");
    await page.locator("main").click({ position: { x: 4, y: 4 } });
    await page.keyboard.press("Shift+T");
    await page.keyboard.press("Control+m");
    await expect(root(page)).toHaveAttribute("data-theme", "glass");
    await expect(root(page)).toHaveAttribute("data-mode", "light");
  });

  test("a letter typed into an open menu is its typeahead", async ({ page }) => {
    await page.goto("/dropdown");
    const button = page.locator('main [command="toggle-popover"][commandfor]').first();
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(':popover-open [role="menuitem"]:focus')).toHaveCount(1);
    await page.keyboard.press("t");
    await page.keyboard.press("m");
    await expect(root(page)).toHaveAttribute("data-theme", "glass");
    await expect(root(page)).toHaveAttribute("data-mode", "light");
  });

  test("the toggles stay in view at the bottom right as the page scrolls", async ({ page }) => {
    const viewport = page.viewportSize()!;
    for (const scroll of [0, 4000]) {
      await page.evaluate((y) => scrollTo(0, y), scroll);
      const box = (await toggles(page).boundingBox())!;
      expect(box.y + box.height).toBeGreaterThan(viewport.height - 40);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      expect(box.x + box.width).toBeGreaterThan(viewport.width - 40);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  for (const theme of settings.theme.values) {
    for (const mode of settings.mode.values) {
      test(`passes axe in ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/", theme, mode);
        const results = await new AxeBuilder({ page }).include(".site-toggles").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
