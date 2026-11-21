import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// From the APG Disclosure pattern: the button is reached with Tab, Enter and Space show and hide the
// panel, focus stays on the button, and the button says whether it's expanded.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

function summary(page: Page, words: string) {
  return page.locator("beautiful-example-preview summary", { hasText: words });
}

/** What Chrome tells a screen reader about a summary: its role, and whether it's expanded. */
async function announced(page: Page, words: string) {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
    nodes: { role?: { value: string }; name?: { value: string }; properties?: { name: string; value: { value: unknown } }[] }[];
  };
  const node = nodes.find((n) => n.name?.value === words && n.role?.value !== "StaticText");
  const expanded = node?.properties?.find((p) => p.name === "expanded")?.value.value;
  return { role: node?.role?.value, expanded };
}

/** The panel's height, from the browser's own box around it. */
function panelHeight(details: Locator) {
  return details.evaluate((el) => parseFloat(getComputedStyle(el, "::details-content").blockSize));
}

test.describe("Disclosure keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/disclosure"));

  test("Enter and Space show and hide the panel, and focus stays on the summary", async ({ page }) => {
    const button = summary(page, "Show the build log");
    const details = button.locator("..");
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open");
    await expect(button).toBeFocused();
    await page.keyboard.press("Space");
    await expect(details).not.toHaveAttribute("open");
    await expect(button).toBeFocused();
  });

  test("Tab skips a closed panel and enters an open one", async ({ page }) => {
    const button = summary(page, "Build settings");
    await section(page, "More settings in a form").getByRole("textbox", { name: "Site name" }).focus();
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#build-command")).not.toBeFocused();
    // Tab right after Enter, while the panel is still growing.
    await button.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(page.locator("#build-command")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(button).toBeFocused();
  });

  test("screen readers hear a button that says whether it's expanded", async ({ page }) => {
    expect(await announced(page, "Build settings")).toEqual({ role: "DisclosureTriangle", expanded: false });
    await summary(page, "Build settings").click();
    expect(await announced(page, "Build settings")).toEqual({ role: "DisclosureTriangle", expanded: true });
  });

  test("a link to something inside a closed panel opens it", async ({ page }) => {
    const details = summary(page, "Build settings").locator("..");
    await page.evaluate(() => {
      location.hash = "#output-folder";
    });
    await expect(details).toHaveAttribute("open");
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const words of ["Build settings", "Show the build log", "What happens if I cancel?"]) await summary(page, words).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Disclosure look", () => {
  test("the summary hugs its words, which line up with the text around it", async ({ page }) => {
    await open(page, "/disclosure");
    const button = summary(page, "Show the build log");
    const lines = await button.evaluate((el) => {
      const words = document.createRange();
      words.selectNodeContents(el);
      const paragraph = el.parentElement!.previousElementSibling!;
      return {
        words: words.getBoundingClientRect().left,
        text: paragraph.getBoundingClientRect().left,
        width: el.getBoundingClientRect().width,
        line: el.parentElement!.getBoundingClientRect().width,
      };
    });
    expect(Math.abs(lines.words - lines.text)).toBeLessThan(1);
    expect(lines.width).toBeLessThan(lines.line / 2);
  });

  test("the chevron points down while closed, and up while open", async ({ page }) => {
    await open(page, "/disclosure");
    const button = summary(page, "Show the build log");
    const chevron = () => button.evaluate((el) => {
      const after = getComputedStyle(el, "::after");
      return { mask: after.maskImage, rotate: after.rotate };
    });
    expect((await chevron()).mask).toContain("url(");
    expect((await chevron()).rotate).toBe("none");
    await button.click();
    await expect.poll(async () => (await chevron()).rotate).toBe("180deg");
  });

  test("the panel grows to its height as it opens, and shrinks as it closes", async ({ page }) => {
    await open(page, "/disclosure");
    const button = summary(page, "Show the build log");
    const details = button.locator("..");
    expect(await panelHeight(details)).toBe(0);
    // Stop the page's clock, open it, and seek the panel's growth to halfway, so a busy machine can't
    // run the growth out before it is read. The growth runs on ::details-content, which
    // getAnimations() doesn't list, so this goes through the DevTools protocol, which names it by
    // the physical property, height.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Animation.enable");
    await cdp.send("Animation.setPlaybackRate", { playbackRate: 0 });
    let full: number;
    try {
      const started = new Promise<{ id: string; duration: number }>((resolve, reject) => {
        setTimeout(() => reject(new Error("the panel's height never started a transition")), 5000);
        cdp.on("Animation.animationStarted", ({ animation }) => {
          if (animation.name === "height") resolve({ id: animation.id, duration: animation.source!.duration });
        });
      });
      await button.click();
      const growth = await started;
      await cdp.send("Animation.seekAnimations", { animations: [growth.id], currentTime: growth.duration / 2 });
      full = await details.evaluate((el) => {
        const content = [...el.children].filter((child) => child.tagName !== "SUMMARY");
        return content.reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);
      });
      // Halfway, the panel is taller than nothing and shorter than its content.
      const half = await panelHeight(details);
      expect(half).toBeGreaterThan(0);
      expect(half).toBeLessThan(full);
    } finally {
      await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 });
      await cdp.detach();
    }
    await expect.poll(() => panelHeight(details)).toBeGreaterThanOrEqual(full);
    await button.click();
    await expect.poll(() => panelHeight(details)).toBe(0);
  });

  test("under reduced motion the panel opens at once, and still fades", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/disclosure");
    const details = summary(page, "Show the build log").locator("..");
    const motion = await details.evaluate((el) => getComputedStyle(el, "::details-content").transitionProperty);
    expect(motion).not.toContain("block-size");
    expect(motion).toContain("opacity");
  });

  test("hover tints the summary, with a Button's corners", async ({ page }) => {
    await open(page, "/disclosure", "classic", "light");
    const button = summary(page, "Show the build log");
    await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(button).toHaveCSS("border-radius", "8px");
    await button.hover();
    await expect(button).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("a disclosure after a field in a form is spaced as a field", async ({ page }) => {
    await open(page, "/disclosure");
    const gap = await summary(page, "Build settings").locator("..").evaluate((el) => getComputedStyle(el).marginBlockStart);
    expect(gap).toBe("24px");
  });
});

