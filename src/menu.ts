/**
 * The keys and pointer of a menu: what a Dropdown adds that the platform lacks. The menu is a
 * <beautiful-menu popover role="menu" tabindex="-1">, opened by a button with commandfor and
 * command="toggle-popover", and its items are elements with role="menuitem". The browser already
 * opens and closes it, closes it on Escape and a click outside, and returns focus to the button.
 *
 * This adds, from the APG menu button pattern and Headless UI's Menu:
 *   - ↓ or ↑ on the button opens the menu on its first or last item. Enter or Space opens it on
 *     the first item, and a click opens it with focus on the menu and no item lit.
 *   - In the menu, ↓ ↑ move and wrap, Home and End go to the ends, an item's aria-keyshortcuts
 *     letter picks it, and any other letter moves to the next item whose label starts with it.
 *   - Space picks a link item, as Enter does. Picking an item closes the menu.
 *   - Tab and Shift+Tab walk the items, as without JS. Focus leaving the menu and its button
 *     closes it, as Popover's does.
 *   - The pointer over an item moves focus to it, and leaving the menu puts focus back on the menu.
 *
 * It works on static markup too. The spec is the docs site's Dropdown page.
 */

import { createTypeahead, isTypeaheadKey } from "./typeahead.ts";

/** An item: an action or link (menuitem), or one that is on or off (menuitemcheckbox, menuitemradio). */
const itemSelector = '[role^="menuitem"]';

/** Where focus goes when a menu next opens, set by its button's keys or by showMenu. */
const openings = new WeakMap<HTMLElement, "first" | "last" | "menu" | "none">();

/**
 * Opens a menu from code, such as a context menu at the pointer: focus goes to its first item, to
 * the menu itself with no item lit, as a pointer opens one, or stays where it is ("none"), as a
 * submenu opens under a resting pointer. The source is its anchor.
 */
export function showMenu(menu: HTMLElement, from: "first" | "menu" | "none", source?: HTMLElement) {
  // Focus moves now, not on the toggle event, which comes a task later, after keys typed in between.
  openings.set(menu, "none");
  menu.showPopover({ source });
  if (from === "first") {
    const first = [...menu.querySelectorAll<HTMLElement>(`${itemSelector}:not(:disabled)`)].find((item) => ownedBy(menu, item));
    first?.focus({ preventScroll: true });
  }
  else if (from === "menu") menu.focus({ preventScroll: true });
}

/** Whether an element belongs to this menu, not to a submenu nested in it. */
const ownedBy = (menu: HTMLElement, el: Element | null) => el?.closest('[role="menu"]') === menu;

