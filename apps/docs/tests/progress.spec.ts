import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// APG has no progress bar pattern. Its Meter pattern is the nearest, and its rules for a range's
// value hold: the bar has a name, a minimum and maximum, a value, and the value in words where
// aria-valuetext gives them. It takes no focus and no keys. The native <progress> does all of it.
// These check that the look keeps it so, and what the Solid Progress adds: the words for the value,
// shown at the end of the label's line, and the Field's name, description and error.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

test.describe("Progress semantics", () => {
  test.beforeEach(({ page }) => open(page, "/progress"));

  test("each bar is a progress bar named by its label, with its value in words", async ({ page }) => {
    const upload = preview(page, "Counting").getByRole("progressbar", { name: "Uploading 12 photos" });
    await expect(upload).toHaveAttribute("aria-valuetext", "5 of 12");
    await expect(upload).toHaveAccessibleDescription("About a minute left.");
    expect(await upload.evaluate((el: HTMLProgressElement) => [el.value, el.max, el.position])).toEqual([5, 12, 5 / 12]);
    await expect(preview(page, "A percentage, and done").getByRole("progressbar", { name: "Importing contacts" })).toHaveAttribute(
      "aria-valuetext",
      "42%",
    );
    await expect(preview(page, "On its own").getByRole("progressbar", { name: "Setup" })).toHaveAttribute("aria-valuetext", "3 of 5 steps");
  });

  test("an indeterminate bar has no value and no words", async ({ page }) => {
    const build = preview(page, "Indeterminate").getByRole("progressbar", { name: "Building Spring launch" });
    expect(await build.evaluate((el: HTMLProgressElement) => el.position)).toBe(-1);
    await expect(build).not.toHaveAttribute("aria-valuetext");
    await expect(preview(page, "Indeterminate").locator("output")).toHaveCount(0);
  });

  test("a failed bar is described by its error", async ({ page }) => {
    const retry = preview(page, "Failed").getByRole("progressbar", { name: "Uploading 12 photos" });
    await expect(retry).toHaveAccessibleDescription("The connection dropped after 7 photos. Try again to send the other 5.");
  });

  test("the shown value is for the eye: screen readers hear it from the bar, once", async ({ page }) => {
    for (const output of await preview(page, "Counting").locator("output").all()) await expect(output).toHaveAttribute("aria-hidden", "true");
    await expect(preview(page, "Counting").locator("output")).toHaveText("5 of 12");
  });

  test("Tab passes over it", async ({ page }) => {
    await section(page, "Counting").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "A percentage, and done").locator("summary").first()).toBeFocused();
    for (const bar of await page.locator("beautiful-example-preview progress").all()) {
      expect(await bar.evaluate((el) => (el as HTMLElement).tabIndex)).toBe(-1);
    }
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Progress look", () => {
  test("the value sits at the end of the label's line, and the description under the bar", async ({ page }) => {
    await open(page, "/progress", "classic", "light");
    const field = preview(page, "Counting");
    const label = (await field.locator("label").boundingBox())!;
    const value = (await field.locator("output").boundingBox())!;
    const bar = (await field.locator("progress").boundingBox())!;
    const description = (await field.locator("p").boundingBox())!;
    expect(Math.abs(value.y - label.y)).toBeLessThan(2);
    expect(value.x + value.width).toBeCloseTo(bar.x + bar.width, 0);
    expect(description.y).toBeGreaterThan(bar.y + bar.height);
    expect(bar.y).toBeGreaterThan(label.y + label.height - 1);
  });

  test("the bar is 8px tall with round ends", async ({ page }) => {
    await open(page, "/progress", "classic", "light");
    const bar = preview(page, "Counting").locator("progress");
    expect((await bar.boundingBox())!.height).toBe(8);
    await expect(bar).toHaveCSS("border-top-left-radius", "9999px");
  });

  test("the fill covers value out of max of the track", async ({ page }) => {
    await open(page, "/progress", "classic", "light");
    const bar = preview(page, "Counting").locator("progress");
    await bar.scrollIntoViewIfNeeded();
    const box = (await bar.boundingBox())!;
    // The fill is a pseudo-element the page can't measure, so its end is read from pixels: the first
    // one along the bar's middle that is no longer blue. 5 of 12 is 42% of the way.
    const shot = await page.screenshot({ clip: { x: box.x, y: box.y + box.height / 2 - 0.5, width: box.width, height: 1 } });
    const end = await page.evaluate(async (b64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${b64}`;
      await image.decode();
      const canvas = new OffscreenCanvas(image.width, 1);
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, image.width, 1).data;
      // The first pixel from the left that is no longer blue: the fill's end.
      for (let i = 0; i < image.width; i++) if (data[i * 4 + 2]! - data[i * 4]! < 60) return i / image.width;
      return 1;
    }, shot.toString("base64"));
    expect(end).toBeCloseTo(5 / 12, 1);
  });

  test("a failed bar turns the fill danger, and an indeterminate one sweeps, or breathes under reduced motion", async ({ page }) => {
    await open(page, "/progress", "classic", "light");
    const fill = (title: string) => preview(page, title).locator("progress").evaluate((el) => getComputedStyle(el).getPropertyValue("--progress-color"));
    expect(await fill("Failed")).not.toBe(await fill("Counting"));
    const build = preview(page, "Indeterminate").locator("progress");
    await expect(build).toHaveCSS("animation-name", "progress-sweep");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(build).toHaveCSS("animation-name", "progress-pulse");
  });

  test("the sweep runs the other way in a right-to-left page", async ({ page }) => {
    await open(page, "/progress");
    const build = preview(page, "Indeterminate").locator("progress");
    await expect(build).toHaveCSS("animation-direction", "normal");
    await page.evaluate(() => (document.documentElement.dir = "rtl"));
    await expect(build).toHaveCSS("animation-direction", "reverse");
  });
});

test.describe("Progress axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/progress", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/progress.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Progress component", () => {
  test("follows its value: the words, the shown value and the bar", async ({ page }) => {
    await page.goto("/tests/harness/progress.html");
    const bar = page.getByRole("progressbar", { name: "Uploading", exact: true });
    const live = page.locator('[data-example="live"]');
    // No value yet: indeterminate, with no words and no shown value.
    expect(await bar.evaluate((el: HTMLProgressElement) => el.position)).toBe(-1);
    await expect(live.locator("output")).toHaveCount(0);
    await page.locator("#start").click();
    await expect(bar).toHaveAttribute("aria-valuetext", "0%");
    await page.locator("#to-four").click();
    await expect(bar).toHaveAttribute("aria-valuetext", "40%");
    await expect(live.locator("output[for=live-upload]")).toHaveText("40%");
    expect(await bar.evaluate((el: HTMLProgressElement) => el.position)).toBeCloseTo(0.4, 5);
    await page.locator("#to-wait").click();
    await expect(bar).not.toHaveAttribute("aria-valuetext");
    await expect(bar).not.toHaveAttribute("value");
    await expect(live.locator("output[for=live-upload]")).toHaveCount(0);
  });

  test("an error that arrives later describes the bar", async ({ page }) => {
    await page.goto("/tests/harness/progress.html");
    const bar = page.getByRole("progressbar", { name: "Uploading", exact: true });
    await page.locator("#fail").click();
    await expect(bar).toHaveAccessibleDescription("It stopped.");
  });

  test("hideValue leaves the value off the label's line, and the bar still says it", async ({ page }) => {
    await page.goto("/tests/harness/progress.html");
    const bar = page.getByRole("progressbar", { name: "Hidden value" });
    await expect(bar).toHaveAttribute("aria-valuetext", "30%");
    await expect(page.locator("output[for=hidden-value]")).toHaveCount(0);
  });

  test("a max the browser would ignore, a value that isn't a number, and empty words fall back", async ({ page }) => {
    await page.goto("/tests/harness/progress.html");
    // 3 out of a max of 0 is read as out of 100, so the bar and its words agree.
    const odd = page.getByRole("progressbar", { name: "Odd max" });
    await expect(odd).toHaveAttribute("max", "100");
    await expect(odd).toHaveAttribute("aria-valuetext", "3%");
    // NaN is no value: the bar is indeterminate, with no words.
    const nan = page.getByRole("progressbar", { name: "Odd value" });
    expect(await nan.evaluate((el: HTMLProgressElement) => el.position)).toBe(-1);
    await expect(nan).not.toHaveAttribute("aria-valuetext");
    // Empty words give the percentage, not an empty aria-valuetext.
    await expect(page.getByRole("progressbar", { name: "Empty words" })).toHaveAttribute("aria-valuetext", "30%");
  });
});
