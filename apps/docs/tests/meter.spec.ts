import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// APG's Meter pattern: the meter has a name, a minimum and maximum, a value, and the value in words
// where aria-valuetext gives them. It takes no focus and no keys. The native <meter> does all of it.
// These check that the look keeps it so, that low, high and optimum color the fill, and what the
// Solid Meter adds: the words for the value, shown at the end of the label's line, and the Field's
// name and description.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

/** The color of the pixel in the middle of a meter's fill, a little in from its start. */
async function fillColor(page: Page, title: string, name: string) {
  const bar = preview(page, title).getByRole("meter", { name, exact: true });
  await bar.scrollIntoViewIfNeeded();
  const box = (await bar.boundingBox())!;
  const shot = await page.screenshot({ clip: { x: box.x + 8, y: box.y + box.height / 2, width: 1, height: 1 } });
  return page.evaluate(async (b64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${b64}`;
    await image.decode();
    const context = new OffscreenCanvas(1, 1).getContext("2d")!;
    context.drawImage(image, 0, 0);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return { r: r!, g: g!, b: b! };
  }, shot.toString("base64"));
}

test.describe("Meter semantics", () => {
  test.beforeEach(({ page }) => open(page, "/meter"));

  test("each meter is named by its label, with its range and its value in words", async ({ page }) => {
    const storage = preview(page, "Storage").getByRole("meter", { name: "Storage" });
    await expect(storage).toHaveAttribute("aria-valuetext", "3.2 GB of 5 GB");
    await expect(storage).toHaveAccessibleDescription("Images and files across your sites. Your plan includes 5 GB.");
    expect(await storage.evaluate((el: HTMLMeterElement) => [el.value, el.min, el.max])).toEqual([3.2, 0, 5]);
    await expect(preview(page, "On its own").getByRole("meter", { name: "Bandwidth this month" })).toHaveAttribute(
      "aria-valuetext",
      "18 GB of 100 GB",
    );
  });

  test("the shown value is for the eye: screen readers hear it from the meter, once", async ({ page }) => {
    for (const output of await page.locator("beautiful-example-preview output").all()) await expect(output).toHaveAttribute("aria-hidden", "true");
    await expect(preview(page, "Storage").locator("output")).toHaveText("3.2 GB of 5 GB");
  });

  test("Tab passes over it", async ({ page }) => {
    await section(page, "Storage").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "As it fills").locator("summary").first()).toBeFocused();
    for (const bar of await page.locator("beautiful-example-preview meter").all()) {
      expect(await bar.evaluate((el) => (el as HTMLElement).tabIndex)).toBe(-1);
    }
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Meter look", () => {
  test("the bar is Progress's: 8px tall with round ends, and the fill as tall as the track", async ({ page }) => {
    await open(page, "/meter", "classic", "light");
    const bar = preview(page, "Storage").locator("meter");
    await bar.scrollIntoViewIfNeeded();
    expect((await bar.boundingBox())!.height).toBe(8);
    await expect(bar).toHaveCSS("border-top-left-radius", "9999px");
    // The fill's middle row and the rows just inside its top and bottom edges are all the accent.
    const box = (await bar.boundingBox())!;
    const shot = await page.screenshot({ clip: { x: box.x + box.width / 4, y: box.y, width: 1, height: box.height } });
    const blue = await page.evaluate(async (b64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${b64}`;
      await image.decode();
      const context = new OffscreenCanvas(1, image.height).getContext("2d")!;
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, 1, image.height).data;
      let rows = 0;
      for (let y = 0; y < image.height; y++) if (data[y * 4 + 2]! - data[y * 4]! > 60) rows++;
      return rows;
    }, shot.toString("base64"));
    expect(blue).toBeGreaterThanOrEqual(6);
  });

  test("the value sits at the end of the label's line, and the description under the bar", async ({ page }) => {
    await open(page, "/meter", "classic", "light");
    const field = preview(page, "Storage");
    const label = (await field.locator("label").boundingBox())!;
    const value = (await field.locator("output").boundingBox())!;
    const bar = (await field.locator("meter").boundingBox())!;
    const description = (await field.locator("p").boundingBox())!;
    expect(Math.abs(value.y - label.y)).toBeLessThan(2);
    expect(value.x + value.width).toBeCloseTo(bar.x + bar.width, 0);
    expect(description.y).toBeGreaterThan(bar.y + bar.height);
    expect(bar.y).toBeGreaterThan(label.y + label.height - 1);
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`low, high and optimum color the fill: accent, amber, red, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/meter", theme, mode);
        const good = await fillColor(page, "As it fills", "Sites");
        const care = await fillColor(page, "As it fills", "Emails this month");
        const out = await fillColor(page, "As it fills", "Storage");
        // Accent is blue, amber is red and green over blue, red is red over green.
        expect(good.b - good.r).toBeGreaterThan(60);
        expect(care.r - care.b).toBeGreaterThan(80);
        expect(care.g - care.b).toBeGreaterThan(40);
        expect(out.r - out.g).toBeGreaterThan(80);
        expect(out.r - out.b).toBeGreaterThan(60);
        // Higher is better: 72 of 100 is under high, so it needs care; 96 is good.
        const speed = await fillColor(page, "When higher is better", "Page speed");
        const access = await fillColor(page, "When higher is better", "Accessibility");
        expect(speed.r - speed.b).toBeGreaterThan(80);
        expect(access.b - access.r).toBeGreaterThan(60);
      });
    }
  }
});

test.describe("Meter axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/meter", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/meter.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The dialog example's stage is a picture, not the plain canvas.
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).exclude("beautiful-demo-stage").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Meter component", () => {
  test("follows its value: the words, the shown value and the state", async ({ page }) => {
    await page.goto("/tests/harness/meter.html");
    const bar = page.getByRole("meter", { name: "Used", exact: true });
    const shown = page.locator("output[for=live-storage]");
    await expect(bar).toHaveAttribute("aria-valuetext", "40%");
    await expect(shown).toHaveText("40%");
    await page.locator("#to-four").click();
    await expect(bar).toHaveAttribute("aria-valuetext", "84%");
    expect(await bar.evaluate((el: HTMLMeterElement) => el.value)).toBeCloseTo(4.2, 5);
    await page.locator("#to-full").click();
    await expect(bar).toHaveAttribute("aria-valuetext", "100%");
    await expect(shown).toHaveText("100%");
  });

  test("hideValue leaves the value off the label's line, and the meter still says it", async ({ page }) => {
    await page.goto("/tests/harness/meter.html");
    const bar = page.getByRole("meter", { name: "Hidden value" });
    await expect(bar).toHaveAttribute("aria-valuetext", "30%");
    await expect(page.locator("output[for=hidden-value]")).toHaveCount(0);
  });

  test("a max with no range, a value that isn't a number, empty words and an offset range fall back", async ({ page }) => {
    await page.goto("/tests/harness/meter.html");
    // 3 out of a max of 0 is read as out of 100, so the bar and its words agree.
    const odd = page.getByRole("meter", { name: "Odd max" });
    await expect(odd).toHaveAttribute("max", "100");
    await expect(odd).toHaveAttribute("aria-valuetext", "3%");
    // NaN reads as the bottom of the range, as the browser reads it.
    const nan = page.getByRole("meter", { name: "Odd value" });
    await expect(nan).toHaveAttribute("aria-valuetext", "0%");
    // Empty words give the percentage, not an empty aria-valuetext.
    await expect(page.getByRole("meter", { name: "Empty words" })).toHaveAttribute("aria-valuetext", "30%");
    // 150 in 50 to 250 is halfway.
    await expect(page.getByRole("meter", { name: "Offset range" })).toHaveAttribute("aria-valuetext", "50%");
    // A min with no max: the range is 100 wide from it, not one.
    const high = page.getByRole("meter", { name: "High min" });
    await expect(high).toHaveAttribute("max", "220");
    await expect(high).toHaveAttribute("aria-valuetext", "30%");
  });

  test("outside a Field, its own aria-describedby passes through", async ({ page }) => {
    await page.goto("/tests/harness/meter.html");
    await expect(page.getByRole("meter", { name: "Described" })).toHaveAccessibleDescription("A note about it.");
  });
});
