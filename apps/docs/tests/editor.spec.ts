import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { clickInPopover } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// The Editor: a textbox (role="textbox", aria-multiline) with ProseMirror inside, a selection
// toolbar and a fixed one (APG Toolbar), a slash menu (a listbox the text box points into with
// aria-activedescendant, as Combobox's) and Context menu's right-click menu. The harness has one
// editor per preset with its handle on window; the docs page has the live examples.

const harness = (page: Page, query = "") => page.goto(`/tests/harness/editor.html${query}`);
const text = (page: Page, name: string) => page.locator(`beautiful-example[data-example="${name}"] beautiful-editor-content`);
const saved = (page: Page, name: string) => page.locator(`#${name}-saved`);

/** Waits for ProseMirror to have read the browser's selection, which it does on selectionchange. */
const settle = (page: Page) => page.waitForTimeout(60);

/** Puts the cursor at the end of the editor's text. */
async function toEnd(page: Page, name: string) {
  await page.waitForFunction((name) => !!window.editors?.[name]?.view, name);
  await page.evaluate((name) => {
    const editor = window.editors[name]!;
    editor.focus();
    const view = editor.view!;
    // The selection's class, as the page has its own copy of ProseMirror: Selection.atEnd is on it.
    const Selection = Object.getPrototypeOf(view.state.selection).constructor;
    view.dispatch(view.state.tr.setSelection(Selection.atEnd(view.state.doc)));
  }, name);
  await settle(page);
}

/** Selects the words in the editor's text. */
async function select(page: Page, name: string, words: string) {
  await page.evaluate(
    ([name, words]) => {
      const view = window.editors[name!]!.view!;
      let from = -1;
      view.state.doc.descendants((node, pos) => {
        if (from < 0 && node.isText && node.text!.includes(words!)) from = pos + node.text!.indexOf(words!);
      });
      if (from < 0) throw new Error(`No "${words}" in the ${name} editor.`);
      view.focus();
      const Text = Object.getPrototypeOf(view.state.selection).constructor;
      view.dispatch(view.state.tr.setSelection(Text.create(view.state.doc, from, from + words!.length)));
    },
    [name, words],
  );
  await settle(page);
}

const bubble = (page: Page, name: string) => page.locator(`beautiful-example[data-example="${name}"] beautiful-editor-bubble`);
const slash = (page: Page, name: string) => page.locator(`beautiful-example[data-example="${name}"] beautiful-popover[data-slash]`);
const menu = (page: Page) => page.locator('[role="menu"]:popover-open').first();
const value = (page: Page, name: string) => page.evaluate((name) => window.editors[name]!.value(), name);

test.describe("Editor text box", () => {
  test.beforeEach(({ page }) => harness(page));

  test("is a named text box, multiline but for one line", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "Headline" })).toHaveAttribute("contenteditable", "true");
    await expect(page.getByRole("textbox", { name: "Headline" })).not.toHaveAttribute("aria-multiline");
    await expect(page.getByRole("textbox", { name: "Headline" })).toHaveAccessibleDescription("The big line at the top of the home page.");
    await expect(page.getByRole("textbox", { name: "Message" })).toHaveAttribute("aria-multiline", "true");
    await expect(page.getByRole("textbox", { name: "Post" })).toHaveAttribute("aria-multiline", "true");
    await expect(page.getByRole("textbox", { name: "Notes" })).toHaveAttribute("contenteditable", "false");
    await expect(page.getByRole("textbox", { name: "Notes" })).toHaveAttribute("aria-readonly", "true");
  });

  test("a click on the label puts the cursor in the text", async ({ page }) => {
    await page.getByText("Headline", { exact: true }).click();
    await expect(text(page, "inline")).toBeFocused();
  });

  test("one line stays one line: Enter adds none", async ({ page }) => {
    await toEnd(page, "inline");
    await page.keyboard.press("Enter");
    await page.keyboard.type("!");
    // Typed at the end of bold words, it's bold too, as in any editor.
    expect(await value(page, "inline")).toBe("Coffee roasted <strong>this week!</strong>");
  });

  test("leaving the text saves it, in its format", async ({ page }) => {
    await toEnd(page, "inline");
    await page.keyboard.type(", at your door");
    await page.getByText("Message", { exact: true }).click();
    await expect(saved(page, "inline")).toHaveText("Coffee roasted <strong>this week, at your door</strong>");
  });

  test("the keys: bold, undo, and Markdown as it's typed", async ({ page }) => {
    await select(page, "text", "Thanks");
    await page.keyboard.press("ControlOrMeta+b");
    expect(await value(page, "text")).toContain("<strong>Thanks</strong>");
    await page.keyboard.press("ControlOrMeta+z");
    expect(await value(page, "text")).not.toContain("<strong>");

    await toEnd(page, "post");
    await page.keyboard.press("Enter");
    await page.keyboard.type("## Monday\n- Grind\n");
    await settle(page);
    const markdown = String(await value(page, "post"));
    expect(markdown).toContain("### Monday");
    expect(markdown).toContain("* Grind");
  });

  test("Turn into's keys change the line's block", async ({ page }) => {
    await toEnd(page, "post");
    await page.keyboard.press("ControlOrMeta+Alt+1");
    expect(String(await value(page, "post"))).toContain("## Roasted on Friday");
    await page.keyboard.press("ControlOrMeta+Alt+0");
    expect(String(await value(page, "post"))).not.toContain("## Roasted");
  });
});

