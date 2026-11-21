import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG disclosure pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
// The docs page tests what the browser does with the examples. The harness tests what the Solid
// component adds: closing when focus leaves, and open and onToggle.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** The button that toggles the panel with this id. */
function trigger(page: Page, id: string) {
  return page.locator(`[commandfor="${id}"][command="toggle-popover"]`);
}

/**
 * The expanded state the browser exposes to screen readers. It comes from the popover itself, not
 * an aria-expanded attribute, and Playwright's role queries only read attributes, so this asks
 * Chromium's accessibility tree.
 */
async function expanded(page: Page, selector: string) {
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  await cdp.detach();
  return nodes[0]?.properties?.find((property) => property.name === "expanded")?.value.value;
}

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("not rendered");
  return found;
}

test.describe("Popover keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/popover"));

  test("Enter and Space open and close the panel, and focus stays on the button", async ({ page }) => {
    const button = trigger(page, "share");
    const panel = page.locator("#share");
    await expect(button).toHaveAttribute("type", "button");
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(panel).toBeVisible();
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(panel).toBeHidden();
    await page.keyboard.press("Space");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Space");
    await expect(panel).toBeHidden();
  });

  test("the button is announced collapsed, then expanded", async ({ page }) => {
    const button = section(page, "With actions").getByRole("button", { name: "Share" });
    await expect(button).toHaveAccessibleName("Share");
    expect(await expanded(page, '[commandfor="share"][command="toggle-popover"]')).toBe(false);
    await button.click();
    await expect(page.locator("#share")).toBeVisible();
    expect(await expanded(page, '[commandfor="share"][command="toggle-popover"]')).toBe(true);
  });

  test("Tab moves from the button into the panel, in order", async ({ page }) => {
    await trigger(page, "share").click();
    await page.keyboard.press("Tab");
    await expect(page.locator("#share").getByRole("button", { name: "Done" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#share").getByRole("button", { name: "Copy link" })).toBeFocused();
  });

  test("Escape closes the panel and returns focus to the button", async ({ page }) => {
    await trigger(page, "share").click();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await expect(page.locator("#share")).toBeHidden();
    await expect(trigger(page, "share")).toBeFocused();
  });

  test("a click outside closes the panel", async ({ page }) => {
    await trigger(page, "share").click();
    await page.locator("h1").click();
    await expect(page.locator("#share")).toBeHidden();
  });

  test("a close button in the panel closes it", async ({ page }) => {
    await trigger(page, "share").click();
    await page.locator("#share").getByRole("button", { name: "Done" }).click();
    await expect(page.locator("#share")).toBeHidden();
  });

  test("opening one popover closes another", async ({ page }) => {
    await trigger(page, "place-bottom").click();
    await trigger(page, "place-top").click();
    await expect(page.locator("#place-bottom")).toBeHidden();
    await expect(page.locator("#place-top")).toBeVisible();
  });
});

test.describe("Popover placement", () => {
  test.beforeEach(({ page }) => open(page, "/popover"));

  test("sits below its button, lined up with its left edge, by default", async ({ page }) => {
    await trigger(page, "place-bottom").click();
    const button = await box(trigger(page, "place-bottom"));
    const panel = await box(page.locator("#place-bottom"));
    expect(Math.round(panel.x)).toBe(Math.round(button.x));
    // 0.5rem below the button.
    expect(Math.round(panel.y - (button.y + button.height))).toBe(8);
  });

  test("follows anchor: centered above, and beside", async ({ page }) => {
    await trigger(page, "place-top").click();
    let button = await box(trigger(page, "place-top"));
    let panel = await box(page.locator("#place-top"));
    expect(Math.round(button.y - (panel.y + panel.height))).toBe(8);
    expect(Math.abs(panel.x + panel.width / 2 - (button.x + button.width / 2))).toBeLessThan(1);

    await trigger(page, "place-right").click();
    button = await box(trigger(page, "place-right"));
    panel = await box(page.locator("#place-right"));
    expect(Math.round(panel.x - (button.x + button.width))).toBe(8);
    expect(Math.round(panel.y)).toBe(Math.round(button.y));
  });

  test("stays on a phone's screen, 1rem from its edges", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const id of ["place-bottom", "place-top", "place-right", "place-end", "cname-help", "launch-details"]) {
      await trigger(page, id).evaluate((el) => el.scrollIntoView({ block: "center" }));
      await trigger(page, id).click();
      const panel = await box(page.locator(`#${id}`));
      expect(panel.x, id).toBeGreaterThanOrEqual(16);
      expect(panel.x + panel.width, id).toBeLessThanOrEqual(390 - 16);
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("Popover axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/popover", theme, mode);
        await trigger(page, "share").click();
        await page.locator("#share").waitFor();
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so it is checked on
      // the harness's plain canvas, with the panels open.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/popover.html?theme=${theme}&mode=${mode}`);
        await page.locator("#controlled").waitFor({ state: "attached" });
        await page.getByRole("button", { name: "Open from outside" }).click();
        await expect(page.locator("#controlled")).toBeVisible();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("#controlled").analyze();
        expect(results.violations).toEqual([]);
        // Glass lets the page through, which axe can't judge either. The glass contrast check measures it from pixels.
        if (theme !== "glass") expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Popover component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/popover.html");
    await page.locator("[data-example]").first().waitFor({ state: "attached" });
  });

  test("Tab past the end of the panel closes it, and focus goes on", async ({ page }) => {
    await trigger(page, "share").click();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator("#share").getByRole("button", { name: "Copy link" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#share")).toBeHidden();
    await expect(trigger(page, "share")).not.toBeFocused();
  });

  test("Shift+Tab back before the button closes it", async ({ page }) => {
    await trigger(page, "place-top").click();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Below", exact: true })).toBeFocused();
    await expect(page.locator("#place-top")).toBeHidden();
  });

  test("moving between the button and the panel keeps it open", async ({ page }) => {
    await trigger(page, "share").click();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(trigger(page, "share")).toBeFocused();
    await expect(page.locator("#share")).toBeVisible();
  });

  test("open opens and closes it from the parent, anchored to its button", async ({ page }) => {
    await page.getByRole("button", { name: "Open from outside" }).click();
    const panel = page.locator("#controlled");
    await expect(panel).toBeVisible();
    const button = await box(trigger(page, "controlled"));
    const placed = await box(panel);
    expect(Math.round(placed.x)).toBe(Math.round(button.x));
    expect(Math.round(placed.y - (button.y + button.height))).toBe(8);
    await page.getByRole("button", { name: "Close from outside" }).click();
    await expect(panel).toBeHidden();
  });

  test("onToggle reports each open and close, however it happens", async ({ page }) => {
    const log = page.locator("#toggles");
    await trigger(page, "controlled").click();
    await expect(log).toHaveText("open");
    await page.keyboard.press("Escape");
    await expect(log).toHaveText("open closed");
    await page.getByRole("button", { name: "Open from outside" }).click();
    await expect(log).toHaveText("open closed open");
  });

  test("a caller's ref reaches the button and the panel", async ({ page }) => {
    await expect(trigger(page, "controlled")).toHaveAttribute("data-ref", "button");
    await expect(page.locator("#controlled")).toHaveAttribute("data-ref", "panel");
  });

  test("the panel opens on the side anchor names, and anchor's default is left out", async ({ page }) => {
    await expect(page.locator("#place-bottom")).not.toHaveAttribute("data-anchor");
    await expect(page.locator("#place-right")).toHaveAttribute("data-anchor", "right start");
  });
});
