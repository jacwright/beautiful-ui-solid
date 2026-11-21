import { expect, test } from "@playwright/test";

// wireTabs and wireToggleGroup wire the plain markup a static website writes. The Solid Tabs and
// ToggleGroup don't use them, so the docs examples no longer test them: this does, on that markup.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/harness/static.html");
  await page.locator("body[data-wired]").waitFor({ state: "attached" });
});

test("wireTabs: the arrows move the selection, its panel and the one Tab stop", async ({ page }) => {
  const tabs = page.getByRole("tablist", { name: "Site settings" }).getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
  await expect(tabs.nth(0)).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("#settings-panel-1")).toBeVisible();
  await expect(page.locator("#settings-panel-0")).toBeHidden();
  await page.keyboard.press("End");
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(0)).toBeFocused();
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
});

test("wireToggleGroup: the arrows move the one choice and the Tab stop, and it reports the change", async ({ page }) => {
  const group = page.getByRole("radiogroup", { name: "Period" });
  await group.evaluate((el) => el.addEventListener("togglechange", (event) => (el.dataset.heard = JSON.stringify((event as CustomEvent).detail))));
  const week = group.getByRole("radio", { name: "Week" });
  const month = group.getByRole("radio", { name: "Month" });
  await week.focus();
  await page.keyboard.press("ArrowRight");
  await expect(month).toBeFocused();
  await expect(month).toHaveAttribute("aria-checked", "true");
  await expect(week).toHaveAttribute("aria-checked", "false");
  await expect(month).toHaveAttribute("tabindex", "0");
  await expect(week).toHaveAttribute("tabindex", "-1");
  await expect(group).toHaveAttribute("data-heard", '["month"]');
});
