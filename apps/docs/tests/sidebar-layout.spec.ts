import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Sidebar layout has no APG pattern of its own: it is a page layout. It follows APG's guidance on
// landmarks (one main, every part in a landmark), and its drawer follows APG's modal dialog pattern.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const harness = (example: string) => `/tests/harness/sidebar-layout.html?example=${example}`;

test.describe("Sidebar layout keyboard and landmarks", () => {
  test.beforeEach(({ page }) => open(page, "/sidebar-layout"));

  test("the skip link comes first, shows on focus, and moves to the content", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const layout = section(page, "A short sidebar, no Navbar").locator("beautiful-sidebar-layout");
    const skip = layout.getByRole("link", { name: "Skip to content" });
    await expect(skip).toHaveCSS("clip-path", "inset(50%)");
    await skip.focus();
    await expect(skip).not.toHaveCSS("clip-path", "inset(50%)");
    expect((await skip.boundingBox())!.width).toBeGreaterThan(40);
    await expect(skip).toHaveAttribute("href", "#site-main");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#site-main$/);
  });

  test("wide: Tab goes from the skip link into the Sidebar, with no header", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const layout = section(page, "An app").locator("beautiful-sidebar-layout");
    await expect(layout.locator(":scope > header")).toBeHidden();
    await layout.getByRole("link", { name: "Skip to content" }).focus();
    await page.keyboard.press("Tab");
    await expect(layout.getByRole("button", { name: "Spring Studio" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(layout.getByRole("button", { name: "Search" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(layout.getByRole("link", { name: "Home" })).toBeFocused();
  });

  test("wide: the Sidebar is the one navigation landmark, beside main", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const layout = section(page, "An app").locator("beautiful-sidebar-layout");
    // The header's Navbar and the closed drawer are hidden, so only the page's Sidebar is a landmark.
    await expect(layout.getByRole("navigation")).toHaveCount(1);
    await expect(layout.locator(":scope > nav[data-sidebar]")).toBeVisible();
    await expect(layout.locator(":scope > main#studio-main > h1")).toHaveText("Sites");
    const [sidebar, main] = await Promise.all([
      layout.locator(":scope > nav[data-sidebar]").boundingBox(),
      layout.locator(":scope > main").boundingBox(),
    ]);
    expect(sidebar!.width).toBeCloseTo(256, 0);
    expect(main!.x - (sidebar!.x + sidebar!.width)).toBeCloseTo(0, 0);
  });

  test("narrow: the header shows the menu button and the Navbar, and the Sidebar hides", async ({ page }) => {
    const layout = section(page, "On a phone").locator("beautiful-sidebar-layout");
    await expect(layout.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await expect(layout.getByRole("button", { name: "Account" })).toBeVisible();
    await expect(layout.locator(":scope > nav[data-sidebar]")).toBeHidden();
    await expect(layout.getByRole("navigation")).toHaveCount(1);
    await expect(layout.getByRole("navigation", { name: "Account" })).toBeVisible();
  });

  test("the menu button opens the drawer, Tab stays in it, and Escape closes it back to the button", async ({ page }) => {
    const layout = section(page, "On a phone").locator("beautiful-sidebar-layout");
    const menu = layout.getByRole("button", { name: "Open navigation" });
    await menu.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("navigation", { name: "Main" })).toBeVisible();
    // The component focuses the drawer itself, and Tab moves through the Sidebar, not the inert page.
    await expect(drawer).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(drawer.getByRole("button", { name: "Spring Studio" })).toBeFocused();
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await expect(drawer.getByRole("link", { name: "Sites" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test("the drawer slides in from the left, the screen's height, and a tap beside it closes it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 844 });
    const layout = section(page, "On a phone").locator("beautiful-sidebar-layout");
    await layout.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toHaveCSS("opacity", "1");
    const box = (await drawer.boundingBox())!;
    expect(box.x).toBeCloseTo(8, 0);
    expect(box.width).toBeCloseTo(320, 0);
    expect(box.height).toBeCloseTo(844 - 16, 0);
    // A tap on the backdrop beside it closes it.
    await page.mouse.click(1000, 400);
    await expect(drawer).toBeHidden();
  });

  test("a wide layout frames the content as a pane, and a narrow one drops the frame", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const wide = section(page, "An app").locator("beautiful-sidebar-layout > main");
    expect(await wide.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
    await expect(wide).toHaveCSS("padding-top", "32px");
    await expect(wide).toHaveCSS("margin-top", "8px");
    await expect(wide).toHaveCSS("margin-left", "0px");
    const narrow = section(page, "On a phone").locator("beautiful-sidebar-layout > main");
    await expect(narrow).toHaveCSS("box-shadow", "none");
    await expect(narrow).toHaveCSS("padding-left", "16px");
  });

  test("the content's parts stack 24px apart, with the line under the title 8px under it", async ({ page }) => {
    const main = section(page, "An app").locator("beautiful-sidebar-layout > main");
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

test.describe("Sidebar layout axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      // On the docs page each example's main and header sit inside the docs' own, so the landmark rules
      // judge the harness below instead, where a page has the one main it has in use.
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/sidebar-layout", theme, mode);
        const results = await new AxeBuilder({ page })
          .include("beautiful-example-preview")
          .disableRules(["landmark-main-is-top-level", "landmark-no-duplicate-main", "landmark-unique", "landmark-banner-is-top-level", "landmark-no-duplicate-banner", "region"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the drawer open, ${theme} ${mode}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${harness("app")}&theme=${theme}&mode=${mode}`);
        await page.getByRole("button", { name: "Open navigation" }).click();
        await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCSS("opacity", "1");
        const builder = new AxeBuilder({ page }).include("dialog").withTags(["wcag2a", "wcag2aa", "wcag21aa"]);
        const results = await (theme !== "glass" ? builder : builder.disableRules(["color-contrast"])).analyze();
        expect(results.violations).toEqual([]);
      });

      // Over the docs page's gradient or through glass axe can't judge contrast, so the harness shows the
      // layout alone, on a page of its own. Glass is measured from pixels in glass.spec.ts.
      for (const example of ["app", "short"]) {
        for (const width of [1280, 390]) {
          test(`${example} as a page of its own at ${width}px, ${theme} ${mode}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(`${harness(example)}&theme=${theme}&mode=${mode}`);
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

test.describe("Sidebar layout component", () => {
  test("the layout fills the screen, and the Sidebar stays put while the content scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(harness("app"));
    await expect(page.locator("beautiful-sidebar-layout")).toHaveCSS("min-height", "600px");
    const main = (await page.locator("main").boundingBox())!;
    expect(main.y + main.height).toBeGreaterThanOrEqual(600 - 8 - 0.5);
    // Content taller than the screen scrolls the page, and the Sidebar stays at the top.
    await page.locator("main").evaluate((el) => el.insertAdjacentHTML("beforeend", "<p style='height: 2000px'>Long</p>"));
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    const sidebar = (await page.locator("beautiful-sidebar-layout > nav[data-sidebar]").boundingBox())!;
    expect(sidebar.y).toBeCloseTo(0, 0);
    expect(sidebar.height).toBeCloseTo(600, 0);
  });

  test("the content runs no wider than 72rem on a big screen, centered in its pane", async ({ page }) => {
    await page.setViewportSize({ width: 1800, height: 900 });
    await page.goto(harness("app"));
    const main = page.locator("main");
    const [pane, table] = await Promise.all([main.boundingBox(), main.locator("beautiful-table").boundingBox()]);
    expect(table!.width).toBeCloseTo(72 * 16, 0);
    expect(Math.abs(pane!.x + pane!.width / 2 - (table!.x + table!.width / 2))).toBeLessThan(1);
  });

  test("following a link in the drawer closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(harness("app"));
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "Forms" }).click();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/#forms$/);
  });

  test("the component's drawer takes focus itself, and Tab goes to the Sidebar's first item", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(harness("app"));
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(drawer.getByRole("button", { name: "Spring Studio" })).toBeFocused();
  });

  test("a link opened in a new tab leaves the drawer open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(harness("app"));
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await drawer.getByRole("link", { name: "Forms" }).click({ modifiers: ["ControlOrMeta"] });
    await expect(drawer).toBeVisible();
  });

  test("growing wide enough to show the Sidebar closes the drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(harness("app"));
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 844 });
    await expect(drawer).toBeHidden();
    // The page isn't left inert.
    await page.locator("beautiful-sidebar-layout > nav[data-sidebar]").getByRole("link", { name: "Forms" }).click();
    await expect(page).toHaveURL(/#forms$/);
  });

  test("the menu button opens the drawer where the browser lacks commandfor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(harness("app"));
    // Without the attribute the browser does nothing on its own, as one without invoker commands.
    await page.getByRole("button", { name: "Open navigation" }).evaluate((el) => el.removeAttribute("commandfor"));
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  });

  test("passes other attributes to the layout, and builds a Sidebar given as JSX twice", async ({ page }) => {
    // ?example= shows only the docs examples, so this block of the harness's own is found on the whole harness.
    await page.goto("/tests/harness/sidebar-layout.html");
    const layout = page.locator('[data-example="attributes"] beautiful-sidebar-layout');
    await expect(layout).toHaveClass("custom");
    await expect(layout).toHaveAttribute("data-extra", "yes");
    await expect(layout.locator(":scope > nav[data-sidebar]")).toHaveCount(1);
    await expect(layout.locator(":scope > dialog[data-drawer='start'] > nav[data-sidebar]")).toHaveCount(1);
    // No Navbar: the header holds the menu button alone.
    await expect(layout.locator(":scope > header > *")).toHaveCount(1);
    // With no id, the content's id is made unique, and the skip link points at it.
    const id = await layout.locator("main").getAttribute("id");
    expect(id).toBeTruthy();
    await expect(layout.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", `#${id}`);
  });
});
