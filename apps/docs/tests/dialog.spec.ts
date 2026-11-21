import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG modal dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
// The examples are the Solid component, opened by commandfor buttons, on the docs page and on the
// harness. The harness's own blocks test what no example shows: returning focus when the opener is
// gone, and open and onClose.

/** The button that opens the dialog with this id. */
function opener(page: Page, id: string) {
  return page.locator(`[commandfor="${id}"][command="show-modal"]`);
}

/** Whether the page's document scrolled, while a dialog is open. */
async function pageScrolls(page: Page) {
  const before = await page.evaluate(() => document.scrollingElement!.scrollTop);
  await page.mouse.move(10, 10);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(100);
  return (await page.evaluate(() => document.scrollingElement!.scrollTop)) !== before;
}

test.describe("Dialog keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/dialog"));

  test("opening moves focus into the dialog, to the autofocus control when there is one", async ({ page }) => {
    await opener(page, "rename-site").click();
    await expect(page.locator("#rename-site")).toBeVisible();
    await expect(page.locator("#rename-site-name")).toBeFocused();
  });

  test("Tab and Shift+Tab stay in the dialog: the page behind is inert", async ({ page }) => {
    await opener(page, "publish").click();
    const dialog = page.locator("#publish");
    for (const key of ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      const inside = await page.evaluate(() => {
        const focused = document.activeElement;
        // Past the last control focus can rest on the browser's own UI, which leaves the body active.
        return focused === document.body || !!focused?.closest("#publish");
      });
      expect(inside, key).toBe(true);
    }
    await expect(dialog).toBeVisible();
  });

  test("Escape closes it and returns focus to the opener", async ({ page }) => {
    await opener(page, "publish").click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#publish")).toBeHidden();
    await expect(opener(page, "publish")).toBeFocused();
  });

  test("a click on the backdrop closes it, and a click on the panel doesn't", async ({ page }) => {
    await opener(page, "size-sm").click();
    const dialog = page.locator("#size-sm");
    await dialog.getByRole("heading").click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
  });

  test("submitting its form closes it with the submit button's value", async ({ page }) => {
    await opener(page, "rename-site").click();
    await page.keyboard.press("Enter");
    const dialog = page.locator("#rename-site");
    await expect(dialog).toBeHidden();
    expect(await dialog.evaluate((el: HTMLDialogElement) => el.returnValue)).toBe("rename");
  });

  test("it is announced as a dialog, named by its title and described by its description", async ({ page }) => {
    await opener(page, "publish").click();
    const dialog = page.getByRole("dialog", { name: "Publish 3 changes?" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription(/go live now/);
  });

  test("the page behind doesn't scroll, and the body does", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await opener(page, "changelog").click();
    const body = page.locator("#changelog beautiful-dialog-body");
    await expect(body).toBeVisible();
    expect(await pageScrolls(page)).toBe(false);
    const box = (await body.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    // The title and the actions stay in view.
    await expect(page.locator("#changelog-title")).toBeInViewport();
    await expect(page.locator("#changelog footer")).toBeInViewport();
  });
});

test.describe("Dialog axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/dialog", theme, mode);
        await opener(page, "rename-site").click();
        await expect(page.locator("#rename-site")).toBeVisible();
        const results = await new AxeBuilder({ page }).include("#rename-site").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/dialog.html?theme=${theme}&mode=${mode}`);
        await opener(page, "publish").click();
        await expect(page.locator("#publish")).toBeVisible();
        // Wait for the entrance to finish: axe reads a fading panel's colors mid-way.
        await page.waitForTimeout(400);
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#publish").analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Dialog component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/dialog.html");
    await page.locator("[data-example]").first().waitFor({ state: "attached" });
  });

  test("with no autofocus control, opening focuses the panel itself, not its first button", async ({ page }) => {
    await opener(page, "publish").click();
    await expect(page.locator("#publish")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#publish").getByRole("button", { name: "Not yet" })).toBeFocused();
  });

  test("with an autofocus control, opening focuses it", async ({ page }) => {
    await opener(page, "rename-site").click();
    await expect(page.locator("#rename-site-name")).toBeFocused();
  });

  test("open opens it, and onClose gets the closing button's value, or nothing", async ({ page }) => {
    const dialog = page.locator("#controlled");
    const log = page.locator("#log");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();
    await dialog.getByRole("button", { name: "Publish" }).click();
    await expect(dialog).toBeHidden();
    await expect(log).toHaveText("publish");

    // Escape gives "", not the earlier answer.
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(log).toHaveText("publish (none)");
  });

  test("setting open to false closes it and calls onClose", async ({ page }) => {
    const dialog = page.locator("#controlled");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await dialog.getByRole("button", { name: "Close from outside" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("#log")).toHaveText("(none)");
    await expect(page.getByRole("button", { name: "Open", exact: true })).toBeFocused();
  });

  test("when open is still true after onClose, it opens again", async ({ page }) => {
    const dialog = page.locator("#controlled");
    await page.getByRole("button", { name: "Refuse the next close" }).click();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#log")).toHaveText("(none)");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#log")).toHaveText("(none) (none)");
    await expect(dialog).toBeHidden();
  });

  test("when the opener has left the page, closing focuses the newest element still there", async ({ page }) => {
    await page.locator("#before").focus();
    await page.getByRole("button", { name: "Delete Spring launch" }).click();
    const dialog = page.locator("#deleted");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete Spring launch" })).toHaveCount(0);
    // Focus moving inside the dialog doesn't push the page's elements out of what it remembers.
    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#before")).toBeFocused();
  });

  test("names and describes itself only by the parts it has", async ({ page }) => {
    await expect(page.locator("#publish")).toHaveAttribute("aria-describedby", "publish-description");
    await expect(page.locator("#size-sm")).not.toHaveAttribute("aria-describedby");
    // A description that appears later is wired then.
    const deleted = page.locator("#deleted");
    await expect(deleted).not.toHaveAttribute("aria-describedby");
    await page.getByRole("button", { name: "Delete Summer sale" }).click();
    await expect(deleted).toHaveAttribute("aria-describedby", "deleted-description");
    await expect(page.getByRole("dialog", { name: "Deleted" })).toHaveAccessibleDescription("Summer sale is gone.");
  });

  test("a drag from the panel out to the backdrop doesn't close it", async ({ page }) => {
    await opener(page, "size-sm").click();
    const title = (await page.locator("#size-sm-title").boundingBox())!;
    await page.mouse.move(title.x + 4, title.y + title.height / 2);
    await page.mouse.down();
    await page.mouse.move(5, 5, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator("#size-sm")).toBeVisible();
  });
});