test.describe("Disclosure axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/disclosure", theme, mode);
        // Open every panel, so axe checks what's inside too.
        await page.locator("beautiful-example-preview details:not([open]) > summary").evaluateAll((all) => {
          for (const el of all) (el.parentElement as HTMLDetailsElement).open = true;
        });
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/disclosure.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        await page.locator("details").evaluateAll((all) => {
          for (const el of all) (el as HTMLDetailsElement).open = true;
        });
        await page.waitForTimeout(400);
        // The controlled block is for the component tests: its plain button is Button's, checked on its own page. The
        // dialog example's stage is glass over a picture, which glass.spec.ts measures from pixels.
        const results = await new AxeBuilder({ page })
          .exclude('[data-example="controlled"]')
          .exclude("beautiful-demo-stage")
          .withRules(["color-contrast"])
          .analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Disclosure component", () => {
  test("open opens and closes it from outside, and onToggle hears every change", async ({ page }) => {
    await page.goto("/tests/harness/disclosure.html");
    const details = page.locator("#controlled");
    await expect(details).not.toHaveAttribute("open");
    await page.locator("#open-it").click();
    await expect(details).toHaveAttribute("open");
    await expect(details).toHaveAttribute("data-heard", "true");
    // The person closes it: the parent hears it and keeps step.
    await details.locator("summary").click();
    await expect(details).not.toHaveAttribute("open");
    await expect(details).toHaveAttribute("data-heard", "true,false");
    await page.locator("#open-it").click();
    await expect(details).toHaveAttribute("open");
    await expect(details).toHaveAttribute("data-heard", "true,false,true");
  });

  test("open at first isn't a change, so onToggle stays quiet until someone presses", async ({ page }) => {
    await page.goto("/tests/harness/disclosure.html");
    const details = page.locator("#open-at-first");
    await expect(details).toHaveAttribute("open");
    await page.waitForTimeout(200);
    await expect(details).toHaveAttribute("data-heard", "");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("data-heard", "false");
  });

  test("passes other attributes to the <details>", async ({ page }) => {
    await page.goto("/tests/harness/disclosure.html");
    const details = page.locator("#controlled");
    await expect(details).toHaveAttribute("name", "settings");
    await expect(details).toHaveAttribute("class", "spaced");
    await expect(details).toHaveAttribute("aria-describedby", "open-it");
  });
});
