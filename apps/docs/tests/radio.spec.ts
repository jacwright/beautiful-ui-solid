import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG Radio Group pattern: the group is one Tab stop, which lands on the checked radio
// (or the first, or the last coming back, when none is checked), the arrow keys move to the next or
// previous radio and check it, wrapping at the ends, and Space checks the focused one. Native radios
// give all of it. The group adds the value, the error and the reset, which the harness tests.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

test.describe("Radio keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/radio"));

  test("the arrow keys move to the next radio and check it, wrapping at the ends", async ({ page }) => {
    const group = preview(page, "A group");
    const anyone = group.getByRole("radio", { name: "Anyone with the link" });
    const team = group.getByRole("radio", { name: "Only the team" });
    const me = group.getByRole("radio", { name: "Only me" });
    await anyone.focus();
    await page.keyboard.press("ArrowDown");
    await expect(team).toBeFocused();
    await expect(team).toBeChecked();
    await expect(anyone).not.toBeChecked();
    await page.keyboard.press("ArrowRight");
    await expect(me).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(anyone).toBeFocused();
    await expect(anyone).toBeChecked();
    await page.keyboard.press("ArrowUp");
    await expect(me).toBeFocused();
    await expect(me).toBeChecked();
    await page.keyboard.press("ArrowLeft");
    await expect(team).toBeChecked();
  });

  test("the group is one Tab stop, and Tab lands on the checked radio", async ({ page }) => {
    const group = preview(page, "A group");
    const team = group.getByRole("radio", { name: "Only the team" });
    await team.check();
    await page.keyboard.press("Shift+Tab");
    await expect(group.getByRole("radio", { name: "Only the team" })).not.toBeFocused();
    await page.keyboard.press("Tab");
    await expect(team).toBeFocused();
    // The next Tab leaves the group, past the radios that aren't checked.
    await page.keyboard.press("Tab");
    await expect(section(page, "A group").locator("summary").first()).toBeFocused();
  });

  test("with none checked, Tab lands on the first radio, Shift+Tab on the last, and Space checks it", async ({ page }) => {
    const group = preview(page, "Nothing chosen");
    await section(page, "Disabled").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    const editor = group.getByRole("radio", { name: "Editor" });
    await expect(editor).toBeFocused();
    await page.keyboard.press("Space");
    await expect(editor).toBeChecked();
    await section(page, "Nothing chosen").locator("summary").first().focus();
    await editor.evaluate((el: HTMLInputElement) => (el.checked = false));
    // Past the Send button, back into the group.
    await page.keyboard.press("Shift+Tab");
    await expect(group.getByRole("button", { name: "Send" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(group.getByRole("radio", { name: "Owner" })).toBeFocused();
  });

  test("a disabled radio is skipped by the arrow keys", async ({ page }) => {
    const group = preview(page, "Disabled").locator("fieldset#billing-period");
    const monthly = group.getByRole("radio", { name: "Monthly, $29" });
    await monthly.focus();
    await page.keyboard.press("ArrowDown");
    await expect(monthly).toBeFocused();
    await expect(monthly).toBeChecked();
    await expect(group.getByRole("radio", { name: "Yearly, $290" })).toBeDisabled();
  });

  test("a click on the label checks the radio", async ({ page }) => {
    const group = preview(page, "A group");
    await group.getByText("Only the team").click();
    await expect(group.getByRole("radio", { name: "Only the team" })).toBeChecked();
    await expect(group.getByRole("radio", { name: "Anyone with the link" })).not.toBeChecked();
  });

  test("the group is named by its legend and described by its description, and each radio by its label and description", async ({ page }) => {
    const group = preview(page, "With descriptions");
    const radiogroup = group.getByRole("radiogroup", { name: "Publish changes" });
    await expect(radiogroup).toHaveAccessibleDescription("Applies to every page on the site.");
    await expect(radiogroup.getByRole("radio", { name: "Right away" })).toHaveAccessibleDescription(
      "Visitors see a change the moment you save it.",
    );
    await expect(radiogroup.getByRole("radio")).toHaveCount(3);
  });

  test("a group sent with nothing chosen is invalid, required, and described by its error", async ({ page }) => {
    const sent = preview(page, "Nothing chosen");
    await sent.getByRole("button", { name: "Send" }).click();
    const radiogroup = sent.getByRole("radiogroup", { name: "Role" });
    await expect(radiogroup).toHaveAttribute("aria-required", "true");
    await expect(radiogroup).toHaveAttribute("aria-invalid", "true");
    await expect(radiogroup).toHaveAccessibleDescription("Choose an option.");
    await expect(radiogroup.getByRole("radio", { name: "Editor" })).toHaveAttribute("aria-invalid", "true");
  });
});

test.describe("Radio look", () => {
  test("a radio is a 16px circle with the kit's focus ring around it", async ({ page }) => {
    await page.goto("/tests/harness/radio.html?theme=classic&mode=light");
    const radio = page.getByRole("radio", { name: "Only the team" });
    const size = (await radio.boundingBox())!;
    expect([size.width, size.height]).toEqual([16, 16]);
    await expect(radio).toHaveCSS("border-radius", "50%");
    await page.getByRole("radio", { name: "Anyone with the link" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(radio).toBeFocused();
    await expect(radio).toHaveCSS("outline-style", "solid");
    await expect(radio).toHaveCSS("outline-width", "2px");
    await expect(radio).toHaveCSS("outline-offset", "2px");
  });

  test("off is a well with a 3:1 edge, on takes the accent fill and a dot, and invalid takes the danger edge", async ({ page }) => {
    await page.goto("/tests/harness/radio.html?theme=classic&mode=light");
    const accentFill = await page.evaluate(() => {
      const probe = document.createElement("beautiful-probe");
      probe.style.background = "color-mix(in srgb, var(--color-accent-fill) var(--control-primary-opacity), transparent)";
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    const off = page.getByRole("radio", { name: "Only the team" });
    await expect(off).toHaveCSS("border-top-color", "rgb(113, 113, 122)");
    const on = page.getByRole("radio", { name: "Anyone with the link" });
    await expect(on).toHaveCSS("background-color", accentFill);
    // The dot has grown to 3px, its radius: 6px across.
    await expect.poll(() => on.evaluate((el) => getComputedStyle(el).getPropertyValue("--radio-dot"))).toBe("3px");
    expect(await off.evaluate((el) => getComputedStyle(el).getPropertyValue("--radio-dot"))).toBe("0px");
    // A press on another radio takes the fill and the dot with it.
    await off.check();
    await expect(off).toHaveCSS("background-color", accentFill);
    await expect(on).not.toHaveCSS("background-color", accentFill);
  });

  test("an invalid radio has the danger edge", async ({ page }) => {
    await open(page, "/radio", "classic", "light");
    const sent = preview(page, "Nothing chosen");
    await sent.getByRole("button", { name: "Send" }).click();
    const editor = sent.getByRole("radio", { name: "Editor" });
    await expect(editor).toHaveCSS("border-top-color", "rgb(201, 31, 58)");
  });

  test("a disabled radio fades with its label and description", async ({ page }) => {
    await page.goto("/tests/harness/radio.html");
    const field = page.locator("beautiful-field", { has: page.getByRole("radio", { name: "Yearly, $290" }) });
    for (const part of ["input", "label", "p"]) await expect(field.locator(part)).toHaveCSS("opacity", "0.5");
  });

  test("a radio sits on the first line of a label that wraps", async ({ page }) => {
    await page.goto("/tests/harness/radio.html");
    const field = page.locator("beautiful-field", { has: page.getByRole("radio", { name: "After a teammate approves" }) });
    await field.evaluate((el) => ((el as HTMLElement).style.width = "120px"));
    const radio = (await field.locator("input").boundingBox())!;
    const label = (await field.locator("label").boundingBox())!;
    const line = await field.locator("label").evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect(label.height).toBeGreaterThan(line * 1.5);
    expect(Math.abs(radio.y + radio.height / 2 - (label.y + line / 2))).toBeLessThanOrEqual(1);
  });

  test("forced colors give the browser's own radio back", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/tests/harness/radio.html");
    await expect(page.getByRole("radio", { name: "Anyone with the link" })).toHaveCSS("appearance", "auto");
  });
});

test.describe("Radio on a touch screen", () => {
  test.use({ viewport: devices["Pixel 7"].viewport, hasTouch: true, isMobile: true });

  test("a radio is 20px", async ({ page }) => {
    await page.goto("/tests/harness/radio.html");
    const size = (await page.getByRole("radio", { name: "Anyone with the link" }).boundingBox())!;
    // 1.25rem at this screen's pixel ratio is a hair over 20.
    expect(size.width).toBeCloseTo(20, 2);
    expect(size.height).toBeCloseTo(20, 2);
  });
});

test.describe("Radio axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/radio", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/radio", theme, mode);
        await section(page, "In a dialog").getByRole("button", { name: "Share" }).click();
        await expect(page.getByRole("dialog", { name: "Share Spring launch" })).toBeVisible();
        const results = await new AxeBuilder({ page }).include("#share-site").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/radio.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The group sent with nothing chosen shows its error, which has to be readable too.
        await page.getByRole("button", { name: "Send", exact: true }).click();
        await expect(page.locator("#role-error")).toBeVisible();
        // A disabled radio's label and description are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> input:disabled)")
          .exclude("fieldset:disabled")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Radio component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/radio.html");
    await page.locator("#send-form input").first().waitFor();
  });

  test("a group the page holds follows its value, both ways", async ({ page }) => {
    const plan = page.locator('[data-example="controlled"]');
    await expect(plan.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await plan.getByRole("radio", { name: "Yearly" }).check();
    await expect(page.locator("#plan-now")).toHaveText("yearly");
    await page.getByRole("button", { name: "Choose yearly" }).click();
    await expect(plan.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await plan.getByRole("radio", { name: "Monthly" }).check();
    await expect(page.locator("#plan-now")).toHaveText("monthly");
    await page.getByRole("button", { name: "Choose yearly" }).click();
    await expect(plan.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await expect(plan.getByRole("radio", { name: "Monthly" })).not.toBeChecked();
  });

  test("a choice the page refuses is put back", async ({ page }) => {
    const locked = page.locator('[data-example="refusing"]');
    await locked.getByRole("radio", { name: "Locked yearly" }).check({ force: true }).catch(() => {});
    await expect(locked.getByRole("radio", { name: "Locked monthly" })).toBeChecked();
    await expect(locked.getByRole("radio", { name: "Locked yearly" })).not.toBeChecked();
  });

  test("a reset leaves a group the page holds as the page has it", async ({ page }) => {
    const plan = page.locator('[data-example="controlled"]');
    await plan.getByRole("radio", { name: "Yearly" }).check();
    await plan.getByRole("button", { name: "Reset plan" }).click();
    await expect(plan.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await expect(page.locator("#plan-now")).toHaveText("yearly");
  });

  test("a group that stops being required drops its message", async ({ page }) => {
    const form = page.locator("#req-form");
    await form.getByRole("button", { name: "Send contact" }).click();
    await expect(form.locator("p[data-error]")).toHaveCount(1);
    await form.getByRole("button", { name: "Stop requiring" }).click();
    await expect(form.locator("p[data-error]")).toHaveCount(0);
    await expect(form.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    await expect(form.getByRole("radiogroup")).not.toHaveAttribute("aria-required");
  });

  test("the group names its radios, so a form sends the checked one", async ({ page }) => {
    const form = page.locator("#send-form");
    await form.getByRole("radio", { name: "Owner" }).check();
    await form.getByRole("radio", { name: "Large" }).check();
    await form.getByRole("button", { name: "Invite" }).click();
    await expect(page.locator("#sent")).toHaveText(JSON.stringify([["role", "owner"], ["size", "l"]]));
  });

  test("a required group sent with nothing chosen speaks once, under its last option, and focus goes to the first radio", async ({ page }) => {
    const form = page.locator("#send-form");
    const group = form.getByRole("radiogroup", { name: "Role" });
    await form.getByRole("button", { name: "Invite" }).click();
    await expect(page.locator("#sent")).toHaveText("");
    await expect(group.getByRole("radio", { name: "Editor" })).toBeFocused();
    await expect(group).toHaveAttribute("aria-invalid", "true");
    await expect(group).toHaveAccessibleDescription("Choose an option.");
    // One message for the group, not one for each option's field.
    await expect(form.locator("p[data-error]")).toHaveCount(1);
    expect(await group.evaluate((el) => (el.lastElementChild as HTMLElement).matches("p[data-error]"))).toBe(true);
    for (const radio of await group.getByRole("radio").all()) await expect(radio).toHaveAttribute("aria-invalid", "true");
    // Space checks the focused radio, and the message goes at once.
    await page.keyboard.press("Space");
    await expect(group.getByRole("radio", { name: "Editor" })).toBeChecked();
    await expect(form.locator("p[data-error]")).toHaveCount(0);
    await expect(group).not.toHaveAttribute("aria-invalid");
    await expect(group.getByRole("radio", { name: "Owner" })).not.toHaveAttribute("aria-invalid");
    await form.getByRole("button", { name: "Invite" }).click();
    await expect(page.locator("#sent")).toHaveText(JSON.stringify([["role", "editor"], ["size", "m"]]));
  });

  test("onChange hears an arrow key", async ({ page }) => {
    const size = page.locator("#send-form").getByRole("radiogroup", { name: "Size" });
    await size.getByRole("radio", { name: "Medium" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(size.getByRole("radio", { name: "Large" })).toBeChecked();
    await expect(page.locator("#heard")).toHaveText(JSON.stringify(["l"]));
  });

  test("a reset puts the choice back, tells onChange, and clears the error", async ({ page }) => {
    const form = page.locator("#send-form");
    const size = form.getByRole("radiogroup", { name: "Size" });
    await form.getByRole("button", { name: "Invite" }).click();
    await expect(form.locator("p[data-error]")).toHaveCount(1);
    await size.getByRole("radio", { name: "Large" }).check();
    await form.getByRole("button", { name: "Reset" }).click();
    await expect(size.getByRole("radio", { name: "Medium" })).toBeChecked();
    await expect(size.getByRole("radio", { name: "Large" })).not.toBeChecked();
    await expect(page.locator("#heard")).toHaveText(JSON.stringify(["l", "m"]));
    await expect(form.locator("p[data-error]")).toHaveCount(0);
    // A radio checked since the page loaded, with no default, is cleared by the reset.
    await form.getByRole("radio", { name: "Owner" }).check();
    await form.getByRole("button", { name: "Reset" }).click();
    await expect(form.getByRole("radio", { name: "Owner" })).not.toBeChecked();
    await form.getByRole("button", { name: "Invite" }).click();
    await expect(form.locator("p[data-error]")).toHaveCount(1);
  });
});
