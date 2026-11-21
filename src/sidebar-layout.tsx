import type { JSX } from "@solidjs/web";
import { createSignal, createUniqueId, omit, onSettled } from "solid-js";
import { Button } from "./button.tsx";
import { Drawer } from "./drawer.tsx";
import { closeWhenWide, followsLink } from "./layout.ts";

/**
 * Sidebar layout: an app's page with a Sidebar down the left and the content in <main> beside it.
 * On a narrow screen the Sidebar hides, and a header across the top holds a menu button, which
 * opens the Sidebar again in a Drawer from the left, and an optional Navbar. The look, and which
 * parts show at which width, are CSS (styles/elements/sidebar-layout.css, layout.css). The spec is
 * the docs site's Sidebar layout page.
 *
 * The Sidebar is built twice, once for the page and once for the drawer, and one is always
 * hidden. What this adds to the markup: the drawer opens from a click as well as from commandfor,
 * for a browser without invoker commands, and it closes when a link in it is followed or the
 * layout grows wide enough to show the Sidebar.
 */

/** Which of the two Sidebars is being built: the one beside the content, or the one in the drawer. */
export type SidebarCopy = "page" | "drawer";

export type SidebarLayoutProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & {
  /**
   * The Sidebar. It is built twice, so write it inline, not as one element held in a variable or
   * an accessor, which would be the same nodes twice. Ids in it must differ between the copies:
   * leave them to the kit's components, or pass a function, which is told which copy it builds.
   */
  sidebar: JSX.Element | ((copy: SidebarCopy) => JSX.Element);
  /** A Navbar for the header on a narrow screen, after the menu button, such as the account. */
  navbar?: JSX.Element;
  /** The page's content. */
  children?: JSX.Element;
};

export function SidebarLayout(props: SidebarLayoutProps) {
  const rest = omit(props, "sidebar", "navbar", "children");
  const id = props.id ?? createUniqueId();
  const [open, setOpen] = createSignal(false);
  let layout: HTMLElement | undefined;
  let menu: HTMLElement | undefined;

  // Each read of a JSX prop builds it again, which is what makes the second copy.
  function sidebar(copy: SidebarCopy) {
    const value = props.sidebar;
    return typeof value === "function" ? value(copy) : value;
  }

  // Wide enough that the menu button hides: the Sidebar shows beside the content, so the drawer has no reason to be open.
  onSettled(() => {
    if (layout) return closeWhenWide(layout, () => menu, open, () => setOpen(false));
  });

  return (
    <beautiful-sidebar-layout {...rest} ref={(el: HTMLElement) => (layout = el)}>
      <a data-skip="" href={`#${id}-main`}>
        Skip to content
      </a>
      {sidebar("page")}
      <header>
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
        {props.navbar}
      </header>
      <Drawer
        id={`${id}-drawer`}
        side="start"
        size="sm"
        aria-label="Navigation"
        open={open()}
        onClose={() => setOpen(false)}
        onClick={(event: MouseEvent) => followsLink(event) && setOpen(false)}
      >
        {sidebar("drawer")}
      </Drawer>
      <main id={`${id}-main`}>{props.children}</main>
    </beautiful-sidebar-layout>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-sidebar-layout": HTMLAttributes<HTMLElement>;
    }
  }
}
