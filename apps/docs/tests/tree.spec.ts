import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Locator, type Page, test } from "@playwright/test";
import { clickInPopover } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// From APG's Tree View pattern: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
// The docs page's examples are the live Solid Tree, so these test the component as people use it.
// Moving focus never selects: selecting shows a page, so it waits for Enter, Space
// or a click.

const leadTree = (page: Page) => page.getByRole("tree", { name: "Pages of Spring launch" });
const pagesTree = (page: Page) => page.getByRole("tree", { name: "Pages", exact: true });
const docsTree = (page: Page) => page.getByRole("tree", { name: "Docs" });
const item = (tree: Locator, name: string) => tree.getByRole("treeitem", { name: new RegExp(`^${name}`) });
/** The pages example: its own line under the tree, and the tree's live region, which says each spot of a keyboard move. */
const pagesExample = (page: Page) => page.locator(".example").filter({ has: pagesTree(page) });
const status = (page: Page) => pagesExample(page).locator('p[role="status"]');
const moveNews = (page: Page) => pagesExample(page).locator('beautiful-visually-hidden[role="status"]');

/** The labels of the items that show, in order, with a * on the selected one. */
async function shown(tree: Locator) {
  return tree.locator(':scope > [role="treeitem"]:not([hidden])').evaluateAll((els) =>
    els.map((el) => `${el.getAttribute("aria-selected") === "true" ? "*" : ""}${el.querySelector("beautiful-tree-label")?.textContent}`),
  );
}

