import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// The APG has no Pagination pattern. From its Landmark Regions guidance: one labelled navigation
// landmark. From its Link pattern: Tab reaches each link and Enter follows it. aria-current="page"
// marks the page you're on, and a Previous with nowhere to go is out of the tab order.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** The row's words as they show: page numbers, gaps, and the arrows' words. */
const row = (page: Page, label: string) =>
  page.getByRole("navigation", { name: label, exact: true }).evaluate((nav) =>
    [...nav.querySelectorAll("a, beautiful-pagination-gap")].map((part) => part.textContent!.trim()).join(" "),
  );

test.describe("Pagination keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/pagination"));

  test("is one navigation landmark, named Pages", async ({ page }) => {
    const preview = section(page, "In the middle").locator("beautiful-example-preview");
    await expect(preview.getByRole("navigation")).toHaveAccessibleName("Pages");
  });

  test("Tab moves through Previous, each page and Next, skipping the gaps", async ({ page }) => {
    const example = section(page, "In the middle");
    await example.getByRole("heading").evaluate((heading) => {
      heading.tabIndex = -1;
      heading.focus();
    });
    const names = [];
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("Tab");
      names.push(await page.evaluate(() => document.activeElement!.getAttribute("aria-label") ?? document.activeElement!.textContent));
    }
    expect(names).toEqual(["Previous", "Page 1", "Page 5", "Page 6", "Page 7", "Page 12", "Next"]);
  });

  test("the current page is marked, and still a link", async ({ page }) => {
    const nav = section(page, "In the middle").getByRole("navigation");
    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName("Page 6");
    await expect(current).toHaveRole("link");
  });

  test("Enter follows a page's link", async ({ page }) => {
    await section(page, "In the middle").getByRole("link", { name: "Page 7" }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#page-7");
  });

  test("Previous on the first page is read as unavailable and can't be focused", async ({ page }) => {
    const previous = section(page, "On the first page").getByRole("link", { name: "Previous" });
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await expect(previous).not.toHaveAttribute("href");
    await previous.focus();
    await expect(previous).not.toBeFocused();
    await expect(previous).toHaveCSS("opacity", "0.5");
  });

  test("the arrows are drawn, and turn for right to left", async ({ page }) => {
    const nav = section(page, "In the middle").getByRole("navigation");
    const turn = (dir: string) =>
      nav.evaluate((el: HTMLElement, dir) => {
        el.dir = dir;
        const [first, last] = [el.firstElementChild!, el.lastElementChild!];
        const look = {
          previous: getComputedStyle(first, "::before").transform,
          next: getComputedStyle(last, "::after").transform,
          mask: getComputedStyle(first, "::before").maskImage,
        };
        el.removeAttribute("dir");
        return look;
      }, dir);
    const ltr = await turn("ltr");
    expect(ltr.mask).toContain("url(");
    expect(ltr.previous).toBe("matrix(-1, 0, 0, 1, 0, 0)");
    expect(ltr.next).toBe("none");
    const rtl = await turn("rtl");
    expect(rtl.previous).toBe("none");
    expect(rtl.next).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  });

  test("narrow, it folds to the current page of the last", async ({ page }) => {
    const nav = section(page, "Narrow").getByRole("navigation");
    const shown = await nav.evaluate((el) => [...el.querySelectorAll("beautiful-pagination-list > *")].filter((c) => (c as HTMLElement).offsetParent).map((c) => c.textContent));
    expect(shown).toEqual(["6", "12"]);
    const of = await nav.locator("beautiful-pagination-list").evaluate((list) => getComputedStyle(list, "::after").content);
    expect(of).toContain("of");
    // The words still show beside the arrows at this width.
    await expect(nav.getByRole("link", { name: "Previous" })).not.toHaveCSS("font-size", "0px");
  });

  test("narrower, Previous and Next keep their arrows and their names", async ({ page }) => {
    await page.goto("/tests/harness/pagination.html");
    const nav = page.locator('[data-example="middle"] nav');
    await nav.evaluate((el) => (el.style.width = "18rem"));
    const previous = nav.getByRole("link", { name: "Previous" });
    await expect(previous).toHaveCSS("font-size", "0px");
    await expect(previous).toHaveAccessibleName("Previous");
    const box = (await previous.boundingBox())!;
    expect(Math.round(box.width)).toBe(Math.round(box.height));
    // The arrow sits in the middle of its square.
    await expect(previous).toHaveCSS("gap", "0px");
    // Newer and Older have no pages beside them, so they keep their words.
    const newer = page.locator('[data-example="newer-older"] nav');
    await newer.evaluate((el) => (el.style.width = "18rem"));
    await expect(newer.getByRole("link", { name: "Newer" })).not.toHaveCSS("font-size", "0px");
  });

  test("each fold starts where the row would no longer fit", async ({ page }) => {
    await page.goto("/tests/harness/pagination.html");
    // At every width, the parts that show fit side by side with room to center the pages.
    const overlaps = await page.locator('[data-example="middle"] nav').evaluate((nav: HTMLElement) => {
      const bad: number[] = [];
      for (let width = 240; width <= 700; width += 4) {
        nav.style.width = `${width}px`;
        const [previous, list, next] = [...nav.children].map((part) => part.getBoundingClientRect());
        if (previous!.right > list!.left + 0.5 || list!.right > next!.left + 0.5) bad.push(width);
      }
      return bad;
    });
    expect(overlaps).toEqual([]);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Pagination look", () => {
  test("pages are quiet text, the current one a secondary Button's pane", async ({ page }) => {
    await open(page, "/pagination", "classic", "light");
    const nav = section(page, "In the middle").getByRole("navigation");
    const plain = nav.getByRole("link", { name: "Page 5" });
    await expect(plain).toHaveCSS("text-decoration-line", "none");
    await expect(plain).toHaveCSS("color", "rgb(24, 24, 27)");
    await expect(plain).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const current = nav.getByRole("link", { name: "Page 6" });
    await expect(current).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(current).toHaveCSS("border-top-color", "rgb(212, 212, 216)");
    await plain.hover();
    await expect(plain).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("every page is a full control, and the row keeps its width as you move", async ({ page }) => {
    await page.goto("/tests/harness/pagination.html");
    const lists = page.locator('[data-example="every-page"] nav beautiful-pagination-list');
    await expect(lists).toHaveCount(12);
    // A row measured before the web font arrives is narrower than one measured after.
    await page.evaluate(() => document.fonts.ready);
    // The rows agree to within a pixel. The current page's heavier weight can make a row a fraction of a
    // pixel wider, and rounding each width splits that across a pixel line with one machine's font and
    // not another's. A failure prints every row's width.
    await expect
      .poll(async () => {
        const widths = await lists.evaluateAll((all) => all.map((list) => list.getBoundingClientRect().width));
        return Math.max(...widths) - Math.min(...widths) < 1 ? "within a pixel" : widths;
      })
      .toBe("within a pixel");
    const sizes = await page.locator('[data-example="every-page"] nav a').evaluateAll((links) =>
      links.map((a) => a.getBoundingClientRect().height),
    );
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(36);
  });
});

test.describe("Pagination axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/pagination", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/pagination.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // The dialog example's stage is a picture, not the plain canvas.
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).exclude("beautiful-demo-stage").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Pagination component", () => {
  test("shows the first, the last, the current page and one each side", async ({ page }) => {
    await page.goto("/tests/harness/pagination.html");
    const rows: Record<number, string> = {};
    for (const at of [1, 4, 5, 6, 9, 12]) rows[at] = await row(page, `On page ${at}`);
    expect(rows).toEqual({
      1: "Previous 1 2 3 4 5 … 12 Next",
      4: "Previous 1 2 3 4 5 … 12 Next",
      5: "Previous 1 … 4 5 6 … 12 Next",
      6: "Previous 1 … 5 6 7 … 12 Next",
      9: "Previous 1 … 8 9 10 11 12 Next",
      12: "Previous 1 … 8 9 10 11 12 Next",
    });
    await expect(page.getByRole("navigation", { name: "On page 12" }).getByRole("link", { name: "Next" })).not.toHaveAttribute("href");
  });

  test("renders nothing with one page, and keeps an out-of-range page in range", async ({ page }) => {
    await page.goto("/tests/harness/pagination.html");
    await expect(page.locator("#one-page")).toHaveCount(0);
    expect(await row(page, "Out of range")).toBe("Previous 1 2 3 Next");
    await expect(page.getByRole("navigation", { name: "Out of range" }).locator('[aria-current="page"]')).toHaveText("3");
    // A page that isn't a number, such as one read from ?page=abc, is the first.
    await expect(page.getByRole("navigation", { name: "Not a number" }).locator('[aria-current="page"]')).toHaveText("1");
  });

  test("moves the current page when the page changes, and forwards its handlers", async ({ page }) => {
    await page.goto("/tests/harness/pagination.html");
    const nav = page.getByRole("navigation", { name: "Moving" });
    await nav.getByRole("link", { name: "Page 5" }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText("5");
    expect(await row(page, "Moving")).toBe("Previous 1 … 4 5 6 … 9 Next");
    await nav.getByRole("link", { name: "Next" }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText("6");
    await expect(nav).toHaveAttribute("id", "moving");
  });
});
