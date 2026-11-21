import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG radio group pattern (https://www.w3.org/WAI/ARIA/apg/patterns/radio/) for one
// choice, and the toolbar pattern (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) for several.

const harness = (page: Page, theme = "glass", mode = "light") =>
  page.goto(`/tests/harness/toggle-group.html?theme=${theme}&mode=${mode}`).then(() => page.locator("[data-example]").first().waitFor());

/** The live preview of the docs example with this title. */
function example(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) }).locator("beautiful-example-preview");
}

test.describe("Toggle group keyboard, one choice", () => {
  test.beforeEach(({ page }) => open(page, "/toggle-group"));

  test("is a named radio group of radios, one checked", async ({ page }) => {
    const group = example(page, "One choice, a segmented control").getByRole("radiogroup", { name: "Period" });
    await expect(group.getByRole("radio")).toHaveCount(4);
    await expect(group.getByRole("radio", { name: "Week", checked: true })).toBeVisible();
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
  });

  test("Tab lands on the checked segment and leaves the group", async ({ page }) => {
    const preview = example(page, "One choice, a segmented control");
    await page.locator(".example", { has: page.getByRole("heading", { name: "Glass over bright content" }) }).locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("radio", { name: "Week" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".example", { has: page.getByRole("heading", { name: "One choice, a segmented control" }) }).locator("summary").first()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(preview.getByRole("radio", { name: "Week" })).toBeFocused();
  });

  test("the arrows move and choose, wrapping at the ends", async ({ page }) => {
    const group = example(page, "One choice, a segmented control");
    const radio = (name: string) => group.getByRole("radio", { name });
    await radio("Week").focus();
    await page.keyboard.press("ArrowRight");
    await expect(radio("Month")).toBeFocused();
    await expect(radio("Month")).toHaveAttribute("aria-checked", "true");
    await expect(radio("Week")).toHaveAttribute("aria-checked", "false");
    await expect(radio("Month")).toHaveAttribute("tabindex", "0");
    await expect(radio("Week")).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(radio("Day")).toBeFocused();
    await expect(radio("Day")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(radio("Year")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(radio("Month")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(radio("Day")).toBeFocused();
    await page.keyboard.press("End");
    await expect(radio("Year")).toHaveAttribute("aria-checked", "true");
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
  });

  test("a click chooses, and a second click keeps it on", async ({ page }) => {
    const group = example(page, "One choice, a segmented control");
    const day = group.getByRole("radio", { name: "Day" });
    await day.click();
    await expect(day).toHaveAttribute("aria-checked", "true");
    await day.click();
    await expect(day).toHaveAttribute("aria-checked", "true");
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
  });

  test("the arrows pass over a disabled segment", async ({ page }) => {
    const group = example(page, "Disabled, one segment and the whole group").getByRole("radiogroup", { name: "Period", exact: true });
    await group.getByRole("radio", { name: "Week" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "Year" })).toBeFocused();
    await expect(group.getByRole("radio", { name: "Month" })).toHaveAttribute("aria-checked", "false");
  });

  test("a disabled group is out of the Tab order and keeps its state", async ({ page }) => {
    const group = example(page, "Disabled, one segment and the whole group").getByRole("radiogroup", { name: "Period, while it loads" });
    await expect(group.getByRole("radio", { name: "Week", checked: true })).toBeDisabled();
    const section = (title: string) => page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
    await section("Disabled, one segment and the whole group").getByRole("radiogroup", { name: "Period", exact: true }).getByRole("radio", { name: "Day" }).focus();
    await page.keyboard.press("Tab");
    await expect(section("Disabled, one segment and the whole group").locator("summary").first()).toBeFocused();
  });

  test("right to left, ← is the next segment", async ({ page }) => {
    const preview = example(page, "One choice, a segmented control");
    await preview.evaluate((el) => el.setAttribute("dir", "rtl"));
    await preview.getByRole("radio", { name: "Week" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(preview.getByRole("radio", { name: "Month" })).toBeFocused();
  });
});

test.describe("Toggle group keyboard, several at once", () => {
  test.beforeEach(({ page }) => open(page, "/toggle-group"));

  test("is a named group of toggle buttons", async ({ page }) => {
    const group = example(page, "Several at once").getByRole("group", { name: "Text style" });
    await expect(group.getByRole("button", { name: "Bold", pressed: true })).toBeVisible();
    await expect(group.getByRole("button", { name: "Italic", pressed: false })).toBeVisible();
    await expect(group.getByRole("button", { name: "Underline", pressed: true })).toBeVisible();
  });

  test("the arrows only move focus, and Space and Enter flip", async ({ page }) => {
    const group = example(page, "Several at once");
    const button = (name: string) => group.getByRole("button", { name });
    await button("Bold").focus();
    await page.keyboard.press("ArrowRight");
    await expect(button("Italic")).toBeFocused();
    await expect(button("Italic")).toHaveAttribute("aria-pressed", "false");
    await expect(button("Bold")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect(button("Italic")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Enter");
    await expect(button("Italic")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("End");
    await expect(button("Underline")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(button("Bold")).toBeFocused();
    await expect(button("Bold")).toHaveAttribute("aria-pressed", "true");
  });

  test("Tab comes back to the segment last focused", async ({ page }) => {
    const group = example(page, "Several at once");
    await group.getByRole("button", { name: "Bold" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(group.getByRole("button", { name: "Italic" })).toBeFocused();
  });
});

test.describe("Toggle group look", () => {
  test("the thumb sits under the checked segment, and glides to the next", async ({ page }) => {
    await open(page, "/toggle-group", "classic", "light");
    const group = example(page, "One choice, a segmented control").getByRole("radiogroup");
    const thumb = () =>
      group.evaluate((el) => {
        const after = getComputedStyle(el, "::after");
        const box = el.getBoundingClientRect();
        return { left: box.left + parseFloat(after.left), width: parseFloat(after.width), content: after.content };
      });
    const box = (name: string) => group.getByRole("radio", { name }).boundingBox();
    expect((await thumb()).content).not.toBe("none");
    expect((await thumb()).left).toBeCloseTo((await box("Week"))!.x, 0);
    await group.getByRole("radio", { name: "Year" }).click();
    await expect.poll(async () => Math.round((await thumb()).left)).toBe(Math.round((await box("Year"))!.x));
    expect((await thumb()).width).toBeCloseTo((await box("Year"))!.width, 0);
  });

  test("several at once: each pressed segment has a pane, and pressed neighbours share one", async ({ page }) => {
    await open(page, "/toggle-group", "classic", "light");
    const group = example(page, "Several at once");
    const pane = (name: string) =>
      group.getByRole("button", { name }).evaluate((el) => {
        const after = getComputedStyle(el, "::after");
        return { opacity: after.opacity, start: after.borderStartStartRadius, end: after.borderStartEndRadius };
      });
    // Bold and Underline are pressed, Italic between them is not.
    await expect.poll(async () => (await pane("Bold")).opacity).toBe("1");
    expect((await pane("Italic")).opacity).toBe("0");
    expect((await pane("Bold")).end).not.toBe("0px");
    await group.getByRole("button", { name: "Italic" }).click();
    await expect.poll(async () => (await pane("Italic")).opacity).toBe("1");
    expect((await pane("Bold")).end).toBe("0px");
    expect((await pane("Italic")).start).toBe("0px");
    expect((await pane("Italic")).end).toBe("0px");
    expect((await pane("Underline")).start).toBe("0px");
  });

  // A pane's shadow is the segment's ::before, which button.css also sizes as a Button's rim. In dark
  // glass the rim is a scaled hairline, so a pane that kept its size ran past the segment.
  for (const mode of modes) {
    test(`a pane is the size of its segment, glass ${mode}`, async ({ page }) => {
      await open(page, "/toggle-group", "glass", mode);
      const bold = example(page, "Several at once").getByRole("button", { name: "Bold" });
      const sizes = await bold.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const shade = getComputedStyle(el, "::before");
        const fill = getComputedStyle(el, "::after");
        return { box: box.width, shade: parseFloat(shade.width), fill: parseFloat(fill.width), mask: shade.maskImage };
      });
      expect(sizes.shade).toBeCloseTo(sizes.box, 0);
      expect(sizes.fill).toBeCloseTo(sizes.box, 0);
      expect(sizes.mask).toBe("none");
    });
  }

  test("fill shares the width equally", async ({ page }) => {
    await open(page, "/toggle-group");
    const preview = example(page, "Fill the width");
    const width = await preview.evaluate((el) => el.querySelector("beautiful-toggle-group")!.getBoundingClientRect().width);
    const content = await preview.evaluate((el) => {
      const style = getComputedStyle(el);
      return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    });
    expect(width).toBeCloseTo(content, 0);
    const widths = await preview.getByRole("radio").evaluateAll((all) => all.map((el) => el.getBoundingClientRect().width));
    expect(widths[0]).toBeCloseTo(widths[1]!, 0);
  });
});

test.describe("Toggle group axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/toggle-group", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Toggle group contrast", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      // The docs page's gradient leaves axe unable to judge contrast, so it is checked on the
      // harness's plain canvas, with each segment that's on hovered too.
      test(`on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await harness(page, theme, mode);
        const results = await new AxeBuilder({ page }).exclude('[data-example="glass"]').withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        for (const button of await page.locator('[data-example] button:is([aria-checked="true"], [aria-pressed="true"]):enabled').all()) {
          await button.hover();
          const hovered = await new AxeBuilder({ page }).include("button:hover").withRules(["color-contrast"]).analyze();
          expect(hovered.violations).toEqual([]);
        }
      });
    }
  }
});

test.describe("Toggle group component", () => {
  test("one choice: the arrows and a click choose, and each choice is reported once", async ({ page }) => {
    await harness(page);
    const group = page.locator('[data-example="single-reported"]');
    const radio = (name: string) => group.getByRole("radio", { name });
    await radio("Week").focus();
    await page.keyboard.press("ArrowRight");
    await expect(radio("Month")).toBeFocused();
    await expect(radio("Month")).toHaveAttribute("aria-checked", "true");
    await expect(radio("Month")).toHaveAttribute("tabindex", "0");
    await expect(radio("Week")).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("End");
    await radio("Day").click();
    await radio("Day").click();
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
    await expect(page.locator('[data-log="single"]')).toHaveText("month year day");
  });

  test("several at once: the arrows move, Space flips, and the list keeps the segments' order", async ({ page }) => {
    await harness(page);
    const group = page.locator('[data-example="multiple-reported"]');
    const button = (name: string) => group.getByRole("button", { name });
    await expect(button("Bold")).toHaveAttribute("tabindex", "0");
    await button("Bold").focus();
    await page.keyboard.press("ArrowRight");
    await expect(button("Italic")).toBeFocused();
    await expect(button("Italic")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Space");
    await expect(button("Italic")).toHaveAttribute("aria-pressed", "true");
    await button("Bold").click();
    await expect(page.locator('[data-log="multiple"]')).toHaveText("bold+italic+underline italic+underline");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(button("Bold")).toBeFocused();
  });

  test("with none chosen, Tab lands on the first, and an arrow chooses", async ({ page }) => {
    await harness(page);
    const group = page.locator('[data-example="none"]');
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(group.getByRole("radio", { name: "First" })).toHaveAttribute("tabindex", "0");
    await group.getByRole("radio", { name: "First" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "Second", checked: true })).toBeVisible();
    await expect(page.locator('[data-log="none"]')).toHaveText("b");
  });

  test("shows what value says when the page owns the state", async ({ page }) => {
    await harness(page);
    const views = page.locator('[data-example="controlled"]').getByRole("radio", { name: "Page views" });
    await views.click();
    await expect(views).toHaveAttribute("aria-checked", "true");
    await expect(page.locator('[data-log="controlled"]')).toHaveText("views");

    // The page never changes it, so it stays as it is, and the choice is still reported.
    const off = page.getByRole("button", { name: "Locked off" });
    await off.click();
    await expect(off).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-log="held"]')).toHaveText("on+off");
  });

  test("a caller's onClick can keep the state by preventing the default", async ({ page }) => {
    await harness(page);
    const button = page.getByRole("radio", { name: "Stays off" });
    await button.click();
    await expect(button).toHaveAttribute("aria-checked", "false");
    await expect(page.locator('[data-log="prevented"]')).toHaveText("");
  });

  test("is never a submit button", async ({ page }) => {
    await harness(page);
    for (const button of await page.locator("beautiful-toggle-group button").all()) await expect(button).toHaveAttribute("type", "button");
  });
});
