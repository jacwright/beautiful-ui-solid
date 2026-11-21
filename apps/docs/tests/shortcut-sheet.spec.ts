import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Shortcut sheet: a Dialog (APG Dialog (Modal)) listing the keys reachable from where focus was,
// from the docs page's live example and the site's own ? key.

const sheet = (page: Page, name = "Keyboard shortcuts") => page.getByRole("dialog", { name });
const row = (page: Page, subject: string) => page.locator("beautiful-demo-page", { hasText: subject });
/** A row's keys button while keys are being changed, named by its action and what it holds. */
const keysButton = (page: Page, action: string) => sheet(page).getByRole("button", { name: new RegExp(`^${action}: `) });
/** What the sheet says it did, while keys are being changed. */
const said = (page: Page) => sheet(page).getByRole("status");
const message = (page: Page) => page.getByRole("status").first();
/** Opens the sheet from a message, so it lists the message's keys, and starts changing keys. */
async function changeKeys(page: Page) {
  await row(page, "Spring launch date").focus();
  await page.keyboard.press("?");
  await sheet(page).getByRole("button", { name: "Change keys" }).click();
}

/** The sheet's sections, as [heading, ["label keys", …]], in order. */
const sections = (page: Page) =>
  sheet(page).evaluate((dialog) => {
    const out: [string, string[]][] = [];
    for (const list of dialog.querySelectorAll("dl")) {
      const heading = list.previousElementSibling?.matches("h3") ? list.previousElementSibling.textContent! : "";
      const rows = [...list.querySelectorAll("dt")].map((dt) => `${dt.textContent} ${dt.nextElementSibling?.textContent}`);
      out.push([heading, rows]);
    }
    return out;
  });

