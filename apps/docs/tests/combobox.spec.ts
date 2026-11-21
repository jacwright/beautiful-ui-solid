import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG combobox pattern, with list autocomplete: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
// The docs page's examples are the Solid component, so the keys are tested there. Two
// choices are ours, not APG's: a second Escape keeps the text, and leaving never picks the lit option.

/** The text box: the input with this id. */
const field = (page: Page, id: string) => page.locator(`#${id}`);
const panel = (page: Page, id: string) => page.locator(`#${id}-options`);
const list = (page: Page, id: string) => page.locator(`#${id}-listbox`);
const option = (page: Page, id: string, name: string) => list(page, id).getByRole("option", { name, exact: true, includeHidden: true });
const chevrons = (page: Page, id: string) => field(page, id).locator("xpath=following-sibling::button");

/** The labels of the options the filter shows. */
const shown = (page: Page, id: string) =>
  list(page, id).evaluate((listbox) =>
    [...listbox.querySelectorAll<HTMLElement>('[role="option"]:not([hidden])')].map((option) => option.firstChild!.textContent!.trim() || option.textContent!.trim()),
  );

/** The option the keys are on: the one the input's aria-activedescendant names, which must be the only one lit. */
async function lit(page: Page, id: string) {
  return field(page, id).evaluate((input) => {
    const active = input.getAttribute("aria-activedescendant");
    const listbox = input.ownerDocument.getElementById(input.getAttribute("aria-controls")!)!;
    const marked = [...listbox.querySelectorAll("[data-active]")].map((el) => el.id);
    if (marked.length > 1 || (active ?? undefined) !== marked[0]) return `out of step: ${active} ${marked}`;
    if (!active) return null;
    const option = input.ownerDocument.getElementById(active)!;
    return [...option.childNodes].filter((node) => !(node instanceof Element && node.matches("small, svg"))).map((node) => node.textContent).join("").trim();
  });
}

async function expectOpen(page: Page, id: string, open: boolean) {
  await expect(panel(page, id)).toBeVisible({ visible: open });
  await expect(field(page, id)).toHaveAttribute("aria-expanded", String(open));
}