test.describe("Tree keyboard and semantics", () => {
  test.beforeEach(({ page }) => open(page, "/tree"));

  test("is one Tab stop, on the selected item", async ({ page }) => {
    // A click on the words above the lead starts Tab from there.
    await page.locator(".lede").click();
    await page.keyboard.press("Tab");
    await expect(item(leadTree(page), "Team")).toBeFocused();
    await expect(leadTree(page).locator('[tabindex="0"]')).toHaveCount(1);
    await expect(pagesTree(page).locator('[tabindex="0"]')).toHaveCount(1);
    await expect(pagesTree(page).locator('[tabindex="0"]')).toHaveAccessibleName(/^Pricing/);
    await expect(pagesTree(page).locator("[data-tree-actions]").first()).toHaveAttribute("tabindex", "-1");
  });

  test("↓ ↑ Home End move without selecting, past closed items' children", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Pricing").focus();
    await page.keyboard.press("ArrowDown");
    await expect(item(tree, "Blog")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(item(tree, "Contact")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(item(tree, "Pricing")).toBeFocused();
    await page.keyboard.press("End");
    await expect(item(tree, "Not found")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item(tree, "Home")).toBeFocused();
    await expect(status(page)).toHaveText("Showing /pricing/");
    await expect(item(tree, "Pricing")).toHaveAttribute("aria-selected", "true");
  });

  test("→ opens and then enters an item; ← closes and then goes to the parent", async ({ page }) => {
    const tree = pagesTree(page);
    const blog = item(tree, "Blog");
    await blog.focus();
    await expect(blog).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("ArrowRight");
    await expect(blog).toHaveAttribute("aria-expanded", "true");
    await expect(item(tree, "Spring launch notes")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(item(tree, "Spring launch notes")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(item(tree, "Spring launch notes")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(blog).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(blog).toHaveAttribute("aria-expanded", "false");
    await expect(item(tree, "Spring launch notes")).toBeHidden();
  });

  test("Enter and Space select; a click selects; the chevron opens without selecting", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("Enter");
    await expect(status(page)).toHaveText("Showing /contact/");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Space");
    await expect(status(page)).toHaveText("Showing /blog/");
    await item(tree, "Home").click();
    await expect(status(page)).toHaveText("Showing /");
    await expect(item(tree, "Home")).toBeFocused();
    await item(tree, "About").click({ position: { x: 12, y: 16 } });
    await expect(item(tree, "About")).toHaveAttribute("aria-expanded", "false");
    await expect(status(page)).toHaveText("Showing /");
  });

  test("* opens every sibling; a letter finds an item", async ({ page }) => {
    const tree = docsTree(page);
    await item(tree, "Components").focus();
    await page.keyboard.press("ArrowRight");
    await expect(item(tree, "Forms")).toBeFocused();
    await page.keyboard.press("*");
    await expect(item(tree, "Forms")).toHaveAttribute("aria-expanded", "true");
    await expect(item(tree, "Overlays")).toHaveAttribute("aria-expanded", "true");
    await expect(item(tree, "Guides")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("d");
    await expect(item(tree, "Dialog")).toBeFocused();
  });

  test("opens the selected item's parents on first show", async ({ page }) => {
    expect(await shown(docsTree(page))).toEqual([
      "Guides",
      "Getting started",
      "*Websites",
      "Illustrations",
      "Components",
      "Forms",
      "Overlays",
      "Changelog",
    ]);
  });

  test("Shift+F10 opens the item's menu on its first action, and Escape returns to the item", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("Shift+F10");
    const menu = page.getByRole("menu", { name: "Actions for Contact" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /^Preview/ })).toBeFocused();
    await expect(item(tree, "Contact")).toHaveAttribute("data-menu-open", "");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(item(tree, "Contact")).toBeFocused();
    await expect(item(tree, "Contact")).not.toHaveAttribute("data-menu-open");
  });

  test("right-click and the … button open the same actions, for their own row", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Home").click({ button: "right" });
    const home = page.getByRole("menu", { name: "Actions for Home" });
    await expect(home).toBeVisible();
    // Delete is hidden on the home page, and so is Move: canMove keeps it where it is.
    await expect(home.getByRole("menuitem")).toHaveText([/Preview/, /Rename/, /Add a page inside/, /Duplicate/]);
    await page.keyboard.press("Escape");
    await item(tree, "Contact").hover();
    await item(tree, "Contact").locator("[data-tree-actions]").click();
    const contact = page.getByRole("menu", { name: "Actions for Contact" });
    await expect(contact.getByRole("menuitem")).toHaveText([/Preview/, /Rename/, /Add a page inside/, /Duplicate/, /Move/, /Delete/]);
    await clickInPopover(contact.getByRole("menuitem", { name: /^Add a page inside/ }));
    await expect(item(tree, "Contact")).toHaveAttribute("aria-expanded", "true");
    await expect(item(tree, "Untitled page")).toHaveAttribute("aria-level", "2");
  });

  test("deleting the focused item hands focus to the row in its place", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("Shift+F10");
    await clickInPopover(page.getByRole("menuitem", { name: /^Delete/ }));
    await expect(item(tree, "Contact")).toHaveCount(0);
    await expect(item(tree, "Not found")).toBeFocused();
  });

  test("typing after an arrow key starts a new search", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Home").focus();
    await page.keyboard.press("b");
    await expect(item(tree, "Blog")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("n");
    await expect(item(tree, "Not found")).toBeFocused();
  });

  test("a click in the indent selects; only the chevron opens", async ({ page }) => {
    const tree = docsTree(page);
    const forms = item(tree, "Forms");
    await forms.click({ position: { x: 4, y: 16 } });
    await expect(forms).toHaveAttribute("aria-selected", "true");
    await expect(forms).toHaveAttribute("aria-expanded", "false");
  });

  test("an action's keys run on the focused item", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("F2");
    await expect(status(page)).toHaveText("Renaming Contact");
  });

  test("an item is named by its label and end, with its level and place", async ({ page }) => {
    const careers = item(pagesTree(page), "Careers");
    await expect(careers).toHaveAccessibleName("Careers Draft");
    await expect(careers).toHaveAttribute("aria-level", "2");
    await expect(careers).toHaveAttribute("aria-posinset", "2");
    await expect(careers).toHaveAttribute("aria-setsize", "2");
    await expect(careers).toHaveAttribute("aria-haspopup", "menu");
  });

  test("children grow in and fade, and the rows below move down with them", async ({ page }) => {
    await item(pagesTree(page), "Blog").focus();
    // Halfway through the open, paused there, so load can't move what's measured.
    const halfway = await page.evaluate(async () => {
      const rows = () => [...document.querySelectorAll<HTMLElement>('[role="tree"][aria-label="Pages"] > [role="treeitem"]')];
      const find = (label: string) => rows().find((row) => row.querySelector("beautiful-tree-label")?.textContent === label)!;
      const contactBefore = find("Contact").getBoundingClientRect().top;
      find("Blog").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      // Solid writes the change when its batch flushes, which under load can take more than a task,
      // and may write the new rows before it puts back the ones after them.
      const has = (label: string) => rows().some((row) => row.querySelector("beautiful-tree-label")?.textContent === label);
      while (!has("Spring launch notes") || !has("Contact")) await new Promise((done) => setTimeout(done));
      const child = find("Spring launch notes");
      const animations = child.getAnimations();
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 60;
      }
      const at = {
        transitions: animations.length,
        height: child.getBoundingClientRect().height,
        opacity: +getComputedStyle(child).opacity,
        contactMoved: find("Contact").getBoundingClientRect().top - contactBefore,
      };
      for (const animation of animations) animation.finish();
      return at;
    });
    expect(halfway.transitions).toBeGreaterThan(0);
    expect(halfway.height).toBeGreaterThan(2);
    expect(halfway.height).toBeLessThan(32);
    expect(halfway.opacity).toBeLessThan(1);
    // Contact has moved down part of the way: three rows' worth when done.
    expect(halfway.contactMoved).toBeGreaterThan(0);
    expect(halfway.contactMoved).toBeLessThan(3 * 32);
    const child = item(pagesTree(page), "Spring launch notes");
    await expect.poll(() => child.evaluate((el) => +getComputedStyle(el).opacity)).toBe(1);
    expect((await child.boundingBox())?.height).toBe(32);
  });

  for (const theme of themes) {
    for (const mode of modes) {
      test(`axe, ${theme} ${mode}, with a menu open`, async ({ page }) => {
        await open(page, "/tree", theme, mode);
        await item(pagesTree(page), "Blog").focus();
        await page.keyboard.press("ArrowRight");
        const scan = () => new AxeBuilder({ page }).include("beautiful-example-preview").disableRules(["color-contrast"]).analyze();
        expect((await scan()).violations).toEqual([]);
        await page.keyboard.press("Shift+F10");
        await expect(page.getByRole("menu", { name: "Actions for Blog" })).toBeVisible();
        expect((await scan()).violations).toEqual([]);
      });
    }
  }
});

