import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG Slider pattern: Tab reaches the slider; the arrows move it a step, Right and Up up,
// Left and Down down; Home and End go to the ends; Page Up and Page Down jump further. It is read
// as a slider with its label and its value, in words where aria-valuetext gives them. The native
// range does all of it. These check that the look keeps it so, and what the Solid Range adds: the
// words for the value, the fill, and a click on a mark.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

test.describe("Range keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/range"));

  test("the arrows move it a step, Home and End go to the ends, Page Up jumps further", async ({ page }) => {
    const share = preview(page, "In a field").getByRole("slider", { name: "Visitors who see the new version" });
    await share.focus();
    await page.keyboard.press("ArrowRight");
    await expect(share).toHaveValue("30");
    await page.keyboard.press("ArrowUp");
    await expect(share).toHaveValue("35");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowDown");
    await expect(share).toHaveValue("25");
    await page.keyboard.press("End");
    await expect(share).toHaveValue("100");
    await page.keyboard.press("Home");
    await expect(share).toHaveValue("0");
    await page.keyboard.press("PageUp");
    await expect(share).toHaveValue("10");
  });

  test("Tab reaches each slider in the order of the page and skips a disabled one", async ({ page }) => {
    const fields = preview(page, "In a field");
    await fields.getByRole("slider").first().focus();
    await page.keyboard.press("Tab");
    await expect(fields.getByRole("slider", { name: "Image quality" })).toBeFocused();
    const states = preview(page, "Empty and disabled");
    await states.getByRole("slider", { name: "Sessions to record" }).focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "Empty and disabled").locator("summary").first()).toBeFocused();
  });

  test("each slider is named by its label, described by its description, and gives its value in words", async ({ page }) => {
    const share = preview(page, "In a field").getByRole("slider", { name: "Visitors who see the new version" });
    await expect(share).toHaveAccessibleDescription("The rest see the live site until you promote it.");
    await expect(share).toHaveAttribute("aria-valuetext", "25%");
    await expect(preview(page, "On its own").getByRole("slider", { name: "Zoom" })).toBeVisible();
    // The shown value is for the eye: screen readers hear it from the slider, once.
    await expect(preview(page, "In a field").locator("output").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("the fill follows the thumb with no JS where CSS can work it out", async ({ page }) => {
    const quality = preview(page, "In a field").getByRole("slider", { name: "Image quality" });
    const at = () => quality.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--range-at")));
    expect(await at()).toBeCloseTo(2 / 3, 2);
    await quality.focus();
    await page.keyboard.press("End");
    await expect.poll(at).toBeCloseTo(1, 2);
    await page.keyboard.press("Home");
    await expect.poll(at).toBeCloseTo(0, 2);
  });

  test("a press on the track moves the thumb there", async ({ page }) => {
    const share = preview(page, "In a field").getByRole("slider", { name: "Visitors who see the new version" });
    await share.scrollIntoViewIfNeeded();
    const box = (await share.boundingBox())!;
    await page.mouse.click(box.x + box.width - 6, box.y + box.height / 2);
    await expect(share).toHaveValue("100");
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Range look", () => {
  test("the value sits at the end of the label's line, and the marks under the track", async ({ page }) => {
    await open(page, "/range", "classic", "light");
    const field = preview(page, "With marks");
    const label = (await field.locator("label").boundingBox())!;
    const value = (await field.locator("output").boundingBox())!;
    const slider = (await field.getByRole("slider").boundingBox())!;
    const marks = field.locator("datalist option");
    expect(Math.abs(value.y - label.y)).toBeLessThan(2);
    expect(value.x + value.width).toBeCloseTo(slider.x + slider.width, 0);
    // The second mark, 30 days, is centered under the thumb's spot for it.
    const room = await field.getByRole("slider").evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineStart));
    const thumb = slider.height - 2 * room;
    const spot = slider.x + room + thumb / 2 + (slider.width - 2 * room - thumb) / 3;
    const second = (await marks.nth(1).boundingBox())!;
    expect(second.x + second.width / 2).toBeCloseTo(spot, 0);
    // The ends line up with the track.
    expect((await marks.first().boundingBox())!.x).toBeCloseTo(slider.x + room, 0);
    const last = (await marks.last().boundingBox())!;
    expect(last.x + last.width).toBeCloseTo(slider.x + slider.width - room, 0);
  });

  test("the focus ring hugs the track and thumb", async ({ page }) => {
    await open(page, "/range");
    const slider = preview(page, "In a field").getByRole("slider").first();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveCSS("outline-style", "solid");
    await expect(slider).toHaveCSS("outline-offset", "-2px");
  });

  test("the thumb grows while dragged, and keeps its size under reduced motion", async ({ page }) => {
    await open(page, "/range");
    const slider = preview(page, "In a field").getByRole("slider").first();
    await slider.scrollIntoViewIfNeeded();
    const box = (await slider.boundingBox())!;
    const scale = () => slider.evaluate((el) => getComputedStyle(el).getPropertyValue("--range-thumb-scale").trim());
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    expect(await scale()).toBe("1.15");
    await page.mouse.up();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.mouse.down();
    expect(await scale()).toBe("1");
    await page.mouse.up();
  });

  test("a disabled slider fades with its label, value and description", async ({ page }) => {
    await open(page, "/range", "classic", "light");
    const field = preview(page, "Empty and disabled").locator("beautiful-field").nth(1);
    for (const part of ["input", "label", "output", "p"]) await expect(field.locator(part)).toHaveCSS("opacity", "0.5");
  });
});

test.describe("Range axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/range", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/range.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A disabled slider's label, description and value are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> input:disabled)")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Range component", () => {
  test("updates its words, its shown value and its fill as it moves", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const slider = page.getByRole("slider", { name: "Keep logs for" });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuetext", "90 days");
    await expect(page.locator('[data-example="marks"] output')).toHaveText("90 days");
    await expect.poll(() => slider.evaluate((el) => el.style.getPropertyValue("--range-at"))).toBe("0.6667");
  });

  test("a click on a mark moves the thumb there, and the page hears it", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const slider = page.getByRole("slider", { name: "Keep backups for" });
    await page.locator('[data-example="heard"] option', { hasText: "1 year" }).click();
    await expect(slider).toHaveValue("3");
    await expect(slider).toHaveAttribute("aria-valuetext", "1 year");
    await expect(page.locator("#heard")).toHaveText("3");
  });

  test("a click on the mark it's already at changes nothing", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    await page.locator('[data-example="heard"] option', { hasText: "30 days" }).click();
    await expect(page.locator("#changes")).toHaveText("0");
  });

  test("a form's reset puts its words, shown value and fill back", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const slider = page.getByRole("slider", { name: "Discount" });
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuetext", "100%");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(slider).toHaveValue("10");
    await expect(slider).toHaveAttribute("aria-valuetext", "10%");
    await expect(page.locator('[data-example="reset"] output')).toHaveText("10%");
    await expect.poll(() => slider.evaluate((el) => el.style.getPropertyValue("--range-at"))).toBe("0.1");
  });

  test("a value from the parent off its step reads what the browser rounded it to", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const slider = page.getByRole("slider", { name: "Split" });
    await page.locator("#set-split").click();
    await expect(slider).toHaveValue("15");
    await expect(slider).toHaveAttribute("aria-valuetext", "15%");
    await expect(page.locator('[data-example="controlled"] output')).toHaveText("15%");
  });

  test("new limits from the parent keep the value the person moved it to", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const slider = page.getByRole("slider", { name: "Split" });
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("100");
    await page.locator("#raise-limit").click();
    await expect(slider).toHaveValue("100");
    await expect(slider).toHaveAttribute("aria-valuetext", "100%");
    await expect.poll(() => slider.evaluate((el) => el.style.getPropertyValue("--range-at"))).toBe("0.5");
  });

  test("marks inside the track sit under their spots, not at its ends", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const slider = page.getByRole("slider", { name: "Sharpness" });
    const box = (await slider.boundingBox())!;
    // The room around the thumb is the input's padding, and the thumb fills the height inside it.
    const room = await slider.evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineStart));
    const thumb = box.height - 2 * room;
    const marks = page.locator('[data-example="inner-marks"] option');
    for (const [i, at] of [0.25, 0.5, 0.75].entries()) {
      const mark = (await marks.nth(i).boundingBox())!;
      const spot = box.x + room + thumb / 2 + (box.width - 2 * room - thumb) * at;
      expect(mark.x + mark.width / 2).toBeCloseTo(spot, 0);
    }
  });

  test("without format, it leaves the number to the browser and shows it in the page's language", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    const sends = page.getByRole("slider", { name: "Emails a month" });
    await expect(sends).not.toHaveAttribute("aria-valuetext");
    await expect(page.locator('[data-example="plain"] output')).toHaveText("10,000");
  });

  test("showValue={false} shows no value", async ({ page }) => {
    await page.goto("/tests/harness/range.html");
    await expect(page.locator('[data-example="hidden"] output')).toHaveCount(0);
  });
});
