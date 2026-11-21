import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// A Navbar is a navigation landmark of plain links and buttons (APG landmark regions). There is no
// APG pattern for the row itself: Tab walks it, Enter follows a link, Space and Enter press a
// button, and there are no arrow keys. A Dropdown in it keeps the menu button pattern's keys.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** Where the current-page bar is, against the nav's own box, and whether it is drawn. */
function bar(nav: Locator) {
  return nav.evaluate((n) => {
    const style = getComputedStyle(n, "::after");
    const box = n.getBoundingClientRect();
    return {
      drawn: style.content !== "none",
      left: box.left + Number.parseFloat(style.left),
      right: box.right - Number.parseFloat(style.right),
      height: style.height,
    };
  });
}

/** The alpha of an element's background tint, read once its transitions have finished. */
async function tint(locator: Locator) {
  await settle(locator);
  const color = await locator.evaluate((el) => getComputedStyle(el).backgroundColor);
  const parts = color.match(/[\d.]+/g)!.map(Number);
  return color.includes("/") || color.startsWith("rgba") ? parts.at(-1)! : 1;
}

async function box(locator: Locator) {
  const b = (await locator.boundingBox())!;
  return { left: b.x, right: b.x + b.width };
}

test.describe("Navbar keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/navbar"));

  test("is a navigation landmark named by its label, marking the current page", async ({ page }) => {
    const nav = section(page, "An app's top bar").getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    // The divider is a separator, and an icon-only item is named by its label.
    await expect(nav.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    await expect(nav.getByRole("link", { name: "Search" })).toBeVisible();
  });

  test("Tab walks the items in order, and the arrow keys don't", async ({ page }) => {
    const nav = section(page, "An app's top bar").getByRole("navigation");
    const order = [
      nav.getByRole("button", { name: "Spring Studio" }),
      nav.getByRole("link", { name: "Home" }),
      nav.getByRole("link", { name: "Sites" }),
      nav.getByRole("link", { name: "Forms" }),
      nav.getByRole("link", { name: "Billing" }),
      nav.getByRole("link", { name: "Search" }),
      nav.getByRole("link", { name: "Inbox" }),
      nav.getByRole("button", { name: "Account" }),
    ];
    await order[0]!.focus();
    for (const item of order.slice(1)) {
      await page.keyboard.press("Tab");
      await expect(item).toBeFocused();
    }
    await page.keyboard.press("Shift+Tab");
    await expect(order[6]!).toBeFocused();
    await order[2]!.focus();
    await page.keyboard.press("ArrowRight");
    await expect(order[2]!).toBeFocused();
  });

  test("a Dropdown in the row keeps its menu keys", async ({ page }) => {
    const nav = section(page, "An app's top bar").getByRole("navigation");
    const team = nav.getByRole("button", { name: "Spring Studio" });
    await team.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Team settings" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(team).toBeFocused();
    await expect(page.locator("#app-team")).not.toBeVisible();
  });

  test("Tab scrolls a row that doesn't fit to the item it reaches", async ({ page }) => {
    const nav = section(page, "Too wide to fit").getByRole("navigation");
    expect(await nav.evaluate((n) => n.scrollLeft)).toBe(0);
    await nav.getByRole("link", { name: "Email" }).focus();
    for (let i = 0; i < 2; i++) await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "API keys" })).toBeFocused();
    expect(await nav.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
    // It lands clear of the 32px fade, so neither it nor its focus ring is faded.
    await nav.getByRole("link", { name: "General" }).focus();
    expect(await nav.evaluate((n) => n.scrollLeft)).toBe(0);
    await nav.getByRole("link", { name: "Billing" }).focus();
    const row = await box(nav);
    const billing = await box(nav.getByRole("link", { name: "Billing" }));
    expect(billing.right).toBeLessThanOrEqual(row.right - 32 + 1);
  });

  test("a menu the nav opens keeps Dropdown's own icons", async ({ page }) => {
    const nav = section(page, "An app's top bar").getByRole("navigation");
    // A danger item with an icon, as a Dropdown in a Navbar might hold: its icon stays the item's red.
    const colors = await nav.evaluate((n) => {
      const menu = n.querySelector<HTMLElement>("#app-account")!;
      const item = document.createElement("button");
      item.type = "button";
      item.setAttribute("role", "menuitem");
      item.dataset.color = "danger";
      item.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12" /></svg>Delete';
      menu.append(item);
      menu.showPopover();
      const result = [getComputedStyle(item).color, getComputedStyle(item.querySelector("svg")!).color];
      menu.hidePopover();
      item.remove();
      return result;
    });
    expect(colors[1]).toBe(colors[0]);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Navbar keys on the component", () => {
  test.beforeEach(({ page }) => page.goto("/tests/harness/navbar.html"));

  test("Enter follows a link, and Space doesn't", async ({ page }) => {
    // Sign in, since the examples' page links make themselves current in place of following.
    const signIn = page.locator('[data-example="site"]').getByRole("link", { name: "Sign in" });
    await signIn.focus();
    await page.keyboard.press("Space");
    expect(await page.evaluate(() => location.hash)).toBe("");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#sign-in");
  });

  test("Space and Enter press a button item, and a disabled one is skipped", async ({ page }) => {
    const action = page.locator("#action");
    await action.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
    await expect(action).toHaveAttribute("data-clicks", "2");
    await page.keyboard.press("Tab");
    await expect(page.locator("#refd")).toBeFocused();
  });
});