// The tree of 5,510 pages renders only the rows in its panel's view (virtual.ts), and the keys
// move through every shown item's data.
test.describe("Tree with thousands of items", () => {
  test.beforeEach(({ page }) => open(page, "/tree"));
  const largeTree = (page: Page) => page.getByRole("tree", { name: "Every page" });
  const rendered = (tree: Locator) => tree.locator(':scope > [role="treeitem"]');

  test("renders only the rows in view, with spacers keeping the full height", async ({ page }) => {
    const tree = largeTree(page);
    await expect(item(tree, "Blog")).toBeVisible();
    // 510 items show: ten sections open, their folders closed.
    expect(await rendered(tree).count()).toBeLessThan(60);
    const height = await tree.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(510 * 32);
    // Scrolled to the middle, with focus in the tree, the rows there are real rows, and the panel stays there.
    await item(tree, "Blog").focus();
    const middle = await tree.evaluate((el) => (el.parentElement!.scrollTop = Math.round(el.scrollHeight / 2)));
    await expect.poll(() => tree.evaluate((el) => el.parentElement!.scrollTop)).toBe(middle);
    await expect.poll(() => rendered(tree).first().getAttribute("aria-level")).toBeTruthy();
    // The sixth section starts halfway: Events is rendered, Guides, near the top, isn't.
    await expect(item(tree, "Events")).toBeAttached();
    await expect(item(tree, "Guides")).toHaveCount(0);
    expect(await rendered(tree).count()).toBeLessThan(60);
  });

  test("End, Home and type-ahead reach items that aren't rendered", async ({ page }) => {
    const tree = largeTree(page);
    await item(tree, "Blog").focus();
    await page.keyboard.press("End");
    await expect(item(tree, "Teams 5")).toBeFocused();
    await expect(item(tree, "Teams 5")).toBeInViewport();
    await expect(item(tree, "Teams 5")).toHaveAttribute("aria-posinset", "50");
    await page.keyboard.press("Home");
    await expect(item(tree, "Blog")).toBeFocused();
    await page.keyboard.type("pre");
    await expect(item(tree, "Press")).toBeFocused();
    // Up from Press: the last folder in Products, far from anything rendered before.
    await page.keyboard.press("ArrowUp");
    const focused = tree.locator(":focus");
    await expect(focused).toHaveAccessibleName(/^Teams 5/);
    await expect(focused).toHaveAttribute("aria-level", "2");
  });

  test("* opens fifty folders at once, and the Tab stop stays rendered out of view", async ({ page }) => {
    const tree = largeTree(page);
    await item(tree, "Getting started 1").first().focus();
    await page.keyboard.press("*");
    await expect(item(tree, "Getting started 1").first()).toHaveAttribute("aria-expanded", "true");
    await expect(item(tree, "Page 1$")).toBeVisible();
    expect(await rendered(tree).count()).toBeLessThan(80);
    // Scrolled far away, the focused row is still on the page, so Tab comes back to it.
    // The panel stays where it was scrolled to while rows and spacers swap (it once jumped back).
    const to = await tree.evaluate((el) => {
      el.parentElement!.scrollTop = 4000;
      return el.parentElement!.scrollTop;
    });
    await page.waitForTimeout(200);
    expect(await tree.evaluate((el) => el.parentElement!.scrollTop)).toBe(to);
    await expect(item(tree, "Getting started 1").first()).toHaveAttribute("tabindex", "0");
    await expect(item(tree, "Getting started 1").first()).toBeFocused();
  });

  test("a keyboard Move's spot far from the moving row scrolls into view", async ({ page }) => {
    // The moving row keeps focus and stays rendered as the panel scrolls away from it, and the
    // panel goes to the spot, not back to the moving row.
    const tree = largeTree(page);
    const blog = item(tree, "Blog");
    await blog.focus();
    await page.keyboard.press("Alt+m");
    await expect(blog).toHaveAttribute("data-moving", "");
    await page.keyboard.press("End");
    const mark = tree.locator("[data-drop]");
    await expect(mark).toBeInViewport();
    await expect.poll(() => tree.evaluate((el) => el.parentElement!.scrollTop)).toBeGreaterThan(10000);
    await expect(blog).toBeFocused();
    await page.keyboard.press("Home");
    await expect(mark).toBeInViewport();
    await page.keyboard.press("Escape");
  });

  test("an open grows its rows in, and a close keeps them until they've shrunk away", async ({ page }) => {
    const tree = largeTree(page);
    const folder = item(tree, "Getting started 1").first();
    await folder.focus();
    // Rows the page loaded with, or that scrolling brings on, don't grow in.
    await expect(tree.locator("[data-entering]")).toHaveCount(0);
    await page.keyboard.press("ArrowRight");
    await expect(tree.locator("[data-entering]")).toHaveCount(10);
    await expect.poll(() => item(tree, "Page 1$").evaluate((el) => +getComputedStyle(el).opacity)).toBe(1);
    // Just closed: the children are hidden but still on the page, shrinking away, then gone. The
    // shrink is quick, so the tree counts them itself rather than a poll that can miss it.
    await tree.evaluate((el) => {
      const counts: number[] = [];
      (el as HTMLElement & { hiddenCounts?: number[] }).hiddenCounts = counts;
      const count = () => counts.push(el.querySelectorAll(":scope > [hidden]").length);
      new MutationObserver(count).observe(el, { childList: true, attributes: true, attributeFilter: ["hidden"], subtree: true });
    });
    await page.keyboard.press("ArrowLeft");
    const hiddenCounts = () => tree.evaluate((el) => (el as HTMLElement & { hiddenCounts?: number[] }).hiddenCounts!);
    await expect
      .poll(async () => {
        const counts = await hiddenCounts();
        return { most: Math.max(0, ...counts), now: counts.at(-1) };
      })
      .toEqual({ most: 10, now: 0 });
    await expect(item(tree, "Page 1$")).toHaveCount(0);
    await expect(folder).toBeFocused();
  });
});

