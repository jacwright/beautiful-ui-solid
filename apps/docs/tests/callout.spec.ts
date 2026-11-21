import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Callout has no APG pattern: it is a note (role="note"), or a live region (status or alert) when
// it's announced. It never takes focus itself. Its links and buttons are in the tab order, and the
// × hands focus on when the callout goes.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Callout keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/callout"));

  test("each callout is a note, read with its title first", async ({ page }) => {
    const notes = section(page, "Tones").getByRole("note");
    await expect(notes).toHaveCount(5);
    await expect(notes.first().locator(":scope > :first-child")).toHaveText("Domains take up to a day to connect");
    await expect(notes.first().locator(":scope > :first-child")).toHaveJSProperty("tagName", "STRONG");
    await expect(notes.nth(2).locator("strong")).toHaveCSS("font-weight", "600");
  });

  test("Tab passes over the callout and stops on its actions in order", async ({ page }) => {
    const preview = section(page, "With actions").locator("beautiful-example-preview");
    await preview.getByRole("button", { name: "View the build log" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(section(page, "Tones").locator("summary").last()).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "How builds work" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "Update card" })).toBeFocused();
  });

  test("the icon is drawn by CSS and the text keeps the text color", async ({ page }) => {
    const warning = section(page, "Tones").locator('beautiful-callout[data-tone="warning"]');
    const icon = await warning.evaluate((el) => {
      const before = getComputedStyle(el, "::before");
      return { height: before.height, mask: before.maskImage };
    });
    expect(icon.height).toBe("20px");
    expect(icon.mask).toContain("data:image/svg+xml");
    const color = await page.evaluate(() => getComputedStyle(document.body).color);
    await expect(warning.locator("p")).toHaveCSS("color", color);
  });

  test("the × dismisses the callout, and focus moves to what comes next", async ({ page }) => {
    const live = section(page, "Dismissible");
    const dismiss = live.getByRole("button", { name: "Dismiss" });
    await dismiss.focus();
    await page.keyboard.press("Enter");
    await expect(live.getByRole("note")).toHaveCount(0);
    // Focus was on the ×. It goes on to the button after the callout, not to the top of the page.
    await expect(live.getByRole("button", { name: "Open the editor" })).toBeFocused();
  });

  test("a callout that is announced is a live region, alert for danger and status for success", async ({ page }) => {
    const live = section(page, "Read out as it appears");
    await live.getByRole("button", { name: "Publish with errors" }).click();
    await expect(live.getByRole("alert")).toContainText("2 pages didn't build");
    await live.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(live.getByRole("status")).toContainText("Spring launch is live");
    await expect(live.getByRole("alert")).toHaveCount(0);
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Callout axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/callout", theme, mode);
        await section(page, "Read out as it appears").getByRole("button", { name: "Publish with errors" }).click();
        await expect(section(page, "Read out as it appears").getByRole("alert")).toContainText("2 pages didn't build");
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient or through glass, so the callouts are checked
      // on the harness's plain canvas in classic. Glass is measured from pixels in glass.spec.ts.
      if (theme !== "glass") {
        test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
          await page.goto(`/tests/harness/callout.html?theme=${theme}&mode=${mode}`);
          await page.locator("[data-example]").first().waitFor();
          const results = await new AxeBuilder({ page })
            .withRules(["color-contrast"])
            .include("[data-example] beautiful-callout:not(beautiful-demo-stage *)")
            .analyze();
          expect(results.passes.length).toBeGreaterThan(0);
          expect(results.violations).toEqual([]);
          expect(results.incomplete).toEqual([]);
        });
      }
    }
  }
});

test.describe("Callout component", () => {
  test("dismissing fades it out first, then focus moves on", async ({ page }) => {
    await page.goto("/tests/harness/callout.html");
    const callout = page.locator("#dismissible");
    await callout.getByRole("button", { name: "Dismiss" }).focus();
    await page.keyboard.press("Space");
    await expect(callout).toHaveAttribute("data-leaving", "");
    await expect(callout).toHaveCount(0);
    await expect(page.locator("#after")).toBeFocused();
  });

  test("a page that keeps the callout gets it back", async ({ page }) => {
    await page.goto("/tests/harness/callout.html");
    const kept = page.locator("#kept");
    await kept.getByRole("button", { name: "Hide tip" }).click();
    await expect(kept).toHaveAttribute("data-leaving", "");
    await expect(kept).not.toHaveAttribute("data-leaving");
    await expect(kept).toHaveCSS("opacity", "1");
  });

  test("a handler that throws still lets the callout come back", async ({ page }) => {
    await page.goto("/tests/harness/callout.html");
    page.on("pageerror", () => {});
    const throws = page.locator("#throws");
    await throws.getByRole("button", { name: "Hide broken tip" }).click();
    await expect(throws).toHaveAttribute("data-leaving", "");
    await expect(throws).not.toHaveAttribute("data-leaving");
  });

  test("a live callout goes in empty and fills a frame later, so it is read out", async ({ page }) => {
    await page.goto("/tests/harness/callout.html");
    await page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { seen: string[] }).seen = seen;
      new MutationObserver((records) => {
        for (const record of records)
          for (const node of record.addedNodes)
            if (node instanceof HTMLElement && node.id === "live-danger") seen.push(node.textContent ?? "");
      }).observe(document.body, { childList: true, subtree: true });
    });
    await page.locator("#show-live").click();
    await expect(page.locator("#live-danger")).toContainText("2 pages didn't build");
    const seen = await page.evaluate(() => (window as unknown as { seen: string[] }).seen);
    expect(seen).toEqual([""]);
  });

  test("live picks alert or status, and a role of the page's own wins", async ({ page }) => {
    await page.goto("/tests/harness/callout.html");
    await page.locator("#show-live").click();
    await expect(page.locator("#live-danger")).toHaveAttribute("role", "alert");
    await expect(page.locator("#live-success")).toHaveAttribute("role", "status");
    const own = page.locator("#live-role");
    await expect(own).toHaveAttribute("role", "log");
    await expect(own).toHaveClass("custom");
    await expect(own).toHaveAttribute("aria-label", "Build");
    await expect(own).not.toHaveAttribute("data-tone");
  });

  test("an announced callout arrives with a fade, and one on the page from the start doesn't", async ({ page }) => {
    await page.goto("/tests/harness/callout.html");
    const still = await page.locator('[data-example="tones"] beautiful-callout').first().evaluate((el) => el.getAnimations().length);
    expect(still).toBe(0);
    await page.locator("#show-live").click();
    const arriving = await page.locator("#live-danger").evaluate((el) => el.getAnimations().map((a) => (a as CSSTransition).transitionProperty));
    expect(arriving).toContain("opacity");
  });
});