test.describe("Navbar look", () => {
  test("items are quiet: the text color, weight 500, no underline, no fill", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const nav = section(page, "An app's top bar").getByRole("navigation");
    for (const item of [nav.getByRole("link", { name: "Sites" }), nav.getByRole("button", { name: "Spring Studio" })]) {
      await expect(item).toHaveCSS("color", "rgb(24, 24, 27)");
      await expect(item).toHaveCSS("font-weight", "500");
      await expect(item).toHaveCSS("text-decoration-line", "none");
      await expect(item).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(item).toHaveCSS("border-radius", "8px");
      await expect(item).toHaveCSS("min-height", "36px");
    }
    // An icon-only item is square.
    const search = await nav.getByRole("link", { name: "Search" }).boundingBox();
    expect(search!.width).toBe(search!.height);
  });

  test("a section's items sit 8px apart, and the spacer pushes what follows to the end", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const nav = section(page, "A site's header").getByRole("navigation");
    const features = await box(nav.getByRole("link", { name: "Features" }));
    const pricing = await box(nav.getByRole("link", { name: "Pricing" }));
    expect(pricing.left - features.right).toBeCloseTo(8, 0);
    // The last item ends at the nav's content edge: its 4px padding in from the nav's box.
    const row = await box(nav);
    const start = await box(nav.getByRole("link", { name: "Start free" }));
    expect(row.right - start.right).toBeCloseTo(4, 0);
    // A hidden section stays hidden.
    const hidden = await nav.locator("beautiful-navbar-section").last().evaluate((el) => {
      (el as HTMLElement).hidden = true;
      return getComputedStyle(el).display;
    });
    expect(hidden).toBe("none");
  });

  test("a Button that names its variant keeps Button's look", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const start = section(page, "A site's header").getByRole("link", { name: "Start free" });
    await expect(start).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(start).toHaveCSS("font-weight", "600");
  });

  test("hover and press tint the item, and an open menu keeps its button tinted", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const nav = section(page, "An app's top bar").getByRole("navigation");
    const sites = nav.getByRole("link", { name: "Sites" });
    const account = nav.getByRole("button", { name: "Account" });
    expect(await tint(sites)).toBe(0);
    // Each read waits out the item's transition, and the poll retries until the pointer state has applied.
    await sites.hover();
    await expect.poll(() => tint(sites)).toBeGreaterThan(0);
    const hovered = await tint(sites);
    await page.mouse.down();
    await expect.poll(() => tint(sites)).toBeGreaterThan(hovered);
    await page.mouse.up();
    await account.click();
    await page.mouse.move(0, 0);
    // Off the button, its open menu alone tints it, deeper than a hover.
    await expect(page.locator("#app-account")).toBeVisible();
    await expect.poll(() => tint(account)).toBeGreaterThan(hovered);
  });

  test("the bar sits under the current item's words, on the nav's bottom edge", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const nav = section(page, "An app's top bar").getByRole("navigation");
    const home = await box(nav.getByRole("link", { name: "Home" }));
    const drawn = await bar(nav);
    expect(drawn.drawn).toBe(true);
    expect(drawn.height).toBe("2px");
    // Inset by the item's 8px padding, to the width of its words.
    expect(drawn.left).toBeCloseTo(home.left + 8, 0);
    expect(drawn.right).toBeCloseTo(home.right - 8, 0);
    // Its rendered box ends on the nav's bottom edge, below the item.
    const edge = await nav.evaluate((n) => {
      const after = getComputedStyle(n, "::after");
      const box = n.getBoundingClientRect();
      return { barBottom: box.top + Number.parseFloat(after.top) + Number.parseFloat(after.height), navBottom: box.bottom };
    });
    expect(edge.barBottom).toBeCloseTo(edge.navBottom, 0);
    const item = (await nav.getByRole("link", { name: "Home" }).boundingBox())!;
    expect(edge.barBottom - 2).toBeGreaterThanOrEqual(item.y + item.height);
  });

  test("the bar glides to the new current item", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const nav = section(page, "An app's top bar").getByRole("navigation");
    const home = await box(nav.getByRole("link", { name: "Home" }));
    const billing = await box(nav.getByRole("link", { name: "Billing" }));
    // Move the current page and hold the bar's glide halfway in the same task, so a busy machine
    // can't run the glide out before it is read.
    const held = await nav.getByRole("link", { name: "Billing" }).evaluate((a) => {
      a.parentElement!.querySelector('[aria-current="page"]')!.removeAttribute("aria-current");
      a.setAttribute("aria-current", "page");
      const glides = a
        .closest("nav")!
        .getAnimations({ subtree: true })
        .filter((t) => t instanceof CSSTransition && (t.effect as KeyframeEffect).pseudoElement === "::after");
      for (const t of glides) {
        t.pause();
        t.currentTime = Number(t.effect!.getComputedTiming().duration) / 2;
      }
      return glides.map((t) => (t as CSSTransition).transitionProperty).sort();
    });
    expect(held).toEqual(["left", "right"]);
    const mid = await bar(nav);
    expect(mid.left).toBeGreaterThan(home.left + 8);
    expect(mid.left).toBeLessThan(billing.left + 8);
    await nav.evaluate((n) => {
      for (const t of n.getAnimations({ subtree: true })) {
        if (t instanceof CSSTransition && (t.effect as KeyframeEffect).pseudoElement === "::after") t.play();
      }
    });
    await expect.poll(async () => Math.round((await bar(nav)).left)).toBe(Math.round(billing.left + 8));
  });

  test("under reduced motion the bar moves at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/navbar", "classic", "light");
    const nav = section(page, "An app's top bar").getByRole("navigation");
    const billing = await box(nav.getByRole("link", { name: "Billing" }));
    await nav.getByRole("link", { name: "Billing" }).evaluate((a) => {
      a.parentElement!.querySelector('[aria-current="page"]')!.removeAttribute("aria-current");
      a.setAttribute("aria-current", "page");
    });
    expect(Math.round((await bar(nav)).left)).toBe(Math.round(billing.left + 8));
  });

  test("with no current page there is no bar", async ({ page }) => {
    await open(page, "/navbar");
    const nav = section(page, "An app's top bar").getByRole("navigation");
    await nav.locator('[aria-current="page"]').evaluate((a) => a.removeAttribute("aria-current"));
    expect((await bar(nav)).drawn).toBe(false);
  });

  test("each Navbar's bar stays on its own current item", async ({ page }) => {
    await open(page, "/navbar");
    const icons = section(page, "With icons").getByRole("navigation");
    const pages = await box(icons.getByRole("link", { name: "Pages" }));
    expect((await bar(icons)).left).toBeCloseTo(pages.left + 8, 0);
  });

  test("the divider stands upright", async ({ page }) => {
    await open(page, "/navbar", "classic", "light");
    const divider = section(page, "An app's top bar").getByRole("separator");
    const size = (await divider.boundingBox())!;
    expect(size.width).toBe(1);
    expect(size.height).toBe(24);
  });

  test("a row that doesn't fit fades at the edge with more past it, and one that fits doesn't", async ({ page }) => {
    await open(page, "/navbar");
    const fades = (nav: Locator) =>
      nav.evaluate((n) => {
        const style = getComputedStyle(n);
        return [style.getPropertyValue("--navbar-fade-start"), style.getPropertyValue("--navbar-fade-end")];
      });
    const narrow = section(page, "Too wide to fit").getByRole("navigation");
    expect(await fades(narrow)).toEqual(["0px", "32px"]);
    await narrow.evaluate((n) => n.scrollTo({ left: n.scrollWidth }));
    await expect.poll(() => fades(narrow)).toEqual(["32px", "0px"]);
    expect(await fades(section(page, "An app's top bar").getByRole("navigation"))).toEqual(["0px", "0px"]);
  });
});

