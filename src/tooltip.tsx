import type { JSX } from "@solidjs/web";
import { children, createEffect, createUniqueId } from "solid-js";

/**
 * Tooltip: a short hint about a control, shown while the pointer rests on it or keyboard focus is
 * on it. The tip is <beautiful-tooltip popover="hint" role="tooltip">, placed after the control, and the
 * control points at it with interestfor. Where the browser has interest invokers, it does all the
 * showing and hiding: after --tooltip-delay (at once while another tip shows), gone after
 * --tooltip-hide-delay, or at once on Escape. wireTooltip does the same where it doesn't.
 *
 * The control's own text is its name, and the tip describes it (aria-describedby). An icon button
 * has no text, so the tip is its name (aria-labelledby). The spec is the docs site's Tooltip page.
 */

/** The one tip wireTooltip is showing. Opening another hides it, as the browser does with hints. */
let shown: { tip: HTMLElement; hide: () => void } | undefined;

/** A time token, such as --tooltip-delay, in milliseconds. */
function delay(el: Element, token: string) {
  const value = getComputedStyle(el).getPropertyValue(token).trim();
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith("ms") ? amount : amount * 1000;
}

/**
 * Shows and hides a control's tip the way interest invokers do, where the browser lacks them.
 * Does nothing where it has them: Chromium 149 and later, on a button or a link. Safari and Firefox
 * lack them in 2026, and no browser has them on a field. The tip is the element the control's interestfor names, or the
 * one given. Returns a function that removes the listeners.
 */
export function wireTooltip(control: HTMLElement, tip?: HTMLElement): () => void {
  const id = control.getAttribute("interestfor");
  const target = tip ?? (id ? control.ownerDocument.getElementById(id) : null);
  if ("interestForElement" in control || !target) return () => {};
  const panel: HTMLElement = target;
  const doc = control.ownerDocument;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const isOpen = () => panel.matches(":popover-open");
  const later = (then: () => void, ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(then, ms);
  };

  function show() {
    clearTimeout(timer);
    if (isOpen()) return;
    if (shown && shown.tip !== panel) shown.hide();
    panel.showPopover({ source: control });
    shown = { tip: panel, hide };
    doc.addEventListener("keydown", escape);
  }

  function hide() {
    clearTimeout(timer);
    if (isOpen()) panel.hidePopover();
    closed();
  }

  // However the tip closes, by hide() or by the browser (a hint's light dismiss, or an auto
  // popover opening), this one stops listening for Escape and no longer counts as shown.
  function closed() {
    doc.removeEventListener("keydown", escape);
    if (shown?.tip === panel) shown = undefined;
  }

  function toggled(event: Event) {
    if ((event as ToggleEvent).newState === "closed") closed();
  }

  // Only the first tip waits: while another shows, this one shows at once, as tooltip.css does
  // for interest invokers.
  const wait = () => (shown ? 0 : delay(control, "--tooltip-delay"));

  // Escape hides only the tip: a dialog or popover under it stays open.
  function escape(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    hide();
  }

  // A touch has no hover: the tap does the control's action and shows nothing.
  function enter(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    if (isOpen()) clearTimeout(timer);
    else later(show, wait());
  }

  function leave(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    // Keyboard focus keeps the tip, and a show it has scheduled.
    if (control.matches(":focus-visible")) return;
    if (isOpen()) later(hide, delay(control, "--tooltip-hide-delay"));
    else clearTimeout(timer);
  }

  function focus() {
    if (control.matches(":focus-visible")) later(show, wait());
  }

  function blur() {
    if (control.matches(":hover")) return;
    hide();
  }

  control.addEventListener("pointerenter", enter);
  control.addEventListener("pointerleave", leave);
  control.addEventListener("focus", focus);
  control.addEventListener("blur", blur);
  panel.addEventListener("toggle", toggled);

  return () => {
    hide();
    control.removeEventListener("pointerenter", enter);
    control.removeEventListener("pointerleave", leave);
    control.removeEventListener("focus", focus);
    control.removeEventListener("blur", blur);
    panel.removeEventListener("toggle", toggled);
  };
}

type Side = "bottom" | "top" | "left" | "right";

export type TooltipProps = {
  /** The hint: a few words. Never a link or a button. */
  content: JSX.Element;
  /**
   * A key shortcut shown after the words, such as "⌘Z", and left out of the control's name. Give
   * the control aria-keyshortcuts too, so a screen reader says it.
   */
  shortcut?: string;
  /** The side of the control the tip shows on, then how it lines up. A bare side centers it. */
  anchor?: Side | `${Side} start` | `${Side} end`;
  /** The tip's id. Made up when left out. */
  id?: string;
  /**
   * Whether the tip is the control's name rather than its description. Left out, the control's
   * markup decides: one with no words of its own is named by the tip. Icon button sets it.
   */
  names?: boolean;
  /** The control: one focusable element, such as a Button or a Link. */
  children: JSX.Element;
};

/**
 * Whether the control has a name of its own, so the tip describes it rather than names it. A
 * button or link with no text, title, or image with alt text has none, so the tip names it.
 */
function named(control: Element) {
  if (control.matches("[aria-label], [aria-labelledby], [title]") || !control.matches("button, a")) return true;
  if (control.querySelector('img[alt]:not([alt=""])')) return true;
  return (control.textContent ?? "").trim() !== "";
}

export function Tooltip(props: TooltipProps) {
  const id = props.id ?? createUniqueId();
  const resolved = children(() => props.children);
  let tip!: HTMLElement;
  const anchor = () => (props.anchor === "top" ? undefined : props.anchor);

  createEffect(
    () => resolved.toArray().find((node): node is HTMLElement => node instanceof HTMLElement),
    (control) => {
      if (!control) return;
      const relation = (props.names ?? !named(control)) ? "aria-labelledby" : "aria-describedby";
      const before = control.getAttribute(relation);
      control.setAttribute("interestfor", id);
      control.setAttribute(relation, before ? `${before} ${id}` : id);
      const unwire = wireTooltip(control, tip);
      return () => {
        unwire();
        control.removeAttribute("interestfor");
        if (before) control.setAttribute(relation, before);
        else control.removeAttribute(relation);
      };
    },
  );

  return (
    <>
      {resolved()}
      <beautiful-tooltip ref={tip} popover="hint" id={id} role="tooltip" data-anchor={anchor()} data-shortcut={props.shortcut}>
        {props.content}
      </beautiful-tooltip>
    </>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-tooltip": HTMLAttributes<HTMLElement>;
    }
  }
}
