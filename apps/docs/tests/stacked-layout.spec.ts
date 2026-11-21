import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Stacked layout has no APG pattern of its own: it is a page layout. It follows APG's guidance on
// landmarks (one banner, one main), and its drawer follows APG's modal dialog pattern.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Stacked layout keyboard and landmarks", () => {
  test.beforeEach(({ page }) => open(page, "/stacked-layout"));

  test("the skip link comes first, shows on focus, and moves to the content", async ({ page }) => {
    const layout = section(page, "No drawer").locator("beautiful-stacked-layout");
    const skip = layout.getByRole("link", { name: "Skip to content" });
    await expect(skip).toHaveCSS("clip-path", "inset(50%)");
    await skip.focus();
    await expect(skip).not.toHaveCSS("clip-path", "inset(50%)");
    expect((await skip.boundingBox())!.width).toBeGreaterThan(40);
    await expect(skip).toHaveAttribute("href", "#settings-main");
    await page.keyboard.press("Tab");
    await expect(layout.getByRole("link", { name: "Account" })).toBeFocused();
  });

  test("Tab goes from the skip link to the Navbar, and a wide layout has no menu button", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const layout = section(page, "An app").locator("beautiful-stacked-layout");
    await expect(layout.getByRole("button", { name: "Open navigation" })).toBeHidden();
    await layout.getByRole("link", { name: "Skip to content" }).focus();
    await page.keyboard.press("Tab");
    await expect(layout.getByRole("button", { name: "Spring Studio" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(layout.getByRole("link", { name: "Home" })).toBeFocused();
  });

  test("the header is the banner, with the Navbar in it, and the content is main", async ({ page }) => {
    const layout = section(page, "An app").locator("beautiful-stacked-layout");
    await expect(layout.locator(":scope > header > nav[data-navbar]")).toHaveCount(1);
    await expect(layout.locator(":scope > main#studio-main > h1")).toHaveText("Sites");
    // A closed drawer is hidden, so only the Navbar is a navigation landmark.
    await expect(layout.getByRole("navigation")).toHaveCount(1);
  });

  test("a narrow layout shows the menu button and hides the collapsed sections", async ({ page }) => {
    const layout = section(page, "On a phone").locator("beautiful-stacked-layout");
    await expect(layout.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await expect(layout.locator("header beautiful-navbar-section[data-collapse]")).toBeHidden();
    await expect(layout.locator("header nav > hr")).toBeHidden();
    await expect(layout.getByRole("button", { name: "Spring Studio" })).toBeVisible();
    await expect(layout.getByRole("button", { name: "Account" })).toBeVisible();
  });

  test("the menu button opens the drawer, Tab stays in it, and Escape closes it back to the button", async ({ page }) => {
    const layout = section(page, "On a phone").locator("beautiful-stacked-layout");
    const menu = layout.getByRole("button", { name: "Open navigation" });
    await menu.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("navigation", { name: "Main" })).toBeVisible();
    // Focus starts on the close button, the first thing in it, and Tab moves through the Sidebar, not the inert page.
    const close = drawer.getByRole("button", { name: "Close navigation" });
    await expect(close).toBeFocused();
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await expect(drawer.getByRole("link", { name: "Billing" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test("the drawer slides in from the left, the screen's height", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const layout = section(page, "On a phone").locator("beautiful-stacked-layout");
    await layout.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toHaveCSS("opacity", "1");
    const box = (await drawer.boundingBox())!;
    expect(box.x).toBeCloseTo(8, 0);
    expect(box.width).toBeCloseTo(320, 0);
    expect(box.height).toBeCloseTo(900 - 16, 0);
  });

  test("the close button closes the drawer", async ({ page }) => {
    const layout = section(page, "On a phone").locator("beautiful-stacked-layout");
    await layout.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await drawer.getByRole("button", { name: "Close navigation" }).click();
    await expect(drawer).toBeHidden();
  });

  test("a wide layout frames the content as a pane, and a narrow one drops the frame", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const wide = section(page, "An app").locator("beautiful-stacked-layout > main");
    expect(await wide.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
    await expect(wide).toHaveCSS("padding-top", "32px");
    const narrow = section(page, "On a phone").locator("beautiful-stacked-layout > main");
    await expect(narrow).toHaveCSS("box-shadow", "none");
    await expect(narrow).toHaveCSS("padding-left", "16px");
  });

  test("the content's parts stack 24px apart, with the line under the title 8px under it", async ({ page }) => {
    const main = section(page, "An app").locator("beautiful-stacked-layout > main");
    const [title, lede, table] = await Promise.all([
      main.locator("h1").boundingBox(),
      main.locator("h1 + p").boundingBox(),
      main.locator("beautiful-table").boundingBox(),
    ]);
    expect(lede!.y - (title!.y + title!.height)).toBeCloseTo(8, 0);
    expect(table!.y - (lede!.y + lede!.height)).toBeCloseTo(24, 0);
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Stacked layout axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      // On the docs page each example's main and header sit inside the docs' own, so the landmark rules
      // judge the harness below instead, where a page has the one main it has in use.
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/stacked-layout", theme, mode);
        const results = await new AxeBuilder({ page })
          .include("beautiful-example-preview")
          .disableRules(["landmark-main-is-top-level", "landmark-no-duplicate-main", "landmark-unique", "landmark-banner-is-top-level", "landmark-no-duplicate-banner", "region"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the drawer open, ${theme} ${mode}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/tests/harness/stacked-layout.html?example=app&theme=${theme}&mode=${mode}`);
        await page.getByRole("button", { name: "Open navigation" }).click();
        await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCSS("opacity", "1");
        const builder = new AxeBuilder({ page }).include("dialog").withTags(["wcag2a", "wcag2aa", "wcag21aa"]);
        const results = await (theme !== "glass" ? builder : builder.disableRules(["color-contrast"])).analyze();
        expect(results.violations).toEqual([]);
      });

      // Over the docs page's gradient or through glass axe can't judge contrast, so the harness shows the
      // layout alone, on a page of its own. Glass is measured from pixels in glass.spec.ts.
      for (const example of ["app", "no-drawer"]) {
        for (const width of [1280, 390]) {
          test(`${example} as a page of its own at ${width}px, ${theme} ${mode}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(`/tests/harness/stacked-layout.html?example=${example}&theme=${theme}&mode=${mode}`);
            await page.locator("main").waitFor();
            const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"]);
            const results = await (theme !== "glass" ? builder : builder.disableRules(["color-contrast"])).analyze();
            expect(results.violations).toEqual([]);
            if (theme !== "glass") expect(results.passes.map((rule) => rule.id)).toContain("color-contrast");
          });
        }
      }
    }
  }
});

test.describe("Stacked layout component", () => {
  test("the layout fills the screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/tests/harness/stacked-layout.html?example=app");
    await expect(page.locator("beautiful-stacked-layout")).toHaveCSS("min-height", "900px");
    const main = (await page.locator("main").boundingBox())!;
    expect(main.y + main.height).toBeCloseTo(900 - 8, 0);
  });

  test("the content runs no wider than 72rem on a big screen, centered", async ({ page }) => {
    await page.setViewportSize({ width: 1800, height: 900 });
    await page.goto("/tests/harness/stacked-layout.html?example=app");
    const main = page.locator("main");
    const [pane, title] = await Promise.all([main.boundingBox(), main.locator("beautiful-table").boundingBox()]);
    expect(title!.width).toBeCloseTo(72 * 16, 0);
    expect(Math.abs(pane!.x + pane!.width / 2 - (title!.x + title!.width / 2))).toBeLessThan(1);
  });

  test("following a link in the drawer closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tests/harness/stacked-layout.html?example=app");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "Forms" }).click();
    await expect(drawer).toBeHidden();
  });

  test("a link opened in a new tab leaves the drawer open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tests/harness/stacked-layout.html?example=app");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    const forms = drawer.getByRole("link", { name: "Forms" });
    await forms.click({ modifiers: ["ControlOrMeta"] });
    await expect(drawer).toBeVisible();
  });

  test("growing wide enough to show the whole Navbar closes the drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tests/harness/stacked-layout.html?example=app");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 844 });
    await expect(drawer).toBeHidden();
    // The page isn't left inert.
    await page.getByRole("link", { name: "Forms" }).click();
    await expect(page).toHaveURL(/#forms$/);
  });

  test("the menu button opens the drawer where the browser lacks commandfor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tests/harness/stacked-layout.html?example=app");
    // Without the attribute the browser does nothing on its own, as one without invoker commands.
    await page.getByRole("button", { name: "Open navigation" }).evaluate((el) => el.removeAttribute("commandfor"));
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  });

  test("passes other attributes to the layout, and leaves the drawer out without a sidebar", async ({ page }) => {
    // A test-only block: the harness shows it with the examples, not alone.
    await page.goto("/tests/harness/stacked-layout.html");
    const layout = page.locator('[data-example="attributes"] beautiful-stacked-layout');
    await expect(layout).toHaveClass("custom");
    await expect(layout).toHaveAttribute("data-extra", "yes");
    await expect(layout.locator("dialog")).toHaveCount(0);
    await expect(layout.locator("header > button")).toHaveCount(0);
    // With no id, the content's id is made unique, and the skip link points at it.
    const id = await layout.locator("main").getAttribute("id");
    expect(id).toBeTruthy();
    await expect(layout.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", `#${id}`);
  });
});