test.describe('Tree with chevron="icon"', () => {
  test.beforeEach(({ page }) => open(page, "/tree"));
  const compact = (page: Page) => page.getByRole("tree", { name: "Handbook pages" });
  const chevronOpacity = (row: Locator) => row.evaluate((el) => +getComputedStyle(el, "::before").opacity);
  const iconOpacity = (row: Locator) => row.evaluate((el) => +getComputedStyle(el.querySelector("svg")!).opacity);

  test("an item with children shows its chevron in the icon's place on hover and keyboard focus", async ({ page }) => {
    const tree = compact(page);
    const policies = item(tree, "Policies");
    const logo = item(tree, "Logo files");
    // No chevron column: a child's icon sits one indent in from its parent's.
    const handbookIcon = await item(tree, "Handbook").locator("svg").boundingBox();
    const logoIcon = await logo.locator("svg").boundingBox();
    expect(Math.round(logoIcon!.x - handbookIcon!.x)).toBe(24);
    await expect.poll(() => chevronOpacity(policies)).toBe(0);
    await policies.hover();
    await expect.poll(() => chevronOpacity(policies)).toBe(1);
    await expect.poll(() => iconOpacity(policies)).toBe(0);
    // A leaf never shows one.
    await logo.hover();
    expect(await logo.evaluate((el) => getComputedStyle(el, "::before").display)).toBe("none");
    await expect.poll(() => iconOpacity(logo)).toBe(1);
    await expect.poll(() => chevronOpacity(policies)).toBe(0);
    await logo.focus();
    await page.keyboard.press("ArrowDown");
    await expect(policies).toBeFocused();
    await page.mouse.move(0, 0);
    await expect.poll(() => chevronOpacity(policies)).toBe(1);
  });

  test("a click on the icon opens and closes; a click on the label selects", async ({ page }) => {
    const tree = compact(page);
    const policies = item(tree, "Policies");
    // The chevron is the row's ::before, over the icon, so the click lands on the row there.
    const row = (await policies.boundingBox())!;
    const icon = (await policies.locator("svg").boundingBox())!;
    await policies.click({ position: { x: icon.x - row.x + icon.width / 2, y: row.height / 2 } });
    await expect(policies).toHaveAttribute("aria-expanded", "true");
    await expect(policies).not.toHaveAttribute("aria-selected", "true");
    await policies.locator("beautiful-tree-label").click();
    await expect(policies).toHaveAttribute("aria-selected", "true");
    await expect(policies).toHaveAttribute("aria-expanded", "true");
  });

  test("on a touchscreen, the tree keeps the chevron's column", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["Pixel 7"] });
    const page = await context.newPage();
    try {
      await open(page, "/tree");
      const policies = item(compact(page), "Policies");
      await expect(policies).toBeAttached();
      expect(await policies.evaluate((el) => getComputedStyle(el, "::before").position)).toBe("static");
      expect(await chevronOpacity(policies)).toBe(1);
      expect(await iconOpacity(policies)).toBe(1);
    } finally {
      await context.close();
    }
  });
});

