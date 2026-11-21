import { render, type JSX } from "@solidjs/web";
import { createSignal, createUniqueId, For, omit, Show, untrack } from "solid-js";
import { type Action, type ActionGroup, type ActionList, ariaKeys, isActionGroup, keyLabel, shownActions } from "./actions.ts";
import { addShortcuts, inTextBox } from "./shortcuts.ts";
import { actionKeys } from "./shortcut-settings.ts";
import { IconButton, type IconButtonProps } from "./icon-button.tsx";
import { showMenu, wireMenu } from "./menu.ts";

/**
 * Context menu: an action list (actions.ts) shown as a menu, at the pointer on a right-click, or
 * beside a "…" button (ActionMenu). Both open one shared menu, a <beautiful-menu popover role="menu">
 * at the end of the page, or of the open modal dialog, whose inert outside would swallow it. It is
 * Dropdown's menu: the same look (dropdown.css) and keys (menu.ts), plus submenus and items that are
 * on or off (context-menu.css). The spec is the docs site's Context menu page.
 *
 * Opened by the pointer, focus goes to the menu with no item lit; by the keyboard, to the first item.
 * On close, focus goes back where it was, or to returnFocus. Picking an item closes the menu first,
 * then runs its action, so an editor's Paste lands in the editor.
 */

export type OpenActionsOptions = {
  /** Opens it beside this element, such as a "…" button or a focused row. */
  anchor?: Element;
  /** Where it sits against the anchor, as on PopoverPanel. */
  side?: "bottom start" | "bottom end" | "right start";
  /** Opens it at this point on the screen, such as the pointer's. */
  at?: { x: number; y: number };
  /** "first" for the keyboard, "menu" for the pointer. */
  focus?: "first" | "menu";
  /** The menu's name for a screen reader. Defaults to "Actions". */
  label?: string;
  /** Names the menu by this element's text, such as its button, in place of label. */
  labelledBy?: Element;
  /** Where focus goes when the menu closes with focus in it. Left out, back where it was. */
  returnFocus?: Element;
  /** Called when it opens, and once when it closes, however it closes. */
  onToggle?: (open: boolean) => void;
};

type Host = {
  menu: HTMLElement;
  /** A point the menu anchors to when it opens at the pointer. */
  point: HTMLElement;
  /** What the open menu came from, so its button can close it again. */
  source?: Element;
  /** The open menu's options, until it closes. */
  options?: OpenActionsOptions;
  /** Where focus goes once the menu has closed. */
  returnTo?: Element;
  dispose?: () => void;
};

const hosts = new WeakMap<Element, Host>();
let count = 0;

/** The shared menu for where this element is: its open modal dialog, or the page. */
function hostFor(near: Element): Host {
  const doc = near.ownerDocument;
  const container = near.closest("dialog:modal") ?? doc.body;
  const existing = hosts.get(container);
  if (existing?.menu.isConnected) return existing;

  const menu = doc.createElement("beautiful-menu");
  menu.id = `beautiful-actions-${++count}`;
  menu.setAttribute("popover", "");
  menu.setAttribute("role", "menu");
  menu.setAttribute("tabindex", "-1");
  menu.dataset.actions = "";
  const point = doc.createElement("beautiful-menu-point");
  point.setAttribute("aria-hidden", "true");
  container.append(point, menu);
  wireMenu(menu);

  const host: Host = { menu, point };
  // Closing is wound up in beforetoggle, which comes at once, however it closes: the toggle event comes a
  // task later, after a pick has run its action, and after a reopen for another opener has merged into it.
  menu.addEventListener("beforetoggle", (event) => {
    if ((event as ToggleEvent).newState !== "closed") return;
    const { options } = host;
    host.options = undefined;
    host.source = undefined;
    host.returnTo = menu.contains(doc.activeElement) ? options?.returnFocus : undefined;
    options?.onToggle?.(false);
  });
  // Escape or a click outside: the browser has put focus back by now, and returnFocus moves it on.
  menu.addEventListener("toggle", () => returnFocus(host));
  menu.addEventListener("keydown", (event) => onSubmenuKey(event));
  menu.addEventListener("pointermove", (event) => onSubmenuPointer(event));
  hosts.set(container, host);
  return host;
}

