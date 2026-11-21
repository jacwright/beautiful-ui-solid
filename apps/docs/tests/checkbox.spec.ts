import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Locator, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG Checkbox pattern: Tab stops on every box, Space toggles it, and a mixed box that
// stands for others turns them all on, then all off. A native checkbox gives the rest.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

const mixed = (box: Locator) => box.evaluate((el) => (el as HTMLInputElement).indeterminate);

/** The select-all checks, the same on the docs page and on the harness. */
function selectAllChecks(where: () => Promise<Locator>) {
  test("a box that stands for others is mixed while only some are on", async () => {
    const group = await where();
    await expect(group.getByRole("checkbox", { name: "All changed pages" })).not.toBeChecked();
    expect(await mixed(group.getByRole("checkbox", { name: "All changed pages" }))).toBe(true);
  });

  test("Space on a mixed box turns every box on, then every box off", async ({ page }) => {
    const group = await where();
    const all = group.getByRole("checkbox", { name: "All changed pages" });
    const pages = group.getByRole("checkbox").filter({ hasNot: page.locator("[aria-controls]") });
    await all.focus();
    await page.keyboard.press("Space");
    await expect(all).toBeChecked();
    expect(await mixed(all)).toBe(false);
    for (const box of await pages.all()) await expect(box).toBeChecked();
    await page.keyboard.press("Space");
    await expect(all).not.toBeChecked();
    for (const box of await pages.all()) await expect(box).not.toBeChecked();
  });

  test("turning one box back on makes the box that stands for them mixed again", async ({ page }) => {
    const group = await where();
    const all = group.getByRole("checkbox", { name: "All changed pages" });
    await group.getByRole("checkbox", { name: "Blog" }).check();
    await expect(all).toBeChecked();
    expect(await mixed(all)).toBe(false);
    await group.getByRole("checkbox", { name: "Home" }).focus();
    await page.keyboard.press("Space");
    await expect(all).not.toBeChecked();
    expect(await mixed(all)).toBe(true);
  });
}

test.describe("Checkbox keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/checkbox"));

  test("Tab stops on every box and skips a disabled one", async ({ page }) => {
    const settings = preview(page, "Settings");
    await settings.getByRole("checkbox").first().focus();
    for (const name of ["Accept form submissions", "Ask for a password on the preview"]) {
      await page.keyboard.press("Tab");
      await expect(settings.getByRole("checkbox", { name })).toBeFocused();
    }
    const states = preview(page, "Invalid and disabled");
    await states.getByRole("checkbox", { name: "I agree to the Terms of Service" }).focus();
    await page.keyboard.press("Tab");
    // Past both disabled boxes, to the example's Code toggle.
    await expect(section(page, "Invalid and disabled").locator("summary").first()).toBeFocused();
  });

  test("Space toggles the focused box", async ({ page }) => {
    const box = preview(page, "Settings").getByRole("checkbox", { name: "Ask for a password on the preview" });
    await box.focus();
    await page.keyboard.press("Space");
    await expect(box).toBeChecked();
    await page.keyboard.press("Space");
    await expect(box).not.toBeChecked();
  });

  test("a click on the label toggles the box", async ({ page }) => {
    const settings = preview(page, "Settings");
    await settings.getByText("Accept form submissions").click();
    await expect(settings.getByRole("checkbox", { name: "Accept form submissions" })).not.toBeChecked();
  });

  test("each box is named by its label, described by its description and error, and marked invalid", async ({ page }) => {
    await expect(preview(page, "Settings").getByRole("checkbox", { name: "Show in search results" })).toHaveAccessibleDescription(
      "Lets Google and Bing list the site's pages.",
    );
    const terms = preview(page, "Invalid and disabled").getByRole("checkbox", { name: "I agree to the Terms of Service" });
    await expect(terms).toHaveAccessibleDescription("Check this box to go on.");
    await expect(terms).toHaveAttribute("aria-invalid", "true");
    await expect(preview(page, "In a table").getByRole("checkbox", { name: "Select the submission from Omar Haddad" })).toBeChecked();
  });
});

test.describe("Checkbox select all", () => {
  let current: Page;
  test.beforeEach(async ({ page }) => {
    current = page;
  });

  test.describe("docs page", () => {
    test.beforeEach(({ page }) => open(page, "/checkbox"));
    selectAllChecks(async () => preview(current, "Select all"));
  });

  test.describe("Solid component", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/tests/harness/checkbox.html");
      await page.locator('[data-example="select-all"] input').first().waitFor();
    });
    selectAllChecks(async () => current.locator('[data-example="select-all"]'));
  });
});

