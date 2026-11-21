import type { JSX } from "@solidjs/web";
import { createContext, createEffect, createSignal, createUniqueId, merge, omit, useContext } from "solid-js";
import { Button, type ButtonProps } from "./button.tsx";

/**
 * Popover: a native popover="auto" panel and the Button that toggles it with commandfor and
 * command="toggle-popover". The browser places it in the top layer, closes it on Escape and on a
 * click outside, returns focus to the button, and sets the button's aria-expanded. The button
 * is the panel's implicit anchor, and CSS places the panel (styles/elements/popover.css).
 *
 * This adds what the platform lacks: the panel closes when focus leaves it and its button, as
 * in Headless UI, and a parent can open it (open) and hear it open and close (onToggle).
 * Popover itself renders no element. The spec is the docs site's Popover page.
 */

type Shared = {
  id: string;
  button: () => HTMLButtonElement | undefined;
  setButton: (el: HTMLButtonElement) => void;
  panel: () => HTMLElement | undefined;
  setPanel: (el: HTMLElement) => void;
  /** Closes the panel when focus moves somewhere other than the button or the panel. */
  focusLeft: (event: FocusEvent) => void;
  toggled: (open: boolean) => void;
};

const PopoverContext = createContext<Shared>();

export type PopoverProps = {
  /** The panel's id. Made up when left out. */
  id?: string;
  /**
   * Opens or closes the panel from the parent. Left out, the button opens and closes it. Keep it
   * in step with onToggle: the panel also closes on Escape, a click outside, or focus leaving.
   */
  open?: boolean;
  /** Called whenever the panel opens or closes, however it happens. */
  onToggle?: (open: boolean) => void;
  children?: JSX.Element;
};

export function Popover(props: PopoverProps) {
  const [button, setButton] = createSignal<HTMLButtonElement>();
  const [panel, setPanel] = createSignal<HTMLElement>();

  const shared: Shared = {
    id: props.id ?? createUniqueId(),
    button,
    setButton,
    panel,
    setPanel,
    focusLeft(event) {
      const to = event.relatedTarget;
      // No relatedTarget: focus left the page, or a click landed on nothing focusable. A click
      // outside is the browser's light dismiss to handle.
      if (!(to instanceof Node)) return;
      if (button()?.contains(to) || panel()?.contains(to)) return;
      panel()?.hidePopover();
    },
    toggled: (open) => props.onToggle?.(open),
  };

  createEffect(
    () => [panel(), button(), props.open] as const,
    ([el, source, open]) => {
      if (!el || open === undefined || el.matches(":popover-open") === open) return;
      // The button as the source makes it the implicit anchor, as when it opens the panel itself.
      if (open) el.showPopover({ source });
      else el.hidePopover();
    },
  );

  return <PopoverContext value={shared}>{props.children}</PopoverContext>;
}

export type PopoverButtonProps = Omit<Extract<ButtonProps, { href?: never }>, "commandfor" | "command">;

/** Calls a ref the caller passed, beside the component's own. Solid compiles a ref prop to a function. */
export function forward<T>(ref: unknown, el: T) {
  if (typeof ref === "function") ref(el);
  else if (Array.isArray(ref)) for (const each of ref) forward(each, el);
}

export function PopoverButton(props: PopoverButtonProps) {
  const shared = useContext(PopoverContext);

  // Listeners, not JSX handlers, so the caller's own onFocusOut passes through untouched.
  function wire(el: HTMLButtonElement) {
    shared.setButton(el);
    el.addEventListener("focusout", shared.focusLeft);
    forward(props.ref, el);
  }

  return <Button {...props} ref={wire} commandfor={shared.id} command="toggle-popover" />;
}

type Side = "bottom" | "top" | "left" | "right";

export type PopoverPanelProps = Omit<JSX.HTMLAttributes<HTMLElement>, "id" | "popover"> & {
  /** The side of the button the panel opens on, then how it lines up. A bare side centers it. */
  anchor?: Side | `${Side} start` | `${Side} end`;
};

/**
 * The attributes a panel element takes from its Popover: the caller's own, the id its button's
 * commandfor names, popover, the anchor as data-anchor, and the ref that wires focus and toggle.
 * Spread onto the element. Dropdown's menu is the same panel under its own element name.
 */
export function panelProps(props: PopoverPanelProps, own?: (el: HTMLElement) => void) {
  const shared = useContext(PopoverContext);

  // Listeners, not JSX handlers, so the caller's own onFocusOut and onToggle pass through untouched.
  function ref(el: HTMLElement) {
    shared.setPanel(el);
    el.addEventListener("focusout", shared.focusLeft);
    el.addEventListener("toggle", (event) => shared.toggled((event as ToggleEvent).newState === "open"));
    own?.(el);
    forward(props.ref, el);
  }

  return merge(omit(props, "anchor", "ref"), {
    ref,
    id: shared.id,
    // An empty value is popover="auto". On a custom element Solid writes values out as they are.
    popover: "" as const,
    get "data-anchor"() {
      return props.anchor === "bottom start" ? undefined : props.anchor;
    },
  });
}

export function PopoverPanel(props: PopoverPanelProps) {
  return <beautiful-popover {...panelProps(props)} />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-popover": HTMLAttributes<HTMLElement> & { popover?: boolean | "" | "auto" | "manual" | "hint" };
    }
  }
}
