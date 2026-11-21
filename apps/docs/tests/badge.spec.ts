import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { badgeColors } from "beautiful-ui-solid";
import { modes, open, themes } from "./settings.ts";

// No APG pattern covers a badge: it is text. It takes no focus, has no role, and reads with the words around it.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Badge keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/badge"));

  test("Tab passes over a badge: it takes no focus", async ({ page }) => {
    const badges = section(page, "Colors").locator("beautiful-badge");
    await expect(badges).toHaveCount(badgeColors.length);
    const focusable = await badges.evaluateAll((all) =>
      all.filter((badge) => {
        (badge as HTMLElement).focus();
        return document.activeElement === badge;
      }).length,
    );
    expect(focusable).toBe(0);
    // From just before the example, Tab goes past its badges to the example's code toggle.
    await section(page, "Colors").getByRole("heading").evaluate((heading) => {
      heading.tabIndex = -1;
      heading.focus();
    });
    await page.keyboard.press("Tab");
    await expect(section(page, "Colors").locator("summary").first()).toBeFocused();
  });

  test("it has no role, and reads with the text around it", async ({ page }) => {
    const heading = section(page, "In text and headings").locator("beautiful-example-preview h3");
    await expect(heading).toHaveAccessibleName("Form submissions 12 new");
    const roles = await section(page, "Colors").locator("beautiful-badge").evaluateAll((all) => all.map((b) => b.getAttribute("role")));
    expect(roles.every((role) => role === null)).toBe(true);
  });

  test("the dot is drawn, not a character in the text", async ({ page }) => {
    const live = section(page, "Status, with a dot").locator("beautiful-badge").first();
    await expect(live).toHaveText("Live");
    const dot = await live.evaluate((badge) => getComputedStyle(badge, "::before").content);
    expect(dot).toBe('""');
  });

  test("it is one line of small text tall, so it doesn't stretch a line it sits in", async ({ page }) => {
    const sizes = await section(page, "In text and headings").locator("beautiful-badge").evaluateAll((all) =>
      all.map((badge) => badge.getBoundingClientRect().height),
    );
    for (const height of sizes) expect(height).toBeCloseTo(20, 0);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Badge look", () => {
  test("every tint sets its own colors, and strong fills with the hue", async ({ page }) => {
    await open(page, "/badge", "classic", "light");
    const read = (title: string) =>
      section(page, title)
        .locator("beautiful-badge")
        .evaluateAll((all) => all.map((b) => ({ color: getComputedStyle(b).color, background: getComputedStyle(b).backgroundColor })));
    const soft = await read("Colors");
    const strong = await read("Strong");
    expect(new Set(soft.map((s) => s.color)).size).toBe(badgeColors.length);
    expect(new Set(soft.map((s) => s.background)).size).toBe(badgeColors.length);
    expect(new Set(strong.map((s) => s.background)).size).toBe(badgeColors.length);
    expect(soft.every((s, i) => s.background !== strong[i]!.background)).toBe(true);
    // The soft wash is see-through, so a tint reads on any surface.
    expect(soft[5]!.background).toMatch(/rgba\(34, 197, 94, 0\.1[12]\d*\)|color\(srgb .* \/ 0\.12\)/);
    expect(strong[4]).toEqual({ color: "rgb(66, 32, 6)", background: "rgb(250, 204, 21)" });
  });

  test("glass lights its top edge, and classic doesn't", async ({ page }) => {
    const shadow = async (theme: (typeof themes)[number]) => {
      await open(page, "/badge", theme, "light");
      return section(page, "Colors").locator("beautiful-badge").first().evaluate((b) => getComputedStyle(b).boxShadow);
    };
    const classic = await shadow("classic");
    const glass = await shadow("glass");
    expect(glass).not.toBe(classic);
    expect(glass).toContain("inset");
  });

  test("forced colors keep its shape with an outline", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, "/badge", "classic", "light");
    const outline = await section(page, "Colors").locator("beautiful-badge").first().evaluate((b) => {
      const style = getComputedStyle(b);
      return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
    });
    expect(outline.width).toBe("1px");
    expect(outline.style).toBe("solid");
    expect(outline.color).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("leaves a Link's data-color to it", async ({ page }) => {
    await open(page, "/link", "classic", "light");
    // A neutral Link takes its text's color: the tints only set properties, so they never paint it.
    const link = page.locator("beautiful-example-preview a[data-color='neutral']").first();
    const look = await link.evaluate((a) => ({ background: getComputedStyle(a).backgroundColor, text: getComputedStyle(a.parentElement!).color, color: getComputedStyle(a).color }));
    expect(look.background).toBe("rgba(0, 0, 0, 0)");
    expect(look.color).toBe(look.text);
  });
});

test.describe("Badge axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/badge", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/badge.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The dialog example's opener sits on the demo stage's bright picture, which axe can't judge.
        // glass.spec.ts measures it from pixels.
        const results = await new AxeBuilder({ page }).exclude("beautiful-demo-stage").withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Badge component", () => {
  test("passes other attributes through, and leaves the defaults out", async ({ page }) => {
    await page.goto("/tests/harness/badge.html");
    const draft = page.locator("#explicit");
    await expect(draft).toHaveAttribute("title", "Not published yet");
    await expect(draft).not.toHaveAttribute("data-color");
    await expect(draft).not.toHaveAttribute("data-variant");
    await expect(draft).not.toHaveAttribute("data-dot");
  });

  test("forwards its handlers", async ({ page }) => {
    await page.goto("/tests/harness/badge.html");
    await page.locator("#counted").click();
    await expect(page.locator("#counted")).toHaveAttribute("data-clicks", "1");
  });
});
