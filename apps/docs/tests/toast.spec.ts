import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// APG has no toast pattern. These follow its guidance on live regions and on not moving focus,
// WCAG 2.2.1 (time that can be stopped) and 4.1.3 (status messages), and the keys the spec on the
// docs site's Toast page chose: F8 reaches the newest toast, Escape dismisses it. The harness has
// the Solid Toaster, and tests send toasts to it through window.toast.

const stack = (page: Page) => page.locator("#stack");
/** The toasts on screen, not those on their way out. */
const shown = (page: Page) => stack(page).locator("beautiful-toast:not([data-leaving])");
const toast = (page: Page, name: string) => shown(page).filter({ hasText: name });
/** The messages of the toasts on screen, oldest first. */
const messages = (page: Page) => shown(page).locator("p:first-of-type");

async function send(page: Page, options: string | Record<string, unknown>) {
  await page.evaluate((opts) => {
    window.toast(opts as Parameters<typeof window.toast>[0]);
  }, options);
}

const harness = (page: Page) => page.goto("/tests/harness/toast.html");

test.describe("Toast", () => {
  test.beforeEach(({ page }) => harness(page));

  test("shows in a polite live region in the top layer, and leaves focus where it is", async ({ page }) => {
    await page.locator("#before").focus();
    await send(page, "Link copied");
    await expect(toast(page, "Link copied")).toBeVisible();
    await expect(page.locator("#before")).toBeFocused();
    await expect(stack(page)).toHaveAttribute("aria-live", "polite");
    await expect(stack(page)).toHaveAttribute("aria-label", "Notifications");
    expect(await stack(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
    // The default placement is left out of the markup.
    await expect(stack(page)).not.toHaveAttribute("data-placement");
  });

  test("F8 moves focus to the newest toast, Escape dismisses it, and focus goes back", async ({ page }) => {
    await page.locator("#before").focus();
    await send(page, "Changes saved");
    await send(page, "Link copied");
    await page.keyboard.press("F8");
    await expect(toast(page, "Link copied")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(toast(page, "Link copied")).toHaveCount(0);
    // The next toast takes focus, then the last Escape sends focus back to where it was.
    await expect(toast(page, "Changes saved")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(shown(page)).toHaveCount(0);
    await expect(page.locator("#before")).toBeFocused();
  });

  test("F8 does nothing with no toast on screen", async ({ page }) => {
    await page.locator("#before").focus();
    await page.keyboard.press("F8");
    await expect(page.locator("#before")).toBeFocused();
  });

  test("Tab goes through the action, then the close button, and Shift+Tab on to older toasts", async ({ page }) => {
    await send(page, "Changes saved");
    await send(page, { message: "Spring launch was deleted", action: { label: "Undo" } });
    await page.keyboard.press("F8");
    const newest = toast(page, "Spring launch was deleted");
    await page.keyboard.press("Tab");
    await expect(newest.getByRole("button", { name: "Undo" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(newest.getByRole("button", { name: "Dismiss" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(toast(page, "Changes saved").getByRole("button", { name: "Dismiss" })).toBeFocused();
  });

  test("the action runs its onClick and dismisses the toast, and Dismiss dismisses it", async ({ page }) => {
    await page.evaluate(() =>
      window.toast({ message: "Spring launch was deleted", action: { label: "Undo", onClick: () => window.log.push("undo") } }),
    );
    await toast(page, "Spring launch was deleted").getByRole("button", { name: "Undo" }).click();
    expect(await page.evaluate(() => window.log)).toEqual(["undo"]);
    await expect(shown(page)).toHaveCount(0);
    await send(page, "Link copied");
    await toast(page, "Link copied").getByRole("button", { name: "Dismiss" }).click();
    await expect(shown(page)).toHaveCount(0);
    // Gone from the page once it has faded out.
    await expect(stack(page).locator("beautiful-toast")).toHaveCount(0);
  });

  test("at most three show, and a fourth sends the oldest away", async ({ page }) => {
    for (const message of ["One", "Two", "Three", "Four"]) await send(page, message);
    await expect(messages(page)).toHaveText(["Two", "Three", "Four"]);
  });

  test("a danger toast stays when a fourth comes, while another can go", async ({ page }) => {
    await send(page, { message: "Couldn't publish", tone: "danger" });
    for (const message of ["One", "Two", "Three"]) await send(page, message);
    await expect(messages(page)).toHaveText(["Couldn't publish", "Two", "Three"]);
  });

  test("dismissing with the mouse doesn't put focus on another toast", async ({ page }) => {
    await send(page, "Changes saved");
    await send(page, "Link copied");
    await toast(page, "Link copied").getByRole("button", { name: "Dismiss" }).click();
    await expect(shown(page)).toHaveCount(1);
    expect(await page.evaluate(() => document.activeElement?.closest("beautiful-toaster") ?? null)).toBeNull();
  });

  test("update changes what it says and its tone", async ({ page }) => {
    await page.evaluate(() => {
      const publishing = window.toast({ message: "Publishing…", duration: Number.POSITIVE_INFINITY });
      publishing.update({ message: "Spring launch is live", tone: "success" });
    });
    await expect(messages(page)).toHaveText(["Spring launch is live"]);
    await expect(shown(page)).toHaveAttribute("data-tone", "success");
  });

  test("inside a modal dialog, the stack moves in, its toasts can be clicked, and it goes back after", async ({ page }) => {
    await page.locator("#open-dialog").click();
    await page.locator("#copy").click();
    await expect(page.locator("#share #stack")).toHaveCount(1);
    // Not inert: a click reaches it.
    await toast(page, "Link copied").getByRole("button", { name: "Dismiss" }).click();
    await expect(shown(page)).toHaveCount(0);
    await page.locator("#copy").click();
    await page.keyboard.press("F8");
    await page.keyboard.press("Escape");
    await expect(shown(page)).toHaveCount(0);
    // Escape dismissed the toast, not the dialog.
    await expect(page.locator("#share")).toHaveJSProperty("open", true);
    await expect(page.locator("#copy")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#share")).toHaveJSProperty("open", false);
    await expect(page.locator("#share #stack")).toHaveCount(0);
    expect(await stack(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
  });

  test("a modal that opens while a toast shows takes the stack in", async ({ page }) => {
    await send(page, { message: "Couldn't publish", tone: "danger" });
    await page.locator("#open-dialog").click();
    await expect(page.locator("#share #stack")).toHaveCount(1);
    await toast(page, "Couldn't publish").getByRole("button", { name: "Dismiss" }).click();
    await expect(shown(page)).toHaveCount(0);
  });

  test("toasts sent in one go as the stack moves into a modal keep their order, and one dismissed at once goes", async ({ page }) => {
    await page.locator("#open-dialog").click();
    await page.evaluate(() => {
      window.toast("Gone").dismiss();
      for (const message of ["One", "Two", "Three", "Four"]) window.toast(message);
    });
    await expect(messages(page)).toHaveText(["Two", "Three", "Four"]);
    await expect(stack(page).locator("beautiful-toast")).toHaveCount(3);
  });

  test("update keeps focus in the toast when it was on one of its buttons", async ({ page }) => {
    await page.evaluate(() => {
      const shown = window.toast({ message: "Publishing…", action: { label: "Cancel" }, duration: Number.POSITIVE_INFINITY });
      (window as unknown as { shown: typeof shown }).shown = shown;
    });
    await page.keyboard.press("F8");
    await page.keyboard.press("Tab");
    await page.evaluate(() =>
      (window as unknown as { shown: { update(o: object): void } }).shown.update({ message: "Spring launch is live", action: { label: "View" } }),
    );
    await expect(toast(page, "Spring launch is live")).toBeFocused();
  });

  test("an action that throws still dismisses its toast", async ({ page }) => {
    await page.evaluate(() =>
      window.toast({
        message: "Spring launch was deleted",
        action: {
          label: "Undo",
          onClick: () => {
            throw new Error("offline");
          },
        },
      }),
    );
    page.on("pageerror", () => {});
    await toast(page, "Spring launch was deleted").getByRole("button", { name: "Undo" }).click();
    await expect(shown(page)).toHaveCount(0);
  });
});

test.describe("Toast timing", () => {
  test.beforeEach(async ({ page }) => {
    // Time stands still until a test runs it on.
    await page.clock.install({ time: new Date("2026-11-03T12:00:00Z") });
    await harness(page);
    await page.clock.pauseAt(new Date("2026-11-03T12:00:05Z"));
  });

  test("a toast leaves after 5s, 8s with an action, and a danger toast stays", async ({ page }) => {
    await send(page, "Link copied");
    await send(page, { message: "Spring launch was deleted", action: { label: "Undo" } });
    await send(page, { message: "Couldn't publish", tone: "danger" });
    await page.clock.runFor(4900);
    await expect(shown(page)).toHaveCount(3);
    await page.clock.runFor(200);
    await expect(messages(page)).toHaveText(["Spring launch was deleted", "Couldn't publish"]);
    await page.clock.runFor(3000);
    await expect(messages(page)).toHaveText(["Couldn't publish"]);
    await page.clock.runFor(60_000);
    await expect(messages(page)).toHaveText(["Couldn't publish"]);
  });

  test("time stops while the pointer is over the stack, and while focus is in it", async ({ page }) => {
    await send(page, "Link copied");
    await toast(page, "Link copied").hover();
    await page.clock.runFor(10_000);
    await expect(shown(page)).toHaveCount(1);
    await page.mouse.move(0, 0);
    await page.keyboard.press("F8");
    await page.clock.runFor(10_000);
    await expect(shown(page)).toHaveCount(1);
    await page.locator("#before").focus();
    await page.clock.runFor(5100);
    await expect(shown(page)).toHaveCount(0);
  });
});

test.describe("Toast swipe", () => {
  test.use({ hasTouch: true });

  async function swipe(page: Page, name: string, dx: number) {
    const box = (await toast(page, name).boundingBox())!;
    const y = box.y + box.height / 2;
    const x = box.x + box.width / 3;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 5; step++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + (dx * step) / 5, y }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }

  test("a long swipe sideways dismisses a toast, and a short one springs it back", async ({ page }) => {
    await harness(page);
    await send(page, { message: "Link copied", duration: Number.POSITIVE_INFINITY });
    await expect(toast(page, "Link copied")).toBeVisible();
    await swipe(page, "Link copied", 20);
    await expect(shown(page)).toHaveCount(1);
    await expect(toast(page, "Link copied")).not.toHaveAttribute("data-swiping");
    await swipe(page, "Link copied", 220);
    await expect(shown(page)).toHaveCount(0);
  });
});

test.describe("Toast axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, and toasts in the corner, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/toast", theme, mode);
        const examples = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(examples.violations).toEqual([]);
        await page.getByRole("button", { name: "Delete site" }).click();
        await page.getByRole("button", { name: "Fail to publish" }).click();
        await expect(page.locator("beautiful-toaster[popover] beautiful-toast")).toHaveCount(2);
        // Done entering, so axe sees them at rest.
        await page.waitForTimeout(500);
        const corner = await new AxeBuilder({ page }).include("beautiful-toaster[popover]").analyze();
        expect(corner.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas. Glass is measured from pixels in glass.spec.ts.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/toast.html?theme=${theme}&mode=${mode}`);
        await page.locator('[data-example="tones"] beautiful-toast').first().waitFor();
        await page.waitForTimeout(500);
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include('[data-example="tones"]').analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test("the docs page's placement picker moves the stack", async ({ page }) => {
  await open(page, "/toast");
  await page.getByLabel("Placement").selectOption("top");
  await expect(page.locator("beautiful-toaster[popover]")).toHaveAttribute("data-placement", "top");
});
