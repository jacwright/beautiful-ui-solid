import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// APG's separator role, in its static form: a Divider is a real <hr>, read as a separator and never focused.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** The alpha of a computed color, such as "oklab(0.2 0 0 / 0.1)" or "rgba(0, 0, 0, 0.5)". 1 when it has none. */
function alpha(color: string) {
  const parts = color.match(/[\d.]+/g)!.map(Number);
  return color.includes("/") || color.startsWith("rgba") ? parts.at(-1)! : 1;
}

const line = (page: Page, title: string, index = 0) => section(page, title).locator("beautiful-example-preview hr").nth(index);

test.describe("Divider keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/divider"));

  test("Tab passes over a Divider", async ({ page }) => {
    const row = section(page, "Vertical, between groups of buttons").locator("beautiful-example-preview");
    await row.getByRole("button", { name: "Redo" }).focus();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Preview" })).toBeFocused();
  });

  test("is read as a separator, and a vertical one says so", async ({ page }) => {
    await expect(section(page, "Between sections").getByRole("separator")).toHaveCount(2);
    const vertical = section(page, "Vertical, between groups of buttons").getByRole("separator");
    await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
  });
});

test.describe("Divider look", () => {
  test("a hairline across what holds it, with no margin", async ({ page }) => {
    await open(page, "/divider", "classic");
    const hr = line(page, "Between sections");
    await expect(hr).toHaveCSS("border-top-width", "1px");
    await expect(hr).toHaveCSS("border-left-width", "0px");
    await expect(hr).toHaveCSS("height", "1px");
    await expect(hr).toHaveCSS("margin-top", "0px");
    const [lineWidth, holderWidth] = await hr.evaluate((el) => [el.getBoundingClientRect().width, el.parentElement!.clientWidth]);
    expect(lineWidth).toBe(holderWidth);
  });

  test("is a tint of the text, and soft is half as strong", async ({ page }) => {
    await open(page, "/divider", "classic");
    const full = alpha(await line(page, "Between sections").evaluate((el) => getComputedStyle(el).borderTopColor));
    const soft = alpha(await line(page, "Soft, between rows").evaluate((el) => getComputedStyle(el).borderTopColor));
    expect(full).toBeCloseTo(0.1, 2);
    expect(soft).toBeCloseTo(0.05, 2);
  });

  test("classic draws one line, and glass a groove with a lit edge", async ({ page }) => {
    await open(page, "/divider", "classic");
    // The shadow's color, without its offsets.
    const shadow = () =>
      line(page, "Between sections").evaluate((el) => getComputedStyle(el).boxShadow.match(/^\w+\([^)]*\)/)![0]);
    expect(alpha(await shadow())).toBe(0);
    await page.evaluate(() => (document.documentElement.dataset.theme = "glass"));
    expect(alpha(await shadow())).toBeGreaterThan(0.5);
  });

  test("in glass's dark mode the groove is a shadow", async ({ page }) => {
    await open(page, "/divider", "glass", "dark");
    const color = await line(page, "Between sections").evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(color).toBe("rgba(0, 0, 0, 0.5)");
  });

  test("a vertical one stands up the height of its row", async ({ page }) => {
    await open(page, "/divider");
    const row = section(page, "Vertical, between groups of buttons");
    const hr = row.locator("hr");
    await expect(hr).toHaveCSS("border-left-width", "1px");
    await expect(hr).toHaveCSS("border-top-width", "0px");
    await expect(hr).toHaveCSS("width", "1px");
    const button = await row.getByRole("button", { name: "Redo" }).boundingBox();
    const box = await hr.boundingBox();
    expect(box!.height).toBe(button!.height);
  });

  test("a dialog's body gives it room each side", async ({ page }) => {
    await open(page, "/divider");
    await section(page, "In a dialog").getByRole("button", { name: "Site settings" }).click();
    const hr = page.locator("#launch-settings hr").first();
    await expect(hr).toHaveCSS("margin-top", "20px");
    await expect(hr).toHaveCSS("margin-bottom", "20px");
  });

  test("a Dropdown's line is a Divider, set in to its items' text", async ({ page }) => {
    await open(page, "/dropdown", "classic");
    const hr = page.locator("[role=menu] > hr").first();
    await expect(hr).toHaveCSS("border-top-width", "1px");
    await expect(hr).toHaveCSS("margin-left", "12px");
  });
});

test.describe("Divider axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/divider", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Divider component", () => {
  test("passes other attributes to the <hr>, and leaves out a horizontal orientation", async ({ page }) => {
    await page.goto("/tests/harness/divider.html");
    const hr = page.locator("#decorative");
    await expect(hr).toHaveJSProperty("tagName", "HR");
    await expect(hr).toHaveClass("custom");
    await expect(hr).toHaveAttribute("role", "presentation");
    await expect(hr).not.toHaveAttribute("aria-orientation");
    await expect(hr).not.toHaveAttribute("data-soft");
    // The attributes a hand-written <hr> would carry pass through as well.
    const handWritten = page.locator("#hand-written");
    await expect(handWritten).toHaveAttribute("aria-orientation", "vertical");
    await expect(handWritten).toHaveAttribute("data-soft", "");
  });

  test("a vertical one outside a flex or grid row is still a line tall", async ({ page }) => {
    await page.goto("/tests/harness/divider.html");
    const height = await page.locator("#hand-written").evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(16);
  });
});
