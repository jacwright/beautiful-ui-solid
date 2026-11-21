import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, omit, Show } from "solid-js";
import { forward } from "./popover.tsx";

/**
 * Navbar: a row of links on a native <nav data-navbar>. It adds no keys: its items are plain
 * links and buttons, and the browser gives them Tab, Enter and Space. The look is CSS
 * (styles/elements/navbar.css), which draws the current page's bar from aria-current="page" and
 * glides it when the current item changes. The one thing it adds: the current item is scrolled
 * into view in a row too wide to fit. The spec is the docs site's Navbar page.
 */

export type NavbarProps = JSX.HTMLAttributes<HTMLElement>;

export function Navbar(props: NavbarProps) {
  return <nav {...props} data-navbar="" />;
}

/** A group of items, closer together than the Navbar's parts. */
export function NavbarSection(props: JSX.HTMLAttributes<HTMLElement>) {
  return <beautiful-navbar-section {...props} />;
}

/** Takes the free room, so what follows it sits at the end of the row. */
export function NavbarSpacer(props: JSX.HTMLAttributes<HTMLElement>) {
  return <beautiful-navbar-spacer {...props} />;
}

/** A hairline standing between parts, such as a team switcher and the links. */
export function NavbarDivider(props: JSX.HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} aria-orientation="vertical" />;
}

type ItemOwn = {
  /** The page you're on. Writes aria-current="page", which draws the bar. */
  current?: boolean;
};

type ItemAsButton = ItemOwn &
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    href?: never;
  };

/** A link can't be disabled, so the types don't allow it with href. */
type ItemAsLink = ItemOwn &
  JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    disabled?: never;
  };

export type NavbarItemProps = ItemAsButton | ItemAsLink;

/** A place, an <a> with href, or an action, a <button>. */
export function NavbarItem(props: NavbarItemProps) {
  const rest = omit(props, "current", "ref");
  const [item, setItem] = createSignal<HTMLElement>();

  function ref(el: HTMLElement) {
    setItem(el);
    forward(props.ref, el);
  }

  // The current item is scrolled into view along its row: at once on the first page, smoothly after.
  createEffect(
    () => [item(), props.current] as const,
    ([el, current]) => {
      if (el && current) reveal(el);
    },
  );

  const current = () => (props.current ? "page" : undefined);
  return (
    <Show
      when={props.href !== undefined}
      fallback={<button {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} ref={ref} type="button" aria-current={current()} />}
    >
      <a {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} ref={ref} aria-current={current()} />
    </Show>
  );
}

/** The Navbars that have shown a current item once. Each later one scrolls there smoothly. */
const revealed = new WeakSet<HTMLElement>();

/**
 * Scrolls the item's Navbar sideways, and only it, to center an item that isn't wholly in view.
 * The edge fades (the nav's scroll padding) count as out of view.
 */
function reveal(item: HTMLElement) {
  const nav = item.closest<HTMLElement>("nav[data-navbar]");
  if (!nav) return;
  const smoothly = revealed.has(nav) && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  revealed.add(nav);
  if (nav.scrollWidth <= nav.clientWidth) return;
  const row = nav.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  const fade = Number.parseFloat(getComputedStyle(nav).scrollPaddingInlineStart) || 0;
  if (box.left >= row.left + fade && box.right <= row.right - fade) return;
  nav.scrollTo({
    left: nav.scrollLeft + box.left + box.width / 2 - (row.left + row.width / 2),
    behavior: smoothly ? "smooth" : "instant",
  });
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-navbar-section": HTMLAttributes<HTMLElement>;
      "beautiful-navbar-spacer": HTMLAttributes<HTMLElement>;
    }
  }
}