// Drag and drop and the keyboard Move, on the site's pages example.
// Rows are 32px: the top quarter of a row drops before it, the bottom quarter after, the middle inside.
test.describe("Tree moving", () => {
  test.beforeEach(({ page }) => open(page, "/tree"));

  /** Presses on a row and drags to a point on another, at a fraction of its height, without letting go. */
  async function dragTo(page: Page, from: Locator, to: Locator, at: number) {
    await from.evaluate((el) => el.parentElement!.scrollIntoView({ block: "center" }));
    const start = (await from.boundingBox())!;
    const end = (await to.boundingBox())!;
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2 + 6, { steps: 2 });
    await page.mouse.move(end.x + end.width / 2, end.y + end.height * at, { steps: 4 });
    // Chromium sends dragover for a move only once the drag has begun: one more move gets it there.
    await page.mouse.move(end.x + end.width / 2 + 2, end.y + end.height * at);
  }

  test("dragging onto the middle of a row puts the item inside it, and opens it", async ({ page }) => {
    const tree = pagesTree(page);
    await dragTo(page, item(tree, "Contact"), item(tree, "Pricing"), 0.5);
    await expect(item(tree, "Pricing")).toHaveAttribute("data-drop", "inside");
    await expect(item(tree, "Contact")).toHaveAttribute("data-moving", "");
    await page.mouse.up();
    await expect(status(page)).toHaveText("Moved Contact inside Pricing");
    await expect(item(tree, "Pricing")).toHaveAttribute("aria-expanded", "true");
    await expect(item(tree, "Contact")).toHaveAttribute("aria-level", "2");
    await expect(tree.locator("[data-drop], [data-moving]")).toHaveCount(0);
    expect(await shown(tree)).toEqual(["Home", "About", "Team", "Careers", "*Pricing", "Contact", "Blog", "Not found"]);
  });

  test("the top and bottom quarters drop before and after, with a line at the row's depth", async ({ page }) => {
    const tree = pagesTree(page);
    await dragTo(page, item(tree, "Not found"), item(tree, "Team"), 0.1);
    const team = item(tree, "Team");
    await expect(team).toHaveAttribute("data-drop", "before");
    // The line starts at Team's depth, one indent in from About's row.
    const line = await team.evaluate((el) => {
      const after = getComputedStyle(el, "::after");
      return { content: after.content, left: parseFloat(after.left), height: after.height };
    });
    expect(line.content).not.toBe("none");
    expect(line.height).toBe("2px");
    expect(line.left).toBeGreaterThan(20);
    await page.mouse.up();
    await expect(status(page)).toHaveText("Moved Not found before Team");
    expect(await shown(tree)).toEqual(["Home", "About", "Not found", "Team", "Careers", "*Pricing", "Blog", "Contact"]);

    await dragTo(page, item(tree, "Home"), item(tree, "Contact"), 0.5);
    // Home can't move (the example's canMove): nothing marks a drop.
    await expect(tree.locator("[data-drop]")).toHaveCount(0);
    await page.mouse.up();
    await dragTo(page, item(tree, "Pricing"), item(tree, "Contact"), 0.9);
    await expect(item(tree, "Contact")).toHaveAttribute("data-drop", "after");
    await page.mouse.up();
    expect(await shown(tree)).toEqual(["Home", "About", "Not found", "Team", "Careers", "Blog", "Contact", "*Pricing"]);
  });

  test("below the last of a set of siblings, the pointer's indent picks the level", async ({ page }) => {
    const tree = pagesTree(page);
    const careers = item(tree, "Careers");
    // Bottom quarter of Careers, over its own icon: after Careers, in About.
    const icon = (await careers.locator("svg").first().boundingBox())!;
    await dragTo(page, item(tree, "Contact"), careers, 0.9);
    const box = (await careers.boundingBox())!;
    await page.mouse.move(icon.x + icon.width / 2, box.y + box.height * 0.9, { steps: 2 });
    await page.mouse.move(icon.x + icon.width / 2 + 1, box.y + box.height * 0.9);
    await expect(careers).toHaveAttribute("data-drop", "after");
    // Out in About's indent: after About, at the top level. The line shows under Careers, at About's depth.
    await page.mouse.move(box.x + 8, box.y + box.height * 0.9, { steps: 2 });
    await page.mouse.move(box.x + 9, box.y + box.height * 0.9);
    await expect(careers).toHaveAttribute("data-drop", "after");
    await expect(careers).toHaveAttribute("style", /--tree-drop-level: 1/);
    await page.mouse.up();
    await expect(status(page)).toHaveText("Moved Contact after About");
    expect(await shown(tree)).toEqual(["Home", "About", "Team", "Careers", "Contact", "*Pricing", "Blog", "Not found"]);
  });

  test("the dragged item doesn't count as a sibling: below Team, out in the indent, Careers goes after About", async ({ page }) => {
    const tree = pagesTree(page);
    const team = item(tree, "Team");
    await dragTo(page, item(tree, "Careers"), team, 0.9);
    const box = (await team.boundingBox())!;
    await page.mouse.move(box.x + 8, box.y + box.height * 0.9, { steps: 2 });
    await page.mouse.move(box.x + 9, box.y + box.height * 0.9);
    // After an open item lands past its children: the line shows under the last, Careers itself, at About's depth.
    await expect(item(tree, "Careers")).toHaveAttribute("data-drop", "after");
    await expect(item(tree, "Careers")).toHaveAttribute("style", /--tree-drop-level: 1/);
    await page.mouse.up();
    expect(await shown(tree)).toEqual(["Home", "About", "Team", "Careers", "*Pricing", "Blog", "Contact", "Not found"]);
    await expect(item(tree, "Careers")).toHaveAttribute("aria-level", "1");
  });

  test("an item can't go inside itself or its own children", async ({ page }) => {
    const tree = pagesTree(page);
    await dragTo(page, item(tree, "About"), item(tree, "Team"), 0.5);
    await expect(tree.locator("[data-drop]")).toHaveCount(0);
    await page.mouse.up();
    await expect(status(page)).toHaveText("Showing /pricing/");
  });

  test("resting on a closed item opens it, so its children can be reached", async ({ page }) => {
    const tree = pagesTree(page);
    await dragTo(page, item(tree, "Contact"), item(tree, "Blog"), 0.5);
    await expect(item(tree, "Blog")).toHaveAttribute("aria-expanded", "false");
    await expect(item(tree, "Blog")).toHaveAttribute("aria-expanded", "true", { timeout: 2000 });
    await expect(item(tree, "Spring launch notes")).toBeVisible();
    // Once it has grown in, so the pointer lands where it's aimed.
    await expect.poll(async () => (await item(tree, "Spring launch notes").boundingBox())?.height).toBe(32);
    const spring = (await item(tree, "Spring launch notes").boundingBox())!;
    await page.mouse.move(spring.x + spring.width / 2, spring.y + spring.height * 0.1, { steps: 3 });
    await page.mouse.move(spring.x + spring.width / 2 + 2, spring.y + spring.height * 0.1);
    await expect(item(tree, "Spring launch notes")).toHaveAttribute("data-drop", "before");
    await page.mouse.up();
    await expect(status(page)).toHaveText("Moved Contact before Spring launch notes");
    await expect(item(tree, "Contact")).toHaveAttribute("aria-level", "2");
  });

  test("Move is in every row's menu, on Alt+M", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("Shift+F10");
    const move = page.getByRole("menuitem", { name: /^Move/ });
    await expect(move).toBeVisible();
    await expect(move).toHaveAttribute("aria-keyshortcuts", "Alt+M");
    await clickInPopover(move);
    await expect(item(tree, "Contact")).toBeFocused();
    await expect(item(tree, "Contact")).toHaveAttribute("data-moving", "");
    await expect(moveNews(page)).toHaveText(/^Moving Contact\. Pick a spot with the arrow keys/);
  });

  test("the keyboard Move picks a spot with the arrows, says each, and Enter moves it there", async ({ page }) => {
    const tree = pagesTree(page);
    const contact = item(tree, "Contact");
    await contact.focus();
    await page.keyboard.press("Alt+m");
    await expect(contact).toHaveAttribute("data-moving", "");
    await page.keyboard.press("ArrowUp");
    await expect(moveNews(page)).toHaveText("Inside Blog");
    await expect(item(tree, "Blog")).toHaveAttribute("data-drop", "inside");
    await page.keyboard.press("ArrowUp");
    await expect(moveNews(page)).toHaveText("Before Blog, at the top level");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(moveNews(page)).toHaveText("After Careers, in About");
    await expect(item(tree, "Careers")).toHaveAttribute("data-drop", "after");
    // The keys only pick: focus, the selection and the menu keys stay put.
    await expect(contact).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(moveNews(page)).toHaveText("Moved Contact after Careers, in About.");
    await expect(status(page)).toHaveText("Moved Contact after Careers");
    expect(await shown(tree)).toEqual(["Home", "About", "Team", "Careers", "Contact", "*Pricing", "Blog", "Not found"]);
    await expect(contact).toBeFocused();
    await expect(tree.locator("[data-drop], [data-moving]")).toHaveCount(0);
    // The arrows move focus again.
    await page.keyboard.press("ArrowDown");
    await expect(item(tree, "Pricing")).toBeFocused();
  });

  test("→ opens a closed item the spot is inside, and Escape cancels", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("Alt+m");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowRight");
    await expect(item(tree, "Blog")).toHaveAttribute("aria-expanded", "true");
    await expect(moveNews(page)).toHaveText("Opened Blog. Before Spring launch notes, in Blog");
    await expect(item(tree, "Spring launch notes")).toHaveAttribute("data-drop", "before");
    await page.keyboard.press("ArrowDown");
    await expect(moveNews(page)).toHaveText("Inside Spring launch notes");
    // Delete, an action's key, doesn't run while moving.
    await page.keyboard.press("Delete");
    await expect(item(tree, "Contact")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(moveNews(page)).toHaveText("Didn't move Contact.");
    await expect(tree.locator("[data-drop], [data-moving]")).toHaveCount(0);
    await expect(item(tree, "Contact")).toHaveAttribute("aria-level", "1");
    await expect(status(page)).toHaveText("Showing /pricing/");
  });

  test("a click anywhere leaves a keyboard move's item where it was", async ({ page }) => {
    const tree = pagesTree(page);
    await item(tree, "Contact").focus();
    await page.keyboard.press("Alt+m");
    await page.keyboard.press("ArrowUp");
    await expect(item(tree, "Blog")).toHaveAttribute("data-drop", "inside");
    await page.locator(".lede").click();
    await expect(tree.locator("[data-drop], [data-moving]")).toHaveCount(0);
    await expect(moveNews(page)).toHaveText("Didn't move Contact.");
  });

    test("a drag near the panel's edge scrolls it, and the dragged row stays rendered", async ({ page }) => {
    const tree = page.getByRole("tree", { name: "Every page" });
    const blog = item(tree, "Blog");
    await blog.scrollIntoViewIfNeeded();
    const panel = await tree.evaluate((el) => {
      const box = el.parentElement!.getBoundingClientRect();
      return { x: box.x + box.width / 2, bottom: box.bottom };
    });
    const start = (await item(tree, "Getting started 1").first().boundingBox())!;
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2 + 6, { steps: 2 });
    await page.mouse.move(panel.x, panel.bottom - 4, { steps: 6 });
    await expect.poll(() => tree.evaluate((el) => el.parentElement!.scrollTop), { timeout: 3000 }).toBeGreaterThan(300);
    await expect(item(tree, "Getting started 1").first()).toHaveAttribute("data-moving", "");
    await page.mouse.up();
  });
});
