import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// APG's Table pattern has no keys: a table is read, not operated. These check the semantics a
// screen reader reads, Tab over the links and sort buttons inside, what the Solid component adds
// (a whole row that follows its link, sorting, a pane that takes focus when it scrolls), and the
// look the spec sets. The Sortable Table example is APG's source for aria-sort and its button.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

/** The harness's own example blocks, and the live ones after them. */
const block = (page: Page, name: string) => page.locator(`[data-example="${name}"]`);

async function harness(page: Page, theme = "classic", mode = "light") {
  await page.goto(`/tests/harness/table.html?theme=${theme}&mode=${mode}`);
  await page.locator("[data-example]").first().waitFor();
}

test.describe("Table semantics and keyboard", () => {
  test.beforeEach(({ page }) => open(page, "/table"));

  test("each table is named, by its label or its caption", async ({ page }) => {
    for (const [title, name] of [
      ["Sites", "Sites"],
      ["Dense and striped", "Top pages, last 30 days"],
      ["Rows as links", "Deploys"],
      ["Sortable columns", "Domains"],
      ["Grid", "Compare plans"],
      ["Empty", "Form submissions"],
      ["On glass", "Spring launch, this week"],
    ] as const) {
      await expect(preview(page, title).getByRole("table", { name, exact: true })).toBeVisible();
    }
  });

  test("a cell is read with its column's header, and a row's header with its row", async ({ page }) => {
    const sites = preview(page, "Sites").getByRole("table");
    await expect(sites.getByRole("columnheader")).toHaveText(["Site", "Domain", "Status", "Visits this week"]);
    await expect(sites.getByRole("row")).toHaveCount(5);
    const plans = preview(page, "Grid").getByRole("table");
    await expect(plans.getByRole("rowheader")).toHaveText(["Sites", "Custom domains", "Form submissions a month", "Scheduled releases", "Price"]);
    await expect(plans.getByRole("columnheader")).toHaveText(["Starter", "Pro", "Team"]);
  });

  test("Tab passes over a table with nothing to operate", async ({ page }) => {
    // Back from the example's own Code toggle, focus passes over the table to what is before it.
    const example = section(page, "Dense and striped");
    await example.locator("summary").first().focus();
    await page.keyboard.press("Shift+Tab");
    await expect(example.locator(":focus")).toHaveCount(0);
    await expect(page.locator("body")).not.toBeFocused();
  });

  test("Tab moves from row link to row link, and Enter follows one", async ({ page }) => {
    const deploys = preview(page, "Rows as links");
    await section(page, "Dense and striped").locator("summary").last().focus();
    for (const name of ["New pricing page", "Fix footer links", "Spring launch"]) {
      await page.keyboard.press("Tab");
      await expect(deploys.getByRole("link", { name })).toBeFocused();
    }
    await deploys.getByRole("link", { name: "Fix footer links" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#deploy-141$/);
  });

  test("a sortable column's header holds a button, and the sorted one carries aria-sort", async ({ page }) => {
    const domains = preview(page, "Sortable columns").getByRole("table");
    await expect(domains.getByRole("columnheader", { name: "Visits" })).toHaveAttribute("aria-sort", "descending");
    for (const name of ["Domain", "Site", "Added"]) {
      await expect(domains.getByRole("columnheader", { name })).not.toHaveAttribute("aria-sort");
    }
    await domains.getByRole("button", { name: "Domain" }).focus();
    for (const name of ["Site", "Visits", "Added"]) {
      await page.keyboard.press("Tab");
      await expect(domains.getByRole("button", { name })).toBeFocused();
    }
  });
});

test.describe("Table look", () => {
  test.beforeEach(({ page }) => open(page, "/table", "classic", "light"));

  test("rows are 44px, and dense rows are a menu item's 32px", async ({ page }) => {
    const row = (title: string) => preview(page, title).locator("tbody tr").first();
    expect((await row("Sites").boundingBox())!.height).toBeCloseTo(44, 0);
    expect((await row("Dense and striped").boundingBox())!.height).toBeCloseTo(32, 0);
  });

  test("a dense row is a finger's 44px on a touch screen", async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } });
    const page = await context.newPage();
    await open(page, "/table", "classic", "light");
    expect((await preview(page, "Dense and striped").locator("tbody tr").first().boundingBox())!.height).toBeCloseTo(44, 0);
    await context.close();
  });

  test("numbers line up: figures of one width, and end-aligned columns", async ({ page }) => {
    const table = preview(page, "Dense and striped").locator("table");
    await expect(table).toHaveCSS("font-variant-numeric", "tabular-nums");
    await expect(table.locator("th", { hasText: "Views" })).toHaveCSS("text-align", "end");
    await expect(table.locator("td").nth(1)).toHaveCSS("text-align", "end");
  });

  test("striped tints every other row, and grid draws lines between columns", async ({ page }) => {
    const rows = preview(page, "Dense and striped").locator("tbody tr");
    await expect(rows.nth(0)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(rows.nth(1)).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const cells = preview(page, "Grid").locator("tbody tr").first().locator("th, td");
    await expect(cells.nth(0)).toHaveCSS("border-left-width", "0px");
    await expect(cells.nth(1)).toHaveCSS("border-left-width", "1px");
  });

  test("a Button in a header cell keeps its own look; only a sort button drops it", async ({ page }) => {
    const sort = preview(page, "Sortable columns").getByRole("button", { name: "Domain" });
    await expect(sort).toHaveCSS("padding-top", "0px");
    await page.evaluate(() => {
      const th = document.querySelector("beautiful-example-preview thead th")!;
      th.insertAdjacentHTML("beforeend", "<button type=\"button\" id=\"plain-button\">Add</button>");
    });
    const button = page.locator("#plain-button");
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(36);
  });

  test("a dense table's look stays out of a table inside one of its cells", async ({ page }) => {
    await page.evaluate(() => {
      const cell = document.querySelector("beautiful-example-preview beautiful-table[data-dense] tbody td")!;
      cell.insertAdjacentHTML("beforeend", "<table id=\"inner\"><tbody><tr><td>Inner</td></tr></tbody></table>");
    });
    await expect(page.locator("#inner td")).not.toHaveCSS("padding-left", "12px");
  });

  test("the sorted column's header is in the text color, the others muted", async ({ page }) => {
    const header = preview(page, "Sortable columns").locator("thead");
    const color = (name: string) => header.getByRole("button", { name }).evaluate((el) => getComputedStyle(el).color);
    expect(await color("Visits")).not.toBe(await color("Domain"));
    expect(await color("Visits")).toBe(await page.evaluate(() => getComputedStyle(document.body).color));
  });

  test("an empty table says so in one cell across every column", async ({ page }) => {
    const cell = preview(page, "Empty").locator("td[data-empty]");
    await expect(cell).toHaveAttribute("colspan", "3");
    await expect(cell).toHaveCSS("text-align", "center");
    expect((await cell.boundingBox())!.height).toBeCloseTo(88, 0);
  });

  test("on a pane by default; in a dialog the rows sit on its surface, lined up with its text", async ({ page }) => {
    await expect(preview(page, "Sites").locator("beautiful-table")).toHaveCSS("border-top-width", "1px");
    await preview(page, "In a dialog").getByRole("button", { name: "DNS records" }).click();
    const dialog = page.locator("#dns-records");
    await settle(dialog);
    const pane = dialog.locator("beautiful-table");
    await expect(pane).toHaveCSS("border-top-width", "0px");
    await expect(pane).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const body = dialog.locator("beautiful-dialog-body");
    expect(await body.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    const textLeft = (await dialog.locator("#dns-records-title").boundingBox())!.x;
    expect((await dialog.getByRole("cell", { name: "A", exact: true }).boundingBox())!.x).toBeCloseTo(textLeft, 0);
  });

  test("in a Card the rows sit on the card, as in a dialog", async ({ page }) => {
    await page.evaluate(() => {
      const pane = document.querySelector("beautiful-example-preview beautiful-table")!;
      const card = document.createElement("beautiful-card");
      pane.replaceWith(card);
      card.append(pane);
    });
    const pane = page.locator("beautiful-card > beautiful-table");
    await expect(pane).toHaveCSS("border-top-width", "0px");
    await expect(pane).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("a wide table scrolls inside its pane, and the page doesn't", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const pane = preview(page, "Dense and striped").locator("beautiful-table");
    const { scroll, client } = await pane.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(scroll).toBeGreaterThan(client);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });

  test("a DatePicker's calendar keeps its own look", async ({ page }) => {
    await page.goto("/input");
    await page.locator("main > article > h1").waitFor();
    const day = page.locator("[data-date-picker] td").first();
    await day.waitFor({ state: "attached" });
    expect(await day.evaluate((el) => [getComputedStyle(el).borderBottomWidth, getComputedStyle(el).paddingLeft])).toEqual(["0px", "0px"]);
  });
});

test.describe("Table axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/table", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/table", theme, mode);
        await page.getByRole("button", { name: "DNS records" }).click();
        await settle(page.locator("#dns-records"));
        const results = await new AxeBuilder({ page }).include("#dns-records").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await harness(page, theme, mode);
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Table component", () => {
  test("a click anywhere in a linked row follows its link", async ({ page }) => {
    await harness(page);
    await block(page, "links").getByRole("cell", { name: "Dana" }).click();
    await expect(page).toHaveURL(/#deploy-142$/);
    await block(page, "links").getByRole("cell", { name: "Yesterday" }).click();
    await expect(page).toHaveURL(/#deploy-140$/);
  });

  test("a Ctrl click or a middle click in a linked row opens the link in a new tab", async ({ page, context }) => {
    await harness(page);
    for (const click of [{ modifiers: ["ControlOrMeta" as const] }, { button: "middle" as const }]) {
      const opened = context.waitForEvent("page");
      await block(page, "links").getByRole("cell", { name: "Claude" }).click(click);
      const tab = await opened;
      expect(tab.url()).toMatch(/#deploy-141$/);
      await tab.close();
    }
    await expect(page).not.toHaveURL(/#deploy/);
  });

  test("selecting text in a linked row doesn't follow the link", async ({ page }) => {
    await harness(page);
    const cell = block(page, "links").getByRole("cell", { name: "10 minutes ago" });
    await cell.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      getSelection()!.removeAllRanges();
      getSelection()!.addRange(range);
    });
    await cell.dispatchEvent("click");
    await expect(page).not.toHaveURL(/#deploy/);
  });

  test("a click in a linked row follows its link while the table scrolls sideways too", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await harness(page);
    await expect(block(page, "links").locator("beautiful-table")).toHaveAttribute("tabindex", "0");
    await block(page, "links").getByRole("cell", { name: "Dana" }).click();
    await expect(page).toHaveURL(/#deploy-142$/);
  });

  test("a right click in a linked row, with or without Shift, follows nothing", async ({ page, context }) => {
    await harness(page);
    let opened = false;
    context.on("page", () => (opened = true));
    const cell = block(page, "links").getByRole("cell", { name: "Claude" });
    await cell.click({ button: "right" });
    await cell.click({ button: "right", modifiers: ["Shift"] });
    await page.keyboard.press("Escape");
    expect(opened).toBe(false);
    await expect(page).not.toHaveURL(/#deploy/);
  });

  test("a row that gets its href later follows it", async ({ page }) => {
    await harness(page);
    const live = block(page, "live-late");
    await live.getByRole("button", { name: "Load links" }).click();
    await live.getByRole("cell", { name: "Dana" }).click();
    await expect(page).toHaveURL(/#deploy-142$/);
  });

  test("a row's own onClick can stop it following its link", async ({ page }) => {
    await harness(page);
    await block(page, "live-late").getByRole("cell", { name: "Prevented" }).click();
    await page.waitForTimeout(100);
    await expect(page).not.toHaveURL(/#deploy/);
  });

  test("a row that takes focus itself still follows its link", async ({ page }) => {
    await harness(page);
    await block(page, "live-late").getByRole("cell", { name: "Focusable row" }).click();
    await expect(page).toHaveURL(/#deploy-140$/);
  });

  test("text selected outside the row doesn't stop it following its link", async ({ page }) => {
    await harness(page);
    await block(page, "live-late").getByLabel("Elsewhere").selectText();
    await block(page, "links").getByRole("cell", { name: "Dana" }).click();
    await expect(page).toHaveURL(/#deploy-142$/);
  });

  test("the first cell's content is drawn once, linked from the first render", async ({ page }) => {
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { linked: string[] }).linked = seen;
      new MutationObserver((records) => {
        for (const record of records) {
          const cell = record.target instanceof Element ? record.target.closest("td") : null;
          if (cell?.closest("tr")?.querySelector("a[data-row-link]")) for (const node of record.removedNodes) seen.push(node.textContent ?? "");
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await harness(page);
    await expect(block(page, "links").getByRole("link", { name: "New pricing page" })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { linked: string[] }).linked)).toEqual([]);
  });

  test("a first cell drawn again takes the link again", async ({ page }) => {
    await harness(page);
    const live = block(page, "live-late");
    await live.getByRole("button", { name: "Load links" }).click();
    await expect(live.getByRole("link", { name: "New pricing page" })).toBeVisible();
    await live.getByRole("button", { name: "Rename" }).click();
    await expect(live.getByRole("link", { name: "Pricing, take two" })).toBeVisible();
  });

  test("a click on a control in a linked row is the control's", async ({ page }) => {
    await harness(page);
    const live = block(page, "live-links");
    await live.getByRole("button", { name: "Roll back" }).click();
    await expect(live.getByRole("status")).toHaveText("Rolled back");
    await expect(page).not.toHaveURL(/#deploy/);
  });

  test("a sort button sorts by its column, ascending first, then the other way, and keeps focus", async ({ page }) => {
    await harness(page);
    const table = block(page, "sortable").getByRole("table");
    const domains = () => table.locator("tbody tr td:first-child").allInnerTexts();
    const domain = table.getByRole("columnheader", { name: "Domain" });
    await table.getByRole("button", { name: "Domain" }).focus();
    await page.keyboard.press("Enter");
    await expect(domain).toHaveAttribute("aria-sort", "ascending");
    await expect(table.getByRole("columnheader", { name: "Visits" })).not.toHaveAttribute("aria-sort");
    expect(await domains()).toEqual(["careers.acme.com", "docs.acme.com", "springlaunch.com", "www.springlaunch.com"]);
    await page.keyboard.press("Space");
    await expect(domain).toHaveAttribute("aria-sort", "descending");
    expect(await domains()).toEqual(["www.springlaunch.com", "springlaunch.com", "docs.acme.com", "careers.acme.com"]);
    await expect(table.getByRole("button", { name: "Domain" })).toBeFocused();
  });

  test("a pane that scrolls sideways takes focus, and the arrow keys scroll it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await harness(page);
    const pane = block(page, "dense").locator("beautiful-table");
    await expect(pane).toHaveAttribute("tabindex", "0");
    await expect(block(page, "dense").getByRole("region", { name: "Top pages, last 30 days" })).toBeVisible();
    await pane.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => pane.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    // Wide enough again, it keeps focus while it has it, then takes no more.
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(pane).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(pane).not.toHaveAttribute("tabindex");
    await expect(pane).not.toHaveAttribute("role");
  });
});
