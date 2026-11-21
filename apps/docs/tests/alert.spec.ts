import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG alert dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
// Alert is a Dialog (dialog.spec.ts tests what they share). These test what differs: the role, the
// backdrop click that does nothing, focus on the least destructive action, the sm width, and the
// bottom card on a narrow screen. The docs examples write autofocus, as markup with no JS would;
// the harness's own blocks test the component without it.

/** The button that opens the alert with this id. */
function opener(page: Page, id: string) {
  return page.locator(`[commandfor="${id}"][command="show-modal"]`);
}

/** Waits for the entrance to finish, so a box or a color is read where it ends up. */
async function settled(page: Page, id: string) {
  await expect(page.locator(`#${id}`)).toBeVisible();
  await page.locator(`#${id}`).evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

test.describe("Alert keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/alert"));

  test("it is announced as an alert dialog, named by its title and described by its description", async ({ page }) => {
    await opener(page, "unpublish").click();
    const alert = page.getByRole("alertdialog", { name: "Unpublish this site?" });
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAccessibleDescription(/not-found page/);
  });

  test("opening focuses the least destructive action", async ({ page }) => {
    await opener(page, "unpublish").click();
    await expect(page.locator("#unpublish").getByRole("button", { name: "Cancel" })).toBeFocused();
  });

  test("Escape closes it with no answer and returns focus to the opener", async ({ page }) => {
    await opener(page, "unpublish").click();
    await page.keyboard.press("Escape");
    const alert = page.locator("#unpublish");
    await expect(alert).toBeHidden();
    expect(await alert.evaluate((el: HTMLDialogElement) => el.returnValue)).toBe("");
    await expect(opener(page, "unpublish")).toBeFocused();
  });

  test("a click on the backdrop does nothing", async ({ page }) => {
    await opener(page, "unpublish").click();
    await settled(page, "unpublish");
    await page.mouse.click(5, 5);
    await expect(page.locator("#unpublish")).toBeVisible();
  });

  test("Tab moves through the field and the actions, and stays in the alert", async ({ page }) => {
    await opener(page, "delete-site").click();
    for (const key of ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      const inside = await page.evaluate(
        () => document.activeElement === document.body || !!document.activeElement?.closest("#delete-site"),
      );
      expect(inside, key).toBe(true);
    }
  });

  test("the destructive action closes it with its value", async ({ page }) => {
    await opener(page, "unpublish").click();
    await page.locator("#unpublish").getByRole("button", { name: "Unpublish" }).click();
    const alert = page.locator("#unpublish");
    await expect(alert).toBeHidden();
    expect(await alert.evaluate((el: HTMLDialogElement) => el.returnValue)).toBe("unpublish");
  });

  test("it is 24rem wide by default", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await opener(page, "unpublish").click();
    await settled(page, "unpublish");
    const box = (await page.locator("#unpublish").boundingBox())!;
    expect(box.width).toBeCloseTo(24 * 16, 0);
  });

  test("on a narrow screen it is a card at the bottom, inset 0.5rem, with the actions stacked, Cancel nearest the thumb", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await opener(page, "unpublish").click();
    await settled(page, "unpublish");
    const box = (await page.locator("#unpublish").boundingBox())!;
    expect(box.x).toBeCloseTo(8, 0);
    // Dialog's scroll lock keeps desktop Chromium's scrollbar gutter (15px) at the right. A phone's
    // scrollbar overlays the page, so there the gap is 0.5rem on both sides.
    expect(box.width).toBeGreaterThanOrEqual(390 - 16 - 15 - 0.5);
    expect(box.width).toBeLessThanOrEqual(390 - 16 + 0.5);
    expect(box.y + box.height).toBeCloseTo(800 - 8, 0);
    const cancel = (await page.locator("#unpublish").getByRole("button", { name: "Cancel" }).boundingBox())!;
    const unpublish = (await page.locator("#unpublish").getByRole("button", { name: "Unpublish" }).boundingBox())!;
    expect(cancel.y).toBeGreaterThan(unpublish.y);
  });
});

test.describe("Alert axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/alert", theme, mode);
        await opener(page, "delete-site").click();
        await settled(page, "delete-site");
        const results = await new AxeBuilder({ page }).include("#delete-site").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/alert.html?theme=${theme}&mode=${mode}`);
        await opener(page, "unpublish").click();
        await settled(page, "unpublish");
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#unpublish").analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Alert component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/alert.html");
    await page.locator("[data-example]").first().waitFor({ state: "attached" });
  });

  test("with no autofocus, opening focuses the first action", async ({ page }) => {
    await opener(page, "archive").click();
    await expect(page.locator("#archive").getByRole("button", { name: "Cancel" })).toBeFocused();
  });

  test("a field with autofocus keeps it", async ({ page }) => {
    await opener(page, "rename-team").click();
    await expect(page.locator("#rename-team-name")).toBeFocused();
    await expect(page.locator("#rename-team footer [autofocus]")).toHaveCount(0);
  });

  test("an alert open from the start focuses its first action, and onClose gets the answer", async ({ page }) => {
    await page.goto("/tests/harness/alert.html?ask");
    const alert = page.locator("#leave");
    await expect(alert).toBeVisible();
    await expect(alert.getByRole("button", { name: "Stay" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(alert).toBeHidden();
    await expect(page.locator("#log")).toHaveText("(none)");
    await page.getByRole("button", { name: "Ask again" }).click();
    await alert.getByRole("button", { name: "Leave" }).click();
    await expect(page.locator("#log")).toHaveText("(none) leave");
  });

  test("a backdrop click does nothing, even where the browser lacks closedby", async ({ page }) => {
    await page.addInitScript(() => {
      delete (HTMLDialogElement.prototype as { closedBy?: string }).closedBy;
    });
    await page.goto("/tests/harness/alert.html");
    await opener(page, "unpublish").click();
    await settled(page, "unpublish");
    await page.mouse.click(5, 5);
    await expect(page.locator("#unpublish")).toBeVisible();
  });

  test("size still sets the width", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await opener(page, "rename-team").click();
    await settled(page, "rename-team");
    expect((await page.locator("#rename-team").boundingBox())!.width).toBeCloseTo(32 * 16, 0);
  });
});
