import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Locator, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// A native <select> is APG's Select-Only Combobox already: the browser does the keys. These check
// the keys the spec promises, in Chromium's customizable select, the look the spec sets, and what
// the Solid Select and Field add: the placeholder, the Field's check, and a value from the page.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

const isOpen = (select: Locator) => select.evaluate((el) => el.matches(":open"));

/** The option with focus, by its text, or undefined when focus isn't on an option. */
const focusedOption = (page: Page) =>
  page.evaluate(() => (document.activeElement instanceof HTMLOptionElement ? document.activeElement.text : undefined));

test.describe("Select keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/select"));

  test("each select is a combo box named by its label, and described by its description and error", async ({ page }) => {
    const plan = preview(page, "Fields").getByRole("combobox", { name: "Plan" });
    await expect(plan).toHaveAccessibleDescription("You can change plans at any time.");
    const metric = preview(page, "Invalid, disabled, and a disabled option").getByRole("combobox", { name: "Metric" });
    await expect(metric).toHaveAccessibleDescription("Choose an option.");
    await expect(metric).toHaveAttribute("aria-invalid", "true");
    await expect(preview(page, "On glass, and in a dialog").getByRole("combobox", { name: "Date range" })).toBeVisible();
  });

  test("Tab moves through the selects and skips a disabled one", async ({ page }) => {
    const states = preview(page, "Invalid, disabled, and a disabled option");
    await states.getByLabel("Metric").focus();
    await page.keyboard.press("Tab");
    await expect(states.getByLabel("Role")).toBeFocused();
  });

  for (const key of ["Enter", "Space", "ArrowDown", "ArrowUp", "Alt+ArrowDown"]) {
    test(`${key} opens the list with focus on the picked option`, async ({ page }) => {
      const zone = preview(page, "Fields").getByLabel("Time zone");
      await zone.focus();
      await page.keyboard.press(key);
      expect(await isOpen(zone)).toBe(true);
      expect(await focusedOption(page)).toBe("Mountain time, Denver");
    });
  }

  test("arrows and End move through the list, and Enter picks, closes it and returns focus", async ({ page }) => {
    const zone = preview(page, "Fields").getByLabel("Time zone");
    await zone.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    expect(await focusedOption(page)).toBe("Central time, Chicago");
    await page.keyboard.press("End");
    expect(await focusedOption(page)).toBe("Berlin");
    await page.keyboard.press("Home");
    expect(await focusedOption(page)).toBe("Pacific time, Los Angeles");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    // Over the group's heading, from the last of the Americas to the first of Europe.
    await page.keyboard.press("ArrowDown");
    expect(await focusedOption(page)).toBe("London");
    await page.keyboard.press("Enter");
    expect(await isOpen(zone)).toBe(false);
    await expect(zone).toBeFocused();
    await expect(zone).toHaveValue("Europe/London");
  });

  test("Escape closes the list without changing the value", async ({ page }) => {
    const zone = preview(page, "Fields").getByLabel("Time zone");
    await zone.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("End");
    await page.keyboard.press("Escape");
    expect(await isOpen(zone)).toBe(false);
    await expect(zone).toBeFocused();
    await expect(zone).toHaveValue("America/Denver");
  });

  test("the arrows pass over a disabled option", async ({ page }) => {
    const role = preview(page, "Invalid, disabled, and a disabled option").getByLabel("Role");
    await role.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    expect(await focusedOption(page)).toBe("Editor");
  });

  test("typing on a closed select picks the first option that starts with it", async ({ page }) => {
    const language = preview(page, "Fields").getByLabel("Language");
    await language.focus();
    await page.keyboard.type("fr");
    await expect(language).toHaveValue("fr");
    expect(await isOpen(language)).toBe(false);
  });

  test("a click opens the list, and a click on an option picks it", async ({ page }) => {
    const language = preview(page, "Fields").getByLabel("Language");
    await language.click();
    expect(await isOpen(language)).toBe(true);
    await language.locator("option", { hasText: "Deutsch" }).click();
    await expect(language).toHaveValue("de");
    expect(await isOpen(language)).toBe(false);
  });

  test("the placeholder isn't in the list", async ({ page }) => {
    const plan = preview(page, "Fields").getByLabel("Plan");
    await plan.click();
    await expect(plan.locator("option", { hasText: "Choose a plan" })).toBeHidden();
    await expect(plan.locator("option", { hasText: "Starter" })).toBeVisible();
  });
});

