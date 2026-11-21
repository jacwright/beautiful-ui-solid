import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// APG has no spinner pattern. From ARIA's status role and WCAG 4.1.3: a polite live region, heard
// without focus, never focused itself, whose words go in after it appears so they are announced.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** Puts a static spinner on the page, as a page would when a load starts, and returns it. */
async function insert(page: Page, markup: string) {
  await page.evaluate((html) => {
    const box = document.createElement("beautiful-example");
    box.id = "inserted";
    box.innerHTML = html;
    document.querySelector("beautiful-example-preview")!.append(box);
  }, markup);
  return page.locator("#inserted beautiful-spinner");
}

test.describe("Spinner keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/spinner"));

  test("each spinner is a status region with its words", async ({ page }) => {
    const sizes = section(page, "Sizes").getByRole("status");
    await expect(sizes).toHaveCount(3);
    for (const spinner of await sizes.all()) await expect(spinner).toHaveText("Loading");
    await expect(section(page, "With its words").getByRole("status").first()).toHaveText("Checking springlaunch.com");
  });

  test("Tab passes over it", async ({ page }) => {
    await section(page, "Sizes").locator("summary").last().focus();
    await page.keyboard.press("Tab");
    await expect(section(page, "With its words").locator("summary").first()).toBeFocused();
  });

  test("hidden words are clipped out of the ring's box, and still in the accessibility tree", async ({ page }) => {
    const spinner = section(page, "Sizes").getByRole("status").first();
    const box = await spinner.boundingBox();
    expect(box!.width).toBeCloseTo(16, 0);
    expect(box!.height).toBeCloseTo(16, 0);
    await expect(spinner).toHaveCSS("overflow", "hidden");
    // Pushed out, not hidden: a hidden element would leave the tree.
    await expect(spinner).toHaveCSS("visibility", "visible");
    await expect(spinner).toHaveText("Loading");
  });

  test("shown words sit beside the ring, or under it at md and lg", async ({ page }) => {
    const inline = section(page, "With its words").getByRole("status").first();
    const stacked = section(page, "A panel that is loading").getByRole("status");
    const look = (spinner: typeof inline) =>
      spinner.evaluate((el) => {
        const ring = getComputedStyle(el, "::after");
        const style = getComputedStyle(el);
        return { width: el.getBoundingClientRect().width, start: style.paddingInlineStart, top: style.paddingBlockStart, ring: ring.width };
      });
    // The Solid Spinner puts its words in after the wait, so the boxes are measured once they're in.
    await expect(inline).toHaveText("Checking springlaunch.com");
    await expect(stacked).toHaveText("Loading the entries");
    const beside = await look(inline);
    expect(beside.width).toBeGreaterThan(100);
    expect(beside.start).toBe("24px");
    const under = await look(stacked);
    expect(under.start).toBe("0px");
    expect(under.top).toBe("44px");
    expect(under.ring).toBe("32px");
  });

  test("sm is the size of the text around it, md 32px and lg 48px", async ({ page }) => {
    const sizes = await section(page, "Sizes")
      .getByRole("status")
      .evaluateAll((all) => all.map((el) => el.getBoundingClientRect().width));
    expect(sizes).toEqual([16, 32, 48]);
    const small = section(page, "With its words").getByRole("status").nth(1);
    expect(await small.evaluate((el) => getComputedStyle(el, "::after").width)).toBe("14px");
  });

  test("it waits before it shows, then fades in", async ({ page }) => {
    // Paused in the evaluate that adds it, then set to a time: a clock of the test's own stretches
    // under load, and the fade, done, would leave getAnimations().
    await page.evaluate(() => {
      const box = document.createElement("beautiful-example");
      box.id = "inserted";
      const spinner = box.appendChild(document.createElement("beautiful-spinner"));
      spinner.setAttribute("role", "status");
      spinner.textContent = "Loading";
      document.querySelector("beautiful-example-preview")!.append(box);
      spinner.getAnimations().forEach((a) => a.pause());
    });
    const spinner = page.locator("#inserted beautiful-spinner");
    const opacityAt = (ms: number) =>
      spinner.evaluate((el, ms) => {
        const fade = el.getAnimations().find((a) => a instanceof CSSAnimation && a.animationName === "spinner-in")!;
        fade.pause();
        fade.currentTime = ms;
        return Number(getComputedStyle(el).opacity);
      }, ms);
    // --spinner-delay is 400ms: hidden at its start and well into the wait.
    expect(await opacityAt(0)).toBeLessThan(0.05);
    expect(await opacityAt(250)).toBeLessThan(0.05);
    await spinner.evaluate((el) => el.getAnimations().forEach((a) => a.play()));
    await expect.poll(() => spinner.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  });

  test("data-delay=none shows it at once", async ({ page }) => {
    const spinner = await insert(page, '<beautiful-spinner role="status" data-delay="none">Loading</beautiful-spinner>');
    expect(Number(await spinner.evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
  });

  test("the arc turns", async ({ page }) => {
    const spin = await section(page, "Sizes")
      .getByRole("status")
      .first()
      .evaluate((el) => {
        const after = getComputedStyle(el, "::after");
        return { name: after.animationName, iterations: after.animationIterationCount, timing: after.animationTimingFunction };
      });
    expect(spin).toEqual({ name: "spinner-turn", iterations: "infinite", timing: "linear" });
  });

  test("under reduced motion the ring breathes and doesn't turn", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const spinner = section(page, "Sizes").getByRole("status").first();
    const after = await spinner.evaluate((el) => {
      const style = getComputedStyle(el, "::after");
      return { name: style.animationName, rotate: style.rotate };
    });
    expect(after.name).toBe("spinner-breathe");
    expect(after.rotate).toBe("none");
  });

  test("forced colors draw the ring in the system's text color", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const spinner = section(page, "Sizes").getByRole("status").first();
    const ring = await spinner.evaluate((el) => {
      const probe = document.createElement("p");
      probe.style.color = "CanvasText";
      document.body.append(probe);
      const text = getComputedStyle(probe).color;
      probe.remove();
      return { arc: getComputedStyle(el, "::after").backgroundColor, text };
    });
    expect(ring.arc).toBe(ring.text);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Spinner look", () => {
  test("neutral is the text's color, accent the accent, and shown words keep the text's", async ({ page }) => {
    await open(page, "/spinner", "classic", "light");
    const ring = (title: string, nth: number) =>
      section(page, title)
        .getByRole("status")
        .nth(nth)
        .evaluate((el) => ({ arc: getComputedStyle(el, "::after").backgroundColor, text: getComputedStyle(el).color }));
    expect(await ring("Sizes", 0)).toEqual({ arc: "rgb(24, 24, 27)", text: "rgb(24, 24, 27)" });
    expect(await ring("Accent", 1)).toEqual({ arc: "rgb(37, 99, 235)", text: "rgb(24, 24, 27)" });
  });

  test("the track is a faint whole ring under the arc", async ({ page }) => {
    await open(page, "/spinner", "classic", "light");
    const track = await section(page, "Sizes")
      .getByRole("status")
      .first()
      .evaluate((el) => {
        const before = getComputedStyle(el, "::before");
        return { opacity: before.opacity, mask: before.maskImage };
      });
    expect(track.opacity).toBe("0.2");
    expect(track.mask).toContain("circle");
  });

  test("glass takes the theme's deeper accent", async ({ page }) => {
    await open(page, "/spinner", "glass", "light");
    const arc = await section(page, "Accent")
      .getByRole("status")
      .first()
      .evaluate((el) => getComputedStyle(el, "::after").backgroundColor);
    expect(arc).toBe("rgb(29, 78, 216)");
  });
});

test.describe("Spinner axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/spinner", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/spinner.html?theme=${theme}&mode=${mode}`);
        await expect(page.locator('[data-example="words"]').getByRole("status").first()).not.toBeEmpty();
        // Past the fade in, so the words are at full color.
        await page.waitForTimeout(800);
        // The harness's own buttons, and the one that opens the dialog example, are Button's to check, and axe
        // can't see through their glass.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("#start")
          .exclude("#detached-add")
          .exclude('[data-example="glass"] beautiful-demo-stage button')
          .analyze();
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Spinner component", () => {
  test("its words go in after the wait, so a screen reader hears them", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    // Held at a wait longer than the test can take, even on a busy machine, then let go to the usual 400ms.
    const hold = await page.addStyleTag({ content: ":root { --spinner-delay: 5s; }" });
    await page.locator("#start").click();
    const spinner = page.locator("#started beautiful-spinner");
    await expect(spinner).toHaveAttribute("role", "status");
    await expect(spinner).toBeEmpty();
    await page.waitForTimeout(250);
    await expect(spinner).toBeEmpty();
    await hold.evaluate((el) => (el as Element).remove());
    await expect(spinner).toHaveText("Loading the preview");
  });

  test("a load quicker than the wait never puts words in", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    await page.evaluate(() => {
      const seen: string[] = [];
      new MutationObserver((records) => {
        for (const record of records) for (const node of record.addedNodes) if (node.textContent) seen.push(node.textContent);
      }).observe(document.querySelector("#started")!, { subtree: true, childList: true, characterData: true });
      (window as unknown as { seen: string[] }).seen = seen;
    });
    // A wait longer than the test can take, even on a busy machine, so the load is surely quicker.
    const hold = await page.addStyleTag({ content: ":root { --spinner-delay: 5s; }" });
    await page.locator("#start").click();
    await expect(page.locator("#started beautiful-spinner")).toBeAttached();
    await page.waitForTimeout(100);
    await page.locator("#start").click();
    await expect(page.locator("#started beautiful-spinner")).toHaveCount(0);
    // Back to the usual wait, and past it: still nothing.
    await hold.evaluate((el) => (el as Element).remove());
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => (window as unknown as { seen: string[] }).seen)).toEqual([]);
  });

  test("delay={false} shows it and its words at once", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    const spinner = page.locator("#at-once");
    await expect(spinner).toHaveAttribute("data-delay", "none");
    await expect(spinner).toHaveText("Publishing", { timeout: 200 });
  });

  test("in a hidden panel, its words wait until the panel shows and the fade begins", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    const spinner = page.locator("#closed-panel beautiful-spinner");
    await page.waitForTimeout(700);
    await expect(spinner).toBeEmpty();
    await page.locator("#closed-panel").evaluate((panel) => panel.removeAttribute("hidden"));
    await page.waitForTimeout(200);
    await expect(spinner).toBeEmpty();
    await expect(spinner).toHaveText("Loading the tab");
  });

  test("a panel hidden again during the wait keeps its spinner quiet until it shows", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    const panel = page.locator("#closed-panel");
    const spinner = panel.locator("beautiful-spinner");
    await panel.evaluate((el) => el.removeAttribute("hidden"));
    await page.waitForTimeout(150);
    await panel.evaluate((el) => el.setAttribute("hidden", ""));
    await page.waitForTimeout(600);
    await expect(spinner).toBeEmpty();
    await panel.evaluate((el) => el.removeAttribute("hidden"));
    await expect(spinner).toHaveText("Loading the tab");
  });

  test("a stylesheet that stops the fade before it begins puts the words in", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    // Right after it mounts, before the fade's first frame, when Chrome sends no animationcancel.
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("#start")!.click();
      setTimeout(() => {
        const style = document.createElement("style");
        style.textContent = "beautiful-spinner { animation: none }";
        document.head.append(style);
      });
    });
    const spinner = page.locator("#started beautiful-spinner");
    await expect(spinner).toHaveText("Loading the preview");
  });

  test("a spinner hidden during its fade takes its words back, and says them again when it shows", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    const panel = page.locator("#closed-panel");
    const spinner = panel.locator("beautiful-spinner");
    await panel.evaluate((el) => el.removeAttribute("hidden"));
    // Every frame, so it's caught while the fade still runs.
    await page.waitForFunction(() => document.querySelector("#closed-panel beautiful-spinner")?.textContent, null, { polling: "raf" });
    // Still fading in: hiding it now cancels the fade.
    await panel.evaluate((el) => el.setAttribute("hidden", ""));
    await expect(spinner).toBeEmpty();
    await panel.evaluate((el) => el.removeAttribute("hidden"));
    await expect(spinner).toHaveText("Loading the tab");
  });

  test("a spinner added to the page after it renders still waits", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    await page.locator("#detached-add").click();
    const spinner = page.locator("#detached beautiful-spinner");
    await expect(spinner).toBeEmpty();
    await expect(spinner).toHaveText("Loading the report");
  });

  test("children that render nothing leave the words hidden and the label read", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    const spinner = page.locator("#falsy");
    await expect(spinner).toHaveText("Saving");
    await expect(spinner).not.toHaveAttribute("data-label");
  });

  test("passes other attributes through, and leaves the defaults out", async ({ page }) => {
    await page.goto("/tests/harness/spinner.html");
    const spinner = page.locator("#passed");
    await expect(spinner).toHaveAttribute("class", "custom");
    await expect(spinner).toHaveAttribute("data-region", "entries");
    for (const name of ["data-size", "data-color", "data-label", "data-delay"]) await expect(spinner).not.toHaveAttribute(name);
  });
});
