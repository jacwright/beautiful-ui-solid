import { expect, type Locator, type Page, test } from "@playwright/test";
import { slugOf } from "../src/nav.ts";
import { guideNames, pageNames } from "../src/pages.ts";
import {
  closeDialog,
  closePopover,
  type Measurement,
  measureGlassText,
  minimumContrast,
  showDialog,
  showPopover,
  type Stage,
  stages,
  widths,
} from "./contrast.ts";
import { modes, open } from "./settings.ts";

type Result = Measurement & { example: string };

/** The text on glass in the scope, at rest and with each control in it hovered. */
async function measure(page: Page, scope: Locator, example: string) {
  const results: Result[] = (await measureGlassText(page, scope)).map((m) => ({ ...m, example }));
  for (const control of await scope.locator("button:not(:disabled), a[data-button]").all()) {
    if (!(await control.isVisible())) continue;
    await control.hover();
    for (const m of await measureGlassText(page, control)) results.push({ ...m, example: `${example}, hovered` });
  }
  await page.mouse.move(0, 0);
  return results;
}

/** Every docs example on the page, open dialogs and popovers included, measured over one stage. */
async function measurePage(page: Page, path: string, mode: (typeof modes)[number], stage: Stage, extraCss = "") {
  await open(page, path, "glass", mode);
  // The theme and mode toggles float over the page, so they'd sit over an example's text. The page's
  // pane would soften the stage behind every example, so it goes too: each example is measured
  // straight over the stage, the hardest place it can be.
  const pane = "beautiful-site > beautiful-sidebar-layout > main";
  await page.addStyleTag({
    content: `${stages[stage]}.site-toggles { visibility: hidden; } ${pane}::after, ${pane}::before { content: none; }${extraCss}`,
  });
  // A toast fades in as the page loads. Measure it once it has arrived, not halfway in. Only
  // time-based animations end: a scroll-driven one, such as a Navbar's edge fade, never finishes.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.timeline instanceof DocumentTimeline)
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
  const results: Result[] = [];
  for (const example of await page.locator(".example").all()) {
    const title = await example.locator(":scope > :is(h2, h3)").textContent() ?? "";
    const preview = example.locator("beautiful-example-preview");
    await preview.evaluate((el) => el.scrollIntoView({ block: "center" }));
    results.push(...(await measure(page, preview, title)));
    for (const dialog of await preview.locator("dialog").all()) {
      await showDialog(dialog);
      results.push(...(await measure(page, dialog, `${title}, open`)));
      await closeDialog(dialog);
    }
    for (const popover of await preview.locator("[popover]").all()) {
      await showPopover(popover);
      results.push(...(await measure(page, popover, `${title}, open`)));
      await closePopover(popover);
    }
  }
  return results;
}

const report = (results: Result[]) =>
  results.map((r) => `${r.ratio.toFixed(2)}:1  ${r.example}: "${r.text.length > 40 ? `${r.text.slice(0, 40)}…` : r.text}", over ${r.behind} at ${r.at.join(", ")}`).join("\n");

// DOCS_PAGES, set by scripts/test.sh for a merge, limits it to the pages of the components
// that changed. Empty or unset, every page.
const only = process.env.DOCS_PAGES?.split(",").filter(Boolean);

test.describe("Glass text contrast", () => {
  // A page with many examples, such as Dialog's, opens and hovers each one: near 30s alone, more
  // under load. The checks that a thinner fill fails measure such pages too.
  test.describe.configure({ timeout: 120_000 });

  // A component page always has glass to measure, and so does the Websites guide: its examples are glass cards and buttons
  // on a stage. The Illustrations guide may have none, and is still measured in case it does.
  // The home page opens on a glass card over a stage, so it is measured too, as the slug "home".
  const measured = [
    { name: "Home", slug: "home", path: "/" },
    ...[...pageNames, ...guideNames].map((name) => ({ name, slug: slugOf(name), path: `/${slugOf(name)}` })),
  ];
  for (const { name, path } of measured.filter((m) => !only?.length || only.includes(m.slug))) {
    const needsGlass = name === "Home" || name === "Websites" || (pageNames as readonly string[]).includes(name);
    for (const mode of modes) {
      for (const stage of Object.keys(stages) as Stage[]) {
        for (const [width, viewport] of Object.entries(widths)) {
          test(`${name}, ${mode}, ${stage} stage, ${width}`, async ({ page }) => {
            await page.setViewportSize(viewport);
            const results = await measurePage(page, path, mode, stage);
            if (needsGlass) expect(results.length, "found no text on glass").toBeGreaterThan(0);
            const low = results.filter((r) => r.ratio < minimumContrast);
            expect(low, `under ${minimumContrast}:1 of ${results.length} measured:\n${report(low)}`).toEqual([]);
          });
        }
      }
    }
  }

  // The check catches a fill that lets too much of the page through.
  test("fails when the dialog panel is thinner", async ({ page }) => {
    await page.setViewportSize(widths.desk);
    const results = await measurePage(page, "/dialog", "dark", "bright", ":root { --surface-inset-fill: rgb(30 30 36 / 0.25); }");
    const low = results.filter((r) => r.ratio < minimumContrast).map((r) => r.text);
    expect(low).toContain("The home page, the pricing page and one image go live now. Visitors see them on their next visit.");
  });

  test("fails when a popover's fill is thinner", async ({ page }) => {
    await page.setViewportSize(widths.desk);
    const results = await measurePage(page, "/popover", "dark", "bright", ":root { --popup-fill: rgb(30 30 36 / 0.2); }");
    const low = results.filter((r) => r.ratio < minimumContrast).map((r) => r.text);
    expect(low).toContain("3 pages, 14 images and one form. 1,284 visits since it went live.");
  });

  test("fails when a button's fill is thinner", async ({ page }) => {
    await page.setViewportSize(widths.desk);
    const results = await measurePage(page, "/button", "light", "bright", ":root { --control-fill: rgb(255 255 255 / 0.3); }");
    const low = results.filter((r) => r.ratio < minimumContrast).map((r) => r.text);
    expect(low).toContain("Delete site");
  });
});
