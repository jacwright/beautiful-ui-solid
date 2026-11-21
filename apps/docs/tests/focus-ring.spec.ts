import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// The ring has no APG pattern: it is a picture of focus and never changes what Tab does.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const ring = (page: Page) => page.locator("beautiful-focus-ring");

/** Sets the glide's time and curve on the root, as a theme would. */
function glideFor(page: Page, time: string, ease = "linear") {
  return page.evaluate(
    ([time, ease]) => {
      document.documentElement.style.setProperty("--motion-focus", time!);
      document.documentElement.style.setProperty("--ease-in-out", ease!);
    },
    [time, ease],
  );
}

/** Focuses a control by keyboard: Tab onto it from the control before it, with no glide. */
async function tabOnto(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) => (element as HTMLElement).focus());
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(ring(page)).toBeHidden();
}

/** Where the ring is drawn: its edges in CSS pixels, from the style the script sets each frame. */
function ringBox(page: Page) {
  return ring(page).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, radius: getComputedStyle(element).borderTopLeftRadius };
  });
}

/** Where the native outline of a control is drawn: its box grown by the 2px offset and 2px width, snapped to pixels. */
function outlineBox(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left - 4),
      top: Math.round(rect.top - 4),
      right: Math.round(rect.right + 4),
      bottom: Math.round(rect.bottom + 4),
    };
  });
}

const link = '.example a[href="#focus-ring"]';
const field = '.example input[name="site-name"]';

