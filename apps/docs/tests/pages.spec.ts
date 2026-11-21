import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { parseComponents, slugOf } from "../src/nav.ts";
import { guideNames, isPageName } from "../src/pages.ts";

// The deploy check. Every path serves index.html, so a 200 proves nothing: each page must
// render its own <h1>. CI runs this against each preview and the live site (DOCS_URL).
//
// Each page also renders no div or span (CLAUDE.md, Principles). markup.test.ts reads the source;
// this reads the DOM the page built on load, so an element Solid or the wiring makes is caught too.
// Markup built later, such as a toast, is left to markup.test.ts.

async function noGeneric(page: Page) {
  await expect(page.locator("div, span")).toHaveCount(0);
}

// A shortcut scope warns in development about keys two of its actions share, or keys the browser
// keeps (shortcuts.ts). On any page, such a warning fails its test.
const warnings: string[] = [];
test.beforeEach(({ page }) => {
  warnings.length = 0;
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().startsWith("Shortcuts:")) warnings.push(message.text());
  });
});
test.afterEach(() => expect(warnings).toEqual([]));

const rows = parseComponents(readFileSync(new URL("../../../docs/components.md", import.meta.url), "utf8"));
const pages = rows.filter((row) => isPageName(row.name));

test("the home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main > article > h1")).toHaveText("Beautiful UI");
  await noGeneric(page);
});

for (const { name, slug } of pages) {
  test(`/${slug} renders the ${name} page`, async ({ page }) => {
    await page.goto(`/${slug}`);
    await expect(page.locator("main > article > h1")).toHaveText(name);
    await noGeneric(page);
  });
}

for (const name of guideNames) {
  test(`/${slugOf(name)} renders the ${name} guide`, async ({ page }) => {
    await page.goto(`/${slugOf(name)}`);
    await expect(page.locator("main > article > h1")).toHaveText(name);
    await noGeneric(page);
  });
}

// A website example is whole sections. A long line in one must wrap, not widen the example or the page.
for (const name of guideNames) {
  test(`/${slugOf(name)} does not scroll sideways on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${slugOf(name)}`);
    await expect(page.locator("main > article > h1")).toHaveText(name);
    const wide = await page.evaluate(() => {
      const overflowing = [...document.querySelectorAll("beautiful-example-preview")].filter((el) => el.scrollWidth > el.clientWidth);
      const root = document.documentElement;
      return { page: Math.max(0, root.scrollWidth - root.clientWidth), examples: overflowing.length };
    });
    expect(wide).toEqual({ page: 0, examples: 0 });
  });
}

test("an unknown path says the page is not found", async ({ page }) => {
  await page.goto("/no-such-component");
  await expect(page.locator("main > article > h1")).toHaveText("Page not found");
  await noGeneric(page);
});
