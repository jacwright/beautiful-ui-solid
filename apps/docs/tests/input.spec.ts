import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Page, test } from "@playwright/test";
import { settle } from "./contrast.ts";
import { modes, open, themes } from "./settings.ts";

// APG has no pattern for a text field: it is the native <input>. These check what the browser
// gives it, the look the spec sets, and what the Solid Input and Field add: their checks, the
// phone format, the https:// a web address gets, and keeping password managers off.

function section(page: Page, title: string) {
  return page.locator(".example", { has: page.getByRole("heading", { name: title, exact: true }) });
}

const preview = (page: Page, title: string) => section(page, title).locator("beautiful-example-preview");

test.describe("Input keyboard and names", () => {
  test.beforeEach(({ page }) => open(page, "/input"));

  test("Tab moves through the fields, stops on a read-only one and skips a disabled one", async ({ page }) => {
    const states = preview(page, "Invalid, read-only and disabled");
    await states.getByLabel("Custom domain").focus();
    await page.keyboard.press("Tab");
    await expect(states.getByLabel("Site address")).toBeFocused();
    await page.keyboard.press("Tab");
    // Past the disabled field, to the example's Code toggle.
    await expect(section(page, "Invalid, read-only and disabled").locator("summary").first()).toBeFocused();
  });

  test("each field is named by its label, described by its description and error, and says what it is", async ({ page }) => {
    const fields = preview(page, "Text fields");
    await expect(fields.getByRole("textbox", { name: "Owner's email" })).toHaveAccessibleDescription("We send receipts and sign-in links here.");
    const domain = preview(page, "Invalid, read-only and disabled").getByRole("textbox", { name: "Custom domain" });
    await expect(domain).toHaveAccessibleDescription("The address visitors type, such as springlaunch.com. Add the ending, such as .com or .org.");
    await expect(domain).toHaveAttribute("aria-invalid", "true");
    await expect(preview(page, "With an icon").getByRole("searchbox", { name: "Find a page" })).toBeVisible();
    await expect(preview(page, "Numbers and phones").getByRole("spinbutton", { name: "Monthly visits goal" })).toBeVisible();
  });

  test("a click on an icon focuses its field", async ({ page }) => {
    const group = preview(page, "With an icon").locator("beautiful-input-group").first();
    await group.scrollIntoViewIfNeeded();
    // The icon takes no clicks itself: a click on it lands on the field under it.
    const icon = (await group.locator("svg").boundingBox())!;
    await page.mouse.click(icon.x + icon.width / 2, icon.y + icon.height / 2);
    await expect(group.getByRole("searchbox")).toBeFocused();
  });

  test("Escape clears a search, and so does a click anywhere on the end of the field", async ({ page }) => {
    const search = preview(page, "With an icon").getByRole("searchbox", { name: "Find a page" });
    await search.fill("pricing");
    await page.keyboard.press("Escape");
    await expect(search).toHaveValue("");
    // The × is icon-sized, but the button is a square the field's height, out to its edge.
    await search.scrollIntoViewIfNeeded();
    const box = (await search.boundingBox())!;
    // Off the rounded corners, which take no clicks.
    const h = box.height;
    for (const [dx, dy] of [[3, h / 2], [h - 4, h / 2], [h / 2, 3], [h / 2, h - 3]] as const) {
      await search.fill("pricing");
      await page.mouse.click(box.x + box.width - dx, box.y + dy);
      await expect(search, `a click ${dx}px from the end`).toHaveValue("");
    }
  });

  test("Arrow keys step a number by its step", async ({ page }) => {
    const goal = preview(page, "Numbers and phones").getByRole("spinbutton", { name: "Monthly visits goal" });
    await goal.focus();
    await page.keyboard.press("ArrowUp");
    await expect(goal).toHaveValue("5500");
  });
});

