import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// No APG pattern covers chips. A group is an APG list, its × is an APG button, and the removal keys
// are the mail apps': Delete and Backspace remove, and focus moves on to the next chip.

/** The live preview of the docs example with this title. */
function example(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) }).locator("beautiful-example-preview");
}

async function harness(page: Page) {
  await page.goto("/tests/harness/chip.html");
  await page.locator('[data-example="live"]').waitFor();
  return page.locator('[data-example="live"]');
}

test.describe("Chip keyboard and semantics", () => {
  test("a group is a named list of chips, and each × is named for its chip", async ({ page }) => {
    await open(page, "/chip");
    const tags = example(page, "Tags").getByRole("list", { name: "Tags" });
    await expect(tags.getByRole("listitem")).toHaveCount(4);
    await expect(tags.getByRole("listitem").first()).toHaveAccessibleName("");
    await expect(tags.getByRole("button")).toHaveCount(4);
    await expect(tags.getByRole("button", { name: "Remove Spring sale", exact: true })).toBeVisible();
    // An icon adds nothing to the name.
    await expect(example(page, "Filters with icons").getByRole("button", { name: "Remove Last 30 days", exact: true })).toBeVisible();
  });

  test("Tab moves from × to ×, and skips a chip without one", async ({ page }) => {
    await open(page, "/chip");
    const tags = example(page, "Tags");
    await tags.getByRole("button", { name: "Remove Landing page" }).focus();
    await page.keyboard.press("Tab");
    await expect(tags.getByRole("button", { name: "Remove Spring sale" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(tags.getByRole("button", { name: "Remove Landing page" })).toBeFocused();
    // The colors example has no × at all: from the Markup toggle before it, Tab passes it by to its Code toggle.
    const section = (title: string) => page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
    await section("Filters with icons").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section("Every color").locator("summary").first()).toBeFocused();
  });

  for (const key of ["Enter", "Space", "Delete", "Backspace"]) {
    test(`${key} removes the chip, and focus moves to the next ×`, async ({ page }) => {
      const live = await harness(page);
      await live.getByRole("button", { name: "Remove Spring sale" }).focus();
      await page.keyboard.press(key);
      await expect(live.getByRole("listitem")).toHaveText(["Landing page", "Newsletter", "Draft copy"]);
      await expect(live.getByRole("button", { name: "Remove Newsletter" })).toBeFocused();
    });
  }

  test("removing the last chip moves focus to the one before, and the only chip to the group", async ({ page }) => {
    const live = await harness(page);
    await live.getByRole("button", { name: "Remove Draft copy" }).focus();
    await page.keyboard.press("Delete");
    await expect(live.getByRole("button", { name: "Remove Newsletter" })).toBeFocused();
    for (let left = 3; left > 0; left--) await page.keyboard.press("Backspace");
    await expect(live.getByRole("listitem")).toHaveCount(0);
    const group = live.getByRole("list", { name: "Live tags" });
    await expect(group).toBeFocused();
    // The group takes focus only while it holds it: Tab goes on from it, and it is never a stop.
    await page.keyboard.press("Tab");
    await expect(live.getByRole("button", { name: "Reset" })).toBeFocused();
    await expect(group).not.toHaveAttribute("tabindex");
  });

  test("a click removes the chip too", async ({ page }) => {
    const live = await harness(page);
    await live.getByRole("button", { name: "Remove Landing page" }).click();
    await expect(live.getByRole("listitem")).toHaveText(["Spring sale", "Newsletter", "Draft copy"]);
    await expect(live.getByRole("button", { name: "Remove Spring sale" })).toBeFocused();
  });

  test("a chip removed after a request still hands focus to the next ×", async ({ page }) => {
    await page.goto("/tests/harness/chip.html");
    const later = page.locator('[data-example="later"]');
    await later.getByRole("button", { name: "Remove Ana" }).focus();
    await page.keyboard.press("Delete");
    await expect(later.getByRole("listitem")).toHaveText(["Sam", "Lee"]);
    await expect(later.getByRole("button", { name: "Remove Sam" })).toBeFocused();
  });

  test("an app that rebuilds every chip still lands on the next ×", async ({ page }) => {
    await page.goto("/tests/harness/chip.html");
    const rebuilt = page.locator('[data-example="rebuilt"]');
    await rebuilt.getByRole("button", { name: "Remove Spring sale" }).focus();
    await page.keyboard.press("Delete");
    await expect(rebuilt.getByRole("listitem")).toHaveText(["Landing page", "Newsletter", "Draft copy"]);
    await expect(rebuilt.getByRole("button", { name: "Remove Newsletter" })).toBeFocused();
  });

  test("a held Delete removes one chip, and a modifier removes none", async ({ page }) => {
    const live = await harness(page);
    await live.getByRole("button", { name: "Remove Landing page" }).focus();
    await page.keyboard.press("Control+Backspace");
    await page.keyboard.press("Shift+Delete");
    await expect(live.getByRole("listitem")).toHaveCount(4);
    // A key held down sends repeats after the first press. Only the first removes.
    await page.keyboard.down("Delete");
    await expect(live.getByRole("button", { name: "Remove Spring sale" })).toBeFocused();
    await live.getByRole("button", { name: "Remove Spring sale" }).evaluate((button) => {
      for (let i = 0; i < 5; i++) button.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", repeat: true, bubbles: true }));
    });
    await page.keyboard.up("Delete");
    await expect(live.getByRole("listitem")).toHaveText(["Spring sale", "Newsletter", "Draft copy"]);
  });

  test("the ×'s name takes the words inside an element child", async ({ page }) => {
    await page.goto("/tests/harness/chip.html");
    await expect(page.locator('[data-example="element"]').getByRole("button")).toHaveAccessibleName("Remove Ana Ruiz (owner)");
  });

  test("a chip the app keeps keeps its focus", async ({ page }) => {
    await page.goto("/tests/harness/chip.html");
    const chip = page.locator("#kept-chip");
    const remove = chip.getByRole("button", { name: "Remove filter Archived", exact: true });
    await remove.focus();
    await page.keyboard.press("Delete");
    await expect(chip).toHaveAttribute("data-removes", "1");
    await expect(remove).toBeFocused();
  });

  test("a chip outside a group has no role, and without onRemove no ×", async ({ page }) => {
    await page.goto("/tests/harness/chip.html");
    const alone = page.locator("#alone");
    await expect(alone).not.toHaveAttribute("role");
    await expect(alone.locator("button")).toHaveCount(0);
  });

  test("the × has a target at least 24px square", async ({ page }) => {
    await open(page, "/chip");
    const remove = example(page, "Tags").getByRole("button").first();
    const target = await remove.evaluate((button) => {
      const after = getComputedStyle(button, "::after");
      const box = button.getBoundingClientRect();
      const grow = -parseFloat(after.top);
      return { width: box.width + 2 * grow, height: box.height + 2 * grow };
    });
    expect(target.width).toBeGreaterThanOrEqual(24);
    expect(target.height).toBeGreaterThanOrEqual(24);
  });

  test("a long label wraps inside its chip, and the page doesn't scroll sideways", async ({ page }) => {
    await open(page, "/chip");
    await page.setViewportSize({ width: 320, height: 800 });
    const chip = example(page, "Tags").locator("beautiful-chip").first();
    const wrapped = await chip.evaluate((el) => {
      el.firstChild!.textContent = "A label far too long to fit on one line of a phone screen";
      const box = el.getBoundingClientRect();
      return { height: box.height, right: box.right, chip: parseFloat(getComputedStyle(el).minHeight) };
    });
    expect(wrapped.height).toBeGreaterThan(wrapped.chip);
    expect(wrapped.right).toBeLessThanOrEqual(320);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Chip axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/chip", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // The docs page's gradient leaves axe unable to judge contrast, so it is checked on the
      // harness's plain canvas. Glass is measured from pixels in glass.spec.ts.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/chip.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});
