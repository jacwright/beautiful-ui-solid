import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// APG has no sidebar pattern: it is a navigation landmark (APG Landmarks) of native links, with
// aria-current="page" on the place you're in. Tab walks every item; the arrows aren't taken.
// The menus in the header and footer are Dropdowns, whose keys tests/dropdown.spec.ts checks.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) }).locator("beautiful-example-preview");
}

const transparent = "rgba(0, 0, 0, 0)";

test.describe("Sidebar keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/sidebar"));

  test("is a named navigation landmark, with its sections named by their headings", async ({ page }) => {
    const app = section(page, "An app's sidebar");
    const nav = app.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("group", { name: "Recent sites" })).toBeVisible();
    await expect(section(page, "Sections").getByRole("navigation", { name: "Site settings" })).toBeVisible();
  });

  test("the current item is marked as the current page, and only it", async ({ page }) => {
    const nav = section(page, "An app's sidebar").getByRole("navigation");
    await expect(nav.locator("[aria-current]")).toHaveCount(1);
    await expect(nav.getByRole("link", { name: "Sites" })).toHaveAttribute("aria-current", "page");
  });

  test("Tab walks every item in order, header, body, then footer, and Shift+Tab walks back", async ({ page }) => {
    const nav = section(page, "An app's sidebar").getByRole("navigation");
    const names = ["Acme", "Search", "Home", "Sites", "Forms", "Domains", "Settings", "Spring launch", "Corner bakery menu", "Portfolio for the 2026 gallery season", "Support", "Sam Lee"];
    await nav.getByRole("button", { name: "Acme" }).focus();
    for (const name of names.slice(1)) {
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAccessibleName(name);
    }
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(":focus")).toHaveAccessibleName("Support");
  });

  test("the arrow keys don't move focus between items", async ({ page }) => {
    const home = section(page, "An app's sidebar").getByRole("link", { name: "Home" });
    await home.focus();
    await page.keyboard.press("ArrowDown");
    await expect(home).toBeFocused();
  });

  test("Enter follows an item's link", async ({ page }) => {
    await section(page, "An app's sidebar").getByRole("link", { name: "Forms" }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#forms");
  });

  test("the header's Dropdown opens from its item with Enter, and Escape puts focus back on it", async ({ page }) => {
    const app = section(page, "An app's sidebar");
    const button = app.getByRole("button", { name: "Acme" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#team-menu").getByRole("menuitem", { name: "Acme" })).toBeFocused();
    // The menu's items keep the Dropdown look, not the sidebar's.
    await expect(page.locator("#team-menu hr")).toHaveCSS("margin-top", "4px");
    // Its button stays lit while the menu is open.
    await page.mouse.move(0, 0);
    expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(transparent);
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
  });

  test("the header and footer stay put while the body scrolls", async ({ page }) => {
    const nav = section(page, "An app's sidebar").getByRole("navigation");
    const body = nav.locator(":scope > beautiful-sidebar-body");
    const before = await nav.locator(":scope > footer").boundingBox();
    const scrolled = await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      return { scrolls: el.scrollHeight > el.clientHeight, top: el.scrollTop };
    });
    expect(scrolled.scrolls).toBe(true);
    expect(scrolled.top).toBeGreaterThan(0);
    expect(await nav.locator(":scope > footer").boundingBox()).toEqual(before);
  });
});

