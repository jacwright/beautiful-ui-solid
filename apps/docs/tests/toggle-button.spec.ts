import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG button pattern, for a toggle button: https://www.w3.org/WAI/ARIA/apg/patterns/button/

/** The live preview of the docs example with this title. */
function example(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) }).locator("beautiful-example-preview");
}

const harness = (page: Page, theme = "glass", mode = "light") =>
  page.goto(`/tests/harness/toggle-button.html?theme=${theme}&mode=${mode}`).then(() => page.locator("[data-example]").first().waitFor());

test.describe("Toggle button keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/toggle-button"));

  test("is a button that says whether it's pressed", async ({ page }) => {
    const row = example(page, "Secondary, the default");
    await expect(row.getByRole("button", { name: "Show drafts", pressed: true })).toBeVisible();
    await expect(row.getByRole("button", { name: "Show archived", pressed: false })).toBeVisible();
  });

  test("Tab moves through the toggles in order", async ({ page }) => {
    const row = example(page, "Tertiary, in a row above an editor");
    await row.getByRole("button", { name: "Grid" }).focus();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Outlines" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(row.getByRole("button", { name: "Spellcheck" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(row.getByRole("button", { name: "Outlines" })).toBeFocused();
  });

  test("Enter and Space flip it, and the name stays the same", async ({ page }) => {
    const button = example(page, "Secondary, the default").getByRole("button", { name: "Show archived" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveAccessibleName("Show archived");
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAccessibleName("Show archived");
  });

  test("Tab skips a disabled toggle, which keeps its state", async ({ page }) => {
    const section = (title: string) => page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
    const disabled = section("Disabled, pressed and not").locator("beautiful-example-preview");
    await expect(disabled.getByRole("button", { name: "Show drafts", pressed: true })).toBeDisabled();
    await expect(disabled.getByRole("button", { name: "Show archived", pressed: false })).toBeDisabled();
    await section("With an icon").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section("Disabled, pressed and not").locator("summary").first()).toBeFocused();
  });

  test("the name comes from the text, and an icon adds nothing to it", async ({ page }) => {
    const icons = example(page, "With an icon");
    await expect(icons.getByRole("button", { name: "Favorite", exact: true })).toBeVisible();
    await expect(icons.getByRole("button", { name: "Watch for changes", exact: true })).toBeVisible();
  });
});

test.describe("Toggle button look", () => {
  // Pressed sinks: no drop shadow or rim, so the state doesn't rest on color alone.
  for (const theme of themes) {
    for (const mode of modes) {
      test(`pressed is sunk and tinted, ${theme} ${mode}`, async ({ page }) => {
        await harness(page, theme, mode);
        const row = page.locator('[data-example="secondary"]');
        const look = (name: string) =>
          row.getByRole("button", { name }).evaluate((el) => {
            const style = getComputedStyle(el);
            return { fill: style.backgroundColor, shadow: style.boxShadow, rim: getComputedStyle(el, "::before").content };
          });
        const pressed = await look("Show drafts");
        const rest = await look("Show archived");
        expect(pressed.fill).not.toBe(rest.fill);
        expect(pressed.shadow).toContain("inset");
        expect(rest.shadow).not.toContain("inset");
        expect(pressed.rim).toBe("none");
      });
    }
  }
});

test.describe("Toggle button axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/toggle-button", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // The docs page's gradient leaves axe unable to judge contrast, so it is checked on the
      // harness's plain canvas, with each pressed toggle hovered too.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await harness(page, theme, mode);
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
        // Glass lets the page through, which axe can't judge. glass.spec.ts measures it from pixels.
        if (theme !== "glass") expect(results.incomplete).toEqual([]);

        for (const button of await page.locator('[aria-pressed="true"]:enabled').all()) {
          await button.hover();
          const hovered = await new AxeBuilder({ page }).include('[aria-pressed="true"]:hover').withRules(["color-contrast"]).analyze();
          expect(hovered.violations).toEqual([]);
        }
      });
    }
  }
});

test.describe("Toggle button component", () => {
  test("owns its state from defaultPressed, and reports each flip", async ({ page }) => {
    await harness(page);
    const button = page.locator('[data-example="reported"]').getByRole("button", { name: "Show drafts" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-log="reported"]')).toHaveText("false true");
  });

  test("shows what pressed says when the page owns the state", async ({ page }) => {
    await harness(page);
    const live = page.locator('[data-example="controlled"]').getByRole("button", { name: "Live preview" });
    await expect(live).toHaveAttribute("aria-pressed", "false");
    await live.click();
    await expect(live).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-log="controlled"]')).toHaveText("true");

    // The page never sets it, so it stays pressed, and the click is still reported.
    const held = page.getByRole("button", { name: "Locked on" });
    await held.click();
    await expect(held).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-log="held"]')).toHaveText("false");
  });

  test("a caller's onClick can keep the state by preventing the default", async ({ page }) => {
    await harness(page);
    const button = page.getByRole("button", { name: "Stays off" });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-log="prevented"]')).toHaveText("");
  });

  test("is never a submit button", async ({ page }) => {
    await harness(page);
    for (const button of await page.locator("button[aria-pressed]").all()) await expect(button).toHaveAttribute("type", "button");
  });
});
