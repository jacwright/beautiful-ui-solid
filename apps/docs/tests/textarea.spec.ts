import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Locator, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// APG has no pattern for a text field: it is the native <textarea>. These check what the browser
// gives it, the look the spec sets (the well it shares with Input, and growing line by line), and
// what the Solid Textarea adds: the count, ⌘/Ctrl + Enter, its own growing where the CSS can't,
// and the Field's checks.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

const height = async (field: Locator) => (await field.boundingBox())!.height;

/** Types lines into a field, one at a time, and returns its height after each. */
async function heightsWhileTyping(page: Page, field: Locator, lines: number) {
  await field.click();
  const heights = [await height(field)];
  for (let line = 1; line <= lines; line++) {
    if (line > 1) await page.keyboard.press("Enter");
    await page.keyboard.type(`Line ${line}`);
    heights.push(await height(field));
  }
  return heights;
}

/**
 * The heights a 14px field with 21px lines takes, typed in line by line from empty: 3 lines' worth
 * until the fourth, a line more for each after, and 12 lines' worth from the twelfth on. Each is
 * the lines plus 8px of padding above and below, edge included.
 */
const desk = (line: number) => Math.min(Math.max(line, 3), 12) * 21 + 16;

test.describe("Textarea keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/textarea"));

  test("Tab moves through the fields, stops on a read-only one and skips a disabled one", async ({ page }) => {
    const states = preview(page, "Invalid, read-only and disabled");
    await states.getByLabel("Why are you cancelling?").focus();
    await page.keyboard.press("Tab");
    await expect(states.getByLabel("Message from the visitor")).toBeFocused();
    await page.keyboard.press("Tab");
    // Past the disabled field, to the example's Code toggle.
    await expect(section(page, "Invalid, read-only and disabled").locator("summary").first()).toBeFocused();
  });

  test("Tab leaves the field, and never types a tab", async ({ page }) => {
    const note = preview(page, "A description and a note").getByLabel("Note to the team");
    await note.click();
    await page.keyboard.type("First");
    await page.keyboard.press("Tab");
    await expect(note).not.toBeFocused();
    await expect(note).toHaveValue("First");
  });

  test("Enter starts a new line, and doesn't send the form", async ({ page }) => {
    const note = preview(page, "A description and a note").getByLabel("Note to the team");
    await note.click();
    await page.keyboard.type("One");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Two");
    await expect(note).toHaveValue("One\nTwo");
  });

  test("each field is named by its label, and described by its description, error and count", async ({ page }) => {
    const description = preview(page, "A description and a note").getByRole("textbox", { name: "Search description" });
    await expect(description).toHaveAccessibleDescription("Search results show it under the page's title. 74 characters left");
    const reason = preview(page, "Invalid, read-only and disabled").getByRole("textbox", { name: "Why are you cancelling?" });
    await expect(reason).toHaveAccessibleDescription("Fill this in. 500 characters left");
    await expect(reason).toHaveAttribute("aria-invalid", "true");
    await expect(preview(page, "On glass, and in a dialog").getByRole("textbox", { name: "Note on this page" })).toBeVisible();
  });
});

test.describe("Textarea look", () => {
  test.beforeEach(({ page }) => open(page, "/textarea", "classic", "light"));

  test("it has Input's well and text, with a paragraph's lines, and grows a line at a time from 3 lines to 12", async ({ page }) => {
    const note = preview(page, "A description and a note").getByLabel("Note to the team");
    await expect(note).toHaveCSS("font-size", "14px");
    await expect(note).toHaveCSS("line-height", "21px");
    await expect(note).toHaveCSS("border-radius", "8px");
    await expect(note).toHaveCSS("resize", "none");
    const heights = await heightsWhileTyping(page, note, 15);
    expect(heights).toEqual(heights.map((_, line) => desk(line)));
    // Past 12 lines it scrolls, and the caret's line is in view.
    expect(await note.evaluate((el) => el.scrollHeight > el.clientHeight && el.scrollTop > 0)).toBe(true);
  });

  test("a field with text starts as tall as its text", async ({ page }) => {
    const message = preview(page, "Invalid, read-only and disabled").getByLabel("Message from the visitor");
    expect(await height(message)).toBe(desk(2));
  });

  test("the count sits under the field's end edge, and beside an error on its line", async ({ page }) => {
    const fields = preview(page, "A description and a note");
    const field = (await fields.getByLabel("Search description").boundingBox())!;
    const count = (await fields.locator("p[data-count]").boundingBox())!;
    expect(count.x + count.width).toBeCloseTo(field.x + field.width, 0);
    expect(count.y).toBeGreaterThan(field.y + field.height);

    const states = preview(page, "Invalid, read-only and disabled");
    const error = (await states.locator("#cancel-reason-error").boundingBox())!;
    const beside = (await states.locator("#cancel-reason-count").boundingBox())!;
    expect(beside.y).toBe(error.y);
    expect(beside.x).toBeGreaterThan(error.x + error.width);
  });

  test("an invalid field has the danger edge, and a disabled one fades with its label", async ({ page }) => {
    const states = preview(page, "Invalid, read-only and disabled");
    const danger = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-danger").trim());
    const probe = await page.evaluate((color) => {
      const el = document.createElement("i");
      el.style.color = color;
      document.body.append(el);
      const rgb = getComputedStyle(el).color;
      el.remove();
      return rgb;
    }, danger);
    await expect(states.getByLabel("Why are you cancelling?")).toHaveCSS("border-top-color", probe);
    await expect(states.getByLabel("Internal notes")).toHaveCSS("opacity", "0.5");
    await expect(states.locator("label", { hasText: "Internal notes" })).toHaveCSS("opacity", "0.5");
  });
});

