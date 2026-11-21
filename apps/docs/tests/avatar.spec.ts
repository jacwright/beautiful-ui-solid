import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { minimumContrast } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// Avatar has no APG pattern: it is an image. It is read once by its name, takes no focus, and a
// button that holds one has the button's keys. Its initials are CSS, so axe can't see them: their
// contrast is checked here from the computed colors.

/** The docs example with this title. */
function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

/** WCAG contrast between two CSS colors, parsed by a canvas into sRGB. */
async function contrast(page: Page, fore: string, back: string) {
  return page.evaluate(
    ([fore, back]) => {
      const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const luminance = (color: string) => {
        paint.clearRect(0, 0, 1, 1);
        paint.fillStyle = color;
        paint.fillRect(0, 0, 1, 1);
        const [r = 0, g = 0, b = 0] = paint.getImageData(0, 0, 1, 1).data;
        const lin = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      };
      const [a, b] = [luminance(fore!), luminance(back!)].sort((x, y) => y - x);
      return (a! + 0.05) / (b! + 0.05);
    },
    [fore, back],
  );
}

test.describe("Avatar semantics and keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/avatar"));

  test("is read once, by its name, not its initials", async ({ page }) => {
    const preview = section(page, "Initials and tints").locator("beautiful-example-preview");
    await expect(preview.getByRole("img", { name: "Priya Natarajan" })).toBeVisible();
    await expect(preview.getByRole("img")).toHaveCount(9);
    // The initials are drawn, so they are no text to read, copy or translate.
    await expect(preview).toHaveText("");
    const drawn = await preview.getByRole("img", { name: "Jonas Weber" }).evaluate((el) => getComputedStyle(el, "::before").content);
    expect(drawn).toBe('"JW"');
  });

  test("a photo is part of the avatar, not a second image", async ({ page }) => {
    const preview = section(page, "With and without a photo").locator("beautiful-example-preview");
    await expect(preview.getByRole("img")).toHaveCount(3);
    await expect(preview.getByRole("img", { name: "Lucía Reyes" })).toHaveCount(2);
  });

  test("beside its name it is hidden, and the name is read on its own", async ({ page }) => {
    const preview = section(page, "Beside a name").locator("beautiful-example-preview");
    await expect(preview.getByRole("img")).toHaveCount(0);
    await expect(preview.getByRole("listitem").first()).toHaveAccessibleName("");
    await expect(preview.getByText("Maya Chen")).toBeVisible();
  });

  test("a group is named, and holds each avatar by name", async ({ page }) => {
    const group = section(page, "A group").getByRole("group", { name: "Editing now" });
    await expect(group.getByRole("img")).toHaveCount(5);
    await expect(group.getByRole("img").last()).toHaveAccessibleName("3 more people");
  });

  test("Tab passes over avatars and lands on a button that holds one", async ({ page }) => {
    const start = (title: string) =>
      section(page, title)
        .getByRole("heading")
        .evaluate((h) => {
          h.tabIndex = -1;
          h.focus();
        });
    // The group's avatars take no focus, so the next stop is the example's Code toggle.
    await start("A group");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Code");
    await start("In a button");
    await page.keyboard.press("Tab");
    await expect(section(page, "In a button").getByRole("button", { name: "Your account, Theo Larsen" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(section(page, "In a button").getByRole("button", { name: "Switch team, Northwind Studio" })).toBeFocused();
  });

  test("the page doesn't scroll sideways on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Avatar look", () => {
  test.beforeEach(({ page }) => open(page, "/avatar", "classic", "light"));

  test("five sizes, with initials that scale", async ({ page }) => {
    const row = section(page, "Sizes").locator("beautiful-demo-row").nth(1);
    const sizes = await row.locator("beautiful-avatar").evaluateAll((all) =>
      all.map((el) => [el.getBoundingClientRect().width, el.getBoundingClientRect().height, parseFloat(getComputedStyle(el).fontSize)]),
    );
    expect(sizes.map(([w]) => w)).toEqual([20, 24, 32, 40, 64]);
    for (const [w, h, font] of sizes) {
      expect(h).toBe(w);
      expect(font).toBeCloseTo(w! * 0.4, 1);
    }
  });

  test("a circle for a person, rounded corners for a team or a site", async ({ page }) => {
    const person = section(page, "Initials and tints").locator("beautiful-avatar").first();
    await expect(person).toHaveCSS("border-radius", "50%");
    const team = section(page, "Teams and sites").getByRole("img", { name: "Northwind Studio" });
    await expect(team).toHaveCSS("border-radius", "22%");
  });

  test("the photo covers the initials and fills the avatar", async ({ page }) => {
    const avatar = section(page, "With and without a photo").getByRole("img", { name: "Lucía Reyes" }).first();
    const img = avatar.locator("img");
    await expect(img).toHaveJSProperty("complete", true);
    const [outer, inner] = await Promise.all([avatar.boundingBox(), img.boundingBox()]);
    expect(inner).toEqual(outer);
    await expect(img).toHaveCSS("object-fit", "cover");
    // On top of the initials, and under the edge.
    await avatar.scrollIntoViewIfNeeded();
    const hit = await avatar.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.tagName;
    });
    expect(hit).toBe("IMG");
  });

  test("a name with no letters shows a person outline", async ({ page }) => {
    const avatar = section(page, "With and without a photo").getByRole("img", { name: "hello@northwind.studio" });
    const before = await avatar.evaluate((el) => getComputedStyle(el, "::before").maskImage);
    expect(before).toContain("url(");
  });

  test("a group overlaps by a quarter, cuts a gap, and sizes its avatars", async ({ page }) => {
    const groups = section(page, "A group").getByRole("group");
    const avatars = groups.first().locator("beautiful-avatar");
    const [a, b] = await Promise.all([avatars.nth(0).boundingBox(), avatars.nth(1).boundingBox()]);
    expect(b!.x - a!.x).toBe(24);
    expect(await avatars.nth(0).evaluate((el) => getComputedStyle(el).maskImage)).toContain("radial-gradient");
    expect(await avatars.last().evaluate((el) => getComputedStyle(el).maskImage)).toBe("none");
    expect((await groups.nth(1).locator("beautiful-avatar").first().boundingBox())!.width).toBe(24);
  });

  test("a button around an avatar takes its shape", async ({ page }) => {
    const button = section(page, "In a button").getByRole("button").first();
    const avatar = button.locator("beautiful-avatar");
    expect(await button.boundingBox()).toEqual(await avatar.boundingBox());
    await expect(button).toHaveCSS("border-radius", "50%");
    await expect(section(page, "In a button").getByRole("button").last()).toHaveCSS("border-radius", "22%");
    // A fine pointer gets no more than the avatar; a finger's target reaches out (pointer: coarse).
    const reach = await button.evaluate((el) => getComputedStyle(el, "::before").top);
    expect(reach).toBe("0px");
  });

  test("hover dims the avatar in a button", async ({ page }) => {
    const button = section(page, "In a button").getByRole("button").first();
    await button.hover();
    await expect(button.locator("beautiful-avatar")).toHaveCSS("filter", "brightness(0.92)");
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`every tint keeps its initials at 4.5:1, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/avatar", theme, mode);
        const pairs = await section(page, "Initials and tints")
          .locator("beautiful-avatar")
          .evaluateAll((all) => all.map((el) => [el.getAttribute("data-color"), getComputedStyle(el).color, getComputedStyle(el).backgroundColor]));
        expect(pairs).toHaveLength(9);
        for (const [color, ink, fill] of pairs) {
          const ratio = await contrast(page, ink!, fill!);
          expect(ratio, `${color}: ${ink} on ${fill}`).toBeGreaterThanOrEqual(minimumContrast);
        }
      });
    }
  }
});

test.describe("Avatar axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/avatar", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the harness, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/avatar.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A bare test page has no landmarks or title heading; those rules are the docs site's.
        const results = await new AxeBuilder({ page }).disableRules(["page-has-heading-one", "region", "landmark-one-main"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Avatar component", () => {
  test("drops a photo that fails, keeps the initials, and tries a new src", async ({ page }) => {
    await page.goto("/tests/harness/avatar.html");
    const avatar = page.locator("#broken");
    await expect(avatar).toHaveAttribute("data-initials", "LR");
    await expect(avatar.locator("img")).toHaveCount(0);
    await page.locator("#fix-photo").click();
    await expect(avatar.locator("img")).toHaveAttribute("src", "/avatars/lucia.svg");
    await expect(avatar.locator("img")).toHaveJSProperty("complete", true);
    await expect(avatar.locator("img")).toHaveCount(1);
  });

  test("passes other attributes to the avatar, and the image ones to the <img>", async ({ page }) => {
    await page.goto("/tests/harness/avatar.html");
    const avatar = page.locator("#attributes");
    await expect(avatar).toHaveClass("extra");
    await expect(avatar).toHaveAttribute("title", "Theo");
    await expect(avatar.locator("img")).toHaveAttribute("loading", "lazy");
    await expect(avatar.locator("img")).toHaveAttribute("referrerpolicy", "no-referrer");
    await expect(avatar).not.toHaveAttribute("loading");
  });

  test("a caller's label wins over the name, and an explicit md holds in a sized group", async ({ page }) => {
    await page.goto("/tests/harness/avatar.html");
    await expect(page.locator("#labelled")).toHaveAccessibleName("Maya Chen, online");
    await expect(page.locator("#labelled")).toHaveAttribute("data-size", "md");
  });

  test("a button with words beside its avatar keeps the Button look", async ({ page }) => {
    await page.goto("/tests/harness/avatar.html");
    const button = page.locator("#with-words");
    await expect(button).not.toHaveCSS("padding-left", "0px");
    await expect(button).not.toHaveCSS("border-radius", "50%");
  });

  test("takes the initials from the first and last words, as letters", async ({ page }) => {
    await page.goto("/tests/harness/avatar.html");
    await expect(page.locator("#emoji")).toHaveAttribute("data-initials", "ÉC");
    await expect(page.locator("#emoji")).toHaveAccessibleName("émile de la cruz");
  });
});
