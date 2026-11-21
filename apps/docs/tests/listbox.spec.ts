import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG listbox pattern and its select-only combobox: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
// The docs page renders its examples with the Solid Listbox, so the keys are tested there. One
// choice is ours, not APG's: Tab keeps the value, as Escape does.

/** The field: the button with this id. */
const field = (page: Page, id: string) => page.locator(`#${id}`);
const list = (page: Page, id: string) => page.locator(`#${id}-options [role="listbox"]`);
const option = (page: Page, id: string, name: string) => list(page, id).getByRole("option", { name, exact: true, includeHidden: true });
const value = (page: Page, id: string) => page.locator(`#${id}-value`);

/** The option the keys are on: the one aria-activedescendant names, which must be the only one lit. */
async function lit(page: Page, id: string) {
  return list(page, id).evaluate((listbox) => {
    const active = listbox.getAttribute("aria-activedescendant");
    const marked = [...listbox.querySelectorAll("[data-active]")].map((el) => el.id);
    if (marked.length > 1 || (active ?? undefined) !== marked[0]) return `out of step: ${active} ${marked}`;
    return active ? listbox.ownerDocument.getElementById(active)!.firstChild!.textContent!.trim() || listbox.ownerDocument.getElementById(active)!.textContent!.trim() : null;
  });
}

/** Opens a list from the keyboard and waits for focus to move into it. */
async function openByKeys(page: Page, id: string, key = "Enter") {
  await field(page, id).focus();
  await page.keyboard.press(key);
  await expect(list(page, id)).toBeFocused();
}

test.describe("Listbox keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/listbox"));

  test("Enter, Space, ↓ and ↑ open the list on the chosen option", async ({ page }) => {
    for (const key of ["Enter", "Space", "ArrowDown", "ArrowUp"]) {
      await openByKeys(page, "invoice-status", key);
      expect(await lit(page, "invoice-status")).toBe("Paid");
      await page.keyboard.press("Escape");
      await expect(field(page, "invoice-status")).toBeFocused();
    }
  });

  test("with nothing chosen, Enter opens on the first option and ↑ on the last", async ({ page }) => {
    await openByKeys(page, "invoice-owner");
    expect(await lit(page, "invoice-owner")).toBe("Ada Lovelace");
    await page.keyboard.press("Escape");
    await openByKeys(page, "invoice-owner", "ArrowUp");
    expect(await lit(page, "invoice-owner")).toBe("Margaret Hamilton");
  });

  test("↓ and ↑ move without wrapping, skipping a disabled option, and Home and End go to the ends", async ({ page }) => {
    await openByKeys(page, "invoice-status");
    await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-status")).toBe("Overdue");
    // Void is disabled, so Overdue is the last.
    await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-status")).toBe("Overdue");
    await page.keyboard.press("Home");
    expect(await lit(page, "invoice-status")).toBe("Draft");
    await page.keyboard.press("ArrowUp");
    expect(await lit(page, "invoice-status")).toBe("Draft");
    await page.keyboard.press("End");
    expect(await lit(page, "invoice-status")).toBe("Overdue");
  });

  test("Page Down and Page Up move a listful, and the lit option scrolls into view", async ({ page }) => {
    await openByKeys(page, "billing-country");
    await page.keyboard.press("Home");
    await page.keyboard.press("PageDown");
    const after = await lit(page, "billing-country");
    expect(["Denmark", "Finland", "France", "Germany", "India", "Ireland"]).toContain(after);
    await page.keyboard.press("End");
    await expect(option(page, "billing-country", "United States")).toBeInViewport();
    await page.keyboard.press("PageUp");
    expect(await lit(page, "billing-country")).not.toBe("United States");
  });

  test("opening scrolls the chosen option into view", async ({ page }) => {
    await openByKeys(page, "billing-country");
    await expect(option(page, "billing-country", "New Zealand")).toBeInViewport();
  });

  test("Enter picks the lit option, closes the list, and shows it in the field", async ({ page }) => {
    await openByKeys(page, "invoice-status");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(list(page, "invoice-status")).toBeHidden();
    await expect(field(page, "invoice-status")).toBeFocused();
    await expect(value(page, "invoice-status")).toHaveText("Sent");
    await expect(option(page, "invoice-status", "Sent")).toHaveAttribute("aria-selected", "true");
    await expect(option(page, "invoice-status", "Paid")).toHaveAttribute("aria-selected", "false");
  });

  test("Space picks too, and doesn't open the list again", async ({ page }) => {
    await openByKeys(page, "invoice-owner");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(value(page, "invoice-owner")).toHaveText("Grace Hopper");
    await expect(value(page, "invoice-owner")).not.toHaveAttribute("data-placeholder");
    await page.waitForTimeout(100);
    await expect(list(page, "invoice-owner")).toBeHidden();
  });

  test("Escape closes the list and keeps the value", async ({ page }) => {
    await openByKeys(page, "invoice-status");
    await page.keyboard.press("Home");
    await page.keyboard.press("Escape");
    await expect(list(page, "invoice-status")).toBeHidden();
    await expect(field(page, "invoice-status")).toBeFocused();
    await expect(value(page, "invoice-status")).toHaveText("Paid");
  });

  test("Tab closes the list, keeps the value, and moves on", async ({ page }) => {
    await openByKeys(page, "invoice-status");
    await page.keyboard.press("Home");
    await page.keyboard.press("Tab");
    await expect(list(page, "invoice-status")).toBeHidden();
    await expect(field(page, "invoice-owner")).toBeFocused();
    await expect(value(page, "invoice-status")).toHaveText("Paid");
  });

  test("letters move to the option they start, and letters typed together add up", async ({ page }) => {
    await openByKeys(page, "billing-country");
    await page.keyboard.press("n");
    expect(await lit(page, "billing-country")).toBe("Norway");
    await page.keyboard.press("n");
    expect(await lit(page, "billing-country")).toBe("Netherlands");
    await page.keyboard.press("Home");
    await page.keyboard.type("new");
    expect(await lit(page, "billing-country")).toBe("New Zealand");
    // A space within a search is part of it.
    await page.keyboard.press("Home");
    await page.keyboard.type("south k");
    expect(await lit(page, "billing-country")).toBe("South Korea");
    await expect(list(page, "billing-country")).toBeVisible();
  });

  test("a letter on the closed field opens the list on the option it starts", async ({ page }) => {
    await field(page, "billing-country").focus();
    await page.keyboard.press("j");
    await expect(list(page, "billing-country")).toBeFocused();
    expect(await lit(page, "billing-country")).toBe("Japan");
  });

  test("with nothing chosen, a letter on the field can open on the first option", async ({ page }) => {
    await field(page, "invoice-owner").focus();
    await page.keyboard.press("a");
    await expect(list(page, "invoice-owner")).toBeFocused();
    expect(await lit(page, "invoice-owner")).toBe("Ada Lovelace");
  });

  test("with several choices, Enter and Space turn options on and off, and the list stays open", async ({ page }) => {
    await openByKeys(page, "email-topics");
    expect(await lit(page, "email-topics")).toBe("Payments");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(value(page, "email-topics")).toHaveText("Payments, Refunds, Disputes");
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    await expect(value(page, "email-topics")).toHaveText("Refunds, Disputes");
    await expect(list(page, "email-topics")).toBeFocused();
    await expect(list(page, "email-topics")).toHaveAttribute("aria-multiselectable", "true");
  });

  test("screen readers hear a pop-up button named by its label and value, and a named list", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Status Paid" })).toHaveAttribute("aria-haspopup", "listbox");
    await expect(page.getByRole("button", { name: "Region Europe" })).toBeVisible();
    await openByKeys(page, "invoice-status");
    await expect(page.getByRole("listbox", { name: "Status" })).toBeVisible();
    await expect(option(page, "invoice-status", "Void")).toHaveAttribute("aria-disabled", "true");
    await expect(list(page, "site-access").getByRole("option", { name: "Team Everyone on your team can open it.", includeHidden: true })).toHaveCount(1);
  });
});

