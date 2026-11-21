import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Text contrast on glass, measured from pixels. axe marks every contrast check over
 * backdrop-filter as incomplete, because it can't know what the glass lets through.
 *
 * For each piece of text on a glass surface in the scope: hide the text, screenshot what's
 * behind it, and compare the text color with the pixel in its box that contrasts least.
 */

/** The minimum for body text, WCAG 1.4.3. */
export const minimumContrast = 4.5;

/** What is behind the examples. Plain is the kit's canvas. Bright is the bright stage, under the whole page. */
export const stages = {
  plain: "body, beautiful-demo-stage { background: var(--color-canvas); }",
  bright: "body { background: var(--demo-bright); background-attachment: fixed; }",
} as const;
export type Stage = keyof typeof stages;

/** The two widths the docs are checked at: a narrow desktop window and a phone. */
export const widths = { desk: { width: 900, height: 900 }, phone: { width: 390, height: 844 } } as const;

/** A piece of text, its contrast, and the pixel behind it that contrasts least: where it is on screen, and its color. */
export type Measurement = { text: string; ratio: number; at: [number, number]; behind: string };

const hidden = "data-contrast-hidden";

/** Measures every piece of text on glass inside the scope. Text clipped out of view by a scroller is skipped. */
export async function measureGlassText(page: Page, scope: Locator): Promise<Measurement[]> {
  const items = await scope.evaluate((root, hidden) => {
    /** Whether an element, or a pseudo-element drawn behind it such as Toggle group's thumb, frosts what's behind. */
    const frosts = (el: Element, pseudo?: string) => {
      const style = getComputedStyle(el, pseudo);
      return style.backdropFilter !== "none" && (!pseudo || style.content !== "none");
    };
    const glassy = (el: Element | null) => {
      for (; el; el = el.parentElement) if (frosts(el) || frosts(el, "::before") || frosts(el, "::after")) return true;
      return false;
    };
    /** The text color as opaque sRGB bytes, with its alpha and the opacity of every element it sits in. */
    const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const rgba = (el: Element, pseudo?: string) => {
      paint.clearRect(0, 0, 1, 1);
      paint.fillStyle = getComputedStyle(el, pseudo).webkitTextFillColor;
      paint.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0, a = 0] = paint.getImageData(0, 0, 1, 1).data;
      let alpha = a / 255;
      for (let up: Element | null = el; up; up = up.parentElement) alpha *= Number(getComputedStyle(up).opacity);
      return [r, g, b, alpha] as const;
    };
    /**
     * The part of a box that shows: inside the viewport and every clipping ancestor. An open
     * dialog or popover is in the top layer, so the ancestors outside it don't clip it.
     */
    const visible = (box: DOMRect, el: Element) => {
      let { left, top, right, bottom } = box;
      const layer = el.closest(":modal, :popover-open");
      for (let up = el.parentElement; up; up = up === layer ? null : up.parentElement) {
        const { overflowX, overflowY } = getComputedStyle(up);
        const clip = up.getBoundingClientRect();
        if (overflowX !== "visible") {
          left = Math.max(left, clip.left);
          right = Math.min(right, clip.right);
        }
        if (overflowY !== "visible") {
          top = Math.max(top, clip.top);
          bottom = Math.min(bottom, clip.bottom);
        }
      }
      const clipped = { left: Math.max(left, 0), top: Math.max(top, 0), right: Math.min(right, innerWidth), bottom: Math.min(bottom, innerHeight) };
      if (right - left < 1 || bottom - top < 1) return null;
      if (clipped.right - clipped.left < 1 || clipped.bottom - clipped.top < 1) {
        throw new Error(`Text is off screen, so it can't be measured: "${el.textContent?.trim()}"`);
      }
      return clipped;
    };

    /** A field's text box: inside its border and padding. */
    const contentBox = (field: Element) => {
      const box = field.getBoundingClientRect();
      const style = getComputedStyle(field);
      const px = (name: string) => parseFloat(style.getPropertyValue(name));
      return new DOMRect(
        box.left + px("border-left-width") + px("padding-left"),
        box.top + px("border-top-width") + px("padding-top"),
        box.width - px("border-left-width") - px("padding-left") - px("padding-right") - px("border-right-width"),
        box.height - px("border-top-width") - px("padding-top") - px("padding-bottom") - px("border-bottom-width"),
      );
    };

    const items = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (let el = walker.currentNode as Element | null; el; el = walker.nextNode() as Element | null) {
      // Disabled controls are exempt from the contrast minimum, as is a calendar's day that can't be picked.
      if (el.closest(':disabled, [aria-disabled="true"]') || !el.checkVisibility() || !glassy(el)) continue;
      let text: string;
      let boxes: ReturnType<typeof visible>[];
      let pseudo: string | undefined;
      if (el.matches("textarea, input:not([type=checkbox], [type=radio], [type=range], [type=color], [type=hidden])")) {
        // A field's value is no text node, so its box stands in for the text's. A date's picker button sits in
        // that box too, so it is hidden with the text.
        // An empty field shows its placeholder, in a color of its own.
        const field = el as HTMLInputElement;
        text = field.value.trim();
        if (!text && field.placeholder.trim()) {
          text = field.placeholder.trim();
          pseudo = "::placeholder";
        }
        boxes = text ? [visible(contentBox(el), el)] : [];
      } else {
        const texts = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
        text = texts.map((n) => n.textContent!.trim()).join(" ");
        boxes = texts.flatMap((node) => {
          // The letters only: a space at either end isn't text, and its box can reach into a neighbor, such as a Badge.
          const range = document.createRange();
          const content = node.textContent!;
          range.setStart(node, content.length - content.trimStart().length);
          range.setEnd(node, content.trimEnd().length);
          return [...range.getClientRects()].map((box) => visible(box, el!));
        });
      }
      const shown = boxes.filter((box) => box !== null);
      if (!shown.length) continue;
      items.push({ text, color: rgba(el, pseudo), boxes: shown });
      // ProseMirror draws its text again when an attribute changes inside it, so the mark goes on
      // the Editor's root, which it leaves alone. Its text inherits the hiding from there.
      (el.closest(".ProseMirror") ?? el).setAttribute(hidden, "");
    }
    return items;
  }, hidden);
  if (!items.length) return [];

  // Hide the measured text, screenshot what's behind it, and show the text again. A focus ring
  // isn't behind the text either: a scroller's ring is inset, over the edge of its last line.
  const style = await page.addStyleTag({
    content: `
      [${hidden}] { -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; text-shadow: none !important; }
      [${hidden}]::placeholder { -webkit-text-fill-color: transparent !important; color: transparent !important; }
      [${hidden}]::-webkit-datetime-edit { -webkit-text-fill-color: transparent !important; color: transparent !important; }
      [${hidden}]::-webkit-calendar-picker-indicator { opacity: 0 !important; }
      :focus-visible { outline-color: transparent !important; }`,
  });
  const png = await page.screenshot({ animations: "disabled", caret: "hide" });
  await style.evaluate((el, hidden) => {
    (el as Element).remove();
    for (const text of document.querySelectorAll(`[${hidden}]`)) text.removeAttribute(hidden);
  }, hidden);

  return page.evaluate(
    async ({ png, items }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(image, 0, 0);
      const scale = image.width / innerWidth;

      const luminance = (r: number, g: number, b: number) => {
        const linear = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
      };

      return items.map(({ text, color: [r, g, b, alpha], boxes }) => {
        let ratio = Infinity;
        let at: [number, number] = [0, 0];
        let behind = "";
        for (const box of boxes) {
          const x = Math.floor(box.left * scale);
          const y = Math.floor(box.top * scale);
          const w = Math.max(1, Math.ceil(box.right * scale) - x);
          const h = Math.max(1, Math.ceil(box.bottom * scale) - y);
          const pixels = context.getImageData(x, y, w, h).data;
          for (let i = 0; i < pixels.length; i += 4) {
            const [pr, pg, pb] = [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!];
            // Translucent text shows the pixel behind it through.
            const back = luminance(pr, pg, pb);
            const ink = luminance(r * alpha + pr * (1 - alpha), g * alpha + pg * (1 - alpha), b * alpha + pb * (1 - alpha));
            const contrast = (Math.max(ink, back) + 0.05) / (Math.min(ink, back) + 0.05);
            if (contrast < ratio) {
              ratio = contrast;
              const n = i / 4;
              at = [Math.round((x + (n % w)) / scale), Math.round((y + Math.floor(n / w)) / scale)];
              behind = `#${[pr, pg, pb].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
            }
          }
        }
        return { text, ratio: Math.round(ratio * 100) / 100, at, behind };
      });
    },
    { png: png.toString("base64"), items },
  );
}

/**
 * Waits for a dialog, a popover or an open list to finish entering or leaving. axe reads colors as
 * they are, so a check made while one fades in measures its text half-faded. A Spinner or an indeterminate Progress
 * inside one moves forever, and a Range's fill is driven by scrolling and never finishes, so neither is waited on, nor a Skeleton's light.
 */
export function settle(dialog: Locator) {
  return dialog.evaluate((el) =>
    Promise.all(
      el
        .getAnimations({ subtree: true })
        .filter((a) => a.timeline instanceof DocumentTimeline && a.effect?.getComputedTiming().endTime !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    ),
  );
}

/**
 * Clicks an item of a menu or another popover once the popover has finished coming in. Clicked
 * while it still grows in, Playwright can scroll the page under it as it clicks, and the click
 * lands on what was beneath.
 */
export async function clickInPopover(item: Locator) {
  await expect(item).toBeVisible();
  await settle(item.locator("xpath=ancestor-or-self::*[@popover][1]"));
  await item.click();
}

export async function showDialog(dialog: Locator) {
  await dialog.evaluate((el: HTMLDialogElement) => el.showModal());
  await settle(dialog);
}

export async function closeDialog(dialog: Locator) {
  await dialog.evaluate((el: HTMLDialogElement) => el.close());
  await settle(dialog);
}

/**
 * Opens a popover from its button, as a click would, so it sits where it does in use. A tooltip
 * is opened by hovering its control, as a person does: shown by `el.showPopover()` with nobody's
 * interest on its control, the browser hides it again after the hide delay, often before the
 * screenshot, which then measures its text over the bare stage. A tooltip whose control can't be
 * hovered, being hidden or disabled, is shown by script.
 */
export async function showPopover(popover: Locator) {
  const hover = await popover.evaluate((el: HTMLElement) => {
    const source = document.querySelector<HTMLElement>(`[commandfor="${el.id}"], [interestfor="${el.id}"]`) ?? undefined;
    // A person opens it from its button, so the button is in view, even in a row that scrolls, such as a Navbar's.
    source?.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (source?.matches("[interestfor]:not(:disabled)") && source.checkVisibility()) return source.getAttribute("interestfor");
    el.showPopover({ source });
    return null;
  });
  if (hover) {
    await popover.page().locator(`[interestfor="${hover}"]`).first().hover();
    // Fully in, and open: a tip the last hover left behind can still be fading out, and is visible
    // while it does, before this hover brings it back.
    await expect
      .poll(() => popover.evaluate((el) => el.matches(":popover-open") && getComputedStyle(el).opacity === "1"), {
        message: "the tooltip opens when its control is hovered",
      })
      .toBe(true);
  }
  await settle(popover);
}

export async function closePopover(popover: Locator) {
  await popover.evaluate((el: HTMLElement) => el.hidePopover());
  await settle(popover);
}