test.describe("Input look", () => {
  test("every field is one height, 36px, with 14px text, and its focus ring is the kit's", async ({ page }) => {
    await open(page, "/input", "classic", "light");
    for (const field of await page.locator("beautiful-example-preview input").all()) {
      if (!(await field.isVisible())) continue;
      expect((await field.boundingBox())!.height).toBe(36);
      await expect(field).toHaveCSS("font-size", "14px");
    }
    const name = preview(page, "Text fields").getByLabel("Site name");
    await name.focus();
    await expect(name).toHaveCSS("outline", "rgb(37, 99, 235) solid 2px");
    await expect(name).toHaveCSS("outline-offset", "2px");
  });

  test("an invalid field has the danger edge, kept under the pointer", async ({ page }) => {
    await open(page, "/input", "classic", "light");
    const domain = preview(page, "Invalid, read-only and disabled").getByLabel("Custom domain");
    await expect(domain).toHaveCSS("border-color", "rgb(201, 31, 58)");
    await domain.hover();
    await expect(domain).toHaveCSS("border-color", "rgb(201, 31, 58)");
  });

  test("hover darkens the edge of an editable field, not a read-only one", async ({ page }) => {
    await open(page, "/input", "classic", "light");
    const name = preview(page, "Text fields").getByLabel("Site name");
    await name.hover();
    await expect(name).toHaveCSS("border-color", "rgb(161, 161, 170)");
    const address = preview(page, "Invalid, read-only and disabled").getByLabel("Site address");
    await address.hover();
    await expect(address).toHaveCSS("border-color", "rgb(212, 212, 216)");
  });

  test("a disabled field fades with its label and description", async ({ page }) => {
    await open(page, "/input");
    const field = preview(page, "Invalid, read-only and disabled").locator("beautiful-field").nth(2);
    for (const part of ["input", "label", "p"]) await expect(field.locator(part)).toHaveCSS("opacity", "0.5");
  });

  test("a placeholder is the muted text color at full opacity", async ({ page }) => {
    await open(page, "/input", "classic", "light");
    const email = preview(page, "Text fields").getByLabel("Owner's email");
    const placeholder = await email.evaluate((el) => {
      const style = getComputedStyle(el, "::placeholder");
      return [style.color, style.opacity];
    });
    expect(placeholder).toEqual(["rgb(82, 82, 91)", "1"]);
  });
});

test.describe("Input on a touch screen", () => {
  test.use({ viewport: devices["Pixel 7"].viewport, hasTouch: true, isMobile: true });

  test("fields are 44px tall with 16px text, so iOS doesn't zoom in", async ({ page }) => {
    await open(page, "/input");
    for (const field of await page.locator("beautiful-example-preview input").all()) {
      if (!(await field.isVisible())) continue;
      expect((await field.boundingBox())!.height).toBe(44);
      await expect(field).toHaveCSS("font-size", "16px");
    }
  });

  test("a bare field in 14px text still gets 16px", async ({ page }) => {
    await open(page, "/input");
    const size = await page.evaluate(() => {
      const box = document.createElement("section");
      box.style.fontSize = "14px";
      const bare = document.createElement("textarea");
      box.append(bare);
      document.body.append(box);
      return getComputedStyle(bare).fontSize;
    });
    expect(size).toBe("16px");
  });
});

