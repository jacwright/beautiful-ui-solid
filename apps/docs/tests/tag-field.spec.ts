import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG combobox pattern, with a multi-select list: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
// The chips' keys are the mail apps' recipient fields: ← from the text goes to the chips, Backspace
// and Delete remove. The docs page's live examples are the Solid component, so they are tested there.

const field = (page: Page, id: string) => page.locator(`#${id}`);
const panel = (page: Page, id: string) => page.locator(`#${id}-options`);
const list = (page: Page, id: string) => page.locator(`#${id}-listbox`);
const option = (page: Page, id: string, name: string) => list(page, id).getByRole("option", { name, exact: true, includeHidden: true });
const chips = (page: Page, id: string) => page.locator(`#${id}-chips`).getByRole("listitem");
const chipLabels = (page: Page, id: string) => page.locator(`#${id}-chips > beautiful-chip`).evaluateAll((all) => all.map((chip) => chip.textContent!.trim()));
const focusedName = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.id);

async function expectOpen(page: Page, id: string, open: boolean) {
  await expect(panel(page, id)).toBeVisible({ visible: open });
  await expect(field(page, id)).toHaveAttribute("aria-expanded", String(open));
}

test.describe("Tag field keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/tag-field"));

  test("the chips are a list named by the label, and the list is multi-select", async ({ page }) => {
    await expect(page.getByRole("list", { name: "Labels", exact: true })).toBeVisible();
    await expect(chips(page, "site-labels")).toHaveCount(2);
    await expect(page.locator("#site-labels-chips").getByRole("button", { name: "Remove Landing page", exact: true })).toHaveAttribute("tabindex", "-1");
    await expect(field(page, "site-labels")).toHaveAccessibleName("Labels");
    await expect(list(page, "site-labels")).toHaveAttribute("aria-multiselectable", "true");
  });

  test("typing filters, Enter adds the lit option, empties the text and keeps the list open", async ({ page }) => {
    await field(page, "site-labels").click();
    await page.keyboard.type("spr");
    await expectOpen(page, "site-labels", true);
    await page.keyboard.press("Enter");
    await expect(field(page, "site-labels")).toHaveValue("");
    await expectOpen(page, "site-labels", true);
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page", "Spring sale"]);
    await expect(option(page, "site-labels", "Spring sale")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#site-labels-value")).toHaveText("Value: launch, landing, sale");
    await expect(page.getByRole("status").filter({ hasText: "Added Spring sale" })).toHaveCount(1);
    // The keys stay on what was picked, and a second Enter takes it out.
    await page.keyboard.press("Enter");
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page"]);
    await expect(option(page, "site-labels", "Spring sale")).toHaveAttribute("aria-selected", "false");
  });

  test("with create, a comma, the Add row and leaving each add what was typed", async ({ page }) => {
    await field(page, "site-labels").click();
    await page.keyboard.type("Holiday");
    await expect(option(page, "site-labels", "Add “Holiday”")).toBeVisible();
    await page.keyboard.press(",");
    await page.keyboard.type("Events");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    // An option's own label adds the option, not a copy.
    await page.keyboard.type("blog");
    await page.keyboard.press(",");
    await page.keyboard.type("Later");
    await page.keyboard.press("Tab");
    await expectOpen(page, "site-labels", false);
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page", "Holiday", "Events", "Blog", "Later"]);
    await expect(page.locator("#site-labels-value")).toHaveText("Value: launch, landing, Holiday, Events, blog, Later");
  });

  test("Enter with the list shut adds the text, and going back past it to a chip and away still adds it", async ({ page }) => {
    await field(page, "site-labels").click();
    await page.keyboard.type("Holiday");
    await page.keyboard.press("Escape");
    await page.keyboard.type("Events");
    await page.keyboard.press("Escape");
    // Escape emptied it: type again, close the list by going to the chips and back, then Enter.
    await page.keyboard.type("Events");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("End");
    await expectOpen(page, "site-labels", false);
    await page.keyboard.press("Enter");
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page", "Events"]);
    await page.keyboard.type("Later");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowLeft");
    // Tab from a chip goes on to the text box; Shift Tab leaves the field.
    await page.keyboard.press("Shift+Tab");
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page", "Events", "Later"]);
    await expect(field(page, "site-labels")).toHaveValue("");
  });

  test("a pasted list adds each piece", async ({ page }) => {
    await field(page, "site-labels").focus();
    await page.evaluate(() => {
      const data = new DataTransfer();
      data.setData("text", "One, Two\nThree");
      document.querySelector("#site-labels")!.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page", "One", "Two", "Three"]);
  });

  test("← and Backspace go to the chips, which move with ← → and remove with Backspace and Delete", async ({ page }) => {
    await field(page, "site-labels").click();
    await page.keyboard.press("Backspace");
    expect(await focusedName(page)).toBe("Remove Landing page");
    await expectOpen(page, "site-labels", false);
    await page.keyboard.press("ArrowLeft");
    expect(await focusedName(page)).toBe("Remove Launch");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(field(page, "site-labels")).toBeFocused();
    await page.keyboard.type("ab");
    // With text, Backspace edits it; ← at its start goes to the chips.
    await page.keyboard.press("Backspace");
    await expect(field(page, "site-labels")).toHaveValue("a");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowLeft");
    expect(await focusedName(page)).toBe("Remove Landing page");
    await page.keyboard.press("Backspace");
    expect(await focusedName(page)).toBe("Remove Launch");
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch"]);
    await page.keyboard.press("Delete");
    await expect(field(page, "site-labels")).toHaveValue("a");
    await page.keyboard.press("Backspace");
    await expect(field(page, "site-labels")).toBeFocused();
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual([]);
    await expect(field(page, "site-labels")).toHaveAttribute("placeholder", "Add labels");
  });

  test("Escape closes and empties the text, and keeps the chips", async ({ page }) => {
    await field(page, "site-labels").click();
    await page.keyboard.type("news");
    await page.keyboard.press("Escape");
    await expectOpen(page, "site-labels", false);
    await expect(field(page, "site-labels")).toHaveValue("");
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Launch", "Landing page"]);
  });

  test("a click on the ×, and on the well, keeps typing in the text box", async ({ page }) => {
    await page.locator("#site-labels-chips").getByRole("button", { name: "Remove Launch", exact: true }).click();
    await expect.poll(() => chipLabels(page, "site-labels")).toEqual(["Landing page"]);
    await expect(field(page, "site-labels")).toBeFocused();
    await field(page, "site-labels").blur();
    const well = page.locator("beautiful-tag-field", { has: field(page, "site-labels") });
    const box = (await well.boundingBox())!;
    await page.mouse.click(box.x + box.width - 60, box.y + box.height / 2);
    await expect(field(page, "site-labels")).toBeFocused();
  });

  test("without create, text left in the box goes, and the form sends each value and checks required", async ({ page }) => {
    await page.getByRole("button", { name: "Send invites" }).click();
    await expect(page.locator("#invite-people-error, [id$='-error']").filter({ hasText: "Choose an option" }).first()).toBeVisible();
    await field(page, "invite-people").click();
    await page.keyboard.type("gr");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Hed");
    // Hedy is disabled, so nothing is lit for Enter to take.
    await page.keyboard.type("y");
    await page.keyboard.press("Tab");
    await expect(field(page, "invite-people")).toHaveValue("");
    await field(page, "invite-people").click();
    await page.keyboard.type("mary");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Send invites" }).click();
    await expect(page.locator("#invite-sent")).toHaveText("Sent people=grace&people=mary");
    await page.getByRole("button", { name: "Clear" }).click();
    await expect.poll(() => chipLabels(page, "invite-people")).toEqual([]);
  });

  test("disabled: nothing opens and the chips can't be removed", async ({ page }) => {
    await expect(field(page, "states-owners")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Remove Ada Lovelace", exact: true })).toBeDisabled();
  });
});

test.describe("Tag field axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, closed and open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/tag-field", theme, mode);
        const closed = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(closed.violations).toEqual([]);
        await field(page, "site-labels").click();
        await page.keyboard.type("s");
        await expectOpen(page, "site-labels", true);
        const results = await new AxeBuilder({ page }).include("#site-labels-options").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
