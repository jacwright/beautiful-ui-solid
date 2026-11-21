import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { modes, open, themes } from "./settings.ts";

// No APG pattern: a card is a container, and the elements inside it do the work. A linked card
// follows the Link pattern for its one link: Tab reaches it, Enter follows it, and its name is
// the heading's words alone. Its hit area is the whole card, and the controls inside stay their own.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** Focuses the example's own title, so the next Tab is the example's first stop. */
function startBefore(page: Page, title: string) {
  return section(page, title)
    .getByRole("heading", { name: title, exact: true })
    .evaluate((heading) => {
      heading.tabIndex = -1;
      heading.focus();
    });
}

const hash = (page: Page) => page.evaluate(() => location.hash);

test.describe("Card keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/card"));

  test("Tab passes over a plain card to the controls inside it", async ({ page }) => {
    await startBefore(page, "A card");
    await page.keyboard.press("Tab");
    await expect(section(page, "A card").getByRole("button", { name: "Change domain" })).toBeFocused();
  });

  test("Tab stops at each linked card's link, then at the controls inside, in reading order", async ({ page }) => {
    const preview = section(page, "Linked cards, on glass").locator("beautiful-example-preview");
    await startBefore(page, "Linked cards, on glass");
    for (const name of ["Spring launch", "Harbor Coffee", "Fern Studio"]) {
      await page.keyboard.press("Tab");
      await expect(preview.getByRole("link", { name, exact: true })).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(preview.getByRole("button", { name: "Publish" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(preview.getByRole("link", { name: "Fern Studio" })).toBeFocused();
  });

  test("Enter follows a card's link, and Space doesn't", async ({ page }) => {
    const link = section(page, "Linked cards, on glass").getByRole("link", { name: "Harbor Coffee" });
    await link.focus();
    await page.keyboard.press("Space");
    expect(await hash(page)).toBe("");
    await page.keyboard.press("Enter");
    await expect.poll(() => hash(page)).toBe("#harbor-coffee");
  });

  test("a card's link is named by its heading alone, and its heading is in the outline", async ({ page }) => {
    const preview = section(page, "Linked cards, on glass").locator("beautiful-example-preview");
    await expect(preview.getByRole("list", { name: "Sites" }).getByRole("listitem")).toHaveCount(3);
    await expect(preview.getByRole("link")).toHaveCount(3);
    await expect(preview.getByRole("link").first()).toHaveAccessibleName("Spring launch");
    await expect(preview.getByRole("heading", { level: 3, name: "Spring launch" })).toBeVisible();
  });

  test("a click anywhere on a linked card follows its link", async ({ page }) => {
    const card = section(page, "Linked cards, on glass").locator("[data-card]").nth(1);
    // On the image, and on the line of text under the title: neither is the link, though the link covers
    // them, so the clicks are forced through Playwright's check that nothing else is on top.
    await card.locator("img").click({ force: true });
    await expect.poll(() => hash(page)).toBe("#harbor-coffee");
    await page.evaluate(() => history.replaceState(null, "", location.pathname));
    await card.getByText("Published yesterday.").click({ force: true });
    await expect.poll(() => hash(page)).toBe("#harbor-coffee");
  });

  test("a control inside a linked card stays its own", async ({ page }) => {
    const card = section(page, "Linked cards, on glass").locator("[data-card]").nth(2);
    const clicks = await card.getByRole("button", { name: "Publish" }).evaluate((button) => {
      let count = 0;
      button.addEventListener("click", () => count++);
      (window as unknown as { publishClicks: () => number }).publishClicks = () => count;
      return count;
    });
    expect(clicks).toBe(0);
    await card.getByRole("button", { name: "Publish" }).click();
    expect(await page.evaluate(() => (window as unknown as { publishClicks: () => number }).publishClicks())).toBe(1);
    expect(await hash(page)).toBe("");
  });

  test("an input group inside a linked card is raised whole, so its icon stays above its field", async ({ page }) => {
    const card = section(page, "Linked cards, on glass").locator("[data-card]").first();
    const layers = await card.evaluate((element) => {
      element.insertAdjacentHTML(
        "beforeend",
        '<beautiful-input-group><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /></svg><input aria-label="Find" /></beautiful-input-group>',
      );
      const group = element.querySelector("beautiful-input-group")!;
      group.scrollIntoView({ block: "center" });
      const field = group.querySelector("input")!;
      const box = field.getBoundingClientRect();
      return {
        group: getComputedStyle(group).zIndex,
        // The field isn't raised past the icon that comes before it in the group.
        field: getComputedStyle(field).zIndex,
        // A click on the field reaches it, not the stretched link.
        hit: document.elementFromPoint(box.right - 8, box.top + box.height / 2)?.tagName,
      };
    });
    expect(layers).toEqual({ group: "1", field: "auto", hit: "INPUT" });
  });

  test("the card shows its link's focus ring, around the whole card", async ({ page }) => {
    const card = section(page, "Linked cards, on glass").locator("[data-card]").first();
    const link = card.getByRole("link");
    await startBefore(page, "Linked cards, on glass");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS("outline-style", "none");
    await expect(card).toHaveCSS("outline-style", "solid");
    await expect(card).toHaveCSS("outline-width", "2px");
    await expect(card).toHaveCSS("outline-offset", "2px");
    // A click shows no ring.
    await section(page, "Linked cards, on glass").locator("[data-card]").nth(1).locator("img").click({ force: true });
    await expect(section(page, "Linked cards, on glass").locator("[data-card]").nth(1)).toHaveCSS("outline-style", "none");
  });

  test("the moving ring glides to the card, and the card's ring waits for it", async ({ page }) => {
    const cards = section(page, "Linked cards, on glass").locator("[data-card]");
    await cards.first().getByRole("link").focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await page.evaluate(() => document.documentElement.style.setProperty("--motion-focus", "4s"));
    await page.keyboard.press("Tab");
    await expect(cards.nth(1).getByRole("link")).toBeFocused();
    await expect(page.locator("beautiful-focus-ring")).toBeVisible();
    await expect(cards.nth(1)).toHaveAttribute("data-focus-ring-gliding");
    await expect(cards.nth(1)).toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
  });

  test("the footers in a row of cards line up at the bottom", async ({ page }) => {
    const cards = section(page, "Linked cards, on glass").locator("[data-card]");
    const bottoms = await cards.evaluateAll((all) => all.map((card) => Math.round(card.getBoundingClientRect().bottom)));
    expect(new Set(bottoms).size).toBe(1);
    const footer = await cards.nth(2).evaluate((card) => {
      const padding = parseFloat(getComputedStyle(card).paddingBottom);
      return card.getBoundingClientRect().bottom - card.querySelector("footer")!.getBoundingClientRect().bottom - padding;
    });
    expect(Math.round(footer)).toBe(1);
  });

  test("media runs to the card's edges, under its top corners", async ({ page }) => {
    const card = section(page, "Linked cards, on glass").locator("[data-card]").first();
    const fit = await card.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const image = element.querySelector("img")!;
      const media = image.getBoundingClientRect();
      return { left: media.left - box.left, right: box.right - media.right, top: media.top - box.top, radius: getComputedStyle(image).borderTopLeftRadius };
    });
    // Inside the 1px border.
    expect(fit).toEqual({ left: 1, right: 1, top: 1, radius: "11px" });
  });

  test("media needs no size: it fills the width at 16:9, cropped, or keeps its own height with auto", async ({ page }) => {
    const cards = section(page, "Linked cards, on glass").locator("[data-card]");
    // The three images are 4:3, 3:2 and 1:1, and none sets a width or height.
    const sizes = await cards.evaluateAll((all) =>
      all.map((card) => {
        const image = card.querySelector("img")!;
        const box = image.getBoundingClientRect();
        return { ratio: box.width / box.height, natural: image.naturalWidth / image.naturalHeight, fit: getComputedStyle(image).objectFit };
      }),
    );
    for (const size of sizes) {
      expect(size.ratio).toBeCloseTo(16 / 9, 1);
      expect(size.fit).toBe("cover");
    }
    expect(new Set(sizes.map((size) => size.natural.toFixed(2))).size).toBe(3);
    const own = await cards.nth(2).evaluate((card) => {
      (card as HTMLElement).style.setProperty("--card-media-ratio", "auto");
      const box = card.querySelector("img")!.getBoundingClientRect();
      return box.width / box.height;
    });
    expect(own).toBeCloseTo(1, 1);
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Card look", () => {
  test("a <beautiful-card> takes the same look as an element with data-card", async ({ page }) => {
    await page.goto("/tests/harness/card.html?theme=classic&mode=light");
    const plain = page.locator("#plain");
    await expect(plain).toHaveCSS("display", "flex");
    await expect(plain).toHaveCSS("padding", "20px");
    await expect(plain).toHaveCSS("border-radius", "12px");
    await expect(plain).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });

  test("classic: the raised panel with a hairline edge", async ({ page }) => {
    await open(page, "/card", "classic", "light");
    const card = section(page, "A card").locator("[data-card]");
    await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(card).toHaveCSS("border-top-color", "rgb(228, 228, 231)");
    await expect(card).toHaveCSS("border-radius", "12px");
    await expect(card).toHaveCSS("padding", "20px");
    // No filter at all, so the card isn't a containing block for a fixed child.
    await expect(card).toHaveCSS("backdrop-filter", "none");
  });

  test("glass: a frosted pane with the rim", async ({ page }) => {
    await open(page, "/card", "glass", "light");
    const card = section(page, "A card").locator("[data-card]");
    await expect(card).toHaveCSS("backdrop-filter", "blur(16px) saturate(1.8)");
    const rim = await card.evaluate((element) => getComputedStyle(element, "::before").content);
    expect(rim).toBe('""');
  });

  test("a linked card lights up under the pointer; a plain one doesn't", async ({ page }) => {
    await open(page, "/card", "classic", "light");
    const linked = section(page, "Linked cards, on glass").locator("[data-card]").first();
    const rest = await linked.evaluate((element) => getComputedStyle(element).boxShadow);
    await linked.locator("img").hover({ force: true });
    await expect(linked).toHaveCSS("border-top-color", "rgb(212, 212, 216)");
    await expect.poll(() => linked.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(rest);

    // Not while the pointer is on a control inside, whose click doesn't follow the link.
    const fern = section(page, "Linked cards, on glass").locator("[data-card]").nth(2);
    await fern.getByRole("button", { name: "Publish" }).hover();
    await expect(fern).toHaveCSS("border-top-color", "rgb(228, 228, 231)");
    await fern.locator("img").hover({ force: true });
    await expect(fern).toHaveCSS("border-top-color", "rgb(212, 212, 216)");

    const plain = section(page, "A card").locator("[data-card]");
    await plain.hover();
    await expect(plain).toHaveCSS("border-top-color", "rgb(228, 228, 231)");
  });

  test("the title link reads as the heading: its color, no accent", async ({ page }) => {
    await open(page, "/card", "classic", "light");
    const link = section(page, "Linked cards, on glass").getByRole("link").first();
    await expect(link).toHaveCSS("color", "rgb(24, 24, 27)");
  });

  test("reduced transparency falls back to classic's card", async ({ page }) => {
    await open(page, "/card", "glass", "light");
    // Playwright can't emulate the preference, so the fallback's rule is checked as written.
    const fallback = await page.evaluate(() =>
      [...document.styleSheets].some((sheet) => {
        try {
          return [...sheet.cssRules].some((rule) => rule.cssText.includes("prefers-reduced-transparency") && rule.cssText.includes("--card-fill: revert-layer"));
        } catch {
          return false;
        }
      }),
    );
    expect(fallback).toBe(true);
  });
});

test.describe("Card axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/card", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/card.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).exclude("beautiful-demo-stage").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Card component", () => {
  test("renders a <beautiful-card> unless as names a meaningful element, which says data-card", async ({ page }) => {
    await page.goto("/tests/harness/card.html");
    await expect(page.locator("#plain")).toHaveJSProperty("tagName", "BEAUTIFUL-CARD");
    await expect(page.locator("#plain")).not.toHaveAttribute("data-card");
    await expect(page.locator("#saving")).toHaveJSProperty("tagName", "FORM");
    await expect(page.locator("#saving")).toHaveAttribute("data-card", "");
  });

  test("passes other attributes through, to the card and to its link", async ({ page }) => {
    await page.goto("/tests/harness/card.html");
    await expect(page.locator("#saving")).toHaveClass("settings");
    await expect(page.locator("#saving")).toHaveAttribute("aria-label", "Saving");
    await expect(page.locator("#open-billing")).toHaveAttribute("aria-describedby", "billing-note");
    await expect(page.locator("#open-billing")).toHaveAttribute("data-card-link", "");
  });

  test("forwards a form card's submit", async ({ page }) => {
    await page.goto("/tests/harness/card.html");
    await page.locator("#saving").getByRole("button", { name: "Save" }).click();
    await expect(page.locator("#saving")).toHaveAttribute("data-saved", "1");
  });
});
