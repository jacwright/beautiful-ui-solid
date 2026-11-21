import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Command palette: a modal Dialog with APG's combobox with list autocomplete, always open, over the
// actions reachable from where focus was. Run against the docs page's live example and the site's ⌘K.

const palette = (page: Page) => page.getByRole("dialog", { name: "Command palette" });
const box = (page: Page) => palette(page).getByRole("combobox", { name: "Search actions" });
const row = (page: Page, subject: string) => page.locator("beautiful-demo-page", { hasText: subject });
const status = (page: Page) => page.locator("section.example").first().getByRole("status");
/** The options as "label|scope|keys", in order. */
const options = (page: Page) =>
  palette(page)
    .getByRole("option")
    .evaluateAll((all) =>
      all.map((o) => [o.firstChild?.textContent?.trim(), o.querySelector("small")?.textContent ?? "", o.querySelector("kbd")?.textContent ?? ""].join("|")),
    );
const groups = (page: Page) => palette(page).locator("[role=group] > header").allTextContents();
const lit = (page: Page) => box(page).evaluate((input) => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.firstChild?.textContent?.trim());

test.describe("Command palette", () => {
  test.beforeEach(({ page }) => open(page, "/command-palette"));

  test("⌘K on a message lists the message's actions, then the inbox's, then the site's, with their keys", async ({ page }) => {
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("ControlOrMeta+k");
    await expect(box(page)).toBeFocused();
    expect(await groups(page)).toEqual(["Message", "Inbox", "Docs"]);
    const found = await options(page);
    expect(found.slice(0, 4)).toEqual(["Archive||E", "Star||S", "New message||C", "Mark all as read||"]);
    // The inbox took ⌘K, and the palette doesn't list itself.
    expect(found.some((each) => each.startsWith("Command palette"))).toBe(false);
    expect(found).toContain("Search pages||/");
    await expect(box(page)).toHaveAttribute("aria-expanded", "true");
    expect(await lit(page)).toBe("Archive");
  });

  test("typing finds by name and keywords, best first, with the scope beside each", async ({ page }) => {
    await row(page, "Pricing page copy").focus();
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("fav");
    expect(await options(page)).toEqual(["Star|Message|S"]);
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("s");
    const found = await options(page);
    expect(found[0]).toBe("Star|Message|S");
    expect(found).toContain("Search pages|Docs|/");
    await page.keyboard.type("zzz");
    await expect(palette(page).getByRole("status")).toHaveText("No actions fit that.");
  });

  test("↵ closes it, puts focus back, and runs the lit action for the message that had focus", async ({ page }) => {
    await row(page, "Spring launch date").focus();
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.press("ArrowDown");
    expect(await lit(page)).toBe("Star");
    await page.keyboard.press("Enter");
    await expect(palette(page)).toBeHidden();
    await expect(row(page, "Spring launch date")).toBeFocused();
    await expect(status(page)).toHaveText("Starred “Spring launch date”.");
  });

  test("an action that can't run now is faded and skipped, and a click runs one too", async ({ page }) => {
    await row(page, "Pricing page copy").focus();
    await page.keyboard.press("e");
    await expect(status(page)).toHaveText("Archived “Pricing page copy”.");
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette(page).getByRole("option", { name: "Archive" })).toHaveAttribute("aria-disabled", "true");
    expect(await lit(page)).toBe("Star");
    await palette(page).getByRole("option", { name: "New message" }).click();
    await expect(palette(page)).toBeHidden();
    await expect(status(page)).toHaveText("Started a new message.");
  });

  test("it's a wall, Escape closes it with nothing run, and it opens fresh", async ({ page }) => {
    await page.getByRole("button", { name: "Command palette", exact: true }).click();
    await expect(box(page)).toBeFocused();
    expect(await groups(page)).toEqual(["Inbox", "Docs"]);
    await page.keyboard.type("c");
    await expect(box(page)).toHaveValue("c");
    await page.keyboard.press("Escape");
    await expect(palette(page)).toBeHidden();
    await expect(status(page)).toHaveText("Focus a message and press ⌘K, or use the button.");
    await page.getByRole("button", { name: "Command palette", exact: true }).click();
    await expect(box(page)).toHaveValue("");
  });

  test("the site's ⌘K opens the site's palette on any page, and its search runs from it", async ({ page }) => {
    await open(page, "/button");
    await page.locator("main h1").click();
    await page.keyboard.press("ControlOrMeta+k");
    expect(await groups(page)).toEqual(["Docs"]);
    await page.keyboard.type("search");
    await page.keyboard.press("Enter");
    await expect(palette(page)).toBeHidden();
    await expect(page.getByRole("combobox", { name: "Search pages" }).first()).toBeFocused();
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`axe on the page and the open palette, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/command-palette", theme, mode);
        await row(page, "Spring launch date").focus();
        await page.keyboard.press("ControlOrMeta+k");
        await expect(box(page)).toBeFocused();
        // Its fade in, done, so axe doesn't read a color partway (glass's fill is thin while it fades).
        await page.locator("dialog[open]").evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas. glass.spec.ts measures glass from pixels.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/command-palette.html?theme=${theme}&mode=${mode}`);
        await page.locator("beautiful-demo-page", { hasText: "Spring launch date" }).focus();
        await page.keyboard.press("ControlOrMeta+k");
        await expect(page.locator("#inbox-palette")).toBeVisible();
        // Its fade and rise in, done, so axe reads the colors it settles on.
        await page.locator("dialog[open]").evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#inbox-palette").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