test.describe("Focus ring glide", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/focus-ring");
    await section(page, "Across controls").scrollIntoViewIfNeeded();
  });

  test("glides from one control to the next on Tab, hiding the next one's outline until it lands", async ({ page }) => {
    await tabOnto(page, link);
    await glideFor(page, "4s");
    const from = await outlineBox(page, link);
    const to = await outlineBox(page, field);
    await page.keyboard.press("Tab");
    await expect(page.locator(field)).toBeFocused();
    await expect(ring(page)).toBeVisible();
    await expect(page.locator(field)).toHaveAttribute("data-focus-ring-gliding");
    await expect(page.locator(field)).toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
    await page.waitForTimeout(1000);
    const box = await ringBox(page);
    // Partway: below the link's ring and above the field's, and wider than the link's.
    expect(box.top).toBeGreaterThan(from.top);
    expect(box.top).toBeLessThan(to.top);
    expect(box.right - box.left).toBeGreaterThan(from.right - from.left);
    expect(box.right - box.left).toBeLessThan(to.right - to.left);
  });

  test("lands exactly on the native outline, then hands over to it", async ({ page }) => {
    await tabOnto(page, link);
    await page.keyboard.press("Tab");
    await expect(ring(page)).toBeHidden();
    await expect(page.locator(field)).not.toHaveAttribute("data-focus-ring-gliding");
    await expect(page.locator(field)).not.toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
    // The ring keeps the last frame's style while hidden. Show it to read where it landed.
    await ring(page).evaluate((element) => (element as HTMLElement).showPopover());
    const { radius, ...box } = await ringBox(page);
    expect(box).toEqual(await outlineBox(page, field));
    // The field's 8px corners, grown by the 4px of offset and width, as the browser draws the outline.
    expect(radius).toBe("12px");
  });

  test("turns toward the newest control when Tab comes again mid-glide", async ({ page }) => {
    await tabOnto(page, link);
    // Curves that hold the ring still while it's read, as a moving ring drifts between reads on a busy
    // machine: the first glide goes halfway in its first 5% and stays there, the second stays where
    // it starts until its end.
    await glideFor(page, "4s", "linear(0, 0.5 5%, 0.5)");
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);
    const before = await ringBox(page);
    await glideFor(page, "4s", "linear(0, 0 99%, 1)");
    await page.keyboard.press("Tab");
    await expect(page.locator('.example input[name="visibility"][value="anyone"]')).toBeFocused();
    // The field it left keeps no hidden outline, and the new glide starts where the ring was.
    await expect(page.locator(field)).not.toHaveAttribute("data-focus-ring-gliding");
    const after = await ringBox(page);
    expect(Math.abs(after.top - before.top)).toBeLessThan(12);
  });

  test("rounds a link's corners, so its ring is round", async ({ page }) => {
    await expect(page.locator(link)).toHaveCSS("border-radius", "3px");
    // A summary is Disclosure's (disclosure.css), rounded like a control, so only the link is checked.
    await tabOnto(page, field);
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(link)).toBeFocused();
    await expect(ring(page)).toBeHidden();
    await ring(page).evaluate((element) => (element as HTMLElement).showPopover());
    // 3px grown by the outline's 2px offset and 2px width.
    expect((await ringBox(page)).radius).toBe("7px");
  });

  test("flies over a box that hides its overflow, uncut", async ({ page }) => {
    const code = section(page, "Across controls").locator("summary").first();
    await tabOnto(page, '.example button[data-color="accent"]');
    await glideFor(page, "4s", "steps(1, jump-start)");
    await page.keyboard.press("Tab");
    await expect(code).toBeFocused();
    await expect(ring(page)).toBeVisible();
    await expect(ring(page)).toHaveCSS("clip-path", "inset(0px)");
    // The example clips with room for a ring, so the outline it hands over to is uncut too.
    await expect(section(page, "Across controls")).toHaveCSS("overflow-clip-margin", "4px");
  });

  test("fits a pill's huge radius to its height, as the browser does", async ({ page }) => {
    const save = '.example button[data-color="accent"]';
    await page.locator(save).evaluate((element) => ((element as HTMLElement).style.borderRadius = "9999px"));
    await tabOnto(page, save);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(ring(page)).toBeHidden();
    await ring(page).evaluate((element) => (element as HTMLElement).showPopover());
    const { radius, top, bottom } = await ringBox(page);
    const height = await page.locator(save).evaluate((element) => element.getBoundingClientRect().height);
    expect(parseFloat(radius)).toBeCloseTo(height / 2 + 4, 0);
    expect(bottom - top).toBeCloseTo(height + 8, 0);
  });

  test("doesn't glide for a click", async ({ page }) => {
    await tabOnto(page, link);
    await glideFor(page, "4s");
    await page.locator(field).click();
    await expect(page.locator(field)).toBeFocused();
    await expect(ring(page)).toBeHidden();
    await expect(page.locator(field)).not.toHaveAttribute("data-focus-ring-gliding");
  });

  test("jumps under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await tabOnto(page, link);
    await page.keyboard.press("Tab");
    await expect(page.locator(field)).toBeFocused();
    await expect(ring(page)).toBeHidden();
    await expect(page.locator(field)).not.toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
  });

  test("stops when focus goes nowhere", async ({ page }) => {
    await tabOnto(page, link);
    await glideFor(page, "4s");
    await page.keyboard.press("Tab");
    await expect(ring(page)).toBeVisible();
    await page.locator(field).evaluate((element) => (element as HTMLElement).blur());
    await expect(ring(page)).toBeHidden();
  });

  test("doesn't glide into a modal dialog or back out, and glides inside it above its backdrop", async ({ page }) => {
    const opener = section(page, "Into a dialog and back").getByRole("button", { name: "Notification settings" });
    await opener.scrollIntoViewIfNeeded();
    await tabOnto(page, '[commandfor="notify-settings"][command="show-modal"]');
    await glideFor(page, "4s");
    // Into the dialog the context changes, so the ring appears on the field with no glide.
    await page.keyboard.press("Enter");
    const email = page.locator('#notify-settings input[name="email"]');
    await expect(email).toBeFocused();
    await expect(ring(page)).toBeHidden();
    await expect(email).not.toHaveAttribute("data-focus-ring-gliding");
    // Inside it, Tab glides. The curve jumps to the end at once, so the ring sits on the next control for the whole glide.
    await glideFor(page, "1500ms", "steps(1, jump-start)");
    await page.keyboard.press("Tab");
    await expect(ring(page)).toBeVisible();
    // The ring is a popover shown after the dialog opened, so it draws above the dialog's panel.
    const edge = await ringBox(page);
    const clip = { x: edge.left, y: (edge.top + edge.bottom) / 2 - 4, width: 2, height: 8 };
    const shown = await page.screenshot({ clip });
    await ring(page).evaluate((element) => ((element as HTMLElement).style.borderColor = "transparent"));
    expect(shown.equals(await page.screenshot({ clip }))).toBe(false);
    await glideFor(page, "160ms", "cubic-bezier(0.45, 0, 0.2, 1)");
    await expect(ring(page)).toBeHidden();
    // Out of the dialog the context changes again: no glide back to the opener.
    await glideFor(page, "4s");
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await expect(ring(page)).toBeHidden();
    await expect(opener).not.toHaveAttribute("data-focus-ring-gliding");
  });

  test("is hidden from screen readers and never takes focus", async ({ page }) => {
    await tabOnto(page, link);
    await page.keyboard.press("Tab");
    await expect(ring(page)).toHaveAttribute("aria-hidden", "true");
    await expect(ring(page)).toHaveAttribute("popover", "manual");
    await expect(ring(page)).not.toHaveAttribute("tabindex");
  });
});

test.describe("Focus ring axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/focus-ring", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
