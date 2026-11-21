import { expect, type Page, test } from "@playwright/test";
import { open } from "./settings.ts";

// The docs site's own chrome: the kit's Sidebar layout, with the page list in its Sidebar and the
// site's name and search at the top of it. The page scrolls, and the Sidebar stays put. On a narrow
// screen the Sidebar is in a drawer.

function sidebar(page: Page) {
  return page.locator("beautiful-site > beautiful-sidebar-layout > nav[data-sidebar]");
}

function search(page: Page) {
  return sidebar(page).getByRole("combobox", { name: "Search pages" });
}

function drawer(page: Page) {
  return page.getByRole("dialog", { name: "Navigation" });
}

test.describe("docs shell", () => {
  test("the Sidebar stays put as the page scrolls, and scrolls on its own", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await open(page, "/table");
    const nav = page.getByRole("navigation", { name: "Pages" });
    await expect(nav.getByRole("link", { name: "Table" })).toHaveAttribute("aria-current", "page");

    await page.mouse.move(800, 400);
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    const side = await sidebar(page).boundingBox();
    expect(side?.y).toBe(0);
    expect(side?.height).toBe(720);
    await expect(search(page)).toBeInViewport();

    // The list is longer than the screen, so its body scrolls, and it starts on the current page.
    const body = sidebar(page).locator("beautiful-sidebar-body");
    expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await expect(nav.getByRole("link", { name: "Table" })).toBeInViewport();
  });

  test("following a link marks the new page current", async ({ page }) => {
    await open(page, "/table");
    await page.getByRole("navigation", { name: "Pages" }).getByRole("link", { name: "Badge" }).click();
    await expect(page.locator("main > article > h1")).toHaveText("Badge");
    await expect(page.getByRole("navigation", { name: "Pages" }).getByRole("link", { name: "Badge" })).toHaveAttribute("aria-current", "page");
  });

  test("the Sidebar groups the pages under section headings", async ({ page }) => {
    await open(page, "/table");
    const nav = page.getByRole("navigation", { name: "Pages" });
    await expect(nav.getByRole("group", { name: "Forms" }).getByRole("link", { name: "Checkbox" })).toBeVisible();
    await expect(nav.getByRole("group", { name: "Data display" }).getByRole("link", { name: "Table" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("group", { name: "Guides" }).getByRole("link", { name: "Websites" })).toBeVisible();
  });

  test("the search is a search box: a magnifying glass, no chevrons, fully rounded", async ({ page }) => {
    await open(page, "/table");
    const group = sidebar(page).locator("beautiful-input-group[data-search]");
    await expect(group.locator(":scope > svg")).toHaveCount(1);
    await expect(group.locator(":scope > button")).toHaveCount(0);
    await expect(search(page)).toHaveAttribute("type", "search");
    expect(await search(page).evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(100);
  });

  test("on a phone the menu button opens the Sidebar in a drawer, which closes on a followed link", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/table");
    await expect(sidebar(page)).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(drawer(page)).toBeVisible();
    await drawer(page).getByRole("link", { name: "Badge" }).click();
    await expect(page.locator("main > article > h1")).toHaveText("Badge");
    await expect(drawer(page)).toBeHidden();
  });

  test("/ puts focus in the search, and picking a page goes there", async ({ page }) => {
    await open(page, "/table");
    await expect(search(page)).toHaveAttribute("aria-keyshortcuts", "/");
    await page.locator("main").click({ position: { x: 4, y: 4 } });
    await page.keyboard.press("/");
    await expect(search(page)).toBeFocused();
    await page.keyboard.type("swit");
    await expect(page.getByRole("option", { name: /^Switch/ }).first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main > article > h1")).toHaveText("Switch");
    await expect(page).toHaveURL(/\/switch$/);
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).not.toBeFocused();
  });

  test("on a phone, / opens the drawer with focus in its search, and a pick closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/table");
    await page.keyboard.press("/");
    await expect(drawer(page)).toBeVisible();
    const inDrawer = drawer(page).getByRole("combobox", { name: "Search pages" });
    await expect(inDrawer).toBeFocused();
    await page.keyboard.type("badg");
    await page.keyboard.press("Enter");
    await expect(page.locator("main > article > h1")).toHaveText("Badge");
    await expect(drawer(page)).toBeHidden();
  });

  test("picking the page you're on adds no history entry", async ({ page }) => {
    await open(page, "/table");
    const before = await page.evaluate(() => history.length);
    await search(page).fill("Table");
    await page.keyboard.press("Enter");
    await expect(page.locator("main > article > h1")).toHaveText("Table");
    expect(await page.evaluate(() => history.length)).toBe(before);
  });
});