/** Moves focus to the opener's returnFocus once, if it closed with focus in it. */
function returnFocus(host: Host) {
  const to = host.returnTo;
  host.returnTo = undefined;
  if (to instanceof HTMLElement) to.focus({ preventScroll: true });
}

/** Closes the menu, puts focus back, and only then runs the action, so what it focuses keeps focus. */
function pick(host: Host, then: () => void) {
  if (host.menu.matches(":popover-open")) host.menu.hidePopover();
  returnFocus(host);
  then();
}

/**
 * Opens an action list for this context. Returns false, and opens nothing, when no action shows.
 * The list is read now, so whether each shows, is enabled and is on is as of this moment.
 */
export function openActions<C>(list: ActionList<C>, context: C, options: OpenActionsOptions = {}): boolean {
  const doc = (options.anchor ?? options.labelledBy ?? options.returnFocus)?.ownerDocument ?? document;
  const near = options.anchor ?? (doc.activeElement !== doc.body ? doc.activeElement : null) ?? doc.body;
  const host = hostFor(near);
  const { menu, point } = host;
  const shown = shownActions(list, context);
  if (!shown.length) return false;

  // Closing tells the last opener it closed, in beforetoggle. Focus stays for the new one to take.
  if (menu.matches(":popover-open")) menu.hidePopover();
  host.returnTo = undefined;
  clearTimeout(pointerTimer);
  host.dispose?.();
  menu.replaceChildren();
  host.options = options;
  host.source = options.anchor;

  if (options.labelledBy) {
    if (!options.labelledBy.id) options.labelledBy.id = `${menu.id}-button`;
    menu.setAttribute("aria-labelledby", options.labelledBy.id);
    menu.removeAttribute("aria-label");
  } else {
    menu.setAttribute("aria-label", options.label ?? "Actions");
    menu.removeAttribute("aria-labelledby");
  }

  host.dispose = render(() => <Entries list={shown} context={context} host={host} />, menu);
  // Each submenu is a menu of its own, with Dropdown's keys.
  const unwire = [...menu.querySelectorAll<HTMLElement>('[role="menu"]')].map(wireMenu);
  const dispose = host.dispose;
  host.dispose = () => {
    for (const done of unwire) done();
    dispose();
  };

  let source: HTMLElement | undefined;
  if (options.at) {
    point.style.left = `${options.at.x}px`;
    point.style.top = `${options.at.y}px`;
    source = point;
    menu.dataset.at = "";
    delete menu.dataset.anchor;
  } else {
    source = options.anchor instanceof HTMLElement ? options.anchor : undefined;
    delete menu.dataset.at;
    if (options.side && options.side !== "bottom start") menu.dataset.anchor = options.side;
    else delete menu.dataset.anchor;
  }
  showMenu(menu, options.focus ?? "menu", source);
  options.onToggle?.(true);
  return true;
}

/** Whether the shared menu near this element is open, and from what. */
function openFrom(near: Element) {
  const host = hostFor(near);
  return host.menu.matches(":popover-open") ? host : undefined;
}

// ---- Rendering --------------------------------------------------------------------------------

function Entries<C>(props: { list: ActionList<C>; context: C; host: Host }) {
  return (
    <For each={props.list}>
      {(entry, index) => (
        <>
          <Show when={index() > 0 && (isActionGroup(entry) || isActionGroup(props.list[index() - 1]!))}>
            <hr />
          </Show>
          {isActionGroup(entry) ? (
            <Group group={entry} context={props.context} host={props.host} />
          ) : (
            <Item action={entry} context={props.context} host={props.host} />
          )}
        </>
      )}
    </For>
  );
}