test.describe("Textarea on a touch screen", () => {
  test.use({ viewport: devices["Pixel 7"].viewport, hasTouch: true, isMobile: true });

  test("the text is 16px, so iOS doesn't zoom in, with lines to match", async ({ page }) => {
    await open(page, "/textarea", "classic", "light");
    const note = preview(page, "A description and a note").getByLabel("Note to the team");
    await expect(note).toHaveCSS("font-size", "16px");
    await expect(note).toHaveCSS("line-height", "24px");
    expect(await height(note)).toBe(3 * 24 + 16);
  });
});

test.describe("Textarea axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/textarea", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the glass dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/textarea", theme, mode);
        await page.getByRole("button", { name: "Reply to Maya" }).click();
        await expect(page.locator("#reply")).toBeVisible();
        await settle(page.locator("#reply"));
        const results = await new AxeBuilder({ page }).include("#reply").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/textarea.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A disabled field's label and description are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> textarea:disabled)")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Textarea component", () => {
  test.describe("in a form", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/tests/harness/textarea.html?theme=classic&mode=light");
      await page.locator("#live").waitFor();
    });

    test("the count follows the text, in words, and the browser stops at the limit", async ({ page }) => {
      const message = page.getByRole("textbox", { name: "Message", exact: true });
      const count = page.locator("#v-message-count");
      await expect(count).toHaveText("20 characters left");
      await expect(message).toHaveAccessibleDescription("20 characters left");
      await message.pressSequentially("Hello there, team");
      await expect(count).toHaveText("3 characters left");
      await message.pressSequentially("!!");
      await expect(count).toHaveText("1 character left");
      await message.pressSequentially("!!!");
      await expect(count).toHaveText("0 characters left");
      await expect(message).toHaveValue("Hello there, team!!!");
    });

    for (const key of ["Control+Enter", "Meta+Enter"]) {
      test(`${key} sends the form through its default button`, async ({ page }) => {
        await page.getByRole("textbox", { name: "Message", exact: true }).fill("Hello");
        await page.keyboard.press(key);
        await expect(page.locator("#live")).toHaveAttribute("data-sent", "send");
      });
    }

    test("Control+Enter with a problem shows it and focuses the field, and sends nothing", async ({ page }) => {
      await page.getByRole("textbox", { name: "Short note" }).click();
      await page.keyboard.press("Control+Enter");
      const message = page.getByRole("textbox", { name: "Message", exact: true });
      await expect(message).toBeFocused();
      await expect(message).toHaveAccessibleDescription("Fill this in. 20 characters left");
      await expect(page.locator("#live")).not.toHaveAttribute("data-sent");
    });

    test("a disabled default button keeps Control+Enter from sending, as it would Enter", async ({ page }) => {
      // Disabled by the fieldset around it, which its own disabled property doesn't say.
      await page.getByRole("textbox", { name: "Held" }).fill("Hello");
      await page.keyboard.press("Control+Enter");
      await page.waitForTimeout(100);
      await expect(page.locator("#held")).not.toHaveAttribute("data-sent");
    });

    test("held down, Control+Enter sends the form once", async ({ page }) => {
      await page.getByRole("textbox", { name: "Message", exact: true }).fill("Hello");
      await page.evaluate(() => {
        const form = document.querySelector<HTMLFormElement>("#live")!;
        form.addEventListener("submit", () => (form.dataset.sends = String(Number(form.dataset.sends ?? 0) + 1)));
      });
      await page.keyboard.down("Control");
      for (let i = 0; i < 3; i++) {
        await page.getByRole("textbox", { name: "Message", exact: true }).dispatchEvent("keydown", { key: "Enter", ctrlKey: true, repeat: i > 0, bubbles: true });
      }
      await page.keyboard.up("Control");
      await expect(page.locator("#live")).toHaveAttribute("data-sends", "1");
    });

    test("a form with no submit button and two one-line fields isn't sent, as Enter wouldn't", async ({ page }) => {
      await page.getByRole("textbox", { name: "Scripted" }).fill("Hello");
      await page.keyboard.press("Control+Enter");
      await page.waitForTimeout(100);
      await expect(page.locator("#scripted")).not.toHaveAttribute("data-sent");
    });

    test("the page's own onKeyDown can take Control+Enter first", async ({ page }) => {
      await page.getByRole("textbox", { name: "Own keys" }).fill("Hello");
      await page.keyboard.press("Control+Enter");
      await page.waitForTimeout(100);
      await expect(page.locator("#own-keys")).not.toHaveAttribute("data-sent");
      await page.keyboard.press("Meta+Enter");
      await expect(page.locator("#own-keys")).toHaveAttribute("data-sent", "send");
    });

    test("the page's own rule speaks once the field is left", async ({ page }) => {
      const message = page.getByRole("textbox", { name: "Message", exact: true });
      await message.fill("see https://x.co");
      await expect(message).not.toHaveAttribute("aria-invalid");
      await page.keyboard.press("Tab");
      await expect(message).toHaveAccessibleDescription("Leave out links. 4 characters left");
      await expect(message).toHaveAttribute("aria-invalid", "true");
    });

    test("rows sets the lines it starts at", async ({ page }) => {
      const short = page.getByRole("textbox", { name: "Short note" });
      expect(await height(short)).toBe(21 + 16);
      await short.click();
      await page.keyboard.type("One");
      await page.keyboard.press("Enter");
      expect(await height(short)).toBe(2 * 21 + 16);
    });

    test("a value from the page updates the count and the height", async ({ page }) => {
      const draft = page.getByRole("textbox", { name: "Draft" });
      await page.getByRole("button", { name: "Load the draft" }).click();
      await expect(draft).toHaveValue(/^Line one/);
      // A script isn't held to maxlength, as typing is, so the count says how far over it is.
      await expect(page.locator("#v-draft-count")).toHaveText("8 characters too many");
      // And the form isn't sent with it: the Field says how to fix it.
      await page.locator("#live").getByRole("button", { name: "Send", exact: true }).click();
      await expect(page.locator("#live")).not.toHaveAttribute("data-sent");
      await expect(draft).toHaveAccessibleDescription(/^Use at most 40 characters\. This has 48\./);
      expect(await height(draft)).toBe(desk(5));
    });

    test("reset puts the count back", async ({ page }) => {
      await page.getByRole("textbox", { name: "Message", exact: true }).fill("Hello");
      await expect(page.locator("#v-message-count")).toHaveText("15 characters left");
      await page.getByRole("button", { name: "Start over" }).click();
      await expect(page.locator("#v-message-count")).toHaveText("20 characters left");
    });

    test("outside a Field, the count has an id of its own and describes the field", async ({ page }) => {
      const alone = page.getByRole("textbox", { name: "Outside a field" });
      await expect(alone).toHaveAccessibleDescription("10 characters left");
      const id = await alone.getAttribute("aria-describedby");
      expect(id).toMatch(/-count$/);
      const count = page.locator(`[id="${id}"]`);
      await expect(count).toHaveText("10 characters left");
      // In muted text at the field's end edge, as in a Field.
      await expect(count).toHaveCSS("text-align", "end");
      await expect(count).toHaveCSS("font-variant-numeric", "tabular-nums");
    });
  });

  test("where the CSS can't grow it, the component does, from its rows to 12 lines", async ({ page }) => {
    // A browser without field-sizing or attr() rows, as Safari and Firefox are now, where
    // textarea.css's @supports leaves field-sizing off.
    // In before the page's scripts run, so the component sees it as it starts.
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = "textarea { field-sizing: fixed !important; min-block-size: 0 !important; }";
      document.documentElement.append(style);
    });
    await page.goto("/tests/harness/textarea.html?theme=classic&mode=light");
    const note = page.getByRole("textbox", { name: "Note to the team" });
    await expect(note).toHaveCSS("resize", "none");
    const heights = await heightsWhileTyping(page, note, 14);
    expect(heights).toEqual(heights.map((_, line) => desk(line)));
    // A width that wraps the text anew fits it again.
    await note.fill("word ".repeat(40).trim());
    const wide = await height(note);
    await note.evaluate((el) => (el.style.inlineSize = "200px"));
    await expect.poll(() => height(note)).toBeGreaterThan(wide);
  });
});
