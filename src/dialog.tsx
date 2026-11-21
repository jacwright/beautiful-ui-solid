import type { JSX } from "@solidjs/web";
import { createContext, createEffect, createSignal, createUniqueId, omit, onSettled, useContext } from "solid-js";
import { forward } from "./popover.tsx";

/**
 * Dialog and its parts: a native <dialog> opened with showModal(), and its title <h2>,
 * description <p>, body <beautiful-dialog-body> and actions <footer>. The browser puts it in the
 * top layer, makes the page inert, closes it on Escape and returns focus. The look and the scroll
 * lock are CSS (styles/elements/dialog.css). The spec is the docs site's Dialog page.
 *
 * This adds what the platform lacks, adapted from Headless UI's Dialog (MIT, Copyright (c) 2020
 * Tailwind Labs, Inc.): with no autofocus control, opening focuses the panel, not its first
 * control (an Alert, role="alertdialog", focuses its first action instead); closing returns
 * focus to the newest element still on the page when the opener is gone;
 * and a backdrop click closes it where closedby is missing. A parent opens it with open and hears
 * it close with onClose. Left out, a button with commandfor and command="show-modal" opens it.
 *
 * The title's id is the dialog's with -title after it, and the description's -description, so
 * static markup can write the same.
 */

type Part = "title" | "description";

type Shared = {
  id: string;
  /** Lists a title or description while it is on the page. Returns the removal. */
  add: (part: Part) => () => void;
};

const DialogContext = createContext<Shared>();

export type DialogProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, "id" | "open" | "onClose"> & {
  /** The dialog's id. Its title's and description's ids are made from it. Left out, it makes a unique one. */
  id?: string;
  /**
   * Shows the dialog when true, closes it when false. Left out, a commandfor button opens it. It is
   * the source of truth: if it is still true after onClose, the dialog opens again.
   */
  open?: boolean;
  /** Called after the dialog closes, however it closed, with the value of the button that closed it, or "". */
  onClose?: (returnValue: string) => void;
  /** The panel's maximum width: 24, 32, 42 or 56rem. */
  size?: "sm" | "md" | "lg" | "xl";
};

export function Dialog(props: DialogProps) {
  const id = props.id ?? createUniqueId();
  const rest = omit(props, "id", "open", "onClose", "size", "ref", "children");
  // Set once the parts have settled, so a dialog that opens at once has its name and description.
  const [dialog, setDialog] = createSignal<HTMLDialogElement>();
  let element: HTMLDialogElement | undefined;
  /** The elements focused before the dialog opened, newest last, to return focus to. */
  let before: HTMLElement[] = [];
  // Counts closes, so the effect below hears one and opens the dialog again if open is still true.
  const [closes, setCloses] = createSignal(0);
  const [titles, setTitles] = createSignal(0);
  const [descriptions, setDescriptions] = createSignal(0);
  const counts = { title: setTitles, description: setDescriptions };

  function add(part: Part) {
    counts[part]((n) => n + 1);
    return () => counts[part]((n) => n - 1);
  }

  function show(el: HTMLDialogElement) {
    before = [...(history.get(el.ownerDocument)?.list ?? [])];
    // An answer from an earlier time never carries over.
    el.returnValue = "";
    el.showModal();
    if (el.querySelector("[autofocus]")) return;
    // An Alert focuses its least destructive action, its first one (APG). Checked at each open, so
    // actions that came later count.
    const action = el.getAttribute("role") === "alertdialog" ? firstAction(el) : null;
    action?.focus();
    if (action && el.ownerDocument.activeElement === action) return;
    // The browser focuses the first control, which opens a phone's keyboard when it is a field.
    // autofocus on the <dialog> itself doesn't help: Chromium still picks the first control.
    el.tabIndex = -1;
    el.focus();
  }

  createEffect(
    () => [dialog(), props.open, closes()] as const,
    ([el, open]) => {
      if (!el || open === undefined || open === el.open) return;
      if (open) show(el);
      else el.close();
    },
  );

  function wire(el: HTMLDialogElement) {
    element = el;
    // A commandfor button opens the dialog through show(), so it focuses as the component does.
    // When open is set, it alone opens the dialog.
    el.addEventListener("command", (event) => {
      if ((event as Event & { command: string }).command !== "show-modal" || el.open) return;
      event.preventDefault();
      if (props.open === undefined) show(el);
    });
    el.addEventListener("close", () => {
      // A close the browser queued before open reopened the dialog.
      if (el.open) return;
      el.removeAttribute("tabindex");
      restoreFocus(el, before);
      // The parent hears first, so setting open to false here doesn't open the dialog again.
      props.onClose?.(el.returnValue);
      setCloses((n) => n + 1);
    });
    forward(props.ref, el);
  }

  // Document listeners go on the page's document, which a ref's template copy isn't in.
  onSettled(() => {
    const el = element;
    if (!el) return;
    setDialog(el);
    const unwatch = watchFocus(el.ownerDocument);
    const unclick = closeOnBackdrop(el);
    return () => {
      unwatch();
      unclick();
    };
  });

  return (
    <dialog
      closedby="any"
      {...rest}
      ref={wire}
      id={id}
      data-size={props.size}
      aria-labelledby={props["aria-labelledby"] ?? (titles() ? `${id}-title` : undefined)}
      aria-describedby={props["aria-describedby"] ?? (descriptions() ? `${id}-description` : undefined)}
    >
      <DialogContext value={{ id, add }}>{props.children}</DialogContext>
    </dialog>
  );
}