test.describe("Combobox keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/combobox"));

  test("typing filters the list, opens it with the first match lit, and Enter picks it", async ({ page }) => {
    await field(page, "billing-country").fill("");
    await field(page, "billing-country").pressSequentially("land");
    await expectOpen(page, "billing-country", true);
    expect(await shown(page, "billing-country")).toEqual(["Finland", "Ireland", "Netherlands", "New Zealand", "Poland", "Switzerland"]);
    expect(await lit(page, "billing-country")).toBe("Finland");
    await expect(field(page, "billing-country")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expectOpen(page, "billing-country", false);
    await expect(field(page, "billing-country")).toHaveValue("Ireland");
    await expect(option(page, "billing-country", "Ireland")).toHaveAttribute("aria-selected", "true");
    await expect(option(page, "billing-country", "Canada")).toHaveAttribute("aria-selected", "false");
    // The filter is gone once it closes.
    expect((await shown(page, "billing-country")).length).toBe(30);
  });

  test("switching windows keeps the typing and the list", async ({ page }) => {
    await field(page, "billing-country").fill("Swi");
    await page.evaluate(() => {
      Object.defineProperty(document, "hasFocus", { value: () => false, configurable: true });
      document.querySelector<HTMLInputElement>("#billing-country")!.dispatchEvent(new FocusEvent("focusout", { relatedTarget: null }));
    });
    await expectOpen(page, "billing-country", true);
    await expect(field(page, "billing-country")).toHaveValue("Swi");
  });

  test("the filter matches the label, not its description", async ({ page }) => {
    await field(page, "review-assignee").fill("@");
    expect(await shown(page, "review-assignee")).toEqual([]);
    await field(page, "review-assignee").fill("Coo");
    expect(await shown(page, "review-assignee")).toEqual(["Tom Cook", "Wade Cooper"]);
  });

  test("the filter ignores case and accents, and says when nothing matches", async ({ page }) => {
    await field(page, "billing-country").fill("");
    await field(page, "billing-country").pressSequentially("COTE");
    expect(await shown(page, "billing-country")).toEqual(["Côte d’Ivoire"]);
    await field(page, "billing-country").pressSequentially("zz");
    expect(await shown(page, "billing-country")).toEqual([]);
    await expect(panel(page, "billing-country").getByRole("status")).toHaveText("No matches");
    await expect(list(page, "billing-country")).toBeHidden();
    expect(await lit(page, "billing-country")).toBeNull();
    // Enter with nothing lit closes and puts the chosen label back.
    await page.keyboard.press("Enter");
    await expectOpen(page, "billing-country", false);
    await expect(field(page, "billing-country")).toHaveValue("Canada");
  });

  test("↓ and ↑ on the shut field open the whole list on the chosen option, or the first or last", async ({ page }) => {
    await field(page, "billing-country").focus();
    await page.keyboard.press("ArrowDown");
    await expectOpen(page, "billing-country", true);
    expect((await shown(page, "billing-country")).length).toBe(30);
    expect(await lit(page, "billing-country")).toBe("Canada");
    await expect(option(page, "billing-country", "Canada")).toBeInViewport();
    await page.keyboard.press("Escape");

    await field(page, "invoice-owner").focus();
    await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-owner")).toBe("Ada Lovelace");
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowUp");
    expect(await lit(page, "invoice-owner")).toBe("Mary Jackson");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Alt+ArrowDown");
    await expectOpen(page, "invoice-owner", true);
    expect(await lit(page, "invoice-owner")).toBeNull();
    await page.keyboard.press("Alt+ArrowUp");
    await expectOpen(page, "invoice-owner", false);
  });

  test("↓ and ↑ move without wrapping, skipping a disabled option; Home and End stay the text box's", async ({ page }) => {
    await field(page, "invoice-owner").focus();
    await page.keyboard.press("ArrowDown");
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-owner")).toBe("Margaret Hamilton");
    // Hedy Lamarr is disabled.
    await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-owner")).toBe("Dorothy Vaughan");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-owner")).toBe("Mary Jackson");
    await page.keyboard.press("Home");
    expect(await lit(page, "invoice-owner")).toBe("Mary Jackson");
    await page.keyboard.press("PageUp");
    expect(await lit(page, "invoice-owner")).toBe("Ada Lovelace");
    await page.keyboard.press("ArrowUp");
    expect(await lit(page, "invoice-owner")).toBe("Ada Lovelace");
  });

  test("Escape closes the list and puts the chosen label back; a second Escape keeps it", async ({ page }) => {
    await field(page, "billing-country").fill("");
    await field(page, "billing-country").pressSequentially("Ger");
    await page.keyboard.press("Escape");
    await expectOpen(page, "billing-country", false);
    await expect(field(page, "billing-country")).toHaveValue("Canada");
    await page.keyboard.press("Escape");
    await expect(field(page, "billing-country")).toHaveValue("Canada");
    await expect(option(page, "billing-country", "Canada")).toHaveAttribute("aria-selected", "true");
  });

  test("Tab closes, keeps the value, and never picks the lit option", async ({ page }) => {
    await field(page, "billing-country").fill("");
    await field(page, "billing-country").pressSequentially("Ger");
    expect(await lit(page, "billing-country")).toBe("Germany");
    await page.keyboard.press("Tab");
    await expectOpen(page, "billing-country", false);
    await expect(field(page, "billing-country")).toHaveValue("Canada");
    await expect(field(page, "invoice-owner")).toBeFocused();
  });

  test("clearing the text and leaving chooses nothing", async ({ page }) => {
    await field(page, "billing-country").fill("");
    await page.keyboard.press("Tab");
    await expect(field(page, "billing-country")).toHaveValue("");
    await expect(list(page, "billing-country").locator('[aria-selected="true"]')).toHaveCount(0);
  });

  test("Enter on the shut field is left to the form", async ({ page }) => {
    await field(page, "billing-country").focus();
    await field(page, "billing-country").evaluate((input) =>
      input.addEventListener("keydown", (event) => setTimeout(() => (input.dataset.prevented = String(event.defaultPrevented))), { once: true }),
    );
    await page.keyboard.press("Enter");
    await expect(field(page, "billing-country")).toHaveAttribute("data-prevented", "false");
    await expectOpen(page, "billing-country", false);
  });

  test("screen readers hear a combo box named by its label, tied to a named list", async ({ page }) => {
    const input = page.getByRole("combobox", { name: "Country" });
    await expect(input).toHaveValue("Canada");
    await expect(input).toHaveAttribute("aria-autocomplete", "list");
    await expect(input).toHaveAttribute("aria-controls", "billing-country-listbox");
    await input.press("ArrowDown");
    await expect(page.getByRole("listbox", { name: "Country" })).toBeVisible();
    await expect(field(page, "invoice-owner")).toHaveAccessibleDescription("They hear when it's paid or overdue.");
  });
});