test.describe("Checkbox look", () => {
  test("a box is 16px, rounded 4px, with the kit's focus ring around its corners", async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html?theme=classic&mode=light");
    const box = page.getByRole("checkbox", { name: "Accept form submissions" });
    const size = (await box.boundingBox())!;
    expect([size.width, size.height]).toEqual([16, 16]);
    await expect(box).toHaveCSS("border-radius", "4px");
    await page.getByRole("checkbox", { name: "Show in search results" }).focus();
    await page.keyboard.press("Tab");
    await expect(box).toBeFocused();
    await expect(box).toHaveCSS("outline-style", "solid");
    await expect(box).toHaveCSS("outline-width", "2px");
    await expect(box).toHaveCSS("outline-offset", "2px");
  });

  test("off is a well with a 3:1 edge, on and mixed take the accent fill, and invalid takes the danger edge", async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html?theme=classic&mode=light");
    const accentFill = await page.evaluate(() => {
      const probe = document.createElement("beautiful-probe");
      probe.style.background = "color-mix(in srgb, var(--color-accent-fill) var(--control-primary-opacity), transparent)";
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    const off = page.getByRole("checkbox", { name: "Ask for a password on the preview" });
    await expect(off).toHaveCSS("border-top-color", "rgb(113, 113, 122)");
    await expect(off).toHaveCSS("background-image", "none");
    const on = page.getByRole("checkbox", { name: "Accept form submissions" });
    await expect(on).toHaveCSS("background-color", accentFill);
    await expect(on).toHaveCSS("background-image", /^url\("data:image\/svg\+xml/);
    const all = page.locator('[data-example="select-all"]').getByRole("checkbox", { name: "All changed pages" });
    await expect(all).toHaveCSS("background-color", accentFill);
    // The dash, not the tick.
    expect(await all.evaluate((el) => getComputedStyle(el).backgroundImage)).not.toEqual(
      await on.evaluate((el) => getComputedStyle(el).backgroundImage),
    );
    await expect(page.getByRole("checkbox", { name: "I agree to the Terms of Service" }).first()).toHaveCSS(
      "border-top-color",
      "rgb(201, 31, 58)",
    );
  });

  test("an invalid box keeps its danger edge when it's on", async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html?theme=classic&mode=light");
    const terms = page.getByRole("checkbox", { name: "I agree to the Terms of Service" }).first();
    await terms.check();
    await terms.evaluate((el) => el.setAttribute("aria-invalid", "true"));
    await expect(terms).toHaveCSS("border-top-color", "rgb(201, 31, 58)");
  });

  test("a mixed box stays mixed when a press leaves the app's state as it was", async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html");
    const stuck = page.getByRole("checkbox", { name: "Stays mixed" });
    await stuck.click();
    await expect.poll(() => mixed(stuck)).toBe(true);
  });

  test("a disabled box fades with its label and description", async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html");
    const field = page.locator("beautiful-field", { has: page.getByRole("checkbox", { name: "Back up the site every day" }) });
    for (const part of ["input", "label", "p"]) await expect(field.locator(part)).toHaveCSS("opacity", "0.5");
  });

  test("a box sits on the first line of a label that wraps", async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html");
    const field = page.locator("beautiful-field", { has: page.getByRole("checkbox", { name: "Show in search results" }) });
    await field.evaluate((el) => ((el as HTMLElement).style.width = "120px"));
    const box = (await field.locator("input").boundingBox())!;
    const label = (await field.locator("label").boundingBox())!;
    const line = await field.locator("label").evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect(label.height).toBeGreaterThan(line * 1.5);
    expect(Math.abs(box.y + box.height / 2 - (label.y + line / 2))).toBeLessThanOrEqual(1);
  });

  test("forced colors give the browser's own box back", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/tests/harness/checkbox.html");
    await expect(page.getByRole("checkbox", { name: "Accept form submissions" })).toHaveCSS("appearance", "auto");
  });
});

test.describe("Checkbox on a touch screen", () => {
  test.use({ viewport: devices["Pixel 7"].viewport, hasTouch: true, isMobile: true });

  test("a box is 20px", async ({ page }) => {
    // Alone, so the box starts on a whole pixel and its size isn't rounded.
    await page.goto("/tests/harness/checkbox.html?example=settings");
    const size = (await page.getByRole("checkbox", { name: "Accept form submissions" }).boundingBox())!;
    expect([size.width, size.height]).toEqual([20, 20]);
  });
});

test.describe("Checkbox axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/checkbox", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the glass dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/checkbox", theme, mode);
        await section(page, "In a dialog").getByRole("button", { name: "Delete site" }).click();
        await expect(page.getByRole("dialog", { name: "Delete Spring launch?" })).toBeVisible();
        const results = await new AxeBuilder({ page }).include("#delete-site").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/checkbox.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A disabled box's label and description are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> input:disabled)")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Checkbox component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/checkbox.html");
    await page.locator("#send-form input").first().waitFor();
  });

  test("a form sends the boxes that are on, and holds back for a required one that's off", async ({ page }) => {
    const form = page.locator('[data-example="send"]');
    const terms = form.getByRole("checkbox", { name: "I agree to the Terms of Service" });
    await form.getByRole("button", { name: "Create site" }).click();
    await expect(page.locator("#sent")).toHaveText("");
    await expect(terms).toBeFocused();
    await expect(terms).toHaveAttribute("aria-invalid", "true");
    await expect(terms).toHaveAccessibleDescription("Check this box to go on.");
    await page.keyboard.press("Space");
    await expect(terms).not.toHaveAttribute("aria-invalid");
    await form.getByRole("button", { name: "Create site" }).click();
    await expect(page.locator("#sent")).toHaveText(JSON.stringify([["terms", "yes"], ["news", "on"]]));
  });

  test("a reset puts each box back and clears its error", async ({ page }) => {
    const form = page.locator('[data-example="send"]');
    const news = form.getByRole("checkbox", { name: "Send me product news" });
    await form.getByRole("button", { name: "Create site" }).click();
    await news.uncheck();
    await form.getByRole("button", { name: "Reset" }).click();
    await expect(news).toBeChecked();
    await expect(form.getByRole("checkbox", { name: "I agree to the Terms of Service" })).not.toHaveAttribute("aria-invalid");
  });

  test("indeterminate is a property, so the markup has no attribute for it", async ({ page }) => {
    const all = page.locator('[data-example="table"]').getByRole("checkbox", { name: "Select every submission" });
    expect(await mixed(all)).toBe(true);
    expect(await all.evaluate((el) => el.getAttributeNames().filter((name) => name.includes("indeterminate")))).toEqual([]);
  });
});