/** The first enabled button or link among a dialog's actions, in its footer. */
function firstAction(el: HTMLDialogElement) {
  return el.querySelector<HTMLElement>(":scope footer :is(button:not(:disabled), a[href])");
}

/** The newest elements that held focus on each page, newest last. Headless UI keeps five. */
const history = new WeakMap<Document, { list: HTMLElement[]; users: number; listener: (event: FocusEvent) => void }>();

function watchFocus(doc: Document) {
  let watched = history.get(doc);
  if (!watched) {
    const list: HTMLElement[] = [];
    const listener = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      list.push(event.target);
      if (list.length > 5) list.shift();
    };
    watched = { list, users: 0, listener };
    doc.addEventListener("focusin", listener, true);
    history.set(doc, watched);
  }
  watched.users++;
  const own = watched;
  return () => {
    if (--own.users) return;
    doc.removeEventListener("focusin", own.listener, true);
    history.delete(doc);
  };
}

/**
 * The browser returns focus to the element focused before the dialog opened. When that element
 * has gone or can't take focus, as a Dropdown item can't once its menu closes, focus would drop to
 * the page. Then this focuses the newest element focused before the dialog opened that still can.
 */
function restoreFocus(el: HTMLDialogElement, before: HTMLElement[]) {
  const doc = el.ownerDocument;
  // At the close event Chromium still has focus on the closed dialog when it found nowhere to return it.
  const active = doc.activeElement;
  if (active && active !== doc.body && !el.contains(active)) return;
  for (const candidate of [...before].reverse()) {
    if (!candidate.isConnected || el.contains(candidate)) continue;
    candidate.focus();
    if (doc.activeElement === candidate) return;
  }
}

/**
 * closedby="any" closes the dialog on a backdrop click. Where the browser lacks closedby, this does
 * it: both pointerdown and pointerup must land on the backdrop, so a drag out of the panel, as when
 * selecting text, doesn't close it.
 */
function closeOnBackdrop(el: HTMLDialogElement) {
  if ("closedBy" in HTMLDialogElement.prototype) return () => {};
  const onBackdrop = (event: PointerEvent) => {
    if (event.target !== el || el.getAttribute("closedby") !== "any") return false;
    const box = el.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    return x < box.left || x > box.right || y < box.top || y > box.bottom;
  };
  let downOnBackdrop = false;
  const down = (event: PointerEvent) => (downOnBackdrop = onBackdrop(event));
  const up = (event: PointerEvent) => {
    if (downOnBackdrop && onBackdrop(event)) el.close();
    downOnBackdrop = false;
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointerup", up);
  };
}

/** Names the dialog. */
export function DialogTitle(props: Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "id">) {
  const shared = useContext(DialogContext);
  onSettled(() => shared.add("title"));
  return <h2 {...props} id={`${shared.id}-title`} />;
}

/** Describes the dialog. */
export function DialogDescription(props: Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "id">) {
  const shared = useContext(DialogContext);
  onSettled(() => shared.add("description"));
  return <p {...props} id={`${shared.id}-description`} />;
}

/** The content. The only part that scrolls, so the title and actions stay in view. */
export function DialogBody(props: JSX.HTMLAttributes<HTMLElement>) {
  return <beautiful-dialog-body {...props} />;
}

/** The buttons, right-aligned. On narrow screens they stack, primary on top. */
export function DialogActions(props: JSX.HTMLAttributes<HTMLElement>) {
  return <footer {...props} />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-dialog-body": HTMLAttributes<HTMLElement>;
    }
  }
}