test.describe("Select look", () => {
  test("every select is 36px tall, as an Input, with 14px text and the kit's focus ring", async ({ page }) => {
    await open(page, "/select", "classic", "light");
    for (const select of await page.locator("beautiful-example-preview select").all()) {
      if (!(await select.isVisible())) continue;
      expect((await select.boundingBox())!.height).toBe(36);
      await expect(select).toHaveCSS("font-size", "14px");
    }
    const row = preview(page, "Beside an input and a button");
    const input = (await row.getByLabel("From").boundingBox())!;
    const select = (await row.getByLabel("Kind").boundingBox())!;
    expect([select.y, select.height]).toEqual([input.y, input.height]);
    const plan = preview(page, "Fields").getByLabel("Plan");
    await plan.focus();
    await expect(plan).toHaveCSS("outline", "rgb(37, 99, 235) solid 2px");
    await expect(plan).toHaveCSS("outline-offset", "2px");
  });

  test("the placeholder is the muted text color, and a value is the text color", async ({ page }) => {
    await open(page, "/select", "classic", "light");
    await expect(preview(page, "Fields").getByLabel("Plan")).toHaveCSS("color", "rgb(82, 82, 91)");
    await expect(preview(page, "Fields").getByLabel("Language")).toHaveCSS("color", "rgb(24, 24, 27)");
  });

  test("hover darkens the edge, and an invalid select keeps its danger edge under the pointer", async ({ page }) => {
    await open(page, "/select", "classic", "light");
    const language = preview(page, "Fields").getByLabel("Language");
    await language.hover();
    await expect(language).toHaveCSS("border-color", "rgb(161, 161, 170)");
    const metric = preview(page, "Invalid, disabled, and a disabled option").getByLabel("Metric");
    await expect(metric).toHaveCSS("border-color", "rgb(201, 31, 58)");
    await metric.hover();
    await expect(metric).toHaveCSS("border-color", "rgb(201, 31, 58)");
  });

  test("a disabled select fades with its label and description", async ({ page }) => {
    await open(page, "/select");
    const field = preview(page, "Invalid, disabled, and a disabled option").locator("beautiful-field").nth(1);
    for (const part of ["select", "label", "p"]) await expect(field.locator(part)).toHaveCSS("opacity", "0.5");
  });

  test("the open list is Popover's panel, under the select and at least as wide", async ({ page }) => {
    await open(page, "/select", "classic", "light");
    const zone = preview(page, "Fields").getByLabel("Time zone");
    await zone.click();
    const panel = await zone.evaluate((el) => {
      const style = getComputedStyle(el, "::picker(select)");
      return [style.backgroundColor, style.borderTopLeftRadius, style.paddingTop];
    });
    // The classic raised fill, --radius-lg and --space-1.
    expect(panel).toEqual(["rgb(255, 255, 255)", "12px", "4px"]);
    const select = (await zone.boundingBox())!;
    const first = (await zone.locator("option").first().boundingBox())!;
    expect(first.y).toBeGreaterThan(select.y + select.height);
    // As tall as a Dropdown item. Read from layout: the list grows in, so its box is scaled for a moment.
    expect(await zone.locator("option").first().evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(32);
  });

  test("one option is ever lit: the pointer's while it's on one, else the keyboard's", async ({ page }) => {
    await open(page, "/select", "classic", "light");
    const language = preview(page, "Fields").getByLabel("Language");
    const lit = () =>
      language.evaluate((el) =>
        [...el.querySelectorAll("option")].filter((o) => getComputedStyle(o).backgroundColor !== "rgba(0, 0, 0, 0)").map((o) => o.text),
      );
    // A click opens the list with nothing lit until the pointer is on an option, as Dropdown does.
    await language.click();
    expect(await lit()).toEqual([]);
    await page.keyboard.press("Escape");
    // The keyboard opens it with the picked option lit.
    await page.keyboard.press("Enter");
    expect(await lit()).toEqual(["English"]);
    // The pointer on another option lights it alone.
    await language.locator("option", { hasText: "Français" }).hover();
    expect(await lit()).toEqual(["Français"]);
  });

  test("the picked option has a check, and the others keep its room", async ({ page }) => {
    await open(page, "/select", "classic", "light");
    const zone = preview(page, "Fields").getByLabel("Time zone");
    await zone.click();
    const checks = await zone.evaluate((el) =>
      [...el.querySelectorAll("option")].map((o) => getComputedStyle(o, "::checkmark").visibility),
    );
    expect(checks.filter((v) => v === "visible")).toHaveLength(1);
    expect(checks[1]).toBe("visible");
  });

  test("on glass the list is frosted, as Popover's panel is", async ({ page }) => {
    await open(page, "/select", "glass", "light");
    const zone = preview(page, "Fields").getByLabel("Time zone");
    await zone.click();
    expect(await zone.evaluate((el) => getComputedStyle(el, "::picker(select)").backdropFilter)).toContain("blur(16px)");
  });
});

test.describe("Select on a touch screen", () => {
  test.use({ viewport: devices["Pixel 7"].viewport, hasTouch: true, isMobile: true });

  test("is 44px tall with 16px text, and opens the phone's own picker", async ({ page }) => {
    await open(page, "/select");
    const plan = preview(page, "Fields").getByLabel("Plan");
    expect((await plan.boundingBox())!.height).toBe(44);
    await expect(plan).toHaveCSS("font-size", "16px");
    await expect(plan).toHaveCSS("appearance", "none");
  });
});

test.describe("Select axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/select", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`an open list, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/select", theme, mode);
        const zone = preview(page, "Fields").getByLabel("Time zone");
        await zone.click();
        expect(await isOpen(zone)).toBe(true);
        await settle(zone);
        const results = await new AxeBuilder({ page }).include("#site-time-zone").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the glass dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/select", theme, mode);
        await section(page, "On glass, and in a dialog").getByRole("button", { name: "Invite a teammate" }).click();
        await expect(page.getByRole("dialog", { name: "Invite a teammate" })).toBeVisible();
        await settle(page.locator("#invite-member"));
        const results = await new AxeBuilder({ page }).include("#invite-member").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/select.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A disabled field's label and description are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> select:disabled)")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Select component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/select.html");
    await page.locator("[data-validating]").waitFor();
  });

  const form = (page: Page) => page.locator("[data-validating]");

  test("starts on the placeholder, with the value \"\", or on the value the page gave", async ({ page }) => {
    await expect(form(page).getByLabel("Plan")).toHaveValue("");
    await expect(form(page).getByLabel("Country")).toHaveValue("ca");
  });

  test("sending the form on the placeholder says to choose, and focuses the select", async ({ page }) => {
    await form(page).getByRole("button", { name: "Save" }).click();
    const plan = form(page).getByRole("combobox", { name: "Plan" });
    await expect(plan).toBeFocused();
    await expect(plan).toHaveAttribute("aria-invalid", "true");
    await expect(plan).toHaveAccessibleDescription("Choose an option.");
    // Picking clears it at once.
    await plan.selectOption("pro");
    await expect(plan).not.toHaveAttribute("aria-invalid", "true");
    await expect(plan).toHaveAccessibleDescription("");
  });

  test("reset puts back the placeholder and the page's value, and clears the error", async ({ page }) => {
    await form(page).getByRole("button", { name: "Save" }).click();
    await form(page).getByLabel("Plan").selectOption("starter");
    await form(page).getByLabel("Country").selectOption("gb");
    await form(page).getByRole("button", { name: "Start over" }).click();
    await expect(form(page).getByLabel("Plan")).toHaveValue("");
    await expect(form(page).getByLabel("Country")).toHaveValue("ca");
    await expect(form(page).getByLabel("Plan")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("a value from the page moves the select, and a pick reaches the page", async ({ page }) => {
    const box = page.locator("[data-controlled]");
    const range = box.getByRole("combobox", { name: "Date range" });
    await expect(range).toHaveValue("30");
    await range.selectOption("7");
    await expect(box.locator("output")).toHaveText("7");
    await box.getByRole("button", { name: "Show 90 days" }).click();
    await expect(range).toHaveValue("90");
  });

  test("options the page loads later take the value, and reset returns to it", async ({ page }) => {
    const late = page.locator("[data-late]");
    const plan = late.getByRole("combobox", { name: "Loaded plan" });
    await late.getByRole("button", { name: "Load plans" }).click();
    await expect(plan).toHaveValue("pro");
    await plan.selectOption("business");
    await late.getByRole("button", { name: "Reset" }).click();
    await expect(plan).toHaveValue("pro");
  });

  test("a select of several values keeps the browser's own rows", async ({ page }) => {
    const option = page.getByRole("listbox", { name: "Several sites" }).getByRole("option").first();
    await expect(option).not.toHaveCSS("display", "flex");
    await expect(page.getByRole("listbox", { name: "Several sites" })).not.toHaveCSS("block-size", "36px");
  });
});
