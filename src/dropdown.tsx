import type { JSX } from "@solidjs/web";
import { createContext, createSignal, createUniqueId, omit, onSettled, Show, useContext } from "solid-js";
import { wireMenu } from "./menu.ts";
import { Popover, PopoverButton, type PopoverButtonProps, panelProps, type PopoverPanelProps, type PopoverProps } from "./popover.tsx";

/**
 * Dropdown: a menu of actions on Popover. The menu is Popover's panel with role="menu", and its
 * button is Popover's button with aria-haspopup="menu", so the browser opens, places and closes
 * it. wireMenu (menu.ts) adds the keys and pointer a menu needs. The look is CSS
 * (styles/elements/dropdown.css). The spec is the docs site's Dropdown page.
 *
 * The button's id is the menu's with -button after it, and the menu is labelled by it, so static
 * markup can write the same.
 */

const DropdownContext = createContext<{ id: string }>();

export type DropdownProps = PopoverProps;

export function Dropdown(props: DropdownProps) {
  const id = props.id ?? createUniqueId();
  return (
    <Popover id={id} open={props.open} onToggle={props.onToggle}>
      <DropdownContext value={{ id }}>{props.children}</DropdownContext>
    </Popover>
  );
}

export type DropdownButtonProps = Omit<PopoverButtonProps, "id">;

export function DropdownButton(props: DropdownButtonProps) {
  const { id } = useContext(DropdownContext);
  return <PopoverButton {...props} id={`${id}-button`} aria-haspopup="menu" />;
}

export type DropdownMenuProps = Omit<PopoverPanelProps, "role" | "tabindex">;

export function DropdownMenu(props: DropdownMenuProps) {
  const { id } = useContext(DropdownContext);
  let menu: HTMLElement | undefined;
  // Wired once on the page, so wireMenu finds its button. It is unwired when the menu goes.
  onSettled(() => (menu ? wireMenu(menu) : undefined));

  return (
    <beautiful-menu
      {...panelProps(props, (el) => (menu = el))}
      role="menu"
      aria-labelledby={`${id}-button`}
      tabindex="-1"
    />
  );
}

type ItemOwn = {
  /** For an action that destroys something. */
  color?: "danger";
  /** One letter or digit that picks the item while the menu is open. Shown at its end. */
  shortcut?: string;
};

type ItemAsButton = ItemOwn &
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "type" | "role"> & {
    href?: never;
  };

/** A link can't be disabled, so the types don't allow it with href. */
type ItemAsLink = ItemOwn &
  Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "role"> & {
    href: string;
    disabled?: never;
  };

export type DropdownItemProps = ItemAsButton | ItemAsLink;

/** One action, a <button>, or a link, an <a> with href. Picking it closes the menu (menu.ts). */
export function DropdownItem(props: DropdownItemProps) {
  const rest = omit(props, "color", "shortcut", "children");
  const content = () => (
    <>
      {props.children}
      <Show when={props.shortcut}>
        <kbd>{props.shortcut}</kbd>
      </Show>
    </>
  );
  return (
    <Show
      when={props.href !== undefined}
      fallback={
        <button
          {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
          type="button"
          role="menuitem"
          data-color={props.color}
          aria-keyshortcuts={props.shortcut}
        >
          {content()}
        </button>
      }
    >
      <a
        {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
        role="menuitem"
        data-color={props.color}
        aria-keyshortcuts={props.shortcut}
      >
        {content()}
      </a>
    </Show>
  );
}

/** An app-wide shortcut, such as ⌘R, shown at an item's end. The app handles the keys. */
export function DropdownShortcut(props: JSX.HTMLAttributes<HTMLElement>) {
  return <kbd {...props} />;
}

/** A line under an item's label, read with it. */
export function DropdownDescription(props: JSX.HTMLAttributes<HTMLElement>) {
  return <small {...props} />;
}

/** A line between groups of items. */
export function DropdownDivider(props: JSX.HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} />;
}

const SectionContext = createContext<{ name: (id: string) => () => void } | null>(null);

/** A group of items under a DropdownHeading, which names it. */
export function DropdownSection(props: JSX.HTMLAttributes<HTMLElement>) {
  const [heading, setHeading] = createSignal<string>();
  const rest = omit(props, "children");
  const name = (id: string) => {
    setHeading(id);
    return () => setHeading(undefined);
  };
  return (
    <beautiful-menu-section {...rest} role="group" aria-labelledby={props["aria-labelledby"] ?? heading()}>
      <SectionContext value={{ name }}>{props.children}</SectionContext>
    </beautiful-menu-section>
  );
}

/** A section's heading. Not an item: the keys pass over it. */
export function DropdownHeading(props: JSX.HTMLAttributes<HTMLElement>) {
  const section = useContext(SectionContext);
  const id = typeof props.id === "string" ? props.id : createUniqueId();
  // The section points at it once it is on the page, and lets go when it leaves.
  if (section) onSettled(() => section.name(id));
  return <header {...props} id={id} role="presentation" />;
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-menu": HTMLAttributes<HTMLElement>;
      "beautiful-menu-section": HTMLAttributes<HTMLElement>;
    }
  }
}