function Group<C>(props: { group: ActionGroup<C>; context: C; host: Host }) {
  const items = () => (
    <For each={props.group.actions}>
      {(action) => <Item action={action} context={props.context} host={props.host} radio={props.group.select === "one"} />}
    </For>
  );
  const id = createUniqueId();
  return (
    <Show when={props.group.heading} fallback={items()}>
      <beautiful-menu-section role="group" aria-labelledby={id}>
        <header id={id} role="presentation">
          {props.group.heading}
        </header>
        {items()}
      </beautiful-menu-section>
    </Show>
  );
}

function Item<C>(props: { action: Action<C>; context: C; host: Host; radio?: boolean }) {
  const action = props.action;
  // Read once, as the menu opens: the list is a snapshot of now, never tracked.
  const disabled = untrack(() => action.enabled?.(props.context) === false);
  const checked = untrack(() => action.active?.(props.context));
  const role = checked === undefined ? "menuitem" : props.radio ? "menuitemradio" : "menuitemcheckbox";
  const content = (
    <>
      {action.icon?.()}
      {action.label}
      <Show when={actionKeys(action)}>{(keys) => <kbd>{keyLabel(keys())}</kbd>}</Show>
      <Show when={!actionKeys(action) && action.shortcut}>{(letter) => <kbd>{letter()}</kbd>}</Show>
      <Show when={action.description}>{(text) => <small>{text()}</small>}</Show>
    </>
  );
  const shared = {
    role,
    "data-color": action.color,
    "aria-checked": checked === undefined ? undefined : checked ? ("true" as const) : ("false" as const),
    // The letter that picks it while the menu is open, or the app-wide keys it shows.
    // A getter, so it follows the person's keys as the shown keys do.
    get "aria-keyshortcuts"() {
      if (action.shortcut) return action.shortcut;
      const keys = actionKeys(action);
      return keys ? ariaKeys(keys) : undefined;
    },
  } as const;

  if (action.actions) {
    const id = createUniqueId();
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <button
          {...shared}
          type="button"
          id={`${id}-item`}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open() ? "true" : "false"}
          aria-controls={id}
          onClick={(event) => openSubmenu(event.currentTarget, event.detail === 0 ? "first" : "none")}
        >
          {content}
        </button>
        <beautiful-menu
          popover=""
          role="menu"
          id={id}
          tabindex="-1"
          data-anchor="right start"
          aria-labelledby={`${id}-item`}
          ref={(el: HTMLElement) => {
            el.addEventListener("toggle", (event) => setOpen((event as ToggleEvent).newState === "open"));
            // Closing with focus in it, as on Escape, focus goes back to its item now. The browser only
            // does that for a popover a button opened, and a later toggle event would race the keys.
            el.addEventListener("beforetoggle", (event) => {
              if ((event as ToggleEvent).newState !== "closed" || !el.contains(el.ownerDocument.activeElement)) return;
              el.ownerDocument.getElementById(`${id}-item`)?.focus({ preventScroll: true });
            });
          }}
        >
          <Entries list={action.actions} context={props.context} host={props.host} />
        </beautiful-menu>
      </>
    );
  }

  const href = untrack(() => action.href?.(props.context));
  const run = () => pick(props.host, () => action.run?.(props.context));
  return (
    <Show
      when={href !== undefined && !disabled}
      fallback={
        <button {...shared} type="button" disabled={disabled} onClick={run}>
          {content}
        </button>
      }
    >
      <a {...shared} href={href} onClick={() => pick(props.host, () => {})}>
        {content}
      </a>
    </Show>
  );
}

// ---- Submenus ---------------------------------------------------------------------------------

/** How long the pointer rests on an item before its submenu opens, as a native menu waits. */
const submenuDelay = 150;
let pointerTimer: ReturnType<typeof setTimeout> | undefined;

