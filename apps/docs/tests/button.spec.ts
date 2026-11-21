import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/

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

test.describe("Button keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/button"));

  test("Tab moves through the buttons in order", async ({ page }) => {
    const row = example(page, "Primary, in each color");
    await row.getByRole("button", { name: "Save draft" }).focus();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Publish" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Delete site" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(row.getByRole("button", { name: "Publish" })).toBeFocused();
  });

  test("Enter and Space activate a button", async ({ page }) => {
    const button = example(page, "Secondary, the default").getByRole("button", { name: "Publish" });
    const clicks = await countClicks(button);
    await button.focus();
    await page.keyboard.press("Enter");
    expect(await clicks()).toBe(1);
    await page.keyboard.press("Space");
    expect(await clicks()).toBe(2);
  });

  test("Tab skips a disabled button", async ({ page }) => {
    const section = (title: string) => page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
    const disabled = section("Disabled").locator("beautiful-example-preview").getByRole("button");
    await expect(disabled).toHaveCount(3);
    for (const button of await disabled.all()) await expect(button).toBeDisabled();
    // From the Markup toggle before the disabled buttons, Tab lands on the one after them.
    await section("A link that looks like a button").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section("Disabled").locator("summary").first()).toBeFocused();
  });

  test("Enter follows a link that looks like a button, and Space doesn't", async ({ page }) => {
    const link = example(page, "A link that looks like a button").getByRole("link", { name: "See pricing" });
    await link.focus();
    await page.keyboard.press("Space");
    await expect(page).not.toHaveURL(/#pricing$/);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#pricing$/);
    // The docs site's router leaves a same-page link to the browser, so the page stays put.
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  });

  test("the name comes from the text, and an icon adds nothing to it", async ({ page }) => {
    const icons = example(page, "With an icon");
    await expect(icons.getByRole("button", { name: "New site", exact: true })).toBeVisible();
    await expect(icons.getByRole("button", { name: "Download files", exact: true })).toBeVisible();
    await expect(icons.getByRole("button", { name: "Next step", exact: true })).toBeVisible();
  });
});

test.describe("Button axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/button", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // The docs page's gradient background leaves axe unable to judge contrast, so it is
      // checked on the harness, which has the kit's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/button.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        // Glass lets the page through, which axe can't judge either. glass.spec.ts measures it from pixels.
        if (theme !== "glass") expect(results.incomplete).toEqual([]);

        // Hover changes a primary fill, so each one is checked hovered too.
        for (const button of await page.locator('[data-variant="primary"]').all()) {
          await button.hover();
          const hovered = await new AxeBuilder({ page }).include('[data-variant="primary"]:hover').withRules(["color-contrast"]).analyze();
          expect(hovered.violations).toEqual([]);
        }
      });
    }
  }
});

test.describe("Button component", () => {
  test("is a submit button only when asked", async ({ page }) => {
    await page.goto("/tests/harness/button.html");
    const form = page.locator('[data-example="form"]');
    await expect(form.getByRole("button", { name: "Preview" })).toHaveAttribute("type", "button");
    await expect(form.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });
});

// The rim and its glint are a ::before drawn at 1 / --control-rim-scale and scaled down, so its
// radius has to be the button's divided by the scale, or its corners poke out past a round button.
test.describe("Button rim", () => {
  test.use({ deviceScaleFactor: 2 });

  for (const mode of modes) {
    test(`follows a pill's radius, glass ${mode}`, async ({ page }) => {
      await open(page, "/button", "glass", mode);
      const buttons = await example(page, "A pill").getByRole("button").all();
      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) {
        const { radius, rim, scale } = await button.evaluate((el) => {
          const own = getComputedStyle(el);
          return {
            radius: parseFloat(own.borderTopLeftRadius),
            rim: parseFloat(getComputedStyle(el, "::before").borderTopLeftRadius),
            scale: parseFloat(own.getPropertyValue("--control-rim-scale")),
          };
        });
        // A pill's radius is far past half its height, so it rounds fully, as the rim must.
        expect(radius).toBeGreaterThan(1000);
        expect(rim * scale).toBeCloseTo(radius, 0);
      }
    });
  }
});

// In light glass a primary's edge color is painted in its rim, so the colored border can't show
// past the white glint. A button in a group draws no rim, so its border keeps the whole edge.
test.describe("Button primary edge", () => {
  const edge = (button: Locator) =>
    button.evaluate((el) => {
      const own = getComputedStyle(el);
      return { border: own.borderTopColor, clip: own.backgroundClip, rimLayers: getComputedStyle(el, "::before").backgroundImage.split("gradient(").length - 1 };
    });

  test("light glass paints it in the rim, and a clear border", async ({ page }) => {
    await open(page, "/button", "glass", "light");
    const { border, clip, rimLayers } = await edge(example(page, "A pill").getByRole("button", { name: "Publish" }));
    expect(border).toMatch(/rgba\(0, 0, 0, 0\)|transparent|\/ 0\)$/);
    expect(clip).toBe("padding-box");
    expect(rimLayers).toBe(3);
  });

  for (const [theme, mode] of [["glass", "dark"], ["classic", "light"]] as const) {
    test(`${theme} ${mode} keeps it in the border`, async ({ page }) => {
      await open(page, "/button", theme, mode);
      const { border, clip } = await edge(example(page, "A pill").getByRole("button", { name: "Publish" }));
      expect(border).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(clip).toBe("border-box");
    });
  }

  test("a primary in a Button group keeps it in the border, in light glass", async ({ page }) => {
    await open(page, "/button-group", "glass", "light");
    const primary = page.locator('beautiful-button-group > [data-variant="primary"]').first();
    const { border, clip } = await edge(primary);
    expect(border).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(clip).toBe("border-box");
  });
});
