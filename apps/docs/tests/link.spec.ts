import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG Link pattern: Tab reaches a link, Enter follows it, and it is read as a link with its words.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

test.describe("Link keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/link"));

  test("Tab moves through the links in the order of the page", async ({ page }) => {
    const preview = section(page, "In text").locator("beautiful-example-preview");
    await section(page, "In text").getByRole("heading").evaluate((heading) => {
      // Start just before the example, so the next Tab is its first link.
      heading.tabIndex = -1;
      heading.focus();
    });
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "spring-launch.example.com" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("link", { name: "preview link" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(preview.getByRole("link", { name: "spring-launch.example.com" })).toBeFocused();
  });

  test("Enter follows a link, and Space doesn't", async ({ page }) => {
    const link = section(page, "On its own").getByRole("link", { name: "Export the entries as CSV" });
    await link.focus();
    await page.keyboard.press("Space");
    expect(await page.evaluate(() => location.hash)).toBe("");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#export");
  });

  test("a link that opens a new tab says so in its name", async ({ page }) => {
    const link = section(page, "Opens a new tab").getByRole("link");
    await expect(link).toHaveAccessibleName("What's a CNAME record? (opens in a new tab)");
    // The arrow is drawn, not a character in the text.
    await expect(link).toHaveText("What's a CNAME record?");
    const arrow = await link.evaluate((element) => getComputedStyle(element, "::after").maskImage);
    expect(arrow).toContain("url(");
  });

  test("the new-tab arrow never wraps onto a line of its own", async ({ page }) => {
    const link = section(page, "Opens a new tab").getByRole("link");
    // At each width, the link's last line box holds its last letter, not just the arrow.
    const alone = await link.evaluate((a) => {
      const p = a.parentElement!;
      const text = a.firstChild as Text;
      const last = document.createRange();
      last.setStart(text, text.length - 1);
      last.setEnd(text, text.length);
      const widths: number[] = [];
      for (let width = 120; width <= 480; width++) {
        p.style.width = `${width}px`;
        const lines = a.getClientRects();
        if (Math.abs(lines[lines.length - 1]!.top - last.getBoundingClientRect().top) > 1) widths.push(width);
      }
      p.style.width = "";
      return widths;
    });
    expect(alone).toEqual([]);
  });

  test("a link that wraps keeps its rounding on each line", async ({ page }) => {
    const link = section(page, "In text").getByRole("link", { name: "spring-launch.example.com" });
    const wrapped = await link.evaluate((a) => {
      a.parentElement!.style.width = "12rem";
      return { lines: a.getClientRects().length, clone: getComputedStyle(a).boxDecorationBreak };
    });
    expect(wrapped.lines).toBeGreaterThan(1);
    expect(wrapped.clone).toBe("clone");
  });

  test("an <a> without href is plain text that can't be focused", async ({ page }) => {
    const paragraph = section(page, "In text").locator("beautiful-example-preview p");
    const bare = await paragraph.evaluate((p) => {
      const a = document.createElement("a");
      a.textContent = "Not a link yet";
      p.append(a);
      a.focus();
      const style = getComputedStyle(a);
      return {
        focused: document.activeElement === a,
        color: style.color,
        text: getComputedStyle(p).color,
        line: style.textDecorationLine,
      };
    });
    expect(bare.focused).toBe(false);
    expect(bare.color).toBe(bare.text);
    expect(bare.line).toBe("none");
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Link look", () => {
  test("accent, underlined at a fraction of its color, solid on hover", async ({ page }) => {
    await open(page, "/link", "classic", "light");
    const link = section(page, "In text").getByRole("link", { name: "preview link" });
    await expect(link).toHaveCSS("color", "rgb(37, 99, 235)");
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    const rest = await link.evaluate((a) => getComputedStyle(a).textDecorationColor);
    expect(rest).not.toBe("rgb(37, 99, 235)");
    await link.hover();
    await expect(link).toHaveCSS("text-decoration-color", "rgb(37, 99, 235)");
  });

  test("its corners are rounded, so its focus ring is", async ({ page }) => {
    await open(page, "/link");
    await expect(section(page, "In text").getByRole("link").first()).toHaveCSS("border-radius", "3px");
  });

  test("neutral takes the color of the text around it, and keeps the underline", async ({ page }) => {
    await open(page, "/link", "classic", "light");
    const preview = section(page, "Neutral").locator("beautiful-example-preview");
    await expect(preview.getByRole("link", { name: "Change how long" })).toHaveCSS("color", "rgb(24, 24, 27)");
    await expect(preview.getByRole("link", { name: "See every version" })).toHaveCSS("color", "rgb(82, 82, 91)");
    await expect(preview.getByRole("link", { name: "See every version" })).toHaveCSS("text-decoration-line", "underline");
  });

  test("glass deepens the accent, as for Button's colored text", async ({ page }) => {
    await open(page, "/link", "glass", "light");
    await expect(section(page, "In text").getByRole("link").first()).toHaveCSS("color", "rgb(29, 78, 216)");
  });

  test("leaves a link styled as a Button to Button", async ({ page }) => {
    await open(page, "/button", "classic", "light");
    // Button draws its own ::after, so a Button link to a new tab gets no arrow and no link color.
    const look = await page.locator("beautiful-example-preview a[data-button]").first().evaluate((a) => {
      const plain = getComputedStyle(a).color;
      a.setAttribute("target", "_blank");
      const after = getComputedStyle(a, "::after");
      return { plain, color: getComputedStyle(a).color, mask: after.maskImage, line: getComputedStyle(a).textDecorationLine };
    });
    expect(look.mask).toBe("none");
    expect(look.color).toBe(look.plain);
    expect(look.color).not.toBe("rgb(37, 99, 235)");
    expect(look.line).toBe("none");
  });
});

test.describe("Link axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/link", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/link.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The glass example's stage is a picture, not the plain canvas.
        const results = await new AxeBuilder({ page })
          .exclude("beautiful-demo-stage")
          .withRules(["color-contrast", "link-in-text-block"])
          .analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Link component", () => {
  test("passes other attributes to the <a>, and leaves the default color out", async ({ page }) => {
    await page.goto("/tests/harness/link.html");
    const download = page.locator("#download");
    await expect(download).toHaveAttribute("download", "entries.csv");
    await expect(download).toHaveAttribute("aria-describedby", "download-size");
    await expect(download).not.toHaveAttribute("data-color");
  });

  test("forwards its handlers", async ({ page }) => {
    await page.goto("/tests/harness/link.html");
    await page.locator("#counted").click();
    await expect(page.locator("#counted")).toHaveAttribute("data-clicks", "1");
  });
});
