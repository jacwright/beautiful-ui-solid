import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG tabs pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
// The keys are tested on the docs page, whose examples are the Solid component.

const tab = (page: Page, list: string, name: string) => page.getByRole("tablist", { name: list }).getByRole("tab", { name });

/** The names of the panels showing in a tab list's tabs. */
async function shown(page: Page, list: string) {
  const tabs = page.getByRole("tablist", { name: list }).locator("..");
  return tabs.locator('[role="tabpanel"]:not([hidden])').evaluateAll((panels) =>
    panels.map((panel) => document.getElementById(panel.getAttribute("aria-labelledby") ?? "")?.textContent?.trim()),
  );
}

async function expectSelected(page: Page, list: string, name: string) {
  await expect(tab(page, list, name)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tablist", { name: list }).locator('[aria-selected="true"]')).toHaveCount(1);
  expect(await shown(page, list)).toEqual([name]);
}

test.describe("Tabs keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/tabs"));

  test("Tab reaches only the selected tab, then its panel", async ({ page }) => {
    await tab(page, "Site settings", "Domains").click();
    await page.locator("h3", { hasText: "Site settings" }).click();
    await page.keyboard.press("Tab");
    await expect(tab(page, "Site settings", "Domains")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#settings-panel-1")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(tab(page, "Site settings", "Domains")).toBeFocused();
  });

  test("→ and ← select the next and previous tab, wrapping, and Home and End go to the ends", async ({ page }) => {
    await tab(page, "Site settings", "General").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Site settings", "Domains")).toBeFocused();
    await expectSelected(page, "Site settings", "Domains");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expectSelected(page, "Site settings", "Billing");
    await page.keyboard.press("ArrowRight");
    await expectSelected(page, "Site settings", "General");
    await page.keyboard.press("End");
    await expectSelected(page, "Site settings", "Billing");
    await page.keyboard.press("Home");
    await expectSelected(page, "Site settings", "General");
    // The selected tab is in the Tab order, as a button is with no tabindex; the others are taken out of it.
    await expect(tab(page, "Site settings", "General")).not.toHaveAttribute("tabindex");
    await expect(tab(page, "Site settings", "Billing")).toHaveAttribute("tabindex", "-1");
  });

  test("the keys pass over a disabled tab", async ({ page }) => {
    await tab(page, "Visits", "Sources").focus();
    await tab(page, "Visits", "Sources").click();
    await page.keyboard.press("ArrowRight");
    await expectSelected(page, "Visits", "Overview");
    await page.keyboard.press("End");
    await expectSelected(page, "Visits", "Sources");
  });

  test("a column of tabs moves with ↓ and ↑, and not with → and ←", async ({ page }) => {
    await tab(page, "Account", "Profile").focus();
    await page.keyboard.press("ArrowDown");
    await expectSelected(page, "Account", "Team");
    await page.keyboard.press("ArrowRight");
    await expectSelected(page, "Account", "Team");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expectSelected(page, "Account", "Security");
  });

  test("with manual selection the arrows move focus alone, and Enter or Space selects", async ({ page }) => {
    await tab(page, "Spring launch", "Pages").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Spring launch", "Posts")).toBeFocused();
    await expectSelected(page, "Spring launch", "Pages");
    await page.keyboard.press("Enter");
    await expectSelected(page, "Spring launch", "Posts");
    await page.keyboard.press("End");
    await expect(tab(page, "Spring launch", "Logs")).toBeFocused();
    await page.keyboard.press("Space");
    await expectSelected(page, "Spring launch", "Logs");
  });

  test("a click selects a tab", async ({ page }) => {
    await tab(page, "Site settings", "Forms").click();
    await expectSelected(page, "Site settings", "Forms");
  });

  test("in a right-to-left page, ← is the next tab", async ({ page }) => {
    await page.locator("html").evaluate((html) => html.setAttribute("dir", "rtl"));
    await tab(page, "Site settings", "General").focus();
    await page.keyboard.press("ArrowLeft");
    await expectSelected(page, "Site settings", "Domains");
  });

  test("the selected line moves under the selected tab", async ({ page }) => {
    const list = page.getByRole("tablist", { name: "Site settings" });
    /** How far the line's ends are from the tab's, in px. */
    const offBy = (index: number) =>
      list.evaluate((el, id) => {
        const tabBox = document.getElementById(id)!.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        const after = getComputedStyle(el, "::after");
        const left = box.left + el.clientLeft + Number.parseFloat(after.left) - el.scrollLeft;
        return Math.round(Math.abs(left - tabBox.left) + Math.abs(Number.parseFloat(after.width) - tabBox.width));
      }, `settings-tab-${index}`);
    expect(await offBy(0)).toBe(0);
    await tab(page, "Site settings", "Forms").click();
    await expect.poll(() => offBy(2)).toBe(0);
  });
});