const submenuOf = (item: Element) => {
  const id = item.getAttribute("aria-controls");
  return id ? item.ownerDocument.getElementById(id) : null;
};

function openSubmenu(item: HTMLElement, focus: "first" | "menu" | "none") {
  // A wait the pointer started, to close the submenus, mustn't close this one after the keys open it.
  clearTimeout(pointerTimer);
  const submenu = submenuOf(item);
  if (!submenu) return;
  closeSubmenus(item.closest<HTMLElement>('[role="menu"]'), submenu);
  if (submenu.matches(":popover-open")) {
    if (focus === "first") submenu.querySelector<HTMLElement>('[role^="menuitem"]:not(:disabled)')?.focus();
    return;
  }
  showMenu(submenu, focus, item);
}

/** Closes the open submenus of a menu, but the one kept. */
function closeSubmenus(menu: HTMLElement | null, keep?: Element) {
  if (!menu) return;
  // Its own submenus, beside their items or inside a section, not theirs.
  for (const open of menu.querySelectorAll<HTMLElement>('[role="menu"]:popover-open')) {
    if (open !== keep && open.parentElement?.closest('[role="menu"]') === menu) open.hidePopover();
  }
}

function onSubmenuKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (event.key === "ArrowRight" && target.getAttribute("aria-haspopup") === "menu" && !target.matches(":disabled")) {
    event.preventDefault();
    openSubmenu(target, "first");
    return;
  }
  if (event.key === "ArrowLeft") {
    const menu = target.closest<HTMLElement>('[role="menu"]');
    const item = menu && menu.ownerDocument.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(menu.id)}"]`);
    if (!item) return;
    event.preventDefault();
    menu.hidePopover();
    item.focus({ preventScroll: true });
  }
}

function onSubmenuPointer(event: PointerEvent) {
  const item = (event.target as Element).closest<HTMLElement>('[role^="menuitem"]');
  if (!item || event.pointerType === "touch") return;
  // The browser sends a move when what's under a still pointer changes, as when a menu opens under it.
  // A pointer that hasn't moved changes nothing, so a submenu the keys opened stays open.
  if (event.movementX === 0 && event.movementY === 0) return;
  clearTimeout(pointerTimer);
  const menu = item.closest<HTMLElement>('[role="menu"]');
  if (item.getAttribute("aria-haspopup") !== "menu") {
    pointerTimer = setTimeout(() => closeSubmenus(menu), submenuDelay);
    return;
  }
  // Focus stays on the item, so the pointer moving over it doesn't pull focus back out of the submenu and close it.
  if (!item.matches(":disabled")) pointerTimer = setTimeout(() => openSubmenu(item, "none"), submenuDelay);
}

// ---- Regions ----------------------------------------------------------------------------------

export type ContextMenuOptions<C> = {
  /** false: the region doesn't run the actions' keys itself, as an editor binds its own. */
  keys?: boolean;
  /** The menu's name for a screen reader, such as "Actions for Home". Defaults to "Actions". */
  label?: (context: C) => string;
  /**
   * Names the region's actions where a ? sheet or a command palette lists them, such as "Pages".
   * With keys: false the region isn't a scope, so whatever runs its keys names them.
   */
  scope?: string;
  /** Where focus goes when the menu closes. Left out, back where it was. */
  returnFocus?: (target: Element) => Element | undefined;
  /** Called when the menu opens and closes, with the context it opened for. */
  onToggle?: (open: boolean, context: C) => void;
};

/** How long a finger rests before a long press opens the menu. */
const longPress = 500;


/**
 * Makes an element a context menu region: ref={contextMenu(actions, contextOf)}. A right-click, a
 * long press, the ContextMenu key or Shift+F10 in it ask contextOf for the context of what was
 * clicked or has focus. A context opens the menu; undefined leaves the browser's own menu. Left out,
 * contextOf always opens it, for a list of no context. The region is also a shortcut scope for the
 * actions' keys (shortcuts.ts).
 */
