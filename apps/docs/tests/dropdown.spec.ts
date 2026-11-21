import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { clickInPopover } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// From the APG menu button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
// The docs page's examples are the Solid component, so the keys are tested there. The harness tests
// what no example shows: open and onToggle, and that picking runs an item's onClick.
// Two choices are the kit's, not APG's: Tab walks the items, and an item may have a shortcut letter.

/** The button that opens the menu with this id. */
function trigger(page: Page, id: string) {
  return page.locator(`[commandfor="${id}"][command="toggle-popover"]`);
}

const menu = (page: Page, id: string) => page.locator(`#${id}`);
const item = (page: Page, id: string, name: string) => menu(page, id).getByRole("menuitem", { name });

/** The items lit now: those with a background. */
function lit(page: Page, id: string) {
  return menu(page, id)
    .locator('[role="menuitem"]')
    .evaluateAll((items) =>
      items
        .filter((el) => getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)")
        .map((el) =>
          [...el.childNodes]
            .filter((node) => !(node instanceof Element && node.matches("kbd, small, svg")))
            .map((node) => node.textContent)
            .join("")
            .trim(),
        ),
    );
}

/** Opens a menu from the keyboard, with Enter on its button, and waits for focus to move into it. */
async function openByKeys(page: Page, id: string, key = "Enter") {
  await trigger(page, id).focus();
  await page.keyboard.press(key);
  await expect(menu(page, id).locator(":focus")).toHaveCount(1);
}

test.describe("Dropdown keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/dropdown"));

  test("Enter, Space and ↓ open the menu on its first item, and ↑ on its last", async ({ page }) => {
    for (const key of ["Enter", "Space", "ArrowDown"]) {
      await openByKeys(page, "site-actions", key);
      await expect(item(page, "site-actions", "Rename")).toBeFocused();
      await page.keyboard.press("Escape");
    }
    await openByKeys(page, "site-actions", "ArrowUp");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
  });

  test("↓ and ↑ move and wrap, skipping a disabled item, and Home and End go to the ends", async ({ page }) => {
    await openByKeys(page, "site-actions");
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "site-actions", "Duplicate")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "site-actions", "Rename")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item(page, "site-actions", "Rename")).toBeFocused();
    await page.keyboard.press("End");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
  });

  test("a letter moves to the next item that starts with it, and letters typed together add up", async ({ page }) => {
    await openByKeys(page, "site-actions");
    await page.keyboard.press("d");
    await expect(item(page, "site-actions", "Duplicate")).toBeFocused();
    // The same letter again, however quickly, steps on to the next item it starts.
    await page.keyboard.press("d");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
    await page.waitForTimeout(600);
    await page.keyboard.press("m");
    await expect(item(page, "site-actions", "Move to folder")).toBeFocused();
    await page.waitForTimeout(600);
    await page.keyboard.press("Home");
    await page.keyboard.type("de");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
  });

  test("an item's shortcut letter picks it, closes the menu, and the page hears it", async ({ page }) => {
    await openByKeys(page, "launch-options");
    await page.keyboard.press("s");
    await expect(menu(page, "launch-options")).toBeHidden();
    await expect(page.locator("#dropdown-picked-text")).toHaveText("Share was selected.");
    await page.keyboard.press("Enter");
    await expect(trigger(page, "launch-options")).toBeFocused();
  });

  test("Enter on an item picks it, and Space on a link item follows it", async ({ page }) => {
    await openByKeys(page, "site-actions");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(menu(page, "site-actions")).toBeHidden();
    await expect(page.locator("#dropdown-picked-text")).toHaveText("Duplicate was selected.");
    await page.keyboard.press("Escape");
    await openByKeys(page, "row-actions");
    await page.keyboard.press("Space");
    await expect(page.locator("#dropdown-picked-text")).toHaveText("View site was selected.");
  });

  test("Escape closes the menu and returns focus to the button", async ({ page }) => {
    await openByKeys(page, "site-actions");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expect(menu(page, "site-actions")).toBeHidden();
    await expect(trigger(page, "site-actions")).toBeFocused();
  });

  test("Tab walks the items, and past the last one closes the menu as focus goes on", async ({ page }) => {
    await openByKeys(page, "site-actions", "Space");
    for (const name of ["Duplicate", "Move to folder", "Delete"]) {
      await page.keyboard.press("Tab");
      await expect(item(page, "site-actions", name)).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(menu(page, "site-actions")).toBeHidden();
    await expect(trigger(page, "site-actions")).not.toBeFocused();
  });

  test("Shift+Tab back before the button closes the menu", async ({ page }) => {
    await openByKeys(page, "site-actions");
    await page.keyboard.press("Shift+Tab");
    await expect(trigger(page, "site-actions")).toBeFocused();
    await expect(menu(page, "site-actions")).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await expect(menu(page, "site-actions")).toBeHidden();
  });

  test("screen readers hear a menu button, and a menu named by it with its items", async ({ page }) => {
    await expect(trigger(page, "site-actions")).toHaveAttribute("aria-haspopup", "menu");
    await openByKeys(page, "site-actions");
    await expect(page.getByRole("menu", { name: "Actions" })).toBeVisible();
    await expect(page.getByRole("menu", { name: "Actions" }).getByRole("menuitem")).toHaveCount(5);
    // An item's shortcut letter is announced with it.
    await expect(menu(page, "launch-options").getByRole("menuitem", { name: "Edit", includeHidden: true })).toHaveAttribute("aria-keyshortcuts", "E");
    // A section is a group named by its heading, and a description is read with its item's label.
    await openByKeys(page, "new-menu");
    await expect(page.getByRole("menu", { name: "New" }).getByRole("group", { name: "Pages" })).toHaveCount(1);
    await expect(page.getByRole("menuitem", { name: "Blank page Start from nothing.", exact: true })).toHaveCount(1);
  });
});