/** Wires one menu and its button. Returns a function that removes everything it added. */
export function wireMenu(menu: HTMLElement): () => void {
  const doc = menu.ownerDocument;
  const button = doc.querySelector<HTMLElement>(`[commandfor="${CSS.escape(menu.id)}"][command="toggle-popover"]`);
  const search = createTypeahead<HTMLElement>(itemLabel);

  const items = () =>
    [...menu.querySelectorAll<HTMLElement>(itemSelector)].filter((item) => ownedBy(menu, item) && !item.matches(":disabled"));
  const focus = (item: HTMLElement | undefined) => item?.focus({ preventScroll: true });

  function onButtonKey(event: KeyboardEvent) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const end = event.key === "ArrowDown" ? "first" : "last";
    if (menu.matches(":popover-open")) return focus(end === "first" ? items()[0] : items().at(-1));
    openings.set(menu, end);
    menu.showPopover({ source: button ?? undefined });
  }

  // A click from Enter or Space has no pointer, so its detail is 0. It runs before the button's command.
  function onButtonClick(event: MouseEvent) {
    openings.set(menu, event.detail === 0 ? "first" : "menu");
  }

  function onToggle(event: Event) {
    const from = openings.get(menu) ?? "menu";
    // A keyboard click that closed the menu set it too, so it never outlives this toggle.
    openings.delete(menu);
    if ((event as ToggleEvent).newState !== "open" || from === "none" || !menu.matches(":popover-open")) return;
    const list = items();
    if (from === "first" && list[0]) focus(list[0]);
    else if (from === "last" && list.length) focus(list.at(-1));
    else menu.focus({ preventScroll: true });
  }

  function onMenuKey(event: KeyboardEvent) {
    // A submenu's keys are its own.
    if (!ownedBy(menu, event.target as Element)) return;
    const list = items();
    const at = list.indexOf(doc.activeElement as HTMLElement);
    const searching = search.searching(event);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        return focus(list[(at + 1) % list.length]);
      case "ArrowUp":
        event.preventDefault();
        return focus(list[at <= 0 ? list.length - 1 : at - 1]);
      case "Home":
        event.preventDefault();
        return focus(list[0]);
      case "End":
        event.preventDefault();
        return focus(list.at(-1));
      case " ": {
        // A space within a search is part of it, as in "move to".
        if (searching) break;
        const item = (event.target as Element).closest<HTMLElement>(itemSelector);
        // A button item clicks itself on Space. A link doesn't, and the menu itself would scroll the page.
        if (!item || item instanceof HTMLAnchorElement) event.preventDefault();
        if (item instanceof HTMLAnchorElement) item.click();
        return;
      }
    }
    if (!isTypeaheadKey(event)) return;
    const key = event.key.toLowerCase();

    // A letter in the middle of a search goes on with the search, so typing a label never picks another item.
    const picked = searching ? undefined : list.find((item) => item.getAttribute("aria-keyshortcuts")?.toLowerCase() === key);
    if (picked) {
      event.preventDefault();
      focus(picked);
      picked.click();
      return;
    }

    event.preventDefault();
    focus(search.find(event, list, at));
  }

  function onMenuClick(event: MouseEvent) {
    const item = (event.target as Element).closest<HTMLElement>(itemSelector);
    // An item that opens a submenu leaves the menu open. Any other, in this menu or a submenu, closes it.
    if (item && !item.matches(":disabled") && !item.hasAttribute("aria-haspopup") && menu.matches(":popover-open")) {
      menu.hidePopover();
    }
  }

  function onFocusOut(event: FocusEvent) {
    const to = event.relatedTarget;
    // No relatedTarget: focus left the page, or a click landed on nothing focusable, which light dismiss handles.
    if (!(to instanceof Node) || menu.contains(to) || button?.contains(to)) return;
    // A submenu stays open while focus is on the item that opened it, as the pointer passes over it.
    if (to instanceof Element && to.getAttribute("aria-controls") === menu.id) return;
    if (menu.matches(":popover-open")) menu.hidePopover();
  }

  function onPointerMove(event: PointerEvent) {
    const item = (event.target as Element).closest<HTMLElement>(itemSelector);
    if (item && ownedBy(menu, item) && item !== doc.activeElement && !item.matches(":disabled")) focus(item);
  }

  function onPointerLeave() {
    // Focus in a submenu stays there: the pointer leaving both keeps the submenu open.
    if (menu.contains(doc.activeElement) && doc.activeElement !== menu && ownedBy(menu, doc.activeElement)) {
      menu.focus({ preventScroll: true });
    }
  }

  const listeners: [EventTarget | null, string, (event: never) => void][] = [
    [button, "keydown", onButtonKey],
    [button, "click", onButtonClick],
    [menu, "toggle", onToggle],
    [menu, "keydown", onMenuKey],
    [menu, "click", onMenuClick],
    [menu, "focusout", onFocusOut],
    [button, "focusout", onFocusOut],
    [menu, "pointermove", onPointerMove],
    [menu, "pointerleave", onPointerLeave],
  ];
  for (const [target, type, listener] of listeners) target?.addEventListener(type, listener as EventListener);
  return () => {
    for (const [target, type, listener] of listeners) target?.removeEventListener(type, listener as EventListener);
  };
}

/** An item's label: its text, less its icon, shortcut and description. */
export function itemLabel(item: Element) {
  let text = "";
  for (const node of item.childNodes) {
    if (node instanceof Element && node.matches("kbd, small, svg")) continue;
    text += node.textContent;
  }
  return text.replace(/\s+/g, " ").trim();
}
