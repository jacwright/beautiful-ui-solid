import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Heading has no APG pattern: it is a real <h1> to <h6>, read with its level and never focused.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Heading keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/heading"));

  test("Tab passes over headings", async ({ page }) => {
    await expect(section(page, "Sizes").locator("beautiful-example-preview h2")).toHaveCount(5);
    // From the last toggle before the Sizes example (Markup), Tab lands on the first one after it (Code).
    await section(page, "Levels").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "Sizes").locator("summary").first()).toBeFocused();
  });

  test("each level is read with its level", async ({ page }) => {
    const preview = section(page, "Levels").locator("beautiful-example-preview");
    for (const [level, name] of [
      [1, "Settings"],
      [2, "Domains"],
      [3, "springlaunch.com"],
      [4, "DNS records"],
    ] as const) {
      await expect(preview.getByRole("heading", { level, name, exact: true })).toBeVisible();
    }
  });

  test("each level has a size of its own", async ({ page }) => {
    const preview = section(page, "Levels").locator("beautiful-example-preview");
    for (const [tag, size] of [
      ["h1", "24px"],
      ["h2", "20px"],
      ["h3", "16px"],
      ["h4", "16px"],
    ] as const) {
      await expect(preview.locator(tag)).toHaveCSS("font-size", size);
    }
  });

  test("size sets the look without the level", async ({ page }) => {
    const preview = section(page, "Sizes").locator("beautiful-example-preview");
    for (const [size, px] of [
      ["xl", "30px"],
      ["lg", "24px"],
      ["sm", "16px"],
    ] as const) {
      await expect(preview.locator(`h2[data-size="${size}"]`)).toHaveCSS("font-size", px);
    }
    // An h1 set to sm is as small as an h3: the size rules win over the level's.
    const title = section(page, "Page title").locator("h1");
    await title.evaluate((h1) => h1.setAttribute("data-size", "sm"));
    await expect(title).toHaveCSS("font-size", "16px");
  });

  test("display scales with the screen, from 36px to 48px", async ({ page }) => {
    const display = section(page, "Sizes").locator('h2[data-size="display"]');
    await expect(display).toHaveCSS("font-weight", "700");
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(display).toHaveCSS("font-size", "36px");
    await page.setViewportSize({ width: 1600, height: 800 });
    await expect(display).toHaveCSS("font-size", "48px");
  });

  test("a dialog's own title keeps its look, and its body sets a heading apart from what's above", async ({ page }) => {
    await section(page, "In a dialog").getByRole("button", { name: "Site settings" }).click();
    await expect(page.locator("#site-settings-title")).toHaveCSS("font-size", "18px");
    const forms = page.locator("#site-settings beautiful-dialog-body h3").nth(1);
    await expect(forms).toHaveCSS("margin-top", "20px");
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Heading axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/heading", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so the headings are checked on the harness's
      // plain canvas. Button's glass, which axe can't see through, has its own check in glass.spec.ts.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/heading.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .include("[data-example] :is(h1, h2, h3, h4, h5, h6):not(beautiful-demo-stage *)")
          .analyze();
        expect(results.passes.length).toBeGreaterThan(0);
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Heading component", () => {
  test("renders its level, and passes other attributes to the heading", async ({ page }) => {
    await page.goto("/tests/harness/heading.html");
    const heading = page.locator("#labelled");
    await expect(heading).toHaveJSProperty("tagName", "H6");
    await expect(heading).toHaveClass("custom");
    await expect(heading).toHaveAttribute("aria-describedby", "labelled-note");
    await expect(heading).not.toHaveAttribute("data-size");
  });
});