test.describe("Dropdown pointer", () => {
  test.beforeEach(({ page }) => open(page, "/dropdown"));

  test("a click opens the menu with focus on it and no item lit", async ({ page }) => {
    await trigger(page, "site-actions").click();
    await expect(menu(page, "site-actions")).toBeFocused();
    await expect.poll(() => lit(page, "site-actions")).toEqual([]);
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "site-actions", "Rename")).toBeFocused();
  });

  test("the pointer lights one item and moves focus to it, and leaving the menu lights none", async ({ page }) => {
    await trigger(page, "site-actions").click();
    await item(page, "site-actions", "Move to folder").hover();
    await expect(item(page, "site-actions", "Move to folder")).toBeFocused();
    await expect.poll(() => lit(page, "site-actions")).toEqual(["Move to folder"]);
    // The keys go on from the pointer's item, and the item under the pointer goes dark.
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "site-actions", "Delete")).toBeFocused();
    await expect.poll(() => lit(page, "site-actions")).toEqual(["Delete"]);
    await page.mouse.move(0, 0);
    await expect(menu(page, "site-actions")).toBeFocused();
    await expect.poll(() => lit(page, "site-actions")).toEqual([]);
  });

  test("a disabled item takes no light or focus", async ({ page }) => {
    await trigger(page, "site-actions").click();
    await item(page, "site-actions", "Unpublish").hover();
    await expect.poll(() => lit(page, "site-actions")).toEqual([]);
    await expect(item(page, "site-actions", "Unpublish")).not.toBeFocused();
  });

  test("Space on the menu itself doesn't scroll the page behind it", async ({ page }) => {
    await trigger(page, "site-actions").click();
    await expect(menu(page, "site-actions")).toBeFocused();
    const before = await page.evaluate(() => scrollY);
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBe(before);
  });

  test("a click on an item picks it and closes the menu", async ({ page }) => {
    await trigger(page, "site-actions").click();
    await clickInPopover(item(page, "site-actions", "Rename"));
    await expect(menu(page, "site-actions")).toBeHidden();
    await expect(page.locator("#dropdown-picked-text")).toHaveText("Rename was selected.");
  });

  test("a click outside closes the menu", async ({ page }) => {
    await trigger(page, "site-actions").click();
    await page.locator("h1").click();
    await expect(menu(page, "site-actions")).toBeHidden();
  });

  test("is at least 12rem wide, lined up under its button", async ({ page }) => {
    await trigger(page, "site-actions").click();
    // Measured once the opening animation, which scales it, has ended.
    await expect(menu(page, "site-actions")).toHaveCSS("transform", "none");
    const button = (await trigger(page, "site-actions").boundingBox())!;
    const panel = (await menu(page, "site-actions").boundingBox())!;
    expect(panel.width).toBeGreaterThanOrEqual(192);
    expect(Math.round(panel.x)).toBe(Math.round(button.x));
  });
});