test.describe("Editor selection toolbar", () => {
  test.beforeEach(({ page }) => harness(page));

  test("shows over selected words, with what's on pressed", async ({ page }) => {
    await expect(bubble(page, "text")).toBeHidden();
    await select(page, "text", "Thanks");
    await expect(bubble(page, "text")).toBeVisible();
    await expect(bubble(page, "text")).toHaveRole("toolbar");
    const bold = bubble(page, "text").getByRole("button", { name: "Bold" });
    await expect(bold).toHaveAttribute("aria-pressed", "false");
    await bold.click();
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(await value(page, "text")).toContain("<strong>Thanks</strong>");
    // The words stay selected, and the cursor is back in the text.
    await expect(text(page, "text")).toBeFocused();
  });

  test("Alt+F10 reaches it, the arrows move along it, Escape goes back to the text", async ({ page }) => {
    await select(page, "text", "Thanks");
    await page.keyboard.press("Alt+F10");
    const buttons = bubble(page, "text").getByRole("button");
    await expect(buttons.first()).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(buttons.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(buttons.last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(text(page, "text")).toBeFocused();
  });

  test("hides at a bare cursor", async ({ page }) => {
    await select(page, "text", "Thanks");
    await expect(bubble(page, "text")).toBeVisible();
    await toEnd(page, "text");
    await expect(bubble(page, "text")).toBeHidden();
  });
});

test.describe("Editor fixed toolbar", () => {
  test.beforeEach(({ page }) => harness(page));

  test("is one tab stop before the text, and the arrows move along it", async ({ page }) => {
    const toolbar = page.locator('beautiful-example[data-example="text"] beautiful-editor-toolbar');
    await expect(toolbar).toHaveRole("toolbar");
    await page.getByRole("textbox", { name: "Headline" }).focus();
    await page.keyboard.press("Tab");
    await expect(toolbar.getByRole("button", { name: "Bold" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(toolbar.getByRole("button", { name: "Italic" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(text(page, "text")).toBeFocused();
    // Back again, to the button the arrows left it on.
    await page.keyboard.press("Shift+Tab");
    await expect(toolbar.getByRole("button", { name: "Italic" })).toBeFocused();
  });

  test("a list button wraps the line in a list, and shows it's on", async ({ page }) => {
    await toEnd(page, "text");
    const bullets = page.locator('beautiful-example[data-example="text"] beautiful-editor-toolbar').getByRole("button", { name: "Bulleted list" });
    await bullets.click();
    expect(await value(page, "text")).toContain("<ul><li><p>Thanks for joining.</p></li></ul>");
    await expect(bullets).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Editor slash menu", () => {
  test.beforeEach(({ page }) => harness(page));

  async function typeSlash(page: Page, query: string) {
    await toEnd(page, "post");
    await page.keyboard.press("Enter");
    await page.keyboard.type(`/${query}`);
  }
  const options = (page: Page) => slash(page, "post").getByRole("option");
  const active = (page: Page) =>
    text(page, "post").evaluate((el) => el.ownerDocument.getElementById(el.getAttribute("aria-activedescendant") ?? "")?.textContent ?? null);

  test("opens at a slash on an empty line, and filters, best match first", async ({ page }) => {
    await typeSlash(page, "");
    await expect(slash(page, "post")).toBeVisible();
    await expect(text(page, "post")).toHaveAttribute("aria-controls", /blocks$/);
    await page.keyboard.type("vid");
    await expect(options(page).first()).toContainText("Video");
    await expect(options(page)).toHaveCount(2); // Video, then Divider
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("he");
    await expect(options(page)).toHaveText(["Heading 1", "Heading 2", "Heading 3"]);
  });

  test("the arrows move the lit option, Enter turns the line into it and the slash goes", async ({ page }) => {
    await typeSlash(page, "he");
    expect(await active(page)).toContain("Heading 1");
    await page.keyboard.press("ArrowDown");
    expect(await active(page)).toContain("Heading 2");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    expect(await active(page)).toContain("Heading 3");
    await page.keyboard.press("Enter");
    await expect(slash(page, "post")).toBeHidden();
    await page.keyboard.type("Grinding");
    expect(String(await value(page, "post"))).toContain("#### Grinding");
    expect(String(await value(page, "post"))).not.toContain("/he");
  });

  test("Escape closes it and keeps what's typed; a click picks an option", async ({ page }) => {
    await typeSlash(page, "quo");
    await page.keyboard.press("Escape");
    await expect(slash(page, "post")).toBeHidden();
    await expect(text(page, "post")).not.toHaveAttribute("aria-activedescendant");
    expect(String(await value(page, "post"))).toContain("/quo");

    // With the slash gone, a new one opens the menu again, on the same line.
    for (let i = 0; i < 4; i++) await page.keyboard.press("Backspace");
    await page.keyboard.type("/");
    await expect(slash(page, "post")).toBeVisible();
    await page.keyboard.type("divi");
    await options(page).first().click();
    expect(String(await value(page, "post"))).toContain("---");
  });

  test("nothing opens mid-line, or in a one-line editor", async ({ page }) => {
    await toEnd(page, "post");
    await page.keyboard.type(" a/b");
    await expect(slash(page, "post")).toBeHidden();
    await expect(slash(page, "inline")).toHaveCount(1);
    await toEnd(page, "inline");
    await page.keyboard.type("/");
    await expect(slash(page, "inline")).toBeHidden();
  });

  test("Image opens the file picker, and the upload puts the picture in", async ({ page }) => {
    await typeSlash(page, "ima");
    await expect(options(page)).toHaveText([/^Image/]);
    const chooser = page.waitForEvent("filechooser");
    await options(page).first().click();
    const png = await page.evaluate(async () => {
      const canvas = new OffscreenCanvas(40, 30);
      canvas.getContext("2d")!.fillRect(0, 0, 40, 30);
      return [...new Uint8Array(await (await canvas.convertToBlob({ type: "image/png" })).arrayBuffer())];
    });
    await (await chooser).setFiles({ name: "beans.png", mimeType: "image/png", buffer: Buffer.from(png) });
    const image = text(page, "post").locator("figure img");
    await expect(image).toHaveAttribute("src", /^blob:/);
    await expect(image).toHaveAttribute("width", "40");
    await expect(text(page, "post").getByRole("button", { name: "Add alt text" })).toBeVisible();
  });
});

test.describe("Editor right-click menu", () => {
  test.beforeEach(({ page }) => harness(page));

  test("offers undo, the clipboard and Turn into at the cursor; marks on selected words", async ({ page }) => {
    await toEnd(page, "text");
    await text(page, "text").locator("p").last().click({ button: "right" });
    await expect(menu(page)).toBeVisible();
    await expect(menu(page).getByRole("menuitem", { name: /^Undo/ })).toBeVisible();
    await expect(menu(page).getByRole("menuitem", { name: /^Paste/ })).toBeVisible();
    await expect(menu(page).getByRole("menuitem", { name: /^Turn into/ })).toHaveAttribute("aria-haspopup", "menu");
    await expect(menu(page).getByRole("menuitemcheckbox", { name: /^Bold/ })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(menu(page)).toHaveCount(0);

    await select(page, "text", "Thanks");
    await text(page, "text").getByText("Thanks").click({ button: "right" });
    await expect(menu(page).getByRole("menuitemcheckbox", { name: /^Bold/ })).toBeVisible();
  });

  test("the editor's keys stay its own while the menu shows them", async ({ page }) => {
    await select(page, "text", "Thanks");
    await text(page, "text").getByText("Thanks").click({ button: "right" });
    await expect(menu(page).getByRole("menuitemcheckbox", { name: /^Bold/ })).toHaveAttribute("aria-keyshortcuts", /B$/);
    await clickInPopover(menu(page).getByRole("menuitemcheckbox", { name: /^Bold/ }));
    expect(await value(page, "text")).toContain("<strong>Thanks</strong>");
  });
});

test.describe("Editor link editor", () => {
  test.beforeEach(({ page }) => harness(page));

  const form = (page: Page) => page.getByRole("form", { name: /link/ });

  test("⌘K asks for the address and links the words, adding https://", async ({ page }) => {
    await select(page, "text", "joining");
    await page.keyboard.press("ControlOrMeta+k");
    await expect(form(page)).toBeVisible();
    await expect(form(page).getByRole("textbox", { name: "Address" })).toBeFocused();
    await page.keyboard.type("example.com/join");
    await page.keyboard.press("Enter");
    await expect(form(page)).toHaveCount(0);
    expect(await value(page, "text")).toContain('<a href="https://example.com/join">joining</a>');
    await expect(text(page, "text")).toBeFocused();
  });

  test("refuses an address people can't follow safely, and Remove takes a link off", async ({ page }) => {
    await select(page, "text", "joining");
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("javascript:alert(1)");
    await page.keyboard.press("Enter");
    await expect(form(page)).toContainText("Use a web address");
    await expect(form(page).getByRole("textbox", { name: "Address" })).toHaveAttribute("aria-invalid", "true");
    await form(page).getByRole("textbox", { name: "Address" }).fill("/join");
    await page.keyboard.press("Enter");
    expect(await value(page, "text")).toContain('<a href="/join">joining</a>');

    await select(page, "text", "join");
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByRole("form", { name: "Edit link" })).toBeVisible();
    await page.getByRole("button", { name: "Remove" }).click();
    expect(await value(page, "text")).not.toContain("<a ");
  });

  test("Escape closes it and leaves the text as it was", async ({ page }) => {
    await select(page, "text", "joining");
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("example.com");
    await page.keyboard.press("Escape");
    await expect(form(page)).toHaveCount(0);
    expect(await value(page, "text")).not.toContain("<a ");
  });
});

test.describe("Editor formats", () => {
  test.beforeEach(({ page }) => harness(page));

  test("HTML keeps only what the schema holds: no scripts, handlers, frames or unsafe links", async ({ page }) => {
    const hostile = [
      '<p>Hi<script>window.pwned = 1</script></p>',
      '<p><img src="x" onerror="window.pwned = 2">there</p>',
      '<p><a href="javascript:window.pwned = 3">click</a> <a href="//evil.example/x">far</a></p>',
      '<iframe src="https://evil.example"></iframe><p style="color:red" onclick="window.pwned = 4">styled</p>',
      '<figure><img src="javascript:alert(1)" alt="bad"></figure><svg><script>window.pwned = 5</script></svg>',
    ].join("");
    const clean = await page.evaluate((html) => window.formats.cleanHTML("post", html), hostile);
    expect(clean).not.toMatch(/script|onerror|onclick|javascript:|iframe|style=|evil/i);
    expect(clean).toContain("<p>Hi</p>");
    expect(clean).toContain("click");
    // Parsing it ran nothing: the parser's document is inert.
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => (window as unknown as { pwned?: number }).pwned)).toBeUndefined();
  });

  test("HTML in Markdown stays as text, but for a video and an app's block", async ({ page }) => {
    const md = '<script>window.pwned = 1</script>\n\nHello <b onclick="x">there</b>\n';
    const out = String(await page.evaluate((md) => window.formats.roundTrip("post", md, "markdown", "html"), md));
    expect(out).toContain("&lt;script&gt;");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<b ");
  });

  test("Markdown comes back as it went in", async ({ page }) => {
    const md = [
      "## Why we roast on Fridays",
      "",
      "Coffee is at its best a few days after roasting. Your bag lands ==right in that window==, ~~late~~ *never* **late**.",
      "",
      '![A tank of water.](/illustrations/reservoir.webp "Fresh beans let go of their gas slowly.")',
      "",
      "* Grind it fresh",
      "",
      "* Brew it within `three weeks`",
      "",
      "1. Weigh",
      "",
      "2. Pour",
      "",
      "> The best coffee I've had at home.",
      "",
      "```js",
      "brew(18, 300)",
      "```",
      "",
      "---",
      "",
      "See [our roasts](https://example.com/roasts).",
    ].join("\n");
    expect(await page.evaluate((md) => window.formats.roundTrip("post", md, "markdown"), md)).toBe(md);
  });

  test("a video and an app's block are kept as HTML in Markdown, and read back", async ({ page }) => {
    const md = [
      'Before.',
      "",
      '<figure data-width="text"><video src="https://cdn.example/clip.webm" poster="https://cdn.example/clip.webp" width="640" height="360" muted loop playsinline preload="none" aria-label="Pouring"></video></figure>',
      "",
      '<beautiful-editor-embed data-type="signup" data-props="{&quot;button&quot;:&quot;Join&quot;}">',
      "</beautiful-editor-embed>",
      "",
      "After.",
    ].join("\n");
    const json = (await page.evaluate((md) => window.formats.roundTrip("post", md, "markdown", "json"), md)) as {
      content: { type: string; attrs?: Record<string, unknown> }[];
    };
    expect(json.content.map((n) => n.type)).toEqual(["paragraph", "video", "embed", "paragraph"]);
    expect(json.content[1]!.attrs).toMatchObject({ poster: "https://cdn.example/clip.webp", alt: "Pouring", mode: "loop", width: 640 });
    expect(json.content[2]!.attrs).toMatchObject({ type: "signup", props: { button: "Join" } });
    const again = await page.evaluate((md) => window.formats.roundTrip("post", window.formats.roundTrip("post", md, "markdown"), "markdown", "json"), md);
    expect(again).toEqual(json);
  });

  test("Markdown a preset can't hold reads as what it can, never an error", async ({ page }) => {
    const md = "Before\n\n---\n\n==noted== and **bold**\n\n![A tank.](https://cdn.example/a.webp \"The tank.\")\n\n## Title\n\n> Quoted";
    expect(await page.evaluate((md) => window.formats.roundTrip("text", md, "markdown", "html"), md)).toBe(
      "<p>Before</p><p>noted and <strong>bold</strong></p><p>The tank.</p><p>Title</p><blockquote><p>Quoted</p></blockquote>",
    );
    expect(await page.evaluate((md) => window.formats.roundTrip("inline", md, "markdown", "html"), md)).toBe(
      "Beforenoted and <strong>bold</strong>The tank.TitleQuoted",
    );
  });

  test("a picture still uploading isn't in the value until it lands", async ({ page }) => {
    await page.evaluate(() => {
      const view = window.editors.post!.view!;
      const image = view.state.schema.nodes.image!.create({ src: "blob:http://localhost/1", upload: "upload-test" });
      view.dispatch(view.state.tr.insert(view.state.doc.content.size, image));
    });
    expect(String(await value(page, "post"))).not.toContain("blob:");
    expect(await page.evaluate(() => JSON.stringify(window.editors.post!.state()!.doc.toJSON()))).toContain("blob:");
  });

  test("plain text: one paragraph per line, and back", async ({ page }) => {
    expect(await page.evaluate(() => window.formats.roundTrip("text", "Hi Sam,\n\nThanks.", "text"))).toBe("Hi Sam,\n\nThanks.");
    expect(await page.evaluate(() => window.formats.roundTrip("text", "Hi Sam,\n\nThanks.", "text", "html"))).toBe("<p>Hi Sam,</p><p>Thanks.</p>");
  });
});

test.describe("Editor on the docs page", () => {
  test("the live examples mount, each with its text", async ({ page }) => {
    await open(page, "/editor");
    const live = (title: string) =>
      page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) }).locator("beautiful-editor-content.ProseMirror");
    await expect(page.locator("beautiful-editor-content.ProseMirror")).toHaveCount(4);
    await expect(live("Editor")).toHaveText("Coffee roasted this week");
    await expect(live("A line of a page's text")).toContainText("Coffee roasted this week, at your door by Friday");
    await expect(live("An email, with the fixed toolbar")).toContainText("Thanks for joining Harbor Coffee");
    await expect(live("A post").locator("h2")).toHaveText("Why we roast on Fridays");
    await expect(live("A post").locator("figure img")).toHaveAttribute("alt", /glass tank/);
  });
});

for (const theme of themes) {
  for (const mode of modes) {
    test(`Editor axe: ${theme} ${mode}`, async ({ page }) => {
      await harness(page, `?theme=${theme}&mode=${mode}`);
      await select(page, "text", "Thanks");
      await expect(bubble(page, "text")).toBeVisible();
      const results = await new AxeBuilder({ page }).include("main").analyze();
      expect(results.violations).toEqual([]);

      await typeSlashFor(page);
      await expect(slash(page, "post")).toBeVisible();
      const withSlash = await new AxeBuilder({ page }).include("main").analyze();
      expect(withSlash.violations).toEqual([]);
    });
  }
}

/**
 * Opens the slash menu on a few options. The whole list scrolls, and axe asks a scrolling region
 * to take focus, but the text keeps focus here, as in any combobox: the arrows move the lit
 * option, which scrolls into view.
 */
async function typeSlashFor(page: Page) {
  await toEnd(page, "post");
  await page.keyboard.press("Enter");
  await page.keyboard.type("/head");
}

test("the docs page passes axe", async ({ page }) => {
  await open(page, "/editor");
  await page.locator("beautiful-editor-content.ProseMirror").first().waitFor();
  const results = await new AxeBuilder({ page }).include("main").analyze();
  expect(results.violations).toEqual([]);
});