export function contextMenu<C>(
  list: ActionList<C> | (() => ActionList<C>),
  contextOf?: (target: Element) => C | undefined,
  options: ContextMenuOptions<C> = {},
) {
  const actions = () => (typeof list === "function" ? list() : list);
  const resolve = (target: Element): { context: C } | undefined => {
    if (!contextOf) return { context: undefined as C };
    const context = contextOf(target);
    return context === undefined ? undefined : { context };
  };
  const open = (target: Element, context: C, how: { at?: { x: number; y: number }; focus: "first" | "menu" }) =>
    openActions(actions(), context, {
      ...how,
      anchor: how.at ? undefined : target,
      label: options.label?.(context),
      returnFocus: options.returnFocus?.(target),
      onToggle: options.onToggle && ((isOpen) => options.onToggle?.(isOpen, context)),
    });

  return (region: HTMLElement) => {
    region.dataset.contextMenu = "";
    const win = region.ownerDocument.defaultView ?? window;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let start: { x: number; y: number } | undefined;
    /** A long press opened the menu, so the click the finger lifting sends isn't a tap. */
    let pressed = false;
    /** A pointer is down in the region. */
    let down = false;

    /**
     * A menu opened while a pointer is down is light-dismissed when it lifts, since the press began
     * outside any menu. So with a pointer down, as where contextmenu comes on the press (macOS, Linux)
     * or a finger is held, the menu opens once it lifts.
     */
    function whenUp(then: () => void) {
      if (!down) return then();
      const go = () => {
        win.removeEventListener("pointerup", go);
        win.removeEventListener("pointercancel", go);
        setTimeout(then);
      };
      win.addEventListener("pointerup", go);
      win.addEventListener("pointercancel", go);
    }

    region.addEventListener("contextmenu", (event) => {
      // Shift keeps the browser's own menu, as Firefox does.
      if (event.shiftKey || event.defaultPrevented) return;
      const target = event.target as Element;
      const touch = (event as PointerEvent).pointerType === "touch";
      // A context menu from the keys has no pointer: it opens at what has focus.
      const fromKeys = event.button !== 2 && !touch && event.clientX === 0 && event.clientY === 0;
      // The keys' own handler below already opened it.
      if (fromKeys && openFrom(region)) return event.preventDefault();
      // On a phone, text being edited keeps the phone's own menu, with its selection handles.
      if (touch && inTextBox(target)) return;
      // A long press the kit timed itself has opened it, or will as the finger lifts.
      if (touch && (pressed || !start)) return event.preventDefault();
      const found = resolve(target);
      if (!found) return;
      event.preventDefault();
      const focused = target.ownerDocument.activeElement ?? target;
      if (fromKeys) return void open(focused, found.context, { focus: "first" });
      if (touch) cancel();
      const at = { x: event.clientX, y: event.clientY };
      whenUp(() => open(target, found.context, { at, focus: "menu" }));
    });

    region.addEventListener("keydown", (event) => {
      const target = event.target as Element;
      if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)) {
        const found = resolve(target);
        if (!found) return;
        event.preventDefault();
        open(target, found.context, { focus: "first" });
        return;
      }
    });
    // The actions' keys, as a shortcut scope: the innermost scope around focus runs them, and text
    // typed in the region, such as a row's rename box, keeps its keys (Delete deletes a letter).
    // A row's rename box keeps every key from the row it renames.
    if (options.keys !== false) addShortcuts(region, actions, contextOf, { inTextBoxes: false, label: options.scope });

    // The press ends wherever the pointer lifts. Listened for per press, so nothing stays on the window.
    const lifted = () => {
      down = false;
      cancel();
      win.removeEventListener("pointerup", lifted);
      win.removeEventListener("pointercancel", lifted);
    };
    region.addEventListener("pointerdown", (event) => {
      down = true;
      pressed = false;
      win.addEventListener("pointerup", lifted);
      win.addEventListener("pointercancel", lifted);
      // A long press, for the browsers that send no contextmenu for one (Safari on iPhone and iPad).
      if (event.pointerType !== "touch" || inTextBox(event.target as Element)) return;
      const target = event.target as Element;
      const at = { x: event.clientX, y: event.clientY };
      start = at;
      clearTimeout(timer);
      timer = setTimeout(() => {
        start = undefined;
        const found = resolve(target);
        if (!found) return;
        pressed = true;
        whenUp(() => open(target, found.context, { at, focus: "menu" }));
      }, longPress);
    });
    const cancel = () => {
      clearTimeout(timer);
      start = undefined;
    };
    region.addEventListener("pointermove", (event) => {
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) cancel();
    });
    region.addEventListener(
      "click",
      (event) => {
        if (!pressed) return;
        pressed = false;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );
  };
}