test.describe("Dropdown axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/dropdown", theme, mode);
        for (const id of ["launch-options", "site-actions", "new-menu", "row-actions"]) {
          await openByKeys(page, id);
          const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
          expect(results.violations, id).toEqual([]);
          await page.keyboard.press("Escape");
          // Closed and done fading, so the next menu's scan doesn't catch this one's text mid-fade.
          await expect(menu(page, id)).toBeHidden();
        }
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas, with an item lit, on the menu at its foot that opens over nothing.
      // Glass is measured from pixels in glass.spec.ts.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/dropdown.html?theme=${theme}&mode=${mode}`);
        await openByKeys(page, "controlled");
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#controlled").analyze();
        expect(results.violations).toEqual([]);
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Dropdown component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/dropdown.html");
    await page.locator('[data-example="controlled"]').waitFor({ state: "attached" });
  });

  const log = (page: Page) => page.locator("#log");

  test("the keys work in the component, and picking runs the item's onClick", async ({ page }) => {
    await openByKeys(page, "controlled");
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "controlled", "Preview")).toBeFocused();
    await expect(menu(page, "controlled").getByRole("group", { name: "Changes" })).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(menu(page, "controlled")).toBeHidden();
    await expect(trigger(page, "controlled")).toBeFocused();
    await expect(log(page)).toHaveText("open preview closed");
  });

  test("a shortcut letter runs its item's onClick", async ({ page }) => {
    await openByKeys(page, "controlled");
    await page.keyboard.press("p");
    await expect(log(page)).toHaveText("open publish closed");
  });

  test("a disabled item's onClick never runs", async ({ page }) => {
    await trigger(page, "controlled").click();
    await item(page, "controlled", "Unpublish").click({ force: true });
    await expect(menu(page, "controlled")).toBeVisible();
    await expect(log(page)).toHaveText("open");
  });

  test("open opens it from the parent with focus on the menu, anchored to its button", async ({ page }) => {
    await page.getByRole("button", { name: "Open from outside" }).click();
    await expect(menu(page, "controlled")).toBeVisible();
    await expect(menu(page, "controlled")).toBeFocused();
    const button = (await trigger(page, "controlled").boundingBox())!;
    const panel = (await menu(page, "controlled").boundingBox())!;
    expect(Math.round(panel.x)).toBe(Math.round(button.x));
    expect(Math.round(panel.y - (button.y + button.height))).toBe(8);
  });

  test("closing it from the keyboard doesn't change where a later open puts focus", async ({ page }) => {
    await openByKeys(page, "controlled");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");
    await expect(menu(page, "controlled")).toBeHidden();
    await page.getByRole("button", { name: "Open from outside" }).click();
    await expect(menu(page, "controlled")).toBeFocused();
  });

  test("Tab past the last item closes it, and focus goes on", async ({ page }) => {
    await openByKeys(page, "controlled");
    await page.keyboard.press("End");
    await page.keyboard.press("Tab");
    await expect(menu(page, "controlled")).toBeHidden();
    await expect(page.getByRole("button", { name: "After" })).toBeFocused();
  });

  test("a caller's ref reaches the button and the menu, and anchor's default is left out", async ({ page }) => {
    await expect(trigger(page, "controlled")).toHaveAttribute("data-ref", "button");
    await expect(menu(page, "controlled")).toHaveAttribute("data-ref", "menu");
    await expect(menu(page, "controlled")).not.toHaveAttribute("data-anchor");
    await expect(menu(page, "row-actions")).toHaveAttribute("data-anchor", "bottom end");
  });
});