test.describe("Combobox pointer", () => {
  test.beforeEach(({ page }) => open(page, "/combobox"));

  test("a click in the text box opens the whole list with the chosen option lit", async ({ page }) => {
    await field(page, "billing-country").click();
    await expectOpen(page, "billing-country", true);
    expect(await lit(page, "billing-country")).toBe("Canada");
    // A second click leaves it open, for the caret.
    await field(page, "billing-country").click();
    await expectOpen(page, "billing-country", true);
  });

  test("the chevrons open and close the list, and focus stays in the text box", async ({ page }) => {
    await chevrons(page, "invoice-owner").click();
    await expectOpen(page, "invoice-owner", true);
    await expect(field(page, "invoice-owner")).toBeFocused();
    await expect(chevrons(page, "invoice-owner")).toHaveAttribute("aria-expanded", "true");
    await chevrons(page, "invoice-owner").click();
    await expectOpen(page, "invoice-owner", false);
    await expect(field(page, "invoice-owner")).toBeFocused();
  });

  test("a click on an option picks it, and a disabled one does nothing", async ({ page }) => {
    await field(page, "invoice-owner").click();
    await option(page, "invoice-owner", "Hedy Lamarr").click({ force: true });
    await expectOpen(page, "invoice-owner", true);
    await option(page, "invoice-owner", "Grace Hopper").click();
    await expectOpen(page, "invoice-owner", false);
    await expect(field(page, "invoice-owner")).toHaveValue("Grace Hopper");
    await expect(field(page, "invoice-owner")).toBeFocused();
  });

  test("the pointer lights the option it's over, and leaving the list lights none", async ({ page }) => {
    await field(page, "invoice-owner").click();
    await option(page, "invoice-owner", "Katherine Johnson").hover();
    await expect.poll(() => lit(page, "invoice-owner")).toBe("Katherine Johnson");
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => lit(page, "invoice-owner")).toBe("Margaret Hamilton");
    await page.mouse.move(0, 0);
    await expect.poll(() => lit(page, "invoice-owner")).toBeNull();
  });

  test("a click away closes the list and puts the chosen label back", async ({ page }) => {
    await field(page, "billing-country").fill("");
    await field(page, "billing-country").pressSequentially("Swe");
    await page.locator("main h1").click();
    await expectOpen(page, "billing-country", false);
    await expect(field(page, "billing-country")).toHaveValue("Canada");
  });

  test("the list is at least as wide as the field, under it", async ({ page }) => {
    await field(page, "billing-country").click();
    // Once it has grown in.
    await expect.poll(() => panel(page, "billing-country").evaluate((el) => el.getAnimations().length)).toBe(0);
    const group = (await field(page, "billing-country").locator("..").boundingBox())!;
    const box = (await panel(page, "billing-country").boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(group.width - 1);
    expect(Math.abs(box.x - group.x)).toBeLessThan(1);
    expect(box.y).toBeGreaterThan(group.y + group.height);
  });

  test("a disabled field doesn't open", async ({ page }) => {
    await chevrons(page, "payout-timezone").click({ force: true });
    await expectOpen(page, "payout-timezone", false);
  });
});

test.describe("Combobox axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, closed and open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/combobox", theme, mode);
        const closed = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(closed.violations).toEqual([]);
        for (const id of ["billing-country", "expense-category"]) {
          await field(page, id).click();
          await expectOpen(page, id, true);
          const results = await new AxeBuilder({ page }).include(`#${id}-options`).analyze();
          expect(results.violations).toEqual([]);
          await page.keyboard.press("Escape");
        }
      });
    }
  }
});

