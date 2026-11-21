import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// A list has no APG pattern: it is document structure, not a widget. Tab stops only on the links
// and buttons in it, Enter and Space do what they do on any link or button, and screen readers
// read it as a list with its count.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("List keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/list"));

  test("Tab passes over a list with no targets", async ({ page }) => {
    await section(page, "Bullets and numbers").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "Checks").locator("summary").first()).toBeFocused();
    await section(page, "Checks").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "Rows").locator("summary").first()).toBeFocused();
  });

  test("Tab stops on each target row in order, and Enter follows it", async ({ page }) => {
    const links = section(page, "Rows that are links");
    await section(page, "Rows").locator("summary").last().focus();
    for (const name of ["Domains", "Forms", "Team"]) {
      await page.keyboard.press("Tab");
      await expect(links.getByRole("link", { name: new RegExp(`^${name}`) })).toBeFocused();
    }
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#team$/);
  });

  test("Tab stops on each Button at a row's end", async ({ page }) => {
    const people = section(page, "Rows with a Button at the end");
    await section(page, "Rows that are links").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(people.getByRole("button", { name: "Remove Sam Okafor" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(people.getByRole("button", { name: "Remove Jonas Weber" })).toBeFocused();
  });

  test("is a list with its items, in every look", async ({ page }) => {
    const bullets = section(page, "Bullets and numbers").locator("beautiful-example-preview");
    await expect(bullets.getByRole("list")).toHaveCount(3);
    await expect(bullets.getByRole("list").first().getByRole("listitem")).toHaveCount(5);
    for (const title of ["Checks", "Rows", "Rows that are links", "Rows with a Button at the end"]) {
      await expect(section(page, title).locator("beautiful-example-preview").getByRole("list")).toHaveCount(1);
    }
    await expect(section(page, "Rows").locator("beautiful-example-preview").getByRole("listitem")).toHaveCount(3);
  });

  test("a target row is one link, named by its title, description and end", async ({ page }) => {
    const link = section(page, "Rows that are links").getByRole("link").first();
    await expect(link).toHaveAccessibleName("Domains Connect a domain you own, or buy one.");
  });

  test("rows line their words up whether a row is a target or not", async ({ page }) => {
    const plain = await section(page, "Rows").locator("li > beautiful-list-body").first().boundingBox();
    const plainList = await section(page, "Rows").locator("ul").boundingBox();
    const target = await section(page, "Rows that are links").locator("a > beautiful-list-body").first().boundingBox();
    const targetList = await section(page, "Rows that are links").locator("ul").boundingBox();
    expect(target!.x - targetList!.x).toBeCloseTo(plain!.x - plainList!.x, 0);
  });

  test("a hovered target row takes the tint, a plain row doesn't", async ({ page }) => {
    const link = section(page, "Rows that are links").getByRole("link").nth(1);
    await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await link.hover();
    await expect(link).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const row = section(page, "Rows").locator("li").nth(1);
    await row.hover();
    await expect(row).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("List row lines", () => {
  const row = (page: Page) => section(page, "Rows").locator("beautiful-example-preview li").nth(1);

  test("a row's line is a Divider's hairline, with no lit edge in classic", async ({ page }) => {
    await open(page, "/list", "classic", "light");
    await expect(row(page)).toHaveCSS("border-top-width", "1px");
    // 10% of the text color, as a Divider's.
    await expect(row(page)).toHaveCSS("border-top-color", /0\.1\)$/);
    await expect(row(page)).toHaveCSS("box-shadow", /^rgba\(0, 0, 0, 0\) /);
  });

  test("in glass's dark mode the line is a groove: a shadow with a lit edge under it", async ({ page }) => {
    await open(page, "/list", "glass", "dark");
    await expect(row(page)).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0.5)");
    await expect(row(page)).toHaveCSS("box-shadow", /^rgba\(255, 255, 255, 0\.08\) 0px 1px 0px 0px inset$/);
  });
});

test.describe("List axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/list", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/list.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The primary Button is only there to check its color, and axe can't judge glass's translucent fill. The
        // dialog example's stage is a picture, not the plain canvas.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("#invites")
          .exclude("beautiful-demo-stage")
          .analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("List component", () => {
  test.describe("props", () => {
    test.beforeEach(({ page }) => page.goto("/tests/harness/list.html"));

    test("ordered rows are an <ol> that still says role=list, and attributes pass through", async ({ page }) => {
      const list = page.locator("#pages");
      await expect(list).toHaveJSProperty("tagName", "OL");
      await expect(list).toHaveAttribute("role", "list");
      await expect(list).toHaveAttribute("aria-label", "Pages");
      await expect(page.locator("#plain-bullets")).not.toHaveAttribute("role");
      await expect(page.locator("#plain-bullets")).not.toHaveAttribute("data-variant");
    });

    test("an item with only children is a bare <li> with its attributes", async ({ page }) => {
      await expect(page.locator("li#plain-row")).toHaveText("Home");
      await expect(page.locator("li#plain-row > *")).toHaveCount(0);
    });

    test("onClick makes the row a button, with the attributes on it", async ({ page }) => {
      const button = page.locator("#pages > li > button#opens");
      await expect(button).toHaveAttribute("type", "button");
      await button.focus();
      await page.keyboard.press("Space");
      await expect(page.locator("body")).toHaveAttribute("data-opened", "pricing");
    });

    test("a disabled button row is skipped by Tab and takes no tint", async ({ page }) => {
      const disabled = page.getByRole("button", { name: /^Blog/ });
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute("commandfor", "nowhere");
      await page.locator("#opens").focus();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: /^Elsewhere/ })).toBeFocused();
    });

    test("a part that came out false or null is left out", async ({ page }) => {
      await expect(page.locator("li#falsy-parts")).toHaveText("Two");
      await expect(page.locator("li#falsy-parts > *")).toHaveCount(0);
    });

    test("a primary Button at a row's end keeps its own text color", async ({ page }) => {
      await expect(page.locator("#invites").getByRole("button", { name: "Invite" })).toHaveCSS("color", "rgb(255, 255, 255)");
    });

    test("a row that opens a new tab keeps Link's arrow, before the end", async ({ page }) => {
      const link = page.getByRole("link", { name: /^Elsewhere/ });
      await expect(link).toHaveAccessibleName(/opens in a new tab/);
      expect(await link.evaluate((a) => getComputedStyle(a, "::after").order)).toBe("1");
    });

    test("href makes the row a link, with the link's attributes on it", async ({ page }) => {
      const link = page.getByRole("link", { name: /^Elsewhere/ });
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener");
      await expect(page.locator("#pages > li").last()).not.toHaveAttribute("target");
    });
  });
});
