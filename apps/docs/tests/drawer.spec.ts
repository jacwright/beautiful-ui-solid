import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG modal dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
// A Drawer is a Dialog that enters from an edge, so the keys are Dialog's. The examples are the Solid
// component, so they test it along with what the browser and drawer.css do.

/** The button that opens the drawer with this id. */
function opener(page: Page, id: string) {
  return page.locator(`[commandfor="${id}"][command="show-modal"]`);
}

/** Opens a drawer and waits for its slide to end, so its box is where it rests. */
async function openDrawer(page: Page, id: string) {
  await opener(page, id).click();
  const drawer = page.locator(`#${id}`);
  await expect(drawer).toBeVisible();
  // A running transition computes the transform it has reached, so none means the slide is over.
  await expect.poll(() => drawer.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  return drawer;
}

/**
 * The drawer's box, measured in from each edge of the box it is fixed to: the viewport, less the
 * scrollbar gutter the docs page keeps (scrollbar-gutter: stable).
 */
async function placement(page: Page, id: string) {
  const box = (await page.locator(`#${id}`).boundingBox())!;
  const [width, height] = await page.evaluate(() => {
    const probe = document.createElement("beautiful-probe");
    probe.style.cssText = "position: fixed; inset: 0";
    document.body.append(probe);
    const { width, height } = probe.getBoundingClientRect();
    probe.remove();
    return [width, height];
  });
  return { left: box.x, top: box.y, right: width - box.x - box.width, bottom: height - box.y - box.height, width: box.width, height: box.height };
}

/** Whether the page's document scrolled, while a drawer is open. */
async function pageScrolls(page: Page) {
  const before = await page.evaluate(() => document.scrollingElement!.scrollTop);
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(100);
  return (await page.evaluate(() => document.scrollingElement!.scrollTop)) !== before;
}

test.describe("Drawer keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/drawer"));

  test("opening moves focus into the drawer", async ({ page }) => {
    await openDrawer(page, "site-settings");
    // With no autofocus control, the panel itself takes focus, as in Headless UI.
    await expect(page.locator("#site-settings")).toBeFocused();
  });

  test("Tab and Shift+Tab stay in the drawer: the page behind is inert", async ({ page }) => {
    await openDrawer(page, "site-settings");
    for (const key of ["Tab", "Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      const inside = await page.evaluate(() => {
        const focused = document.activeElement;
        // Past the last control focus can rest on the browser's own UI, which leaves the body active.
        return focused === document.body || !!focused?.closest("#site-settings");
      });
      expect(inside, key).toBe(true);
    }
  });

  test("Escape closes it and returns focus to the opener", async ({ page }) => {
    await openDrawer(page, "activity");
    await page.keyboard.press("Escape");
    await expect(page.locator("#activity")).toBeHidden();
    await expect(opener(page, "activity")).toBeFocused();
  });

  test("a click on the backdrop beside it closes it, and a click on the panel doesn't", async ({ page }) => {
    const drawer = await openDrawer(page, "activity");
    await drawer.getByRole("heading", { name: "Activity" }).click();
    await expect(drawer).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(drawer).toBeHidden();
  });

  test("submitting its form closes it with the submit button's value", async ({ page }) => {
    await openDrawer(page, "site-settings");
    await page.locator("#site-settings-name").focus();
    await page.keyboard.press("Enter");
    const drawer = page.locator("#site-settings");
    await expect(drawer).toBeHidden();
    expect(await drawer.evaluate((el: HTMLDialogElement) => el.returnValue)).toBe("save");
  });

  test("it is announced as a dialog, named by its title or aria-label, and described", async ({ page }) => {
    await openDrawer(page, "site-settings");
    const drawer = page.getByRole("dialog", { name: "Site settings" });
    await expect(drawer).toHaveAccessibleDescription("Changes go live on your next publish.");
    await page.keyboard.press("Escape");
    await openDrawer(page, "main-menu");
    await expect(page.getByRole("dialog", { name: "Main menu" })).toBeVisible();
  });

  test("the page behind doesn't scroll, and the body does, with the title in view", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await openDrawer(page, "activity");
    const body = page.locator("#activity beautiful-dialog-body");
    expect(await pageScrolls(page)).toBe(false);
    const box = (await body.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator("#activity-title")).toBeInViewport();
  });
});

