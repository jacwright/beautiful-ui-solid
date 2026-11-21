import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Auth layout has no APG pattern: it is a page layout. It follows APG's guidance on landmarks:
// everything sits in a landmark, and there is one main. It adds no focus and no keys of its own.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Auth layout keyboard and landmarks", () => {
  test.beforeEach(({ page }) => open(page, "/auth-layout"));

  test("Tab moves through the card's controls in order, then the footer's links", async ({ page }) => {
    const preview = section(page, "Sign in").locator("beautiful-example-preview");
    await preview.getByRole("link", { name: "Sign in with Google" }).focus();
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "Sign in with Microsoft" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "Terms" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "Privacy Policy" })).toBeFocused();
    // The layout itself is never a stop.
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(preview.getByRole("link", { name: "Sign in with Google" })).toBeFocused();
  });

  test("the card is the main landmark, and the footer outside it is contentinfo", async ({ page }) => {
    const preview = section(page, "Sign in").locator("beautiful-example-preview");
    const layout = preview.locator("beautiful-auth-layout");
    await expect(layout.locator(":scope > main")).toHaveCount(1);
    await expect(layout.locator(":scope > footer")).toHaveCount(1);
    await expect(layout.locator("main")).toHaveJSProperty("tagName", "MAIN");
    // The page's one h1 is in the card, and names what the page is for.
    await expect(layout.locator("main > h1")).toHaveText("Sign in to Acme");
    // The logo is an image named for the app.
    await expect(layout.getByRole("img", { name: "Acme" })).toBeVisible();
  });

  test("the card is 28rem wide and centered", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const layout = section(page, "Join a team").locator("beautiful-auth-layout");
    const card = layout.locator("main");
    await expect(card).toHaveCSS("width", "448px");
    const [outer, inner] = await Promise.all([layout.boundingBox(), card.boundingBox()]);
    expect(Math.abs(outer!.x + outer!.width / 2 - (inner!.x + inner!.width / 2))).toBeLessThan(1);
  });

  test("buttons fill the card's width, 12px apart, and the parts stack 24px apart", async ({ page }) => {
    const card = section(page, "Join a team").locator("beautiful-auth-layout > main");
    const [join, later] = await Promise.all([
      card.getByRole("button", { name: "Join the team" }).boundingBox(),
      card.getByRole("button", { name: "Not now" }).boundingBox(),
    ]);
    const box = (await card.boundingBox())!;
    const padding = await card.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
    expect(join!.width).toBeCloseTo(box.width - 2 * padding - 2, 0);
    expect(later!.y - (join!.y + join!.height)).toBeCloseTo(12, 0);
    const title = await card.locator("h1").boundingBox();
    const lede = await card.locator("h1 + p").boundingBox();
    expect(lede!.y - (title!.y + title!.height)).toBeCloseTo(8, 0);
  });

  test("a wide screen frames the card and a phone drops the frame", async ({ page }) => {
    const card = section(page, "Sign in").locator("beautiful-auth-layout > main");
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(card).toHaveCSS("border-top-color", /^(?!rgba\(0, 0, 0, 0\))/);
    expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(card).toHaveCSS("box-shadow", "none");
    await expect(card).toHaveCSS("padding-left", "0px");
    await expect(card).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  });

  test("an app's own backdrop shows behind the card", async ({ page }) => {
    const layout = section(page, "An app's own backdrop").locator("beautiful-auth-layout");
    // The backdrop is the stage's gradient, not the canvas.
    expect(await layout.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain("radial-gradient");
  });

  test("a wrong code is an error on its field, read with the input", async ({ page }) => {
    const code = section(page, "A code, with an error");
    const input = code.getByRole("textbox", { name: "Code" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("That code has expired. Send a new one.");
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Auth layout axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      // On the docs page each example's <main> is inside the docs' own, and there are five of them, so the
      // landmark rules judge the harness below instead, where a page has the one <main> it has in use.
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/auth-layout", theme, mode);
        const results = await new AxeBuilder({ page })
          .include("beautiful-example-preview")
          .disableRules(["landmark-main-is-top-level", "landmark-no-duplicate-main", "landmark-unique", "region"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      // Over the docs page's gradient or through glass axe can't judge contrast, so the harness shows the
      // layout alone, on a page of its own: its landmarks are judged here, and its contrast in classic.
      // Glass is measured from pixels in glass.spec.ts.
      for (const example of ["sign-in", "invite", "code", "expired"]) {
        test(`${example} as a page of its own, ${theme} ${mode}`, async ({ page }) => {
          await page.goto(`/tests/harness/auth-layout.html?example=${example}&theme=${theme}&mode=${mode}`);
          await page.locator("main").waitFor();
          const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"]);
          const results = await (theme !== "glass" ? builder : builder.disableRules(["color-contrast"])).analyze();
          expect(results.violations).toEqual([]);
          if (theme !== "glass") {
            expect(results.incomplete).toEqual([]);
            expect(results.passes.map((rule) => rule.id)).toContain("color-contrast");
          }
        });
      }
    }
  }
});

test.describe("Auth layout component", () => {
  test("the layout fills the screen, with the card centered and the footer at the bottom", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/tests/harness/auth-layout.html?example=sign-in");
    const layout = page.locator("beautiful-auth-layout");
    await expect(layout).toHaveCSS("min-height", "900px");
    const [outer, card, footer] = await Promise.all([
      layout.boundingBox(),
      layout.locator("main").boundingBox(),
      layout.locator("footer").boundingBox(),
    ]);
    expect(footer!.y + footer!.height).toBeGreaterThan(outer!.y + outer!.height - 40);
    expect(card!.y).toBeGreaterThan(outer!.y + 100);
    expect(card!.y + card!.height).toBeLessThan(footer!.y);
  });

  test("with no footer the card sits in the middle of the screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/tests/harness/auth-layout.html?example=expired");
    const [outer, card] = await Promise.all([page.locator("beautiful-auth-layout").boundingBox(), page.locator("main").boundingBox()]);
    // The layout's padding is 32px above and 24px below, so the middle is 4px above the screen's.
    expect(Math.abs(card!.y + card!.height / 2 - (outer!.y + outer!.height / 2))).toBeLessThanOrEqual(6);
  });

  test("a card taller than the screen scrolls the page, starting at the top", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    await page.goto("/tests/harness/auth-layout.html?example=code");
    const card = await page.locator("main").boundingBox();
    expect(card!.y).toBeGreaterThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(300);
  });

  test("passes other attributes to the layout, and leaves the footer out without one", async ({ page }) => {
    await page.goto("/tests/harness/auth-layout.html");
    const layout = page.locator("#labelled");
    await expect(layout).toHaveJSProperty("tagName", "BEAUTIFUL-AUTH-LAYOUT");
    await expect(layout).toHaveClass("custom");
    await expect(layout).toHaveAttribute("data-extra", "yes");
    await expect(layout.locator(":scope > footer #small-print")).toHaveText("Small print");
    await expect(page.locator('[data-example="expired"] footer')).toHaveCount(0);
  });
});
