import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Text has no APG pattern: a paragraph is read as one and never takes focus.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Text keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/text"));

  test("Tab passes over paragraphs", async ({ page }) => {
    await expect(section(page, "Sizes").locator("beautiful-example-preview p")).toHaveCount(3);
    // From the Markup toggle before the Sizes example, Tab lands on the one after it.
    await section(page, "Body text").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "Sizes").locator("summary").first()).toBeFocused();
  });

  test("is a paragraph, with strong and code inside it", async ({ page }) => {
    const preview = section(page, "Body text").locator("beautiful-example-preview");
    await expect(preview.getByRole("paragraph")).toHaveCount(1);
    await expect(preview.locator("p > strong")).toHaveText("nothing goes live until you publish");
    await expect(preview.locator("p > code")).toHaveText("spring-launch.example.com");
  });

  test("without a size, takes the size of where it sits", async ({ page }) => {
    await section(page, "In a dialog").getByRole("button", { name: "Connect a domain" }).click();
    const body = page.locator("#connect-domain beautiful-dialog-body");
    await expect(body.locator("p").first()).toHaveCSS("font-size", "14px");
    await expect(section(page, "Body text").locator("beautiful-example-preview p")).toHaveCSS("font-size", "16px");
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Text tones", () => {
  test("muted text takes a glass surface's stronger shade", async ({ page }) => {
    // On the harness's plain canvas: the docs page's own content sits on a Sidebar layout pane, a glass surface too.
    await page.goto("/tests/harness/text.html?theme=glass&mode=light");
    const muted = page.locator('[data-example="muted"] p[data-tone="muted"]').first();
    await expect(muted).toHaveCSS("color", "rgb(82, 82, 91)");
    await page.locator('[data-example="glass"]').getByRole("button", { name: "Connect a domain" }).click();
    await expect(page.locator('#connect-domain p[data-tone="muted"]')).toHaveCSS("color", "rgb(63, 63, 70)");
  });

  test("strong in muted text takes the full text color", async ({ page }) => {
    await open(page, "/text", "classic", "dark");
    await expect(section(page, "Muted").locator('beautiful-example-preview p[data-tone="muted"] strong').first()).toHaveCSS(
      "color",
      "rgb(244, 244, 245)",
    );
  });
});

test.describe("Text axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/text", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/text.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The glass example's stage is bright on purpose, so its contrast is the docs page's to judge.
        const results = await new AxeBuilder({ page }).exclude("beautiful-demo-stage").withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Text component", () => {
  test("passes other attributes to the paragraph", async ({ page }) => {
    await page.goto("/tests/harness/text.html");
    await expect(page.locator("#described")).toHaveText("Shown under the field.");
    await expect(page.locator("#described")).toHaveAttribute("data-tone", "muted");
    await expect(page.getByText("The default tone")).not.toHaveAttribute("data-tone");
  });
});