test.describe("Drawer placement", () => {
  test.beforeEach(({ page }) => open(page, "/drawer"));

  test("each side floats 0.5rem in from its edge and the two beside it", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    const edges = {
      start: ["left", "top", "bottom"],
      end: ["right", "top", "bottom"],
      top: ["top", "left", "right"],
      bottom: ["bottom", "left", "right"],
    } as const;
    for (const [side, near] of Object.entries(edges)) {
      const id = `side-${side}`;
      await openDrawer(page, id);
      for (const edge of near) await expect.poll(async () => Math.round((await placement(page, id))[edge]), `${side} ${edge}`).toBe(8);
      const box = await placement(page, id);
      if (side === "start" || side === "end") expect(Math.round(box.width)).toBe(28 * 16);
      else expect(box.height).toBeLessThan(400);
      await page.keyboard.press("Escape");
      await expect(page.locator(`#${id}`)).toBeHidden();
    }
  });

  test("the actions sit at the bottom of a side drawer", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    const drawer = await openDrawer(page, "drawer-md");
    const footer = (await drawer.locator("footer").boundingBox())!;
    const panel = (await drawer.boundingBox())!;
    expect(panel.y + panel.height - (footer.y + footer.height)).toBeLessThan(48);
  });

  test("sizes are 20, 28 and 40rem wide", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    for (const [size, rem] of [["sm", 20], ["md", 28], ["lg", 40]] as const) {
      await openDrawer(page, `drawer-${size}`);
      expect(Math.round((await placement(page, `drawer-${size}`)).width)).toBe(rem * 16);
      await page.keyboard.press("Escape");
      await expect(page.locator(`#drawer-${size}`)).toBeHidden();
    }
  });

  test("on a phone a side drawer leaves 3rem of backdrop to tap, and the tap closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const drawer = await openDrawer(page, "site-settings");
    const box = await placement(page, "site-settings");
    expect(Math.round(box.left)).toBe(48);
    await page.mouse.click(20, 400);
    await expect(drawer).toBeHidden();
  });

  test("right to left, start is the right edge", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    await openDrawer(page, "side-start");
    await expect.poll(async () => Math.round((await placement(page, "side-start")).right)).toBe(8);
  });
});

test.describe("Drawer axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/drawer", theme, mode);
        for (const id of ["site-settings", "main-menu"]) {
          await openDrawer(page, id);
          const results = await new AxeBuilder({ page }).include(`#${id}`).analyze();
          expect(results.violations).toEqual([]);
          await page.keyboard.press("Escape");
        }
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/drawer.html?theme=${theme}&mode=${mode}`);
        // A drawer whose body doesn't scroll: axe can't judge text scrolled under the body's edge.
        await openDrawer(page, "site-settings");
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#site-settings").analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Drawer component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/drawer.html");
    await page.locator("[data-example]").first().waitFor({ state: "attached" });
  });

  test("with no autofocus control, opening focuses the drawer itself, not its first field", async ({ page }) => {
    await opener(page, "site-settings").click();
    await expect(page.locator("#site-settings")).toBeFocused();
  });

  test("open opens it from its side, and onClose gets the closing button's value, or nothing", async ({ page }) => {
    const drawer = page.locator("#filters");
    const log = page.locator("#log");
    await expect(drawer).toHaveAttribute("data-drawer", "start");
    await page.getByRole("button", { name: "Open filters" }).click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toBeFocused();
    await drawer.getByRole("button", { name: "Apply" }).click();
    await expect(drawer).toBeHidden();
    await expect(log).toHaveText("apply");

    await page.getByRole("button", { name: "Open filters" }).click();
    await drawer.getByRole("button", { name: "Close from outside" }).click();
    await expect(drawer).toBeHidden();
    await expect(log).toHaveText("apply (none)");
    await expect(page.getByRole("button", { name: "Open filters" })).toBeFocused();
  });
});
