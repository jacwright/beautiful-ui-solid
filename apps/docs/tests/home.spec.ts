import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// The home page: the kit's overview, opening on a live settings card, with cards to the pages to read first.

for (const theme of themes) {
  for (const mode of modes) {
    test(`the home page has no accessibility violations in ${theme} ${mode}`, async ({ page }) => {
      await open(page, "/", theme, mode);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });
  }
}

test("each card under Where to start goes to its page", async ({ page }) => {
  await open(page, "/");
  const cards = page.locator("beautiful-home-starts [data-card-link]");
  await expect(cards).toHaveCount(6);
  const links = await cards.evaluateAll((all) => all.map((link) => ({ href: link.getAttribute("href")!, title: link.textContent! })));
  for (const { href, title } of links) {
    await page.goto(href);
    await expect(page.locator("main > article > h1")).toHaveText(title);
  }
});
