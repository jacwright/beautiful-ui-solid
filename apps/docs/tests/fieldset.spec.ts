import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// APG has no pattern for a field or a fieldset: they are native <fieldset>, <legend> and
// <label for>, so these check what the browser gives them, and the wiring the spec adds.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

test.describe("Fieldset keyboard and labels", () => {
  test.beforeEach(({ page }) => open(page, "/fieldset"));

  test("Tab moves through the fields in the order they're written", async ({ page }) => {
    const group = preview(page, "A group of fields");
    await group.getByLabel("Site name").focus();
    await page.keyboard.press("Tab");
    await expect(group.getByLabel("Summary")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(group.getByLabel("Language")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(group.getByLabel("Summary")).toBeFocused();
  });

  test("Tab skips every control in a disabled fieldset", async ({ page }) => {
    const fields = preview(page, "A disabled group").getByRole("textbox");
    await expect(fields).toHaveCount(2);
    for (const field of await fields.all()) await expect(field).toBeDisabled();
    // From the last toggle before the disabled group (Markup), Tab lands on the first one after it (Code).
    await section(page, "Checkboxes in a group").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "A disabled group").locator("summary").first()).toBeFocused();
  });

  test("a click on a label focuses its control, and ticks a checkbox", async ({ page }) => {
    const group = preview(page, "A group of fields");
    await group.getByText("Site name", { exact: true }).click();
    await expect(group.getByLabel("Site name")).toBeFocused();

    const weekly = preview(page, "Checkboxes in a group").getByRole("checkbox", { name: "Every Monday" });
    await expect(weekly).not.toBeChecked();
    await preview(page, "Checkboxes in a group").getByText("Every Monday, with last week's visits").click();
    await expect(weekly).toBeChecked();
    await page.keyboard.press("Space");
    await expect(weekly).not.toBeChecked();
  });

  test("each control is named by its label and described by its description and error", async ({ page }) => {
    const group = preview(page, "A group of fields");
    await expect(group.getByRole("textbox", { name: "Site name", exact: true })).toBeVisible();
    await expect(group.getByRole("textbox", { name: "Summary Optional", exact: true })).toHaveAccessibleDescription(
      "One or two sentences. Search results show it under the name.",
    );
    await expect(group.getByRole("combobox", { name: "Language", exact: true })).toBeVisible();

    const domain = preview(page, "A field with an error").getByRole("textbox", { name: "Custom domain" });
    await expect(domain).toHaveAccessibleDescription(
      "The address visitors type, such as springlaunch.com. A domain can't have spaces.",
    );
    await expect(domain).toHaveAttribute("aria-invalid", "true");
  });

  test("a fieldset is a group named by its legend and described under it", async ({ page }) => {
    const group = preview(page, "Checkboxes in a group").getByRole("group", { name: "Email me when" });
    await expect(group).toHaveAccessibleDescription("The emails go to the address you sign in with.");
    await expect(group.getByRole("checkbox")).toHaveCount(3);
  });
});

