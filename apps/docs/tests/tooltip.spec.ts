import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { accessible, withoutInterestInvokers } from "./interest.ts";
import { modes, open, themes } from "./settings.ts";

// From the APG tooltip pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
// and WCAG 1.4.13's dismissal (Escape). The tip is one the pointer passes through, chosen over 1.4.13's
// hoverable rule. On Chromium, which has interest invokers, the
// docs examples test what the browser does. The harness tests the Solid component, and wireTooltip
// in a page that has no interest invokers.

/** The control that points at the tip with this id. */
function control(page: Page, id: string) {
  return page.locator(`[interestfor="${id}"]`);
}

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("not rendered");
  return found;
}

/**
 * Records whether the next key's default was prevented, from a window listener, which runs after
 * the document's. Set up and awaited before the key is pressed, so the press can't come first.
 */
async function watchEscape(page: Page) {
  await page.evaluate(() => {
    const at = window as { prevented?: boolean };
    delete at.prevented;
    addEventListener("keydown", (event) => (at.prevented = event.defaultPrevented), { once: true });
  });
}

const escapePrevented = (page: Page) => page.evaluate(() => (window as { prevented?: boolean }).prevented);

/** The tip shows after the delay, not before. Shared by the native and the wired behavior. */
function behaves(start: (page: Page) => Promise<void>) {
  test.beforeEach(({ page }) => start(page));

  test("resting the pointer shows the tip after the delay, and leaving hides it", async ({ page }) => {
    const tip = page.locator("#tip-publish");
    // The page times it, from the pointer's arrival to the tip's opening: a wait in the test
    // stretches under load and can outlast the delay.
    await tip.evaluate((el) => {
      const times = {} as { over?: number; open?: number };
      (window as unknown as { tipTimes: typeof times }).tipTimes = times;
      el.previousElementSibling!.scrollIntoView({ block: "center" });
      el.previousElementSibling!.addEventListener("pointerover", () => (times.over ??= performance.now()));
      el.addEventListener("toggle", (event) => {
        if ((event as ToggleEvent).newState === "open") times.open ??= performance.now();
      });
    });
    await page.getByRole("button", { name: "Publish" }).hover();
    await expect(tip).toBeVisible();
    const { over, open } = await page.evaluate(() => (window as unknown as { tipTimes: { over?: number; open?: number } }).tipTimes);
    expect(over, "the pointer arrives on the control").toBeDefined();
    expect(open, "the tip opens").toBeDefined();
    // --tooltip-delay is 200ms. A few ms of timer slack, never an instant tip.
    expect(open! - over!).toBeGreaterThan(180);
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
  });

  test("passing over a control on the way somewhere else shows nothing", async ({ page }) => {
    // A delay longer than any pass over it can take, even on a busy machine, then the time it
    // would have taken and more.
    await page.addStyleTag({ content: "[interestfor] { --tooltip-delay: 1s; }" });
    const button = page.getByRole("button", { name: "Publish" });
    await button.hover();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1300);
    await expect(page.locator("#tip-publish")).toBeHidden();
  });

  test("while a tip shows, the next control's tip shows at once", async ({ page }) => {
    await page.getByRole("button", { name: "Publish" }).hover();
    await expect(page.locator("#tip-publish")).toBeVisible();
    await page.getByRole("button", { name: "Preview" }).hover();
    // Well under the 200ms a first tip waits.
    await page.waitForTimeout(60);
    expect(await page.locator("#tip-preview").evaluate((el) => el.matches(":popover-open"))).toBe(true);
    await expect(page.locator("#tip-publish")).toBeHidden();
  });

  test("the pointer passes through the tip to what's under it", async ({ page }) => {
    const tip = page.locator("#tip-publish");
    await page.getByRole("button", { name: "Publish" }).hover();
    await expect(tip).toBeVisible();
    const at = await box(tip);
    const middle = { x: at.x + at.width / 2, y: at.y + at.height / 2 };
    const under = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("beautiful-tooltip") ?? null, middle);
    expect(under).toBeNull();
    await page.mouse.move(middle.x, middle.y, { steps: 4 });
    await expect(tip).toBeHidden();
  });

  test("Tab to a control shows its tip after the delay, and focus stays on the control", async ({ page }) => {
    const preview = page.getByRole("button", { name: "Preview" });
    await page.getByRole("button", { name: "Publish" }).focus();
    await page.keyboard.press("Tab");
    await expect(preview).toBeFocused();
    await expect(page.locator("#tip-preview")).toBeVisible();
    await expect(preview).toBeFocused();
  });

  test("Escape hides the tip at once", async ({ page }) => {
    await page.getByRole("button", { name: "Publish" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#tip-preview")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#tip-preview")).toBeHidden();
    await expect(page.getByRole("button", { name: "Preview" })).toBeFocused();
  });

  test("Tab on to the next control moves the tip with it", async ({ page }) => {
    await page.getByRole("button", { name: "Publish" }).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator("#tip-publish")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator("#tip-preview")).toBeVisible();
    await expect(page.locator("#tip-publish")).toBeHidden();
  });
}

