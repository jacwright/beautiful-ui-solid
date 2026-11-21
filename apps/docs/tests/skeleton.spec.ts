import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Skeleton has no APG pattern. It follows ARIA's aria-busy: the shapes are hidden from assistive
// tech, and the busy region holds words a screen reader reads in their place.

/** The preview of the docs example with this title. */
function preview(page: Page, title: string) {
  return page
    .locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) })
    .locator("beautiful-example-preview");
}

/** The names of the page's @keyframes rules. The fade-in is checked against these and the computed
 * style, not getAnimations(): it is one-shot and leaves that list when it ends, which on a busy
 * machine can be before the page is read. */
function keyframes(page: Page) {
  return page.evaluate(() =>
    [...document.styleSheets].flatMap((sheet) =>
      [...sheet.cssRules].flatMap(function names(rule): string[] {
        if (rule instanceof CSSKeyframesRule) return [rule.name];
        return "cssRules" in rule ? [...(rule as CSSGroupingRule).cssRules].flatMap(names) : [];
      }),
    ),
  );
}

test.describe("Skeleton keyboard and screen readers", () => {
  test.beforeEach(({ page }) => open(page, "/skeleton"));

  test("Tab passes over skeletons, and none takes focus", async ({ page }) => {
    // In the live example, Tab goes from the Reload button straight to the Code toggle after it.
    const live = page.locator(".example", { has: page.getByRole("heading", { name: "Loading, then loaded", exact: true }) });
    await live.getByRole("button", { name: "Reload" }).click();
    await expect(live.locator("beautiful-skeleton").first()).toBeAttached();
    await page.keyboard.press("Tab");
    await expect(live.locator("summary").first()).toBeFocused();
    // Nothing in a busy region can take focus: no tabindex, and nothing focusable inside.
    const focusable = page.locator(
      ":is(beautiful-skeleton, beautiful-skeleton-group)[tabindex], beautiful-skeleton-group :is(a[href], button, input, select, textarea, [tabindex])",
    );
    await expect(focusable).toHaveCount(0);
  });

  test("a screen reader skips the shapes and reads the group's label", async ({ page }) => {
    const card = preview(page, "Stat cards").locator("article").first();
    await expect(card).toMatchAriaSnapshot(`
      - article "Visitors":
        - heading "Visitors" [level=3]
        - text: Loading visitors
    `);
    await expect(card.locator("beautiful-skeleton-group")).toHaveAttribute("aria-busy", "true");
    for (const shape of await preview(page, "People").locator("beautiful-skeleton").all()) {
      await expect(shape).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("the label is out of sight", async ({ page }) => {
    const label = preview(page, "Chart").locator("beautiful-visually-hidden");
    const box = await label.boundingBox();
    expect(box!.width * box!.height).toBeLessThanOrEqual(1);
  });

  test("a text skeleton is as tall as the lines it stands for, so the text takes its room", async ({ page }) => {
    const live = preview(page, "Loading, then loaded");
    const card = live.locator("article").first();
    const loaded = await card.boundingBox();
    await live.getByRole("button", { name: "Reload" }).click();
    await expect(card.locator("beautiful-skeleton").first()).toBeAttached();
    expect((await card.boundingBox())!.height).toBe(loaded!.height);
    await expect(card.getByText("12,480")).toBeVisible({ timeout: 4000 });

    const paragraph = preview(page, "Paragraph").locator("beautiful-skeleton");
    const lineHeight = await paragraph.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect((await paragraph.boundingBox())!.height).toBeCloseTo(4 * lineHeight, 0);
  });

  test("rect is 16:9 unless it has a height, and circle is 40px across", async ({ page }) => {
    const rect = preview(page, "Chart").locator("beautiful-skeleton");
    await expect(rect).toHaveCSS("height", "192px");
    await rect.evaluate((el) => el.style.removeProperty("height"));
    const box = (await rect.boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    const circle = preview(page, "People").locator('beautiful-skeleton[data-shape="circle"]').first();
    await expect(circle).toHaveCSS("width", "40px");
    await expect(circle).toHaveCSS("height", "40px");
  });

  test("waits before it fades in, then sweeps its light", async ({ page }) => {
    const shape = preview(page, "Chart").locator("beautiful-skeleton");
    await expect(shape).toHaveCSS("animation-name", "skeleton-in");
    await expect(shape).toHaveCSS("animation-delay", "0.3s");
    expect(await keyframes(page)).toEqual(expect.arrayContaining(["skeleton-in", "skeleton-shimmer"]));
    // The light loops forever, so it is always among the running animations: its ::after is drawn.
    await expect
      .poll(() =>
        shape.evaluate((el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => (a as CSSAnimation).animationName === "skeleton-shimmer")
            .map((a) => a.effect!.getTiming().delay),
        ),
      )
      .toEqual([0]);
  });

  test("under reduced motion the light stays still and the shape breathes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const shape = preview(page, "Chart").locator("beautiful-skeleton");
    expect(await shape.evaluate((el) => getComputedStyle(el, "::after").content)).toBe("none");
    // The breath starts once the fade-in ends (300ms wait plus the 150ms reduced-motion fade).
    await expect(shape).toHaveCSS("animation-name", "skeleton-in, skeleton-breathe");
    await expect(shape).toHaveCSS("animation-delay", "0.3s, 0.45s");
    expect(await keyframes(page)).toEqual(expect.arrayContaining(["skeleton-in", "skeleton-breathe"]));
    await expect
      .poll(() => shape.evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName)))
      .toContain("skeleton-breathe");
  });

  test("in forced colors it is drawn in GrayText", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const shape = preview(page, "Chart").locator("beautiful-skeleton");
    const gray = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = "GrayText";
      document.body.append(probe);
      return getComputedStyle(probe).color;
    });
    await expect(shape).toHaveCSS("background-color", gray);
  });

  test("right to left, the light sweeps the other way", async ({ page }) => {
    const shape = preview(page, "Chart").locator("beautiful-skeleton");
    await shape.evaluate((el) => el.closest("article")!.setAttribute("dir", "rtl"));
    expect(await shape.evaluate((el) => getComputedStyle(el, "::after").animationDirection)).toBe("reverse");
  });

  test("reflows on a narrow screen without a sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Skeleton axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/skeleton", theme, mode);
        const results = await new AxeBuilder({ page }).include(".example").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so the cards' words are checked on the
      // harness's plain canvas. The shapes have no words: they are hidden from assistive tech.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/skeleton.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).include("[data-example] h3").analyze();
        expect(results.passes.length).toBeGreaterThan(0);
        expect(results.violations).toEqual([]);
        expect(results.incomplete).toEqual([]);
      });
    }
  }
});