test.describe("Fieldset layout", () => {
  test.beforeEach(({ page }) => open(page, "/fieldset"));

  test("a text field stacks its label, description, control and error", async ({ page }) => {
    const field = preview(page, "A field with an error").locator("beautiful-field");
    const tops = await Promise.all(
      ["label", "p:not([data-error])", "input", "p[data-error]"].map((part) =>
        field.locator(part).boundingBox().then((box) => box!.y),
      ),
    );
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  test("a checkbox sits beside its label, centered on its line, with the description under the label", async ({ page }) => {
    const field = preview(page, "Checkboxes in a group").locator("beautiful-field").nth(1);
    const at = (part: string) => field.locator(part).boundingBox().then((b) => b!);
    const [box, label, description] = await Promise.all([at("input"), at("label"), at("p")]);
    expect(box.x + box.width).toBeLessThan(label.x);
    expect(Math.abs(box.y + box.height / 2 - (label.y + label.height / 2))).toBeLessThanOrEqual(1);
    expect(description.x).toBe(label.x);
    expect(description.y).toBeGreaterThan(label.y);
  });

  test("a disabled fieldset fades its legend, its description and its fields' labels", async ({ page }) => {
    const group = preview(page, "A disabled group");
    for (const part of ["legend", "fieldset > p", "label"]) await expect(group.locator(part).first()).toHaveCSS("opacity", "0.5");
    await expect(preview(page, "A group of fields").locator("label").first()).toHaveCSS("opacity", "1");
  });
});

test.describe("Fieldset colors", () => {
  test("an error is in the danger color, and an optional note in muted text", async ({ page }) => {
    await open(page, "/fieldset", "classic", "light");
    await expect(preview(page, "A field with an error").locator("p[data-error]")).toHaveCSS("color", "rgb(201, 31, 58)");
    const note = preview(page, "A group of fields").locator("label small");
    await expect(note).toHaveCSS("color", "rgb(82, 82, 91)");
    await expect(note).toHaveCSS("font-weight", "400");
  });
});

test.describe("Fieldset on a touch screen", () => {
  // A phone in Chromium: a touch screen, so the pointer is coarse.
  test.use({ viewport: devices["Pixel 7"].viewport, hasTouch: true, isMobile: true });

  test("the label, description and error grow to 16px with the control", async ({ page }) => {
    await open(page, "/fieldset");
    const field = preview(page, "A field with an error").locator("beautiful-field");
    for (const part of ["label", "p:not([data-error])", "p[data-error]"]) {
      await expect(field.locator(part)).toHaveCSS("font-size", "16px");
    }
  });
});

test.describe("Fieldset axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/fieldset", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the glass dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/fieldset", theme, mode);
        await section(page, "In a dialog, on glass").getByRole("button", { name: "Invite a teammate" }).click();
        await expect(page.getByRole("dialog", { name: "Invite a teammate" })).toBeVisible();
        await settle(page.locator("#invite"));
        const results = await new AxeBuilder({ page }).include("#invite").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/fieldset.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Fieldset component", () => {
  test("an error that comes and goes marks the control invalid while it shows", async ({ page }) => {
    await page.goto("/tests/harness/fieldset.html");
    const control = page.getByRole("textbox", { name: "Subdomain" });
    await expect(control).not.toHaveAttribute("aria-invalid");
    await expect(control).not.toHaveAttribute("aria-describedby");
    await page.getByRole("button", { name: "Toggle error" }).click();
    await expect(control).toHaveAttribute("aria-invalid", "true");
    await expect(control).toHaveAccessibleDescription("That subdomain is taken.");
    await page.getByRole("button", { name: "Toggle error" }).click();
    await expect(control).not.toHaveAttribute("aria-invalid");
    await expect(control).not.toHaveAttribute("aria-describedby");
  });

  test("a disabled field disables its control and fades its label", async ({ page }) => {
    await page.goto("/tests/harness/fieldset.html");
    const control = page.getByRole("textbox", { name: "Subdomain" });
    await expect(control).toBeEnabled();
    await page.getByRole("button", { name: "Toggle disabled" }).click();
    await expect(control).toBeDisabled();
    await expect(page.locator("#changing").locator("xpath=..").locator("label")).toHaveCSS("opacity", "0.5");
  });

  test("a field without an id makes a unique one and links its parts", async ({ page }) => {
    await page.goto("/tests/harness/fieldset.html");
    const control = page.getByRole("textbox", { name: "Made-up id" });
    await expect(control).toHaveAccessibleDescription("Its id is unique.");
    const id = await control.getAttribute("id");
    expect(id).toBeTruthy();
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  });

  test("a description with its own id is linked by it, and the control's own links are kept after the field's", async ({ page }) => {
    await page.goto("/tests/harness/fieldset.html");
    const bio = page.getByRole("textbox", { name: "Bio" });
    await expect(bio).toHaveAttribute("aria-describedby", "bio-help own-links-error bio-count");
    await expect(bio).toHaveAttribute("aria-invalid", "true");
  });

  test("a control outside a field takes nothing from one", async ({ page }) => {
    await page.goto("/tests/harness/fieldset.html");
    const alone = page.getByRole("textbox", { name: "Outside a field" });
    await expect(alone).toBeVisible();
    for (const name of ["id", "aria-describedby", "aria-invalid", "disabled"]) await expect(alone).not.toHaveAttribute(name);
  });
});