test.describe("Tooltip keyboard and pointer", () => {
  behaves((page) => open(page, "/tooltip"));
});

test.describe("Tooltip names and descriptions", () => {
  test.beforeEach(({ page }) => open(page, "/tooltip"));

  test("an icon button takes the tip as its name, without the shortcut", async ({ page }) => {
    expect(await accessible(page, '[interestfor="tip-undo"]')).toEqual({ name: "Undo", description: undefined });
    await expect(control(page, "tip-undo")).toHaveAttribute("aria-keyshortcuts", "Meta+Z");
  });

  test("a control with words takes the tip as its description", async ({ page }) => {
    expect(await accessible(page, '[interestfor="tip-publish"]')).toEqual({
      name: "Publish",
      description: "Puts your changes live on spring-launch.com",
    });
  });

  test("the tip is a tooltip, out of the tab order", async ({ page }) => {
    await expect(page.locator("#tip-undo")).toHaveAttribute("role", "tooltip");
    await control(page, "tip-copy").focus();
    await page.keyboard.press("Tab");
    await expect(control(page, "tip-delete")).toBeFocused();
  });
});

test.describe("Tooltip placement", () => {
  test.beforeEach(({ page }) => open(page, "/tooltip"));

  async function shown(page: Page, id: string) {
    await control(page, id).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await control(page, id).hover();
    await expect(page.locator(`#${id}`)).toBeVisible();
    return { button: await box(control(page, id)), tip: await box(page.locator(`#${id}`)) };
  }

  test("sits centered above its control by default, 0.5rem away", async ({ page }) => {
    const { button, tip } = await shown(page, "tip-above");
    expect(Math.round(button.y - (tip.y + tip.height))).toBe(8);
    expect(Math.abs(tip.x + tip.width / 2 - (button.x + button.width / 2))).toBeLessThan(1);
  });

  test("follows anchor: below, and beside", async ({ page }) => {
    let { button, tip } = await shown(page, "tip-below");
    expect(Math.round(tip.y - (button.y + button.height))).toBe(8);
    await page.mouse.move(0, 0);
    ({ button, tip } = await shown(page, "tip-right"));
    expect(Math.round(tip.x - (button.x + button.width))).toBe(8);
    expect(Math.abs(tip.y + tip.height / 2 - (button.y + button.height / 2))).toBeLessThan(1);
  });


  test("stays on a phone's screen, 1rem from its edges", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const id of ["tip-undo", "tip-publish", "tip-preview", "tip-stage-visits"]) {
      await control(page, id).evaluate((el) => el.scrollIntoView({ block: "center" }));
      await control(page, id).focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const tip = page.locator(`#${id}`);
      await expect(tip).toBeVisible();
      const at = await box(tip);
      expect(at.x, id).toBeGreaterThanOrEqual(16);
      expect(at.x + at.width, id).toBeLessThanOrEqual(390 - 16);
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("Tooltip axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, a tip showing, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/tooltip", theme, mode);
        await control(page, "tip-undo").hover();
        await expect(page.locator("#tip-undo")).toBeVisible();
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas, with a tip showing. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/tooltip.html?theme=${theme}&mode=${mode}`);
        // The harness's last control, so its tip sits over nothing but the canvas.
        await control(page, "tip-alone").hover();
        await expect(page.locator("#tip-alone")).toBeVisible();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#tip-alone").analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Tooltip component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/tooltip.html");
    await page.locator("[data-example]").first().waitFor({ state: "attached" });
  });

  test("adds the tip to a description the control already has", async ({ page }) => {
    await expect(control(page, "tip-extra")).toHaveAttribute("aria-describedby", "trial-note tip-extra");
  });

  test("flips below where there's no room above", async ({ page }) => {
    // The toolbar alone, at the very top of the page.
    await page.goto("/tests/harness/tooltip.html?example=toolbar");
    await control(page, "tip-undo").hover();
    const tip = page.locator("#tip-undo");
    await expect(tip).toBeVisible();
    const button = await box(control(page, "tip-undo"));
    expect(Math.round((await box(tip)).y - (button.y + button.height))).toBe(8);
  });

  test("the shortcut shows after the words, and stays out of the name", async ({ page }) => {
    await expect(page.locator("#tip-undo")).toHaveAttribute("data-shortcut", "⌘Z");
    const shown = await page.locator("#tip-undo").evaluate((el) => getComputedStyle(el, "::after").content);
    expect(shown).toContain("⌘Z");
  });

  test("a field, which interest invokers skip, still shows its tip on focus", async ({ page }) => {
    const field = page.getByRole("textbox", { name: "Site address" });
    await expect(field).toHaveAttribute("aria-describedby", "tip-field");
    await page.getByRole("button", { name: "Upgrade" }).focus();
    await page.keyboard.press("Tab");
    await expect(field).toBeFocused();
    await expect(page.locator("#tip-field")).toBeVisible();
  });

  test("a tip that focus scheduled still shows when the pointer leaves first", async ({ page }) => {
    const field = page.getByRole("textbox", { name: "Site address" });
    await field.hover();
    await page.getByRole("button", { name: "Upgrade" }).focus();
    await page.keyboard.press("Tab");
    await page.mouse.move(0, 0);
    await expect(page.locator("#tip-field")).toBeVisible();
  });

  test("leaves anchor's default out", async ({ page }) => {
    await expect(page.locator("#tip-above")).not.toHaveAttribute("data-anchor");
    await expect(page.locator("#tip-right")).toHaveAttribute("data-anchor", "right");
  });
});

test.describe("Tooltip without interest invokers", () => {
  behaves(async (page) => {
    await withoutInterestInvokers(page);
    await page.goto("/tests/harness/tooltip.html");
    await page.locator("#tip-publish").waitFor({ state: "attached" });
    await expect(page.locator("[interestfor]")).toHaveCount(0);
  });

  test("Escape hides only the tip, and a popover under it stays open", async ({ page }) => {
    await withoutInterestInvokers(page);
    await page.goto("/tests/harness/tooltip.html");
    await page.locator("#tip-publish").waitFor({ state: "attached" });
    await watchEscape(page);
    await page.getByRole("button", { name: "Publish" }).hover();
    await expect(page.locator("#tip-publish")).toBeVisible();
    await page.keyboard.press("Escape");
    expect(await escapePrevented(page)).toBe(true);
    await expect(page.locator("#tip-publish")).toBeHidden();
  });

  test("a tip the browser closes stops counting as shown", async ({ page }) => {
    await withoutInterestInvokers(page);
    await page.goto("/tests/harness/tooltip.html");
    await page.locator("#tip-publish").waitFor({ state: "attached" });
    await page.getByRole("button", { name: "Publish" }).hover();
    await expect(page.locator("#tip-publish")).toBeVisible();
    // As a light dismiss or an opening popover would.
    await page.locator("#tip-publish").evaluate((el: HTMLElement) => el.hidePopover());
    await watchEscape(page);
    await page.keyboard.press("Escape");
    expect(await escapePrevented(page)).toBe(false);
    // Nothing shows, so the next tip waits again.
    await page.mouse.move(0, 0);
    await page.getByRole("button", { name: "Preview" }).hover();
    await page.waitForTimeout(60);
    expect(await page.locator("#tip-preview").evaluate((el) => el.matches(":popover-open"))).toBe(false);
  });
});
