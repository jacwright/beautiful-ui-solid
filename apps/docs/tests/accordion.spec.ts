import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG Accordion pattern: each header is a button reached with Tab, Enter and Space open and
// close its panel, and Up, Down, Home and End move between the headers. The headers are native
// summaries in <details> that share a name, so opening one closes the one that was open.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

function summary(page: Page, words: string) {
  return page.locator("summary", { hasText: words });
}

test.describe("Accordion keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/accordion"));

  test("Enter opens an item and closes the one that was open, and focus stays on the summary", async ({ page }) => {
    const general = summary(page, "General").locator("..");
    const build = summary(page, "Build");
    await expect(general).toHaveAttribute("open");
    await build.focus();
    await page.keyboard.press("Enter");
    await expect(build.locator("..")).toHaveAttribute("open");
    await expect(general).not.toHaveAttribute("open");
    await expect(build).toBeFocused();
    // Closing the open one leaves them all closed.
    await page.keyboard.press("Space");
    await expect(page.locator("details[name=site-settings][open]")).toHaveCount(0);
  });

  test("Tab moves through the summaries and into the open panel only", async ({ page }) => {
    await summary(page, "General").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#site-title")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(summary(page, "Build")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(summary(page, "Search engines")).toBeFocused();
  });

  test("several can be open together without a shared name", async ({ page }) => {
    const together = section(page, "Several open together");
    await together.locator("summary", { hasText: "Contact form" }).click();
    await expect(together.locator("beautiful-accordion details[open]")).toHaveCount(3);
  });

  test("a link to something inside a closed item opens it and closes the open one", async ({ page }) => {
    await page.evaluate(() => {
      location.hash = "#build-script";
    });
    await expect(summary(page, "Build").locator("..")).toHaveAttribute("open");
    await expect(summary(page, "General").locator("..")).not.toHaveAttribute("open");
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await summary(page, "Can an agent change my site while I'm away?").click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Accordion look", () => {
  test("each summary takes the row with its chevron at the end, and its words line up with the panel's", async ({ page }) => {
    await open(page, "/accordion");
    const lines = await summary(page, "General").evaluate((el) => {
      const words = document.createRange();
      words.selectNodeContents(el);
      const group = el.closest("beautiful-accordion")!.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      const panel = el.nextElementSibling!.getBoundingClientRect();
      return { words: words.getBoundingClientRect().left, panel: panel.left, width: box.width, group: group.width, height: box.height };
    });
    expect(Math.abs(lines.words - lines.panel)).toBeLessThan(1);
    expect(lines.width).toBeGreaterThanOrEqual(lines.group);
    expect(lines.height).toBe(40);
  });

  test("a hairline between items, none above the first", async ({ page }) => {
    await open(page, "/accordion", "classic", "light");
    const items = section(page, "Questions").locator("beautiful-accordion > details");
    await expect(items.first()).toHaveCSS("border-top-width", "0px");
    await expect(items.nth(1)).toHaveCSS("border-top-width", "1px");
    await expect(items.nth(1)).not.toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  });

  test("the summary's words are the size of the text around it", async ({ page }) => {
    await open(page, "/accordion");
    const sizes = await summary(page, "Can I use my own domain?").evaluate((el) => ({
      summary: getComputedStyle(el).fontSize,
      group: getComputedStyle(el.closest("beautiful-accordion")!).fontSize,
    }));
    expect(sizes.summary).toBe(sizes.group);
  });
});

test.describe("Accordion axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/accordion", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/accordion.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // Open one item in each named group, and every item in the others.
        await page.locator("beautiful-accordion > details").evaluateAll((all) => {
          const seen = new Set<string>();
          for (const el of all as HTMLDetailsElement[]) {
            if (el.name && seen.has(el.name)) continue;
            seen.add(el.name);
            el.open = true;
          }
        });
        await page.waitForTimeout(400);
        // The glass example's opener sits on the demo stage's bright picture, which axe can't judge.
        // glass.spec.ts measures it from pixels.
        const results = await new AxeBuilder({ page }).exclude("beautiful-demo-stage").withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Accordion component", () => {
  test("Down, Up, Home and End move between this group's summaries, and wrap", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    const group = page.locator("#first-group");
    const item = (words: string) => group.locator(":scope > details > summary", { hasText: words });
    const [one, two, own] = [item("One"), item("Two"), item("Own name")];
    await one.focus();
    await page.keyboard.press("ArrowDown");
    await expect(two).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(own).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(one).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(own).toBeFocused();
    await page.keyboard.press("Home");
    await expect(one).toBeFocused();
    await page.keyboard.press("End");
    await expect(own).toBeFocused();
    // A key with a modifier is the browser's or the page's.
    await page.keyboard.press("Shift+ArrowUp");
    await expect(own).toBeFocused();
    // The caller's own onKeyDown still hears every key.
    await expect(group).toHaveAttribute("data-keys", "ArrowDown,ArrowDown,ArrowDown,ArrowUp,Home,End,Shift,ArrowUp");
  });

  test("the arrow keys stay inside a nested accordion", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    await page.locator("#first-group summary", { hasText: "One" }).first().click();
    const inner = page.locator("#nested summary");
    await inner.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(inner.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(inner.first()).toBeFocused();
  });

  test("a plain Disclosure in an item's panel stays out of the group", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    await expect(page.locator("#inner-plain")).not.toHaveAttribute("name");
  });

  test("a caller's onKeyDown can keep a key from the group with preventDefault", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    const summaries = page.locator("#second-group > details > summary");
    await summaries.first().focus();
    await page.keyboard.press("End");
    await expect(summaries.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(summaries.nth(1)).toBeFocused();
  });

  test("each group gets its own name, and an item's own name wins", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    const names = await page.evaluate(() => {
      const nameOf = (selector: string) => [...document.querySelectorAll<HTMLDetailsElement>(selector)].map((el) => el.getAttribute("name"));
      return {
        first: nameOf("#first-group > details"),
        nested: nameOf("#nested > details"),
        second: nameOf("#second-group > details"),
        together: nameOf('[data-example="together"] details'),
      };
    });
    const [one, two, own] = names.first;
    expect(one).toBeTruthy();
    expect(two).toBe(one);
    expect(own).toBe("own");
    expect(names.nested[0]).toBeTruthy();
    expect(names.nested[0]).not.toBe(one);
    expect(names.nested[1]).toBe(names.nested[0]);
    expect(names.second[0]).toBeTruthy();
    expect(names.second[0]).not.toBe(one);
    expect(names.together).toEqual([null, null, null]);
  });

  test("opening one item in a group closes the other", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    const group = page.locator("#first-group");
    await group.locator("summary", { hasText: "One" }).first().click();
    await group.locator(":scope > details > summary", { hasText: "Two" }).click();
    await expect(group.locator(":scope > details").first()).not.toHaveAttribute("open");
    await expect(group.locator(":scope > details").nth(1)).toHaveAttribute("open");
  });

  test("passes other attributes to the <beautiful-accordion>", async ({ page }) => {
    await page.goto("/tests/harness/accordion.html");
    const group = page.locator("#first-group");
    await expect(group).toHaveAttribute("class", "spaced");
    await expect(group).toHaveAttribute("aria-label", "First");
  });
});