test.describe("Skeleton component", () => {
  test("passes other attributes through, and leaves out what's left at its default", async ({ page }) => {
    await page.goto("/tests/harness/skeleton.html");
    const group = page.locator("#group");
    await expect(group).toHaveClass("custom");
    await expect(group).toHaveAttribute("aria-busy", "true");
    await expect(group.locator("beautiful-visually-hidden")).toHaveText("Loading");
    const line = page.locator("#one-line");
    await expect(line).toHaveClass("custom");
    for (const id of ["#one-line", "#text-shape"]) {
      await expect(page.locator(id)).not.toHaveAttribute("data-shape");
      await expect(page.locator(id)).not.toHaveAttribute("style");
    }
    await expect(page.locator("#circle")).toHaveAttribute("style", "width: 4rem;");
    // A ref the caller passes still gets the element.
    await expect(page.locator("#with-ref")).toHaveAttribute("data-ref", "");
  });

  test("a skeleton that mounts later sweeps in step with the rest", async ({ page }) => {
    await page.goto("/tests/harness/skeleton.html");
    await page.locator("#late").waitFor({ state: "attached" });
    const phases = () =>
      page.evaluate(() =>
        ["#early", "#late"].map((id) => {
          const sweep = document
            .querySelector(id)!
            .getAnimations({ subtree: true })
            .find((a) => (a as CSSAnimation).animationName === "skeleton-shimmer");
          return sweep?.startTime;
        }),
      );
    // Both started at the timeline's origin, though #late mounted 700ms after #early.
    await expect.poll(phases).toEqual([0, 0]);

    // A sweep the browser rebuilds, as when reduced motion is turned off again, falls back in step.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(phases).toEqual([undefined, undefined]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect.poll(phases).toEqual([0, 0]);
  });
});