test.describe("Sidebar look", () => {
  test("an item is text at rest, tinted under the pointer, and the current one is a raised pane", async ({ page }) => {
    await open(page, "/sidebar", "classic", "light");
    const nav = section(page, "An app's sidebar").getByRole("navigation");
    const forms = nav.getByRole("link", { name: "Forms" });
    await expect(forms).toHaveCSS("background-color", transparent);
    await expect(forms).toHaveCSS("text-decoration-line", "none");
    await expect(forms).toHaveCSS("color", "rgb(24, 24, 27)");
    await forms.hover();
    await expect(forms).not.toHaveCSS("background-color", transparent);

    const sites = nav.getByRole("link", { name: "Sites" });
    // The control fill and edge, as on a secondary Button, and the icon in the accent.
    await expect(sites).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(sites).toHaveCSS("border-top-color", "rgb(212, 212, 216)");
    await expect(sites.locator("svg")).toHaveCSS("color", "rgb(37, 99, 235)");
    // Hovering the current item changes nothing.
    await sites.hover();
    await expect(sites).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });

  test("its lines are Divider's hairlines, a groove with a lit edge in glass's dark mode", async ({ page }) => {
    const lines = () =>
      section(page, "An app's sidebar").evaluate((preview) => {
        const nav = preview.querySelector("nav[data-sidebar]")!;
        const hr = document.querySelector("beautiful-example-preview nav[data-sidebar] > * > hr, beautiful-example-preview beautiful-sidebar-section > hr")!;
        const header = getComputedStyle(nav.querySelector(":scope > header")!);
        const footer = getComputedStyle(nav.querySelector(":scope > footer")!);
        const rule = getComputedStyle(hr);
        return [
          [header.borderBottomWidth, header.borderBottomColor, header.boxShadow],
          [footer.borderTopWidth, footer.borderTopColor, footer.boxShadow],
          [rule.borderTopWidth, rule.borderTopColor, rule.boxShadow],
        ];
      });
    await open(page, "/sidebar", "glass", "dark");
    const [header, footer, rule] = await lines();
    expect(header).toEqual(["1px", "rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255, 0.08) 0px 1px 0px 0px"]);
    expect(footer).toEqual(["1px", "rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255, 0.08) 0px 1px 0px 0px inset"]);
    expect(rule).toEqual(["1px", "rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255, 0.08) 0px 1px 0px 0px"]);
  });

  test("on glass the current item is frosted", async ({ page }) => {
    await open(page, "/sidebar", "glass", "dark");
    const sites = section(page, "An app's sidebar").getByRole("link", { name: "Sites" });
    expect(await sites.evaluate((el) => getComputedStyle(el).backdropFilter)).toContain("blur");
    expect(await sites.evaluate((el) => getComputedStyle(el, "::before").content)).not.toBe("none");
  });

  test("a row is at least the control height, and its corners round its focus ring", async ({ page }) => {
    await open(page, "/sidebar");
    const home = section(page, "An app's sidebar").getByRole("link", { name: "Home" });
    expect((await home.boundingBox())!.height).toBeGreaterThanOrEqual(36);
    await expect(home).toHaveCSS("border-radius", "8px");
  });

  test("a long label wraps instead of hiding its end", async ({ page }) => {
    await open(page, "/sidebar");
    const long = section(page, "An app's sidebar").getByRole("link", { name: "Portfolio for the 2026 gallery season" });
    await expect(long).toHaveCSS("text-overflow", "clip");
    expect((await long.boundingBox())!.height).toBeGreaterThan(36);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page, "/sidebar");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Sidebar axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/sidebar", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/sidebar.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).include('[data-example="sections"]').withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Sidebar component", () => {
  test("starts with the body scrolled to the current item, and the page where it was", async ({ page }) => {
    await page.goto("/tests/harness/sidebar.html");
    const body = page.locator("#long-body");
    await body.waitFor();
    const current = body.getByRole("link", { name: "Site 24" });
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    // The current item is inside the body's box, so it shows without scrolling.
    const inside = await current.evaluate((item) => {
      const room = item.parentElement!.getBoundingClientRect();
      const at = item.getBoundingClientRect();
      return at.top >= room.top && at.bottom <= room.bottom;
    });
    expect(inside).toBe(true);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test("a body that starts hidden scrolls to its current item when it first shows", async ({ page }) => {
    await page.goto("/tests/harness/sidebar.html");
    const body = page.locator("#sheet-body");
    await body.waitFor({ state: "attached" });
    expect(await body.evaluate((el) => el.scrollTop)).toBe(0);
    await page.locator('[data-example="sheet"]').evaluate((el) => el.removeAttribute("hidden"));
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test("a body scrolls to the current item when it changes, and a caller's own aria-current passes through", async ({ page }) => {
    await page.goto("/tests/harness/sidebar.html");
    const body = page.locator("#long-body");
    await body.waitFor();
    await body.evaluate((el) => {
      el.scrollTop = 0;
      el.querySelector('[aria-current="page"]')!.removeAttribute("aria-current");
      el.querySelector<HTMLElement>("a[href='#site-29']")!.setAttribute("aria-current", "page");
    });
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator("#stepped")).toHaveAttribute("aria-current", "step");
  });

  test("a section with an empty heading names nothing", async ({ page }) => {
    await page.goto("/tests/harness/sidebar.html");
    const section = page.locator("#unnamed");
    await section.waitFor({ state: "attached" });
    await expect(section).not.toHaveAttribute("aria-labelledby");
    await expect(section.locator("header")).toHaveCount(0);
  });

  test("a Button that names its variant keeps Button's look", async ({ page }) => {
    await page.goto("/tests/harness/sidebar.html?theme=classic");
    const button = page.getByRole("button", { name: "New site" });
    await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(button).toHaveCSS("font-weight", "600");
    expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(transparent);
  });

  test("an item without href is a button that forwards its handlers, and can be disabled", async ({ page }) => {
    await page.goto("/tests/harness/sidebar.html");
    const counted = page.locator("#counted");
    await expect(counted).toHaveAttribute("type", "button");
    await counted.click();
    await expect(counted).toHaveAttribute("data-clicks", "1");
    await expect(page.locator("#disabled")).toBeDisabled();
    await expect(page.locator("#disabled")).toHaveCSS("opacity", "0.5");
  });
});