test.describe("Listbox pointer", () => {
  test.beforeEach(({ page }) => open(page, "/listbox"));

  test("a click opens the list with the chosen option lit, or none", async ({ page }) => {
    await field(page, "invoice-status").click();
    await expect(list(page, "invoice-status")).toBeFocused();
    expect(await lit(page, "invoice-status")).toBe("Paid");
    await page.keyboard.press("Escape");
    await field(page, "invoice-owner").click();
    await expect(list(page, "invoice-owner")).toBeFocused();
    expect(await lit(page, "invoice-owner")).toBe(null);
    await page.keyboard.press("ArrowDown");
    expect(await lit(page, "invoice-owner")).toBe("Ada Lovelace");
  });

  test("the pointer lights the option it's over, and leaving the list lights none", async ({ page }) => {
    await field(page, "invoice-status").click();
    await option(page, "invoice-status", "Draft").hover();
    expect(await lit(page, "invoice-status")).toBe("Draft");
    await option(page, "invoice-status", "Void").hover();
    expect(await lit(page, "invoice-status")).toBe("Draft");
    await page.mouse.move(5, 5);
    expect(await lit(page, "invoice-status")).toBe(null);
  });

  test("a click on an option picks it and closes the list; a disabled one does nothing", async ({ page }) => {
    await field(page, "invoice-status").click();
    await option(page, "invoice-status", "Void").click({ force: true });
    await expect(list(page, "invoice-status")).toBeVisible();
    await option(page, "invoice-status", "Overdue").click();
    await expect(list(page, "invoice-status")).toBeHidden();
    await expect(value(page, "invoice-status")).toHaveText("Overdue");
    await expect(field(page, "invoice-status")).toBeFocused();
  });

  test("a click on the label focuses the field without opening it", async ({ page }) => {
    await page.locator('label[for="invoice-status"]').click();
    await expect(field(page, "invoice-status")).toBeFocused();
    await expect(list(page, "invoice-status")).toBeHidden();
  });

  test("a chosen option's icon shows in the field, without its description", async ({ page }) => {
    await field(page, "site-access").click();
    await option(page, "site-access", "Public Listed, and found by search engines.").click();
    await expect(value(page, "site-access")).toHaveText("Public");
    await expect(value(page, "site-access").locator("svg")).toHaveCount(1);
  });

  test("the list is at least as wide as the field, under it", async ({ page }) => {
    await field(page, "invoice-status").click();
    // Once it has grown in.
    await page.locator("#invoice-status-options").evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const button = (await field(page, "invoice-status").boundingBox())!;
    const panel = (await page.locator("#invoice-status-options").boundingBox())!;
    expect(panel.width).toBeGreaterThanOrEqual(button.width - 1);
    expect(Math.abs(panel.x - button.x)).toBeLessThan(2);
    expect(panel.y).toBeGreaterThan(button.y + button.height);
  });

  test("a disabled field doesn't open", async ({ page }) => {
    await field(page, "payout-schedule").click({ force: true });
    await expect(page.locator("#payout-schedule-options")).toBeHidden();
  });
});