test.describe("Combobox component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/combobox.html");
    await page.locator('[data-example="form"]').waitFor();
  });

  const log = (page: Page) => page.locator("#log");

  test("typing and Enter pick in the component, and onChange hears the value", async ({ page }) => {
    await field(page, "region").fill("U");
    expect(await lit(page, "region")).toBe("US");
    await page.keyboard.press("Enter");
    await expect(field(page, "region")).toHaveValue("US");
    await expect(log(page)).toHaveText("region us");
  });

  test("the form sends the value under its name, never the typed text", async ({ page }) => {
    await field(page, "plan").click();
    await option(page, "plan", "Pro").click();
    await field(page, "region").fill("Eur");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(log(page)).toContainText("sent plan=pro&region=eu&owner=ada");
    await expect(field(page, "region")).toHaveValue("Europe");
  });

  test("a controlled field follows its value, and its text with it", async ({ page }) => {
    await expect(field(page, "owner")).toHaveValue("Ada Lovelace");
    await page.locator("#set-owner").click();
    await expect(field(page, "owner")).toHaveValue("Grace Hopper");
    await expect(option(page, "owner", "Grace Hopper")).toHaveAttribute("aria-selected", "true");
  });

  test("a controlled field that turns a pick down shows the value it kept", async ({ page }) => {
    await field(page, "owner").fill("Radia");
    await page.keyboard.press("Enter");
    await expect(log(page)).toHaveText("owner radia");
    await expect(field(page, "owner")).toHaveValue("Ada Lovelace");
  });

  test("a reset with nothing changed puts the text back", async ({ page }) => {
    await field(page, "region").fill("Eu");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(field(page, "region")).toHaveValue("Europe");
    await expect(log(page)).not.toContainText("region");
  });

  test("clearing the text and leaving chooses nothing, and onChange hears it", async ({ page }) => {
    await field(page, "owner").fill("");
    await page.keyboard.press("Tab");
    await expect(log(page)).toHaveText("owner ");
    await expect(field(page, "owner")).toHaveValue("");
  });

  test("required with nothing chosen: the form doesn't send, the Field says why, and focus goes to the text box", async ({ page }) => {
    await page.getByRole("button", { name: "Save" }).click();
    await expect(log(page)).not.toContainText("sent");
    await expect(page.locator("#plan-error")).toHaveText("Choose an option.");
    await expect(field(page, "plan")).toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "plan")).toBeFocused();
    // Choosing one clears it at once.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator("#plan-error")).toHaveCount(0);
  });

  test("a form's reset puts back the default value and its text, and tells onChange", async ({ page }) => {
    await field(page, "region").click();
    await option(page, "region", "US").click();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(field(page, "region")).toHaveValue("Europe");
    await expect(log(page)).toContainText("region us | region eu");
  });

  test("a page that filters for itself: the list follows its options, and the chosen label stays when its option goes", async ({ page }) => {
    await field(page, "customer").fill("Sw");
    await expect.poll(() => shown(page, "customer")).toEqual(["Sweden", "Switzerland"]);
    expect(await lit(page, "customer")).toBe("Sweden");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(field(page, "customer")).toHaveValue("Switzerland");
    await expect(page.locator("#search-value")).toHaveText("ch");
    // The page's list goes back to its first five, without Switzerland: the text keeps the label.
    await page.keyboard.press("Tab");
    await expect(field(page, "customer")).toHaveValue("Switzerland");
    await field(page, "customer").fill("Zz");
    await page.keyboard.press("Escape");
    await expect(field(page, "customer")).toHaveValue("Switzerland");
  });

  test("a disabled field doesn't open", async ({ page }) => {
    await expect(field(page, "payout-timezone")).toBeDisabled();
    await chevrons(page, "payout-timezone").click({ force: true });
    await expectOpen(page, "payout-timezone", false);
  });

  test("axe's contrast check passes on the plain canvas in each theme and mode", async ({ page }) => {
    for (const theme of themes) {
      for (const mode of modes) {
        await page.goto(`/tests/harness/combobox.html?theme=${theme}&mode=${mode}`);
        await field(page, "billing-country").click();
        await expectOpen(page, "billing-country", true);
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include('[data-example="fields"]').include("#billing-country-options").analyze();
        expect(results.violations).toEqual([]);
      }
    }
  });
});

test.describe("Combobox search box", () => {
  const box = (page: Page) => page.getByRole("combobox", { name: "Search sites" });
  const popup = (page: Page) => page.locator("beautiful-popover:has([aria-label='Search sites'])");

  test.beforeEach(async ({ page }) => {
    await open(page, "/combobox");
    await box(page).scrollIntoViewIfNeeded();
  });

  test("has a magnifying glass at its start, no chevrons, and is a search input", async ({ page }) => {
    const group = page.locator("beautiful-input-group[data-search]").filter({ has: box(page) });
    await expect(group.locator(":scope > svg:first-child")).toHaveCount(1);
    await expect(group.locator(":scope > button")).toHaveCount(0);
    await expect(box(page)).toHaveAttribute("type", "search");
  });

  test("opens only on typed text, and closes when the text is cleared", async ({ page }) => {
    await box(page).click();
    await expect(box(page)).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("ArrowDown");
    await expect(box(page)).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.type("har");
    await expect(box(page)).toHaveAttribute("aria-expanded", "true");
    await expect(popup(page).getByRole("option")).toHaveText([/Harbor Coffee/]);
    await box(page).fill("");
    await expect(box(page)).toHaveAttribute("aria-expanded", "false");
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`passes axe open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/combobox", theme, mode);
        await box(page).fill("f");
        await expect(box(page)).toHaveAttribute("aria-expanded", "true");
        const results = await new AxeBuilder({ page }).include("beautiful-popover:popover-open").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
