import type { JSX } from "@solidjs/web";
import { createUniqueId, omit, onSettled, Show } from "solid-js";
import { forward } from "./popover.tsx";

/**
 * Sidebar: an app's own navigation, a <nav data-sidebar> named with aria-label. Its header and
 * footer stay put and its body scrolls between them. Items are native links, or buttons for an
 * action, so the browser gives them their keys; the only script is scrolling the body to the
 * current item on load. The look is CSS (styles/elements/sidebar.css). A Dropdown in the header
 * or footer needs nothing of its own: its button is an item. The spec is the docs site's Sidebar
 * page.
 */

export type SidebarProps = JSX.HTMLAttributes<HTMLElement> & {
  /** What it holds, read with the landmark: "Main", "Site settings". An app with a Navbar too has two navs, so it is required. */
  "aria-label": string;
};

export function Sidebar(props: SidebarProps) {
  return <nav {...props} data-sidebar="" />;
}

/** Pinned at the top: the team or site switcher, a search. */
export function SidebarHeader(props: JSX.HTMLAttributes<HTMLElement>) {
  return <header {...props} />;
}

/** The main items, between the header and footer. It scrolls when they don't fit, and starts scrolled to the current item. */
export function SidebarBody(props: JSX.HTMLAttributes<HTMLElement>) {
  const rest = omit(props, "ref");
  let body: HTMLElement | undefined;

  // When the body first has a size (on load, or when a closed sheet first opens), and each time
  // the current item changes, as when a router follows back. Picking an item puts it in view
  // already, so that never scrolls.
  onSettled(() => {
    if (!body || typeof ResizeObserver === "undefined") return;
    const el = body;
    const sized = new ResizeObserver(() => {
      if (!el.clientHeight) return;
      sized.disconnect();
      reveal(el);
    });
    sized.observe(el);
    const moved = new MutationObserver(() => el.clientHeight && reveal(el));
    moved.observe(el, { attributes: true, attributeFilter: ["aria-current"], subtree: true });
    return () => {
      sized.disconnect();
      moved.disconnect();
    };
  });

  function ref(el: HTMLElement) {
    body = el;
    forward(props.ref, el);
  }

  return <beautiful-sidebar-body {...rest} ref={ref} />;
}

/** Scrolls the body alone, never the page, to its current item when that is out of view: then it lands in the middle. */
function reveal(body: HTMLElement) {
  // The body's own items, not one in a menu opened from it.
  const item = body.querySelector(':scope > [aria-current="page"], :scope > beautiful-sidebar-section > [aria-current="page"]');
  if (!item) return;
  const room = body.getBoundingClientRect();
  const at = item.getBoundingClientRect();
  if (at.top < room.top || at.bottom > room.bottom) {
    body.scrollTop += at.top - room.top - (room.height - at.height) / 2;
  }
}

/** Pinned at the bottom: support, the account. */
export function SidebarFooter(props: JSX.HTMLAttributes<HTMLElement>) {
  return <footer {...props} />;
}

export type SidebarSectionProps = Omit<JSX.HTMLAttributes<HTMLElement>, "role"> & {
  /** The small heading over its items, which names the group. Its id is the section's with -heading after it. */
  heading?: string;
};

/** Items under a heading, with space above them. */
export function SidebarSection(props: SidebarSectionProps) {
  const rest = omit(props, "heading", "children", "id");
  const fallback = createUniqueId();
  const headingId = () => (props.heading ? `${props.id ?? fallback}-heading` : undefined);
  return (
    <beautiful-sidebar-section {...rest} id={props.id} role="group" aria-labelledby={props["aria-labelledby"] ?? headingId()}>
      <Show when={props.heading}>
        <header id={headingId()}>{props.heading}</header>
      </Show>
      {props.children}
    </beautiful-sidebar-section>
  );
}

type ItemOwn = {
  /** Marks the place you're in with aria-current="page". Mark one item. */
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

export type SidebarItemProps = ItemAsButton | ItemAsLink;

/** One row: a link with href, a button without. Its children are an optional <svg>, the label, and an optional trailing <svg>. */
export function SidebarItem(props: SidebarItemProps) {
  const rest = omit(props, "current");
  // The prop is the way to say it; a caller's own aria-current ("true", "step") still passes through.
  const current = () => (props.current ? "page" : props["aria-current"]);
  return (
    <Show
      when={props.href !== undefined}
      fallback={<button {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} type="button" aria-current={current()} />}
    >
      <a {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} aria-current={current()} />
    </Show>
  );
}

/** A faint line between items. */
export function SidebarDivider(props: JSX.HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-sidebar-body": HTMLAttributes<HTMLElement>;
      "beautiful-sidebar-section": HTMLAttributes<HTMLElement>;
    }
  }
}
