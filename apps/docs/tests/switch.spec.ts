import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// From the APG Switch pattern: Tab reaches the switch; Space flips it; it is read as a switch with
// its label and its state, on or off, and its description. Enter is optional in APG, and left to
// the browser, as on a checkbox. The native checkbox with role="switch" does all of it. These
// check that the look keeps it so, and what the Solid Switch adds: onChange with the new state,
// and a Field's wiring.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** The red, green and blue of a computed color, each 0 to 1: rgb() or color(srgb). */
function channels(color: string) {
  const numbers = color.match(/[\d.]+/g)!.map(Number);
  return color.startsWith("rgb") ? numbers.slice(0, 3).map((n) => n / 255) : numbers.slice(0, 3);
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

test.describe("Switch keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/switch"));

  test("Space flips it, and Enter doesn't", async ({ page }) => {
    const weekly = preview(page, "A list of settings").getByRole("switch", { name: "Every Monday, with last week's visits" });
    await weekly.focus();
    await expect(weekly).not.toBeChecked();
    await page.keyboard.press("Space");
    await expect(weekly).toBeChecked();
    await page.keyboard.press("Enter");
    await expect(weekly).toBeChecked();
    await page.keyboard.press("Space");
    await expect(weekly).not.toBeChecked();
  });

  test("Tab reaches each switch in the order of the page, and skips a disabled one", async ({ page }) => {
    const list = preview(page, "A list of settings");
    await list.getByRole("switch").first().focus();
    await page.keyboard.press("Tab");
    await expect(list.getByRole("switch", { name: "A payment fails" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(list.getByRole("switch", { name: "Every Monday, with last week's visits" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(list.getByRole("switch", { name: "A payment fails" })).toBeFocused();
    await preview(page, "Disabled").getByRole("switch").first().scrollIntoViewIfNeeded();
    await expect(preview(page, "Disabled").getByRole("switch").first()).toBeDisabled();
  });

  test("it is a switch, named by its label, described by its description, and on or off by its checked state", async ({ page }) => {
    const form = preview(page, "A list of settings").getByRole("switch", { name: "A visitor sends a form" });
    await expect(form).toHaveRole("switch");
    await expect(form).toHaveAccessibleDescription("With what they wrote, so you can reply from your inbox.");
    await expect(form).toBeChecked();
    // The state is the input's own: there is no aria-checked to keep in step.
    await expect(form).not.toHaveAttribute("aria-checked");
  });

  test("a click on the label flips it", async ({ page }) => {
    const list = preview(page, "A list of settings");
    const weekly = list.getByRole("switch", { name: "Every Monday, with last week's visits" });
    await list.getByText("Every Monday, with last week's visits").click();
    await expect(weekly).toBeChecked();
  });

  test("a form sends it as a checkbox while it is on", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    const data = await page.locator("#settings-form").evaluate((form: HTMLFormElement) => [...new FormData(form).entries()]);
    expect(data).toEqual([
      ["indexed", "yes"],
      ["controlled", "on"],
    ]);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Switch look", () => {
  test("it is a pill 32 by 20, and the thumb sits at the start off and the end on", async ({ page }) => {
    await open(page, "/switch", "classic", "light");
    const list = preview(page, "A list of settings");
    const on = list.getByRole("switch", { name: "A visitor sends a form" });
    const off = list.getByRole("switch", { name: "Every Monday, with last week's visits" });
    for (const input of [on, off]) {
      await expect(input).toHaveCSS("width", "32px");
      await expect(input).toHaveCSS("height", "20px");
      await expect(input).toHaveCSS("border-top-left-radius", "9999px");
    }
    await expect(on).toHaveCSS("background-position", /100%/);
    await expect(off).toHaveCSS("background-position", /^0%/);
  });

  test("in a field, the switch sits at the end of the label's line, centered on it", async ({ page }) => {
    await open(page, "/switch", "classic", "light");
    const field = preview(page, "A list of settings").locator("beautiful-field").nth(1);
    const label = (await field.locator("label").boundingBox())!;
    const input = (await field.getByRole("switch").boundingBox())!;
    const box = (await field.boundingBox())!;
    expect(input.x + input.width).toBeCloseTo(box.x + box.width, 0);
    expect(input.x).toBeGreaterThan(label.x + label.width);
    expect(input.y + input.height / 2).toBeCloseTo(label.y + label.height / 2, 0);
  });

  test("on is filled with the accent, neutral with near-black, and off is the well", async ({ page }) => {
    await open(page, "/switch", "classic", "light");
    const fill = (input: Locator) => input.evaluate((el) => getComputedStyle(el).backgroundColor);
    const accent = preview(page, "A list of settings").getByRole("switch", { name: "A visitor sends a form" });
    const neutral = preview(page, "Neutral").getByRole("switch", { name: "Compact rows" });
    const off = preview(page, "Neutral").getByRole("switch", { name: "Show drafts in the list" });
    // The same fill as a primary accent Button: --color-accent-fill, opaque in classic.
    const [on, quiet, dark] = [await fill(accent), await fill(neutral), await fill(off)];
    expect(on).not.toBe(quiet);
    expect(on).not.toBe(dark);
    expect(quiet).not.toBe(dark);
    expect(channels(on)[2]!).toBeGreaterThan(channels(on)[0]! * 2);
    expect(Math.max(...channels(quiet))).toBeLessThan(0.15);
  });

  test("the focus ring is round like the track", async ({ page }) => {
    await open(page, "/switch");
    const input = preview(page, "A list of settings").getByRole("switch").first();
    await input.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(input).toHaveCSS("outline-style", "solid");
    await expect(input).toHaveCSS("border-top-left-radius", "9999px");
  });

  test("an invalid switch keeps its danger edge, on, and under the pointer", async ({ page }) => {
    await page.goto("/tests/harness/switch.html?theme=classic&mode=light");
    const input = page.getByRole("switch", { name: "Needs a look" });
    await expect(input).toBeChecked();
    await expect(input).toHaveCSS("border-top-color", "rgb(201, 31, 58)");
    await input.hover();
    await expect(input).toHaveCSS("border-top-color", "rgb(201, 31, 58)");
  });

  test("a disabled switch fades with its label and description", async ({ page }) => {
    await open(page, "/switch", "classic", "light");
    const field = preview(page, "Disabled").locator("beautiful-field").first();
    for (const part of ["input", "label", "p"]) await expect(field.locator(part)).toHaveCSS("opacity", "0.5");
  });

  test("the thumb jumps under reduced motion and glides otherwise", async ({ page }) => {
    await open(page, "/switch", "classic", "light");
    const input = preview(page, "A list of settings").getByRole("switch", { name: "Every Monday, with last week's visits" });
    // background-color, border-color, then the thumb's background-position.
    const durations = () => input.evaluate((el) => getComputedStyle(el).transitionDuration.split(", "));
    expect((await durations())[2]).not.toBe("0s");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await durations()).toEqual([expect.not.stringMatching(/^0s$/), expect.not.stringMatching(/^0s$/), "0s"]);
  });

  test("the switch grows to 44 by 26 where the pointer is a finger", async ({ page, browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    const touch = await context.newPage();
    await open(touch, "/switch");
    const input = preview(touch, "A list of settings").getByRole("switch").first();
    await expect(input).toHaveCSS("width", "44px");
    await expect(input).toHaveCSS("height", "26px");
    await context.close();
  });

  test("it is drawn in the theme's own colors in forced colors", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, "/switch", "classic", "light");
    const off = preview(page, "A list of settings").getByRole("switch", { name: "Every Monday, with last week's visits" });
    // CanvasText and Canvas, as the browser resolves them.
    const system = await off.evaluate(() => {
      const probe = document.createElement("p");
      probe.style.cssText = "color: CanvasText; background-color: Canvas";
      document.body.append(probe);
      const { color, backgroundColor } = getComputedStyle(probe);
      probe.remove();
      return { color, backgroundColor };
    });
    await expect(off).toHaveCSS("border-top-color", system.color);
    await expect(off).toHaveCSS("background-color", system.backgroundColor);
  });
});

test.describe("Switch axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/switch", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the glass dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/switch", theme, mode);
        await section(page, "In a dialog").getByRole("button", { name: "Site settings" }).click();
        await expect(page.getByRole("dialog", { name: "Spring launch settings" })).toBeVisible();
        await settle(page.locator("#site-settings"));
        const results = await new AxeBuilder({ page }).include("#site-settings").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/switch.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A disabled switch's label and description are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> input:disabled)")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Switch component", () => {
  test("onChange gets the new state first, then the change event", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    const comments = page.getByRole("switch", { name: "Comments on posts" });
    await comments.check();
    await expect(page.locator("#heard")).toHaveText("true change");
    await comments.uncheck();
    await expect(page.locator("#heard")).toHaveText("false change");
  });

  test("a controlled switch follows its signal, and tells it what the person did", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    const controlled = page.getByRole("switch", { name: "Controlled" });
    await expect(controlled).toBeChecked();
    await controlled.uncheck();
    await expect(page.locator("#on")).toHaveText("false");
    await controlled.check();
    await expect(page.locator("#on")).toHaveText("true");
    await page.locator("#turn-off").click();
    await expect(controlled).not.toBeChecked();
  });

  test("a form's reset puts back where each switch started, and a controlled one's signal hears it", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    const indexed = page.getByRole("switch", { name: "Show in search results" });
    const comments = page.getByRole("switch", { name: "Comments on posts" });
    const controlled = page.getByRole("switch", { name: "Controlled" });
    await indexed.uncheck();
    await comments.check();
    await controlled.uncheck();
    await expect(page.locator("#on")).toHaveText("false");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(indexed).toBeChecked();
    await expect(comments).not.toBeChecked();
    await expect(controlled).toBeChecked();
    // The page hears what the reset did, as it hears a flip.
    await expect(page.locator("#on")).toHaveText("true");
    await expect(page.locator("#heard")).toHaveText("false change");
  });

  test("a reset goes back to what the page last set, not to what the person chose", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    const saved = page.getByRole("switch", { name: "Saved setting" });
    await expect(saved).not.toBeChecked();
    // The page loads its saved setting after the switch is shown, then the person turns it off.
    await page.locator("#load-saved").click();
    await expect(saved).toBeChecked();
    await saved.uncheck();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(saved).toBeChecked();
    // Another flip and another reset still go back to the same place.
    await saved.uncheck();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(saved).toBeChecked();
  });

  test("a reset that changes nothing tells the page nothing", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#heard")).toHaveText("");
  });

  test("outside a field it works on its own, and colors are left to data-color", async ({ page }) => {
    await page.goto("/tests/harness/switch.html");
    const alone = page.getByRole("switch", { name: "Outside a field" });
    await alone.check();
    await expect(alone).toBeChecked();
    await expect(alone).not.toHaveAttribute("data-color");
    await expect(page.getByRole("switch", { name: "Compact rows" })).toHaveAttribute("data-color", "neutral");
  });
});