test.describe("Tabs axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/tabs", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Tabs contrast", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/tabs.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The track under the tabs is a 1px gradient line, and axe gives up on any text over a
        // gradient. The line sits below the labels, so it is left out to let axe judge them.
        await page.addStyleTag({ content: "beautiful-tab-list { background-image: none !important; }" });
        // The glass example's stage is bright on purpose, so its contrast is the docs page's to judge.
        const results = await new AxeBuilder({ page }).exclude("beautiful-demo-stage").withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Tabs component", () => {
  test.describe("on the harness", () => {
    test.beforeEach(({ page }) => page.goto("/tests/harness/tabs.html"));

    test("the keys and a click select, and the selected panel shows", async ({ page }) => {
      await tab(page, "Site settings", "General").focus();
      await page.keyboard.press("ArrowRight");
      await expect(tab(page, "Site settings", "Domains")).toBeFocused();
      await expectSelected(page, "Site settings", "Domains");
      await page.keyboard.press("End");
      await expectSelected(page, "Site settings", "Billing");
      await page.keyboard.press("ArrowRight");
      await expectSelected(page, "Site settings", "General");
      await tab(page, "Site settings", "Forms").click();
      await expectSelected(page, "Site settings", "Forms");
      await expect(tab(page, "Site settings", "Forms")).not.toHaveAttribute("tabindex");
      await expect(tab(page, "Site settings", "General")).toHaveAttribute("tabindex", "-1");
    });

    test("passes over a disabled tab, and a column moves with ↓ and ↑", async ({ page }) => {
      await tab(page, "Visits", "Sources").click();
      await page.keyboard.press("ArrowRight");
      await expectSelected(page, "Visits", "Overview");
      await tab(page, "Account", "Profile").focus();
      await page.keyboard.press("ArrowUp");
      await expectSelected(page, "Account", "Security");
    });

    test("manual: the arrows move focus, and Enter selects", async ({ page }) => {
      await tab(page, "Spring launch", "Pages").focus();
      await page.keyboard.press("ArrowRight");
      await expect(tab(page, "Spring launch", "Posts")).toBeFocused();
      await expectSelected(page, "Spring launch", "Pages");
      await page.keyboard.press("Enter");
      await expectSelected(page, "Spring launch", "Posts");
    });

    test("a held selection follows selectedIndex, and onChange hears each pick", async ({ page }) => {
      await expectSelected(page, "Held", "Two");
      await tab(page, "Held", "Two").focus();
      await page.keyboard.press("ArrowLeft");
      await expectSelected(page, "Held", "One");
      // The parent refuses the third tab, so the selection stays where it was.
      await tab(page, "Held", "Three").click();
      await expectSelected(page, "Held", "One");
      await expect(page.locator("#held-log")).toHaveText("0 2");
      await page.locator("#held-first").click();
      await tab(page, "Held", "Two").click();
      await page.locator("#held-first").click();
      await expectSelected(page, "Held", "One");
    });

    test("a disabled first tab, or an index out of range, passes the selection to a tab that can take it", async ({ page }) => {
      await expectSelected(page, "First disabled", "Open");
      await expectSelected(page, "Out of range", "Start");
    });

    test("a tab shown again by Show takes its old place", async ({ page }) => {
      const middle = () => tab(page, "Toggled", "Middle");
      await expect(middle()).toHaveAttribute("id", "toggled-tab-1");
      await page.locator("#toggle-middle").click();
      await expect(middle()).toHaveCount(0);
      await page.locator("#toggle-middle").click();
      await expect(middle()).toHaveAttribute("id", "toggled-tab-1");
      await middle().click();
      await expectSelected(page, "Toggled", "Middle");
      // The selected tab leaving passes the selection on, so the list stays in the Tab order.
      await page.locator("#toggle-middle").click();
      await expectSelected(page, "Toggled", "Left");
    });

    test("a caller's onClick can stop the switch with preventDefault", async ({ page }) => {
      await tab(page, "Passed", "Blocked").click();
      await expectSelected(page, "Passed", "Counted");
    });

    test("the keys select without clicking the tab", async ({ page }) => {
      await tab(page, "Passed", "Other").click();
      await expect(page.locator("#passed-clicks")).toHaveText("0");
      await page.keyboard.press("ArrowLeft");
      await expectSelected(page, "Passed", "Counted");
      await expect(page.locator("#passed-clicks")).toHaveText("0");
    });

    test("passes other attributes, refs and handlers to its elements", async ({ page }) => {
      const root = page.locator('[data-example="passed"] beautiful-tabs');
      await expect(root).toHaveAttribute("data-note", "tabs");
      await expect(root).toHaveClass("extra");
      const list = page.getByRole("tablist", { name: "Passed" });
      await expect(list).toHaveAttribute("data-note", "list");
      await expect(list).toHaveAttribute("data-reffed", "");
      await expect(page.locator('#passed-panel-0')).toHaveAttribute("data-note", "panel");
      await tab(page, "Passed", "Other").click();
      await tab(page, "Passed", "Counted").click();
      await expect(page.locator("#passed-clicks")).toHaveText("1");
      await expectSelected(page, "Passed", "Counted");
    });
  });
});
