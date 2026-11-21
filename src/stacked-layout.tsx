import type { JSX } from "@solidjs/web";
import { children, createSignal, createUniqueId, omit, onSettled, Show } from "solid-js";
import { Dialog } from "./dialog.tsx";
import { Button } from "./button.tsx";
import { closeWhenWide, followsLink } from "./layout.ts";

/**
 * Stacked layout: an app's page with a Navbar across the top, in the page's <header>, and the
 * content in <main> under it. On a narrow screen a menu button opens the Sidebar in a drawer, a
 * modal Dialog from the left. The look, and which parts show at which width, are CSS
 * (styles/elements/stacked-layout.css). The spec is the docs site's Stacked layout page.
 *
 * What this adds to the markup: the drawer opens from a click as well as from commandfor, for a
 * browser without invoker commands, and it closes when a link in it is followed or the layout
 * grows wide enough to hide the menu button.
 */

export type StackedLayoutProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & {
  /** The Navbar for the top of the page. */
  navbar: JSX.Element;
  /** The Sidebar the menu button opens on a narrow screen. Left out, there is no menu button. */
  sidebar?: JSX.Element;
  /** The page's content. */
  children?: JSX.Element;
};

export function StackedLayout(props: StackedLayoutProps) {
  const rest = omit(props, "navbar", "sidebar", "children");
  const id = props.id ?? createUniqueId();
  // Read once: each read of a JSX prop builds it again.
  const sidebar = children(() => props.sidebar);
  const [open, setOpen] = createSignal(false);
  let layout: HTMLElement | undefined;
  let menu: HTMLElement | undefined;

  // Wide enough that the menu button hides: the whole Navbar shows, so the drawer has no reason to be open.
  onSettled(() => {
    if (layout) return closeWhenWide(layout, () => menu, open, () => setOpen(false));
  });

  function onDrawerClick(event: MouseEvent) {
    if (followsLink(event)) setOpen(false);
  }

  return (
    <beautiful-stacked-layout {...rest} ref={(el: HTMLElement) => (layout = el)}>
      <a data-skip="" href={`#${id}-main`}>
        Skip to content
      </a>
      <header>
        <Show when={sidebar()}>
          <Button
            ref={(el: HTMLElement) => (menu = el)}
            variant="tertiary"
            data-icon-button=""
            aria-label="Open navigation"
            commandfor={`${id}-drawer`}
            command="show-modal"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <path d="M3 6h14M3 10h14M3 14h14" />
            </svg>
          </Button>
        </Show>
        {props.navbar}
      </header>
      <Show when={sidebar()}>
        <Dialog id={`${id}-drawer`} data-drawer="start" aria-label="Navigation" open={open()} onClose={() => setOpen(false)} onClick={onDrawerClick}>
          <Button
            variant="tertiary"
            data-icon-button=""
            aria-label="Close navigation"
            autofocus
            commandfor={`${id}-drawer`}
            command="close"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </Button>
          {sidebar()}
        </Dialog>
      </Show>
      <main id={`${id}-main`}>{props.children}</main>
    </beautiful-stacked-layout>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-stacked-layout": HTMLAttributes<HTMLElement>;
    }
  }
}
