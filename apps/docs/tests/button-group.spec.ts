import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the group role (WAI-ARIA 1.2) and the APG button pattern: the group is named, takes no focus
// of its own, and Tab reaches each button in it in turn.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** Each corner's radius in px, in the order top-left, top-right, bottom-right, bottom-left. */
function corners(el: Locator) {
  return el.evaluate((node) => {
    const style = getComputedStyle(node);
    return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].map(
      (radius) => Number.parseFloat(radius),
    );
  });
}

test.describe("Button group keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/button-group"));

  test("is a group named by its label, holding its buttons", async ({ page }) => {
    const group = section(page, "Secondary, the default").getByRole("group", { name: "Site", exact: true });
    await expect(group).toBeVisible();
    await expect(group.getByRole("button")).toHaveText(["Edit", "Preview", "Share"]);
    await expect(section(page, "Links that look like buttons").getByRole("group", { name: "Pages of entries" }).getByRole("link")).toHaveCount(2);
  });

  test("Tab reaches each button in turn, and the group takes no stop of its own", async ({ page }) => {
    const example = section(page, "Secondary, the default");
    await example.getByRole("heading").evaluate((heading) => {
      // Start just before the example, so the next Tab is its first button.
      heading.tabIndex = -1;
      heading.focus();
    });
    for (const name of ["Edit", "Preview", "Share"]) {
      await page.keyboard.press("Tab");
      await expect(example.getByRole("button", { name })).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(example.locator("summary").first()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(example.getByRole("button", { name: "Share" })).toBeFocused();
  });

  test("Tab skips a disabled button", async ({ page }) => {
    const example = section(page, "With a disabled button");
    await expect(example.getByRole("button", { name: "Redo" })).toBeDisabled();
    await example.getByRole("button", { name: "Undo" }).focus();
    await page.keyboard.press("Tab");
    await expect(example.locator("summary").first()).toBeFocused();
  });

  test("a split button's menu button opens its menu, and Escape brings focus back", async ({ page }) => {
    const example = section(page, "A split button");
    const button = example.getByRole("button", { name: "More ways to publish" });
    await button.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu", { name: "More ways to publish" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Schedule for later" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
  });
});

test.describe("Button group look", () => {
  test.beforeEach(({ page }) => open(page, "/button-group", "classic", "light"));

  test("rounds only the outer corners, and the buttons touch", async ({ page }) => {
    const buttons = section(page, "Secondary, the default").getByRole("button");
    const [first, middle, last] = [buttons.nth(0), buttons.nth(1), buttons.nth(2)];
    expect(await corners(first)).toEqual([8, 0, 0, 8]);
    expect(await corners(middle)).toEqual([0, 0, 0, 0]);
    expect(await corners(last)).toEqual([0, 8, 8, 0]);
    const boxes = await Promise.all([first, middle, last].map((button) => button.boundingBox()));
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.x).toBeCloseTo(boxes[i - 1]!.x + boxes[i - 1]!.width, 1);
  });

  test("neighbours share one edge: a button after the first draws no start edge", async ({ page }) => {
    const buttons = section(page, "Secondary, the default").getByRole("button");
    const startEdges = await buttons.evaluateAll((all) => all.map((button) => getComputedStyle(button).borderLeftWidth));
    expect(startEdges).toEqual(["1px", "0px", "0px"]);
  });

  test("the corners count buttons only, so a split button's menu doesn't take the last one", async ({ page }) => {
    const button = section(page, "A split button").getByRole("button", { name: "More ways to publish" });
    expect(await corners(button)).toEqual([0, 8, 8, 0]);
  });

  test("a split button's menu button stays a square Icon button", async ({ page }) => {
    const box = (await section(page, "A split button").getByRole("button", { name: "More ways to publish" }).boundingBox())!;
    expect(box.width).toBeCloseTo(box.height, 1);
  });

  test("a hidden button leaves the one before it the round end corners", async ({ page }) => {
    const buttons = section(page, "Secondary, the default").getByRole("group", { name: "Site" }).getByRole("button");
    const middle = buttons.nth(1);
    await buttons.nth(2).evaluate((el) => el.toggleAttribute("hidden", true));
    expect(await corners(middle)).toEqual([0, 8, 8, 0]);
  });

  test("right to left, the round corners stay on the outside", async ({ page }) => {
    const group = section(page, "Secondary, the default").getByRole("group", { name: "Site" });
    await group.evaluate((el) => el.setAttribute("dir", "rtl"));
    const buttons = group.getByRole("button");
    expect(await corners(buttons.nth(0))).toEqual([0, 8, 8, 0]);
    expect(await corners(buttons.nth(2))).toEqual([8, 0, 0, 8]);
  });

  test("a pressed button darkens but doesn't shrink away from its neighbours", async ({ page }) => {
    const button = section(page, "Secondary, the default").getByRole("button", { name: "Preview" });
    await button.hover();
    await page.mouse.down();
    await expect.poll(() => button.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await page.mouse.up();
  });

  test("the group draws one shadow, and the buttons none", async ({ page }) => {
    const example = section(page, "Secondary, the default");
    expect(await example.getByRole("group", { name: "Site" }).evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
    for (const button of await example.getByRole("button").all()) {
      expect(await button.evaluate((el) => getComputedStyle(el).boxShadow)).toBe("none");
    }
  });

  test("in glass the group draws one rim, and the buttons none", async ({ page }) => {
    await open(page, "/button-group", "glass", "light");
    const example = section(page, "Secondary, the default");
    expect(await example.getByRole("group", { name: "Site" }).evaluate((el) => getComputedStyle(el, "::before").content)).not.toBe("none");
    for (const button of await example.getByRole("button").all()) {
      expect(await button.evaluate((el) => getComputedStyle(el, "::before").content)).toBe("none");
    }
  });

  test("a focused button sits above its neighbours, so its ring isn't covered", async ({ page }) => {
    const button = section(page, "Secondary, the default").getByRole("button", { name: "Preview" });
    await button.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    expect(await button.evaluate((el) => getComputedStyle(el).zIndex)).toBe("2");
  });
});

test.describe("Button group axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/button-group", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // The docs page's gradient leaves axe unable to judge contrast, so it is checked on the
      // harness's plain canvas. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/button-group.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("ButtonGroup component", () => {
  test("takes its name from aria-labelledby, and passes other attributes through", async ({ page }) => {
    await page.goto("/tests/harness/button-group.html");
    const group = page.getByRole("group", { name: "Formatting" });
    await expect(group).toHaveAttribute("id", "labelled");
    await expect(group).toHaveClass("extra");
    await expect(group.getByRole("button")).toHaveCount(2);
  });
});
