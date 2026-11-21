import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// Shadows are a guide of rounded rectangles, one per depth, each wearing its --shadow-N.

for (const theme of themes) {
  for (const mode of modes) {
    test.describe(`${theme} ${mode}`, () => {
      test("has no accessibility violations", async ({ page }) => {
        await open(page, "/shadows", theme, mode);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations).toEqual([]);
      });

      test("each depth wears its own shadow, deeper as it rises", async ({ page }) => {
        await open(page, "/shadows", theme, mode);
        const shadows = await page.evaluate(() =>
          [1, 2, 3, 4].map((level) => {
            const el = document.querySelector(`beautiful-elevation[data-elevation="${level}"]`)!;
            const probe = document.createElement("beautiful-elevation");
            probe.style.boxShadow = `var(--shadow-${level})`;
            document.body.append(probe);
            const expected = getComputedStyle(probe).boxShadow;
            probe.remove();
            return { actual: getComputedStyle(el).boxShadow, expected };
          }),
        );
        for (const { actual, expected } of shadows) {
          expect(actual).not.toBe("none");
          expect(actual).toBe(expected);
        }
        expect(new Set(shadows.map((s) => s.actual)).size).toBe(4);
      });
    });
  }
}

test("a part's shadow is one of the depths", async ({ page }) => {
  await open(page, "/button", "glass", "light");
  const same = await page.evaluate(() => {
    const button = document.querySelector("beautiful-example-preview button:not([data-variant]):not(:disabled)")!;
    const probe = document.createElement("beautiful-elevation");
    probe.style.boxShadow = "var(--shadow-1)";
    document.body.append(probe);
    const expected = getComputedStyle(probe).boxShadow;
    probe.remove();
    return getComputedStyle(button).boxShadow === expected;
  });
  expect(same).toBe(true);
});
