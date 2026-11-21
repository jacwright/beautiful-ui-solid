import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { clickInPopover } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// Context menu: the docs page's live examples are the Solid components, so the tests run there.
// Keys from APG's menu and menubar patterns (submenus); APG has no context menu pattern, so the
// right-click, long press and Shift escape follow desktop apps, as the spec says.

const menu = (page: Page) => page.locator("[data-actions]");
const row = (page: Page, name: string) => page.locator("beautiful-demo-page", { hasText: name });
const status = (page: Page) => page.getByRole("status");
const submenu = (page: Page) => menu(page).locator('[role="menu"]').first();

async function rightClick(page: Page, name: string) {
  const target = row(page, name).locator("strong");
  await target.scrollIntoViewIfNeeded();
  await target.click({ button: "right" });
  await expect(menu(page)).toBeVisible();
}

test.describe("Context menu", () => {
  test.beforeEach(({ page }) => open(page, "/context-menu"));

  test("a right-click opens the row's actions at the pointer, named for the row, with focus on the menu", async ({ page }) => {
    const target = row(page, "Pricing").locator("strong");
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!;
    await page.mouse.click(box.x + 10, box.y + 5, { button: "right" });
    await expect(menu(page)).toBeVisible();
    await expect(menu(page)).toHaveAttribute("aria-label", "Actions for Pricing");
    await expect(menu(page)).toBeFocused();
    const at = (await menu(page).boundingBox())!;
    expect(Math.abs(at.x - (box.x + 10))).toBeLessThan(2);
    expect(Math.abs(at.y - (box.y + 5))).toBeLessThan(2);
  });

  test("what's hidden and disabled follows the row: Publish only on a draft, no Delete for Home", async ({ page }) => {
    await rightClick(page, "Home");
    await expect(menu(page).getByRole("menuitem", { name: "Delete" })).toBeDisabled();
    await expect(menu(page).getByRole("menuitem", { name: "Publish", exact: true })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await rightClick(page, "Spring launch");
    await expect(menu(page).getByRole("menuitem", { name: "Publish", exact: true })).toBeVisible();
    await expect(menu(page).getByRole("menuitem", { name: "Delete" })).toBeEnabled();
  });

  test("picking an item closes the menu, then runs it for the row", async ({ page }) => {
    await rightClick(page, "About");
    await clickInPopover(menu(page).getByRole("menuitem", { name: /^Duplicate/ }));
    await expect(menu(page)).toBeHidden();
    await expect(status(page)).toHaveText("Duplicated About.");
  });

  test("a right-click on another row while the menu is open opens that row's menu", async ({ page }) => {
    await rightClick(page, "Pricing");
    await rightClick(page, "About");
    await expect(menu(page)).toHaveAttribute("aria-label", "Actions for About");
  });

  test("opening one … button's menu from another tells the first it closed", async ({ page }) => {
    const first = row(page, "Pricing").getByRole("button", { name: "Actions for Pricing" });
    const second = row(page, "About").getByRole("button", { name: "Actions for About" });
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("Shift+F10 and the menu key open it below the focused row, on its first item, and Escape returns focus", async ({ page }) => {
    for (const key of ["Shift+F10", "ContextMenu"]) {
      await row(page, "Pricing").focus();
      await page.keyboard.press(key);
      await expect(menu(page).getByRole("menuitem", { name: "Open" })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(menu(page)).toBeHidden();
      await expect(row(page, "Pricing")).toBeFocused();
    }
  });

  test("an action's keys run it for the focused row, and do nothing when it's disabled", async ({ page }) => {
    await row(page, "About").focus();
    await page.keyboard.press("F2");
    await expect(status(page)).toHaveText("Renaming About.");
    await page.keyboard.press("Delete");
    await expect(status(page)).toHaveText("Deleted About.");
    await row(page, "Home").focus();
    await page.keyboard.press("Delete");
    await expect(status(page)).toHaveText("Deleted About.");
  });

  test("the … button opens the same list below it, and a second click closes it", async ({ page }) => {
    const button = row(page, "Pricing").getByRole("button", { name: "Actions for Pricing" });
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(menu(page)).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(menu(page)).toHaveAttribute("aria-labelledby", (await button.getAttribute("id"))!);
    const [b, m] = [(await button.boundingBox())!, (await menu(page).boundingBox())!];
    expect(m.y).toBeGreaterThan(b.y + b.height - 1);
    expect(Math.abs(m.x + m.width - (b.x + b.width))).toBeLessThan(2);
    await button.click();
    await expect(menu(page)).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("Enter on the … button opens on the first item, and focus comes back to it", async ({ page }) => {
    const button = row(page, "About").getByRole("button", { name: "Actions for About" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(menu(page).getByRole("menuitem", { name: "Open" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
  });

  test("→ opens a submenu on its first item, ← and Escape close it back to its item", async ({ page }) => {
    await row(page, "Pricing").focus();
    await page.keyboard.press("Shift+F10");
    await expect(menu(page).getByRole("menuitem", { name: "Open" })).toBeFocused();
    const move = menu(page).getByRole("menuitem", { name: "Move to" });
    await move.focus();
    await expect(move).toHaveAttribute("aria-haspopup", "menu");
    await page.keyboard.press("ArrowRight");
    await expect(submenu(page).getByRole("menuitem", { name: "Marketing" })).toBeFocused();
    await expect(move).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await expect(submenu(page).getByRole("menuitem", { name: "Blog" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(submenu(page)).toBeHidden();
    await expect(move).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(submenu(page)).toBeHidden();
    await expect(menu(page)).toBeVisible();
    await expect(move).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(submenu(page).getByRole("menuitem", { name: "Marketing" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu(page)).toBeHidden();
    await expect(status(page)).toHaveText("Moved Pricing to Marketing.");
  });

  test("a submenu opens under a resting pointer and stays open as the pointer moves over its item and into it", async ({ page }) => {
    await rightClick(page, "Pricing");
    const move = menu(page).getByRole("menuitem", { name: "Move to" });
    const box = (await move.boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await expect(submenu(page)).toBeVisible();
    // It once opened and closed over and over as the pointer moved along the item.
    for (let x = 12; x < box.width - 4; x += 6) {
      await page.mouse.move(box.x + x, box.y + box.height / 2);
      await page.waitForTimeout(30);
      await expect(submenu(page)).toBeVisible();
    }
    await page.waitForTimeout(300);
    await expect(submenu(page)).toBeVisible();
    const blog = submenu(page).getByRole("menuitem", { name: "Blog" });
    await blog.hover();
    await expect(blog).toBeFocused();
    await move.hover();
    await page.waitForTimeout(300);
    await expect(submenu(page)).toBeVisible();
    await menu(page).getByRole("menuitem", { name: "Open" }).hover();
    await expect(submenu(page)).toBeHidden();
  });

  test("a checkbox item and a set of radio items show which is on, and picking one changes it", async ({ page }) => {
    const box = page.locator("textarea[data-demo-writing]");
    await box.focus();
    await page.keyboard.press("Shift+F10");
    const wrap = menu(page).getByRole("menuitemcheckbox", { name: "Wrap lines" });
    await expect(wrap).toHaveAttribute("aria-checked", "true");
    await clickInPopover(wrap);
    await expect(box).toHaveAttribute("wrap", "off");
    await expect(box).toBeFocused();
    await page.keyboard.press("Shift+F10");
    await expect(wrap).toHaveAttribute("aria-checked", "false");
    await expect(menu(page).getByRole("menuitem", { name: /^Undo/ })).toBeFocused();
    await menu(page).getByRole("menuitem", { name: "Text size" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(submenu(page).getByRole("menuitemradio", { name: "Medium" })).toHaveAttribute("aria-checked", "true");
    await clickInPopover(submenu(page).getByRole("menuitemradio", { name: "Large" }));
    await expect(box).toHaveAttribute("data-size", "large");
  });

  test("Cut and Copy are disabled with nothing selected", async ({ page }) => {
    const box = page.locator("textarea[data-demo-writing]");
    await box.click();
    await page.keyboard.press("End");
    await page.keyboard.press("Shift+F10");
    await expect(menu(page).getByRole("menuitem", { name: /^Cut/ })).toBeDisabled();
    await page.keyboard.press("Escape");
    await box.press("ControlOrMeta+a");
    await page.keyboard.press("Shift+F10");
    await expect(menu(page).getByRole("menuitem", { name: /^Cut/ })).toBeEnabled();
  });

  test("Shift with a right-click leaves the browser's own menu", async ({ page }) => {
    const target = row(page, "Pricing").locator("strong");
    await target.scrollIntoViewIfNeeded();
    const prevented = await target.evaluate((el) => {
      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, shiftKey: true, button: 2, clientX: 5, clientY: 5 });
      el.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(prevented).toBe(false);
    await expect(menu(page)).toBeHidden();
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`axe on the page and the open menu with a submenu, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/context-menu", theme, mode);
        await row(page, "Pricing").focus();
        await page.keyboard.press("Shift+F10");
        await expect(menu(page).getByRole("menuitem", { name: "Open" })).toBeFocused();
        await menu(page).getByRole("menuitem", { name: "Move to" }).focus();
        await page.keyboard.press("ArrowRight");
        await expect(submenu(page)).toBeVisible();
        // Contrast through glass is glass.spec.ts's to measure.
        const results = await new AxeBuilder({ page }).include("main").include("[data-actions]").disableRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