test.describe("Navbar axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/navbar", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`docs examples with a menu open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/navbar", theme, mode);
        await section(page, "An app's top bar").getByRole("button", { name: "Spring Studio" }).click();
        await expect(page.locator("#app-team")).toBeVisible();
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/navbar.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        // On glass, axe can't see through a primary Button's rim. tests/glass.spec.ts measures glass from pixels.
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Navbar component", () => {
  test("moves aria-current with its router, and scrolls the new current item into view", async ({ page }) => {
    await page.goto("/tests/harness/navbar.html");
    const nav = page.getByRole("navigation", { name: "Routed" });
    await expect(nav.getByRole("link", { name: "General" })).toHaveAttribute("aria-current", "page");
    expect(await nav.evaluate((n) => n.scrollLeft)).toBe(0);
    await page.locator("#go-api-keys").click();
    const keys = nav.getByRole("link", { name: "API keys" });
    await expect(keys).toHaveAttribute("aria-current", "page");
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await expect
      .poll(async () => {
        const row = await box(nav);
        const item = await box(keys);
        return item.left >= row.left && item.right <= row.right;
      })
      .toBe(true);
    // A click on an item moves it too.
    await nav.getByRole("link", { name: "Email" }).click();
    await expect(nav.getByRole("link", { name: "Email" })).toHaveAttribute("aria-current", "page");
  });

  test("scrolls only its row, never the page", async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 300 });
    await page.goto("/tests/harness/navbar.html");
    const nav = page.getByRole("navigation", { name: "Routed" });
    await nav.waitFor();
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator("#go-api-keys").evaluate((button) => (button as HTMLButtonElement).click());
    await expect.poll(() => nav.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test("passes other attributes and handlers to its elements", async ({ page }) => {
    await page.goto("/tests/harness/navbar.html");
    const nav = page.locator("#passed");
    await expect(nav).toHaveAttribute("data-navbar", "");
    await expect(nav).toHaveClass("extra");
    await expect(page.locator("#section")).toBeVisible();
    await expect(page.locator("#action")).toHaveAttribute("type", "button");
    await page.locator("#action").click();
    await expect(page.locator("#action")).toHaveAttribute("data-clicks", "1");
    await expect(page.locator("#off")).toBeDisabled();
    await expect(page.locator("#off")).toHaveCSS("opacity", "0.5");
    await expect(page.locator("#refd")).toHaveAttribute("data-refd", "true");
    await expect(page.locator("#action")).not.toHaveAttribute("aria-current");
  });
});