test.describe("Listbox axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, closed and open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/listbox", theme, mode);
        const closed = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(closed.violations).toEqual([]);
        for (const id of ["invoice-status", "site-access", "email-topics"]) {
          await field(page, id).click();
          await expect(list(page, id)).toBeFocused();
          const results = await new AxeBuilder({ page }).include(`#${id}-options`).analyze();
          expect(results.violations).toEqual([]);
          await page.keyboard.press("Escape");
        }
      });
    }
  }
});

test.describe("Listbox component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/listbox.html");
    await page.locator('[data-example="form"]').waitFor();
  });

  const log = (page: Page) => page.locator("#log");

  test("the keys pick in the component, and onChange hears the value", async ({ page }) => {
    await openByKeys(page, "region");
    expect(await lit(page, "region")).toBe("Europe");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(value(page, "region")).toHaveText("US");
    await expect(field(page, "region")).toBeFocused();
    await expect(log(page)).toHaveText("region us");
  });

  test("the form sends the value under its name, once for each with several", async ({ page }) => {
    await field(page, "plan").click();
    await option(page, "plan", "Pro").click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(log(page)).toContainText("sent plan=pro&region=eu&topics=payments");
  });

  test("a controlled list with several choices follows its value", async ({ page }) => {
    await openByKeys(page, "topics");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(value(page, "topics")).toHaveText("Payments, Disputes");
    await expect(list(page, "topics")).toBeFocused();
    await expect(log(page)).toHaveText("topics payments,disputes");
  });

  test("required with nothing chosen: the form doesn't send, the Field says why, and focus goes to the field", async ({ page }) => {
    await page.getByRole("button", { name: "Save" }).click();
    await expect(log(page)).not.toContainText("sent");
    await expect(page.locator("#plan-error")).toHaveText("Choose an option.");
    await expect(field(page, "plan")).toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "plan")).toBeFocused();
    // Choosing one clears it at once.
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(page.locator("#plan-error")).toHaveCount(0);
  });

  test("a form's reset puts back the default value and tells onChange", async ({ page }) => {
    await field(page, "region").click();
    await option(page, "region", "US").click();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(value(page, "region")).toHaveText("Europe");
    await expect(log(page)).toHaveText("region us | region eu | topics ");
  });

  test("a description doesn't show in the field, and the label's click focuses it", async ({ page }) => {
    await expect(value(page, "site-access")).toHaveText("Team");
    await expect(value(page, "site-access").locator("small")).toHaveCount(0);
    await page.locator('label[for="site-access"]').click();
    await expect(field(page, "site-access")).toBeFocused();
    await expect(list(page, "site-access")).toBeHidden();
  });

  test("a disabled option can't be picked, and a disabled list doesn't open", async ({ page }) => {
    await field(page, "invoice-status").click();
    await option(page, "invoice-status", "Void").click({ force: true });
    await expect(value(page, "invoice-status")).toHaveText("Paid");
    await page.keyboard.press("Escape");
    await field(page, "payout-schedule").click({ force: true });
    await expect(page.locator("#payout-schedule-options")).toBeHidden();
  });

  test("axe's contrast check passes on the plain canvas in each theme and mode", async ({ page }) => {
    for (const theme of themes) {
      for (const mode of modes) {
        await page.goto(`/tests/harness/listbox.html?theme=${theme}&mode=${mode}`);
        await field(page, "invoice-status").click();
        await expect(list(page, "invoice-status")).toBeFocused();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include('[data-example="fields"]').include("#invoice-status-options").analyze();
        expect(results.violations, `${theme} ${mode}`).toEqual([]);
      }
    }
  });
});
