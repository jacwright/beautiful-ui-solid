import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Shortcuts: the docs page's live examples are the Solid components, so the tests run there. APG
// has no pattern for an app's shortcuts; the scopes, walls and text box rules are the spec's.

const examples = { "shortcuts/lead": 0, "shortcuts/dialog": 1 };
const status = (page: Page, example: keyof typeof examples) => page.locator("section.example").nth(examples[example]).getByRole("status");
const row = (page: Page, subject: string) => page.locator("beautiful-demo-page", { hasText: subject });
const reply = (page: Page) => page.getByRole("textbox", { name: "Reply" });

test.describe("Shortcuts", () => {
  test.beforeEach(({ page }) => open(page, "/shortcuts"));

  test("a message's keys act on the message that has focus", async ({ page }) => {
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("e");
    await expect(status(page, "shortcuts/lead")).toHaveText("Archived “Spring launch date”.");
    await row(page, "New logo files").focus();
    await page.keyboard.press("s");
    await expect(status(page, "shortcuts/lead")).toHaveText("Starred “New logo files”.");
    await page.keyboard.press("Delete");
    await expect(status(page, "shortcuts/lead")).toHaveText("Deleted “New logo files”.");
  });

  test("a scope further out runs what the inner ones don't bind: R from a message goes to the reply", async ({ page }) => {
    await row(page, "Pricing page copy").focus();
    await page.keyboard.press("r");
    await expect(reply(page)).toBeFocused();
  });

  test("a text box keeps the letters and Delete, and its own scope gets Mod+Enter", async ({ page }) => {
    const before = await status(page, "shortcuts/lead").textContent();
    await reply(page).focus();
    await page.keyboard.type("esrx");
    await page.keyboard.press("Delete");
    await page.keyboard.press("Backspace");
    await expect(reply(page)).toHaveValue("esr");
    await expect(status(page, "shortcuts/lead")).toHaveText(before!);
    // The site's own T and M stay letters here too.
    await page.keyboard.type("tm");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "glass");
    await page.keyboard.press("ControlOrMeta+Enter");
    await expect(status(page, "shortcuts/lead")).toHaveText("Sent “esrtm”.");
    await expect(reply(page)).toHaveValue("");
  });

  test("an open modal dialog is a wall: the page's N stops at it, and the dialog's Mod+S works inside", async ({ page }) => {
    const opener = page.getByRole("button", { name: "Site settings" });
    await opener.focus();
    await page.keyboard.press("n");
    await expect(status(page, "shortcuts/dialog")).toHaveText("Started a new site.");
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Site settings" });
    await expect(dialog).toBeVisible();
    await page.getByRole("switch", { name: "Show in search engines" }).focus();
    await page.evaluate(() => {
      const status = document.querySelectorAll("section.example")[1]!.querySelector('[role="status"]')!;
      status.textContent = "Nothing yet.";
    });
    await page.keyboard.press("n");
    await page.keyboard.press("t");
    await expect(status(page, "shortcuts/dialog")).toHaveText("Nothing yet.");
    await page.keyboard.press("ControlOrMeta+s");
    await expect(status(page, "shortcuts/dialog")).toHaveText("Saved the settings.");
    await expect(dialog).toBeHidden();
  });

  test("outside every example's scope, the site's T flips the theme", async ({ page }) => {
    await page.locator("main > article > h1").click();
    await page.keyboard.press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "classic");
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`axe on the page and the open dialog, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/shortcuts", theme, mode);
        let results = await new AxeBuilder({ page }).include("main").disableRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        await page.getByRole("button", { name: "Site settings" }).click();
        await expect(page.getByRole("dialog", { name: "Site settings" })).toBeVisible();
        results = await new AxeBuilder({ page }).include("dialog[open]").disableRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test("the innermost scope wins: Mod+K in the editor adds a link, and elsewhere opens the command palette", async ({ page }) => {
  await open(page, "/editor");
  const text = page.getByRole("textbox", { name: "Headline" }).first();
  await text.dblclick();
  // A word is selected in the editor before the key, or Mod+K has nothing to link: under load the
  // editor can take the double click before it has taken focus and the selection.
  await expect(text).toBeFocused();
  await expect.poll(() => page.evaluate(() => getSelection()?.toString().trim() ?? "")).not.toBe("");
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("form", { name: /link/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("main > article > h1").click();
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
});
