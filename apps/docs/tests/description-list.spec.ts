import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Description list has no APG pattern: a <dl> is read as a list of terms and details, and only
// the links and buttons inside a detail take focus.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** Each element's box, rounded to whole pixels. */
async function boxes(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    }),
  );
}

test.describe("Description list keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/description-list"));

  test("Tab passes over the list, stopping only at a link inside a detail", async ({ page }) => {
    const example = section(page, "Site details");
    // Back from the Code toggle after the list: the one stop in the list is its link, then out of it.
    await example.locator("summary").first().focus();
    await page.keyboard.press("Shift+Tab");
    await expect(example.getByRole("link", { name: "spring-launch.example.com" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    const inList = await example.locator("beautiful-example-preview dl").evaluate((dl) => dl.contains(document.activeElement));
    expect(inList).toBe(false);
  });

  test("terms and details have the term and definition roles, in reading order", async ({ page }) => {
    const list = section(page, "Site details").locator("beautiful-example-preview dl");
    await expect(list.getByRole("term")).toHaveText(["Site", "Address", "Plan", "Last published"]);
    await expect(list.getByRole("definition")).toHaveCount(4);
    await expect(list.getByRole("definition").first()).toHaveText("Spring launch");
  });

  test("a list in a dialog keeps the roles", async ({ page }) => {
    await section(page, "In a dialog").getByRole("button", { name: "Deploy details" }).click();
    const list = page.locator("#deploy-details dl");
    await expect(list.getByRole("term")).toHaveText(["Started", "Took", "Pages changed", "Version"]);
    await expect(list.getByRole("definition")).toHaveCount(4);
  });

  test("an empty detail shows a dash, read as None", async ({ page }) => {
    const empty = section(page, "Several details, an empty one, and a long one").locator("dd:empty");
    await expect(empty).toHaveCount(1);
    const content = await empty.evaluate((dd) => getComputedStyle(dd, "::before").content);
    expect(content).toBe('"—" / "None"');
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Description list layout", () => {
  test("a wide list puts each term beside its details, in one column of terms", async ({ page }) => {
    await open(page, "/description-list", "classic", "light");
    const list = '.example:has(h3:text-is("Site details")) beautiful-example-preview dl';
    const terms = await boxes(page, `${list} dt`);
    const details = await boxes(page, `${list} dd`);
    const dl = (await boxes(page, list))[0]!;
    for (const [i, term] of terms.entries()) {
      expect(term.x).toBe(dl.x);
      expect(details[i]!.y).toBe(term.y);
      expect(details[i]!.x).toBe(terms[0]!.x + terms[0]!.width);
    }
    // Half the list, up to 20rem.
    expect(Math.abs(terms[0]!.width - Math.min(dl.width / 2, 320))).toBeLessThanOrEqual(1);
  });

  test("a second detail sits under the first, in the details column", async ({ page }) => {
    await open(page, "/description-list", "classic", "light");
    const list = '.example:has(h3:text-is("Several details, an empty one, and a long one")) beautiful-example-preview dl';
    const [first, second] = await boxes(page, `${list} dd`);
    expect(second!.x).toBe(first!.x);
    expect(second!.y).toBe(first!.y + first!.height);
  });

  test("terms that share details stack in the term column, and the details sit beside the last", async ({ page }) => {
    await page.goto("/tests/harness/description-list.html");
    const list = '[data-example="shared"] dl';
    const [first, second, next] = await boxes(page, `${list} dt`);
    const [shared] = await boxes(page, `${list} dd`);
    expect(second!.x).toBe(first!.x);
    expect(second!.y).toBe(first!.y + first!.height);
    expect(shared!.y).toBe(second!.y);
    // Their text starts level too: the same top padding.
    const pads = await page
      .locator(`${list} :is(dt + dt, dt + dt + dd)`)
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).paddingBlockStart));
    expect(pads[0]).toBe(pads[1]);
    expect(shared!.x).toBe(first!.x + first!.width);
    expect(next!.x).toBe(first!.x);
  });

  test("a list under 24rem stacks each detail under its term", async ({ page }) => {
    await open(page, "/description-list", "classic", "light");
    const list = '.example:has(h3:text-is("In a sidebar")) beautiful-example-preview dl';
    const dl = (await boxes(page, list))[0]!;
    expect(dl.width).toBeLessThan(384);
    const terms = await boxes(page, `${list} dt`);
    const details = await boxes(page, `${list} dd`);
    for (const [i, term] of terms.entries()) {
      expect(term.width).toBe(dl.width);
      expect(details[i]!.x).toBe(dl.x);
      expect(details[i]!.y).toBe(term.y + term.height);
    }
  });

  test("a list sized by its content keeps its width", async ({ page }) => {
    await page.goto("/tests/harness/description-list.html");
    const shrunk = page.locator('[data-example="fit-content"] dl');
    // A container query's container-type would collapse this list to 0. It is as wide as its widest line.
    const width = (await shrunk.boundingBox())!.width;
    const term = (await shrunk.locator("dt").evaluate((dt) => dt.scrollWidth)) as number;
    expect(Math.ceil(width)).toBeGreaterThanOrEqual(term);
    expect(term).toBeGreaterThan(30);
  });

  test("the first row has no line above it, and each later row has one across the list", async ({ page }) => {
    await open(page, "/description-list", "classic", "light");
    const list = section(page, "Site details").locator("beautiful-example-preview dl");
    const lines = await list.locator("dt").evaluateAll((terms) =>
      terms.map((dt) => {
        const line = getComputedStyle(dt, "::before");
        return line.content === "none" ? null : line.width;
      }),
    );
    const width = await list.evaluate((dl) => `${dl.clientWidth}px`);
    expect(lines).toEqual([null, width, width, width]);
  });

  test("a row's line is a Divider's hairline, a groove in glass's dark mode", async ({ page }) => {
    const line = (page: Page) =>
      section(page, "Site details")
        .locator("beautiful-example-preview dt")
        .nth(1)
        .evaluate((dt) => {
          const style = getComputedStyle(dt, "::before");
          return { height: style.height, color: style.backgroundColor, shadow: style.boxShadow };
        });
    await open(page, "/description-list", "classic", "light");
    const classic = await line(page);
    expect(classic.height).toBe("1px");
    expect(classic.color).toMatch(/0\.1\)$/);
    expect(classic.shadow).toMatch(/^rgba\(0, 0, 0, 0\) /);
    await open(page, "/description-list", "glass", "dark");
    const glass = await line(page);
    expect(glass.color).toBe("rgba(0, 0, 0, 0.5)");
    expect(glass.shadow).toBe("rgba(255, 255, 255, 0.08) 0px 1px 0px 0px");
  });

  test("terms take a glass surface's stronger muted shade", async ({ page }) => {
    // On the harness's plain canvas: the docs page's own content sits on a Sidebar layout pane, a glass surface too.
    await page.goto("/tests/harness/description-list.html?theme=glass&mode=light");
    await expect(page.locator('[data-example="site"] dt').first()).toHaveCSS("color", "rgb(82, 82, 91)");
    await page.locator('[data-example="dialog"]').getByRole("button", { name: "Deploy details" }).click();
    await expect(page.locator("#deploy-details dt").first()).toHaveCSS("color", "rgb(63, 63, 70)");
  });
});

test.describe("Description list axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/description-list", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/description-list.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The dialog example's stage is glass over a picture, which glass.spec.ts measures from pixels.
        const results = await new AxeBuilder({ page }).exclude("beautiful-demo-stage").withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Description list component", () => {
  test("passes other attributes through, and leaves data-size out without a size", async ({ page }) => {
    await page.goto("/tests/harness/description-list.html");
    const list = page.locator("#summary");
    await expect(list).not.toHaveAttribute("data-size");
    await expect(list.locator("dt")).toHaveAttribute("id", "plan-term");
    await expect(list.locator("dd")).toHaveAttribute("aria-labelledby", "plan-term");
  });
});