test.describe("Input axe", () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`docs examples, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/input", theme, mode);
        const results = await new AxeBuilder({ page }).include("beautiful-example-preview").analyze();
        expect(results.violations).toEqual([]);
      });

      test(`the glass dialog example, open, ${theme} ${mode}`, async ({ page }) => {
        await open(page, "/input", theme, mode);
        await section(page, "On glass, and in a dialog").getByRole("button", { name: "Add a domain" }).click();
        await expect(page.getByRole("dialog", { name: "Add a custom domain" })).toBeVisible();
        await settle(page.locator("#add-domain"));
        const results = await new AxeBuilder({ page }).include("#add-domain").analyze();
        expect(results.violations).toEqual([]);
      });

      // axe can't judge contrast over the docs page's gradient, so it is checked on the harness's plain canvas.
      test(`contrast on the plain canvas, ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/tests/harness/input.html?theme=${theme}&mode=${mode}`);
        await page.locator("[data-example]").first().waitFor();
        // A disabled field's label and description are part of an inactive control, which WCAG exempts.
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("beautiful-field:has(> input:disabled)")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("Input component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/input.html");
    await page.locator("[data-validating]").waitFor();
  });

  const form = (page: Page) => page.locator("[data-validating]");

  test("autocomplete=off keeps password managers off, and other fields are theirs", async ({ page }) => {
    const goal = page.getByRole("spinbutton", { name: "Monthly visits goal" });
    await expect(goal).toHaveAttribute("data-1p-ignore", "");
    await expect(goal).toHaveAttribute("data-lpignore", "true");
    await expect(goal).toHaveAttribute("data-bwignore", "");
    await expect(page.getByRole("textbox", { name: "Owner's email" })).not.toHaveAttribute("data-1p-ignore");
  });

  test("a field says nothing while it's typed in for the first time, and speaks once it's left", async ({ page }) => {
    const email = form(page).getByRole("textbox", { name: "Email" });
    await email.fill("sam@");
    await expect(email).not.toHaveAttribute("aria-invalid");
    await page.keyboard.press("Tab");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAccessibleDescription("Enter an email address, such as name@example.com.");
    // From then on it follows the value, and clears the moment the value is fixed.
    await email.focus();
    await page.keyboard.type("example.com");
    await expect(email).not.toHaveAttribute("aria-invalid");
    await expect(form(page).locator("p[data-error]")).toHaveCount(0);
  });

  test("leaving a field without changing it says nothing", async ({ page }) => {
    const email = form(page).getByRole("textbox", { name: "Email" });
    await email.focus();
    await page.keyboard.press("Tab");
    await expect(email).not.toHaveAttribute("aria-invalid");
  });

  test("sending the form shows every problem in words and focuses the first, with no browser bubble", async ({ page }) => {
    await form(page).getByRole("button", { name: "Save" }).click();
    const email = form(page).getByRole("textbox", { name: "Email" });
    await expect(email).toBeFocused();
    await expect(email).toHaveAccessibleDescription("Fill this in.");
    const password = form(page).getByLabel("Password");
    await expect(password).toHaveAttribute("aria-invalid", "true");
    await expect(password).toHaveAccessibleDescription("12 characters or more, with letters and numbers. Fill this in.");
    // The browser's own bubble would have set no message of ours: the field holds one error each.
    await expect(form(page).locator("p[data-error]")).toHaveCount(3);
  });

  test("a click on Save from a field with a problem still lands, though the problem pushes Save down", async ({ page }) => {
    const password = form(page).getByLabel("Password");
    await password.fill("short1");
    await form(page).getByRole("button", { name: "Save" }).click();
    // The submit ran: every empty required field speaks, and focus is on the first.
    await expect(form(page).getByRole("textbox", { name: "Email" })).toBeFocused();
    await expect(password).toHaveAccessibleDescription(/Use at least 12 characters\. This has 6\.$/);
  });

  test("the browser's checks come first, then the page's own rule", async ({ page }) => {
    const password = form(page).getByLabel("Password");
    await password.fill("short1");
    await page.keyboard.press("Tab");
    await expect(password).toHaveAccessibleDescription(/Use at least 12 characters\. This has 6\.$/);
    await password.fill("longenoughbutnodigits");
    await expect(password).toHaveAccessibleDescription(/Mix letters and numbers\.$/);
    await password.fill("longenough4you");
    await expect(password).not.toHaveAttribute("aria-invalid");
  });

  test("a number off its step names the two nearest that fit", async ({ page }) => {
    const seats = form(page).getByRole("spinbutton", { name: "Seats" });
    await seats.fill("12");
    await page.keyboard.press("Tab");
    await expect(seats).toHaveAccessibleDescription("Enter 10 or 15.");
    await seats.fill("2");
    await expect(seats).toHaveAccessibleDescription("Enter 5 or more.");
  });

  test("a web address typed without https:// gets it when the field is left", async ({ page }) => {
    const website = form(page).getByRole("textbox", { name: "Website" });
    await website.fill("springlaunch.com");
    await page.keyboard.press("Tab");
    await expect(website).toHaveValue("https://springlaunch.com");
    await expect(website).not.toHaveAttribute("aria-invalid");
    await website.fill("not a site");
    await page.keyboard.press("Tab");
    await expect(website).toHaveValue("not a site");
    await expect(website).toHaveAccessibleDescription("Enter a web address, such as https://example.com.");
    // A host with a port has no scheme either.
    await website.fill("springlaunch.com:8080");
    await page.keyboard.press("Tab");
    await expect(website).toHaveValue("https://springlaunch.com:8080");
  });

  test("reset checks a field's own rule again, on the value it goes back to", async ({ page }) => {
    const password = form(page).getByLabel("Password", { exact: true });
    await password.fill("longbutnodigits");
    expect(await password.evaluate((el: HTMLInputElement) => el.validity.customError)).toBe(true);
    await form(page).getByRole("button", { name: "Start over" }).click();
    await expect(password).toHaveValue("");
    // Empty, it is missing, and the rule's problem with the old value is gone.
    await expect.poll(() => password.evaluate((el: HTMLInputElement) => el.validity.customError)).toBe(false);
  });

  test("an error the page writes wins over the field's own, and reset hides the field's", async ({ page }) => {
    const subdomain = form(page).getByRole("textbox", { name: "Subdomain" });
    await form(page).getByRole("button", { name: "Save" }).click();
    await expect(subdomain).toHaveAccessibleDescription("Fill this in.");
    await form(page).getByRole("button", { name: "Toggle taken" }).click();
    await expect(subdomain).toHaveAccessibleDescription("That subdomain is taken.");
    await form(page).getByRole("button", { name: "Toggle taken" }).click();
    await expect(subdomain).toHaveAccessibleDescription("Fill this in.");
    await form(page).getByRole("button", { name: "Start over" }).click();
    await expect(form(page).locator("p[data-error]")).toHaveCount(0);
    await expect(subdomain).not.toHaveAttribute("aria-invalid");
  });

  test("a field outside a Field keeps the browser's own checks", async ({ page }) => {
    const alone = page.getByRole("textbox", { name: "Outside a field" });
    expect(await alone.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await expect(alone).not.toHaveAttribute("aria-invalid");
  });

  test.describe("a phone number", () => {
    const phone = (page: Page, name = "Phone") => form(page).getByRole("textbox", { name, exact: true });

    test("is formatted for its country as it's typed", async ({ page }) => {
      await phone(page).pressSequentially("5550100199");
      await expect(phone(page)).toHaveValue("(555) 010-0199");
      await phone(page, "Phone in New Zealand").pressSequentially("0211234567");
      await expect(phone(page, "Phone in New Zealand")).toHaveValue("021 123 4567");
    });

    test("with a + is formatted as an international number", async ({ page }) => {
      await phone(page).pressSequentially("+442071838750");
      await expect(phone(page)).toHaveValue("+44 20 7183 8750");
    });

    test("keeps the caret after the same digit when one is typed in the middle", async ({ page }) => {
      await phone(page).pressSequentially("5550100199");
      // Put the caret after "(555) 0", and type a 9 there.
      await phone(page).evaluate((el: HTMLInputElement) => el.setSelectionRange(7, 7));
      await page.keyboard.press("Backspace");
      await page.keyboard.type("9");
      await expect(phone(page)).toHaveValue("(555) 910-0199");
      expect(await phone(page).evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(7);
    });

    test("Backspace never sticks on a character the format puts back", async ({ page }) => {
      await phone(page).pressSequentially("5550100199");
      await phone(page).evaluate((el: HTMLInputElement) => el.setSelectionRange(6, 6));
      // The caret is after "(555) ": Backspace takes the space, and the 5 before it.
      await page.keyboard.press("Backspace");
      await expect(phone(page)).toHaveValue("(550) 100-199");
      for (let i = 0; i < 20; i++) await page.keyboard.press("Backspace");
      await page.keyboard.press("End");
      for (let i = 0; i < 20; i++) await page.keyboard.press("Backspace");
      await expect(phone(page)).toHaveValue("");
    });

    test("Delete on a character the format puts back takes the digit after it", async ({ page }) => {
      await phone(page).pressSequentially("5550100199");
      // The caret is before ") ": Delete takes the bracket, and the 0 after the space.
      await phone(page).evaluate((el: HTMLInputElement) => el.setSelectionRange(4, 4));
      await page.keyboard.press("Delete");
      await expect(phone(page)).toHaveValue("(555) 100-199");
    });
  });
});

test.describe("DatePicker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/harness/input.html");
    await page.locator("[data-validating]").waitFor();
  });

  const form = (page: Page) => page.locator("[data-validating]");
  const launch = (page: Page) => form(page).getByRole("textbox", { name: "Launch date" });
  const button = (page: Page) => page.locator("#v-launch").locator("xpath=..").getByRole("button", { name: "Choose a date" });
  const sent = (page: Page, name: string) => form(page).locator(`input[type="hidden"][name="${name}"]`);
  const calendar = (page: Page) => page.getByRole("dialog", { name: /2026|2027/ });

  test("shows the date in the locale's order, and sends it as an ISO date", async ({ page }) => {
    await expect(launch(page)).toHaveValue("11/20/2026");
    await expect(sent(page, "launch")).toHaveValue("2026-11-20");
    await expect(page.getByRole("textbox", { name: "Renewal date in the UK" })).toHaveAttribute("placeholder", "DD/MM/YYYY");
  });

  test("the button opens a calendar on the picked day, with focus on it", async ({ page }) => {
    await button(page).click();
    await expect(calendar(page)).toBeVisible();
    await expect(calendar(page)).toHaveAccessibleName("November 2026");
    const day = page.getByRole("gridcell", { name: "Friday, November 20, 2026" });
    await expect(day).toBeFocused();
    await expect(day).toHaveAttribute("aria-selected", "true");
    // The week starts on Sunday in the US.
    await expect(calendar(page).getByRole("columnheader").first()).toHaveAttribute("abbr", "Sunday");
  });

  test("arrows, Home, End and Page keys move the focus as APG's date picker does", async ({ page }) => {
    await button(page).click();
    await expect(page.getByRole("gridcell", { name: "Friday, November 20, 2026" })).toBeFocused();
    const focused = () => page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    await page.keyboard.press("ArrowRight");
    expect(await focused()).toBe("Saturday, November 21, 2026");
    await page.keyboard.press("ArrowDown");
    expect(await focused()).toBe("Saturday, November 28, 2026");
    await page.keyboard.press("Home");
    expect(await focused()).toBe("Sunday, November 22, 2026");
    await page.keyboard.press("End");
    expect(await focused()).toBe("Saturday, November 28, 2026");
    await page.keyboard.press("ArrowUp");
    expect(await focused()).toBe("Saturday, November 21, 2026");
    await page.keyboard.press("PageDown");
    expect(await focused()).toBe("Monday, December 21, 2026");
    await expect(calendar(page)).toHaveAccessibleName("December 2026");
    await page.keyboard.press("Shift+PageDown");
    expect(await focused()).toBe("Tuesday, December 21, 2027");
    await page.keyboard.press("Shift+PageUp");
    await page.keyboard.press("PageUp");
    await page.keyboard.press("ArrowLeft");
    expect(await focused()).toBe("Friday, November 20, 2026");
  });

  test("Enter picks the day, closes the calendar and returns focus to its button", async ({ page }) => {
    await button(page).click();
    await expect(page.getByRole("gridcell", { name: "Friday, November 20, 2026" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(calendar(page)).toBeHidden();
    await expect(button(page)).toBeFocused();
    await expect(launch(page)).toHaveValue("11/21/2026");
    await expect(sent(page, "launch")).toHaveValue("2026-11-21");
  });

  test("a click on a day picks it", async ({ page }) => {
    await button(page).click();
    await page.getByRole("gridcell", { name: "Friday, November 27, 2026" }).click();
    await expect(calendar(page)).toBeHidden();
    await expect(sent(page, "launch")).toHaveValue("2026-11-27");
  });

  test("Escape closes the calendar without picking", async ({ page }) => {
    await button(page).click();
    await expect(page.getByRole("gridcell", { name: "Friday, November 20, 2026" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(calendar(page)).toBeHidden();
    await expect(button(page)).toBeFocused();
    await expect(sent(page, "launch")).toHaveValue("2026-11-20");
  });

  test("Alt + Down in the field opens the calendar", async ({ page }) => {
    await launch(page).focus();
    await page.keyboard.press("Alt+ArrowDown");
    await expect(calendar(page)).toBeVisible();
  });

  test("a day outside min and max can't be picked", async ({ page }) => {
    await button(page).click();
    await expect(page.getByRole("gridcell", { name: "Friday, November 20, 2026" })).toBeFocused();
    await page.keyboard.press("PageUp");
    const day = page.getByRole("gridcell", { name: "Tuesday, October 20, 2026" });
    await expect(day).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Enter");
    await expect(calendar(page)).toBeVisible();
    await expect(sent(page, "launch")).toHaveValue("2026-11-20");
  });

  test("a typed date reads in the locale's order and is written back in it", async ({ page }) => {
    await launch(page).fill("12/5/26");
    await page.keyboard.press("Tab");
    await expect(launch(page)).toHaveValue("12/05/2026");
    await expect(sent(page, "launch")).toHaveValue("2026-12-05");
    const uk = page.getByRole("textbox", { name: "Renewal date in the UK" });
    await uk.fill("5.12.2026");
    await page.keyboard.press("Tab");
    await expect(uk).toHaveValue("05/12/2026");
    await expect(sent(page, "renewal")).toHaveValue("2026-12-05");
  });

  test("a date that doesn't read, or is out of range, says how to fix it", async ({ page }) => {
    await launch(page).fill("31/31/2026");
    await page.keyboard.press("Tab");
    await expect(launch(page)).toHaveAttribute("aria-invalid", "true");
    await expect(launch(page)).toHaveAccessibleDescription(/^Any day in November or December 2026\. Enter a date such as \d\d\/\d\d\/\d{4}\.$/);
    await launch(page).fill("10/20/2026");
    await expect(launch(page)).toHaveAccessibleDescription(/Choose 11\/01\/2026 or later\.$/);
    await launch(page).fill("11/20/2026");
    await expect(launch(page)).not.toHaveAttribute("aria-invalid");
  });

  test("a date that doesn't read sends no date, never the one it replaced", async ({ page }) => {
    await launch(page).fill("not a date");
    await page.keyboard.press("Tab");
    await expect(sent(page, "launch")).toHaveValue("");
  });

  test("reset puts back the date the page gave", async ({ page }) => {
    await launch(page).fill("12/5/26");
    await page.keyboard.press("Tab");
    await expect(sent(page, "launch")).toHaveValue("2026-12-05");
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(launch(page)).toHaveValue("11/20/2026");
    await expect(sent(page, "launch")).toHaveValue("2026-11-20");
  });

  test("the week starts on Monday in the UK", async ({ page }) => {
    await page.locator("#v-renewal").locator("xpath=..").getByRole("button", { name: "Choose a date" }).click();
    await expect(page.getByRole("dialog").getByRole("columnheader").first()).toHaveAttribute("abbr", "Monday");
  });
});