// ---- The "…" button ---------------------------------------------------------------------------

export type ActionMenuProps<C> = Omit<Extract<IconButtonProps, { href?: never }>, "label" | "onClick" | "children" | "onToggle"> & {
  actions: ActionList<C>;
  context: C;
  /** The button's name and the menu's: "Actions for Home". */
  label: string;
  /** Where the menu sits against the button. Below its end, as a "…" sits at the end of a row. */
  side?: "bottom start" | "bottom end";
  /**
   * false: out of the Tab order and hidden from screen readers, for a row whose own keys reach the
   * menu, such as a Tree's, which opens it with Shift+F10. Give returnFocus the row.
   */
  focusable?: boolean;
  /** Where focus goes when the menu closes. Left out, back to the button. */
  returnFocus?: Element;
  onToggle?: (open: boolean) => void;
  /** In place of the three dots. */
  icon?: JSX.Element;
};

/** A "…" icon button that opens an action list below it. The same list a region's right-click shows. */
export function ActionMenu<C>(props: ActionMenuProps<C>) {
  let button!: HTMLButtonElement;
  const [open, setOpen] = createSignal(false);

  /** The menu was open from this button when the pointer pressed it, which light-dismisses it first. */
  let wasOpen = false;

  function show(focus: "first" | "menu") {
    const host = openFrom(button);
    if (host?.source === button) return host.menu.hidePopover();
    if (wasOpen) return void (wasOpen = false);
    openActions(props.actions, props.context, {
      anchor: button,
      side: props.side ?? "bottom end",
      focus,
      labelledBy: props.focusable === false ? undefined : button,
      label: props.label,
      returnFocus: props.returnFocus,
      onToggle: (isOpen) => {
        setOpen(isOpen);
        props.onToggle?.(isOpen);
      },
    });
  }

  const rest = omit(props, "actions", "context", "label", "side", "focusable", "returnFocus", "onToggle", "icon");

  return (
    <IconButton
      {...(rest as Extract<IconButtonProps, { href?: never }>)}
      ref={(el: HTMLButtonElement) => (button = el)}
      label={props.label}
      variant={props.variant ?? "tertiary"}
      aria-haspopup="menu"
      aria-expanded={open() ? "true" : "false"}
      tabindex={props.focusable === false ? "-1" : undefined}
      aria-hidden={props.focusable === false ? "true" : undefined}
      onPointerDown={() => (wasOpen = openFrom(button)?.source === button)}
      // The pointer's click opens the menu with no item lit; Enter and Space open it on the first.
      onClick={(event: MouseEvent) => show(event.detail === 0 ? "first" : "menu")}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        show("first");
      }}
    >
      {props.icon ?? (
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="4.5" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="15.5" cy="10" r="1.5" />
        </svg>
      )}
    </IconButton>
  );
}

declare module "@solidjs/web" {
  namespace JSX {
    interface IntrinsicElements {
      "beautiful-menu-point": HTMLAttributes<HTMLElement>;
    }
  }
}