test.describe("Shortcut sheet", () => {
  test.beforeEach(({ page }) => open(page, "/shortcut-sheet"));

  test("? on a message lists the message's keys, then the inbox's, then the site's, and closes back to the message", async ({ page }) => {
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("?");
    await expect(sheet(page)).toBeVisible();
    const found = await sections(page);
    expect(found.map(([heading]) => heading)).toEqual(["Message", "Inbox", "Docs"]);
    expect(found[0]![1]).toEqual(["Archive E", "Star S"]);
    expect(found[1]![1]).toEqual(["New message C", "Keyboard shortcuts ?"]);
    // The inbox took ?, so the site's own ? isn't listed again.
    expect(found[2]![1].some((each) => each.startsWith("Keyboard shortcuts"))).toBe(false);
    expect(found[2]![1].some((each) => each.startsWith("Search pages"))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(sheet(page)).toBeHidden();
    await expect(row(page, "Spring launch date")).toBeFocused();
  });

  test("the button opens it from itself: no message's keys", async ({ page }) => {
    await page.getByRole("button", { name: "Keyboard shortcuts", exact: true }).click();
    await expect(sheet(page)).toBeVisible();
    expect((await sections(page)).map(([heading]) => heading)).toEqual(["Inbox", "Docs"]);
    await sheet(page).getByRole("button", { name: "Close" }).click();
    await expect(sheet(page)).toBeHidden();
  });

  test("it's a wall: the inbox's keys don't run behind it", async ({ page }) => {
    await row(page, "Pricing page copy").focus();
    await page.keyboard.press("?");
    await page.keyboard.press("c");
    await page.keyboard.press("e");
    // The site's T, behind the inbox, doesn't flip the theme either.
    await page.keyboard.press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "glass");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("status").first()).toHaveText("Press ? here, or focus a message first and press it there.");
  });

  test("the site's ? opens the site's sheet from anywhere on a page, and a text box keeps ?", async ({ page }) => {
    await open(page, "/button");
    await page.locator("main h1").click();
    await page.keyboard.press("?");
    await expect(sheet(page)).toBeVisible();
    expect((await sections(page)).map(([heading]) => heading)).toEqual(["Docs"]);
    await page.keyboard.press("Escape");
    const search = page.getByRole("combobox", { name: "Search pages" }).first();
    await search.focus();
    await page.keyboard.press("?");
    await expect(search).toHaveValue("?");
    await expect(sheet(page)).toBeHidden();
  });

  test("single-key shortcuts turn off: the sheet drops them, they don't run, the site's buttons stop showing them, and it lasts", async ({ page }) => {
    await page.getByRole("button", { name: "Keyboard shortcuts", exact: true }).click();
    const single = sheet(page).getByRole("switch", { name: "Single-key shortcuts" });
    await expect(single).toBeChecked();
    await single.click();
    await expect(single).not.toBeChecked();
    // Every inbox key is a single key, so the inbox's section is gone; the site keeps ⌘K.
    const found = await sections(page);
    expect(found.map(([heading]) => heading), JSON.stringify(found)).toEqual(["Docs"]);
    expect(found[0]![1]).toEqual([expect.stringMatching(/^Command palette (⌘K|Ctrl\+K)$/)]);
    await page.keyboard.press("Escape");
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("e");
    await expect(message(page)).toHaveText("Press ? here, or focus a message first and press it there.");
    await expect(page.locator(".site-toggles kbd")).toHaveCount(0);
    await page.reload();
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("?");
    await expect(sheet(page)).toBeHidden();
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  });

  test("a new key for an action runs it, shows on the sheet, replaces its own, and lasts", async ({ page }) => {
    await changeKeys(page);
    await keysButton(page, "Archive").click();
    await expect(said(page)).toHaveText("Press the new keys for Archive. Esc cancels.");
    await page.keyboard.press("Alt+e");
    await expect(said(page)).toHaveText("Archive is now Alt+E.");
    // The row keeps its button, so focus stays on it.
    await expect(keysButton(page, "Archive")).toBeFocused();
    await expect(keysButton(page, "Archive")).toHaveAccessibleName("Archive: Alt+E");
    await sheet(page).getByRole("button", { name: "Done" }).click();
    await page.keyboard.press("Escape");
    await row(page, "Pricing page copy").focus();
    await page.keyboard.press("e");
    await expect(message(page)).toHaveText("Press ? here, or focus a message first and press it there.");
    await page.keyboard.press("Alt+e");
    await expect(message(page)).toHaveText("Archived “Pricing page copy”.");
    await page.reload();
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("?");
    expect((await sections(page))[0]![1]).toEqual(["Archive Alt+E", "Star S"]);
    // Reset puts its own back.
    await sheet(page).getByRole("button", { name: "Change keys" }).click();
    await sheet(page).getByRole("button", { name: "Reset Archive's keys" }).click();
    await expect(keysButton(page, "Archive")).toHaveAccessibleName("Archive: E");
  });

  test("keys another action has, or the browser keeps, are refused; Esc cancels without closing; Remove takes them off", async ({ page }) => {
    await changeKeys(page);
    await keysButton(page, "Star").click();
    await page.keyboard.press("e");
    await expect(said(page)).toHaveText("Archive already uses E. Press other keys, or Esc.");
    await page.keyboard.press("Control+w");
    await expect(said(page)).toHaveText("Ctrl+W is the browser's. Press other keys, or Esc.");
    await page.keyboard.press("Enter");
    await expect(said(page)).toHaveText("Enter, Space and Tab work the controls. Press other keys.");
    await page.keyboard.press("Escape");
    await expect(sheet(page)).toBeVisible();
    await expect(said(page)).toHaveText("Nothing changed.");
    await expect(keysButton(page, "Star")).toHaveAccessibleName("Star: S");
    await sheet(page).getByRole("button", { name: "Remove Star's keys" }).click();
    await expect(keysButton(page, "Star")).toHaveAccessibleName("Star: None");
    // Reset is refused once another action has taken its own keys.
    await keysButton(page, "Star").click();
    await page.keyboard.press("Alt+s");
    await keysButton(page, "Archive").click();
    await page.keyboard.press("s");
    await sheet(page).getByRole("button", { name: "Reset Star's keys" }).click();
    await expect(said(page)).toHaveText("Archive already uses S. Change those first.");
    await sheet(page).getByRole("button", { name: "Reset all" }).click();
    await expect(keysButton(page, "Star")).toHaveAccessibleName("Star: S");
    await expect(sheet(page).getByRole("button", { name: "Reset all" })).toHaveCount(0);
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`axe on the page and the open sheet, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/shortcut-sheet", theme, mode);
        await row(page, "Spring launch date").focus();
        await page.keyboard.press("?");
        await expect(sheet(page)).toBeVisible();
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        // And while the keys are being changed, waiting for a press.
        await sheet(page).getByRole("button", { name: "Change keys" }).click();
        await keysButton(page, "Archive").click();
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/shortcut-sheet.html?theme=${theme}&mode=${mode}`);
        await page.locator("beautiful-demo-page", { hasText: "Spring launch date" }).focus();
        await page.keyboard.press("?");
        await expect(page.locator("#inbox-shortcuts")).toBeVisible();
        // Its fade and rise in, done, so axe reads the colors it settles on.
        await page.locator("dialog[open]").evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
        const contrast = () => new AxeBuilder({ page }).withRules(["color-contrast"]).include("#inbox-shortcuts").analyze();
        expect((await contrast()).violations).toEqual([]);
        await page.locator("#inbox-shortcuts").getByRole("button", { name: "Change keys" }).click();
        await page.locator("#inbox-shortcuts").getByRole("button", { name: "Star: S" }).click();
        expect((await contrast()).violations).toEqual([]);
      });
    }
  }
});
