/**
 * The keys and pointer of a Tree: what the platform lacks for APG's Tree View pattern. The tree is
 * a <beautiful-tree role="tree"> whose direct children are its items, flat, each with role="treeitem"
 * and aria-level. An item with children has aria-expanded, and the children of a closed item are
 * hidden. The selected item has aria-selected="true". The tree is one Tab stop: the selected item,
 * or the first, has tabindex="0" and the rest "-1", and focus moves among them by the arrow keys.
 *
 *   - ↓ ↑ move to the next or previous shown item. Home and End go to the first and last.
 *   - → opens a closed item, and on an open one moves to its first child.
 *   - ← closes an open item, and on any other moves to its parent.
 *   - Enter and Space select the focused item. * opens every item at its level under its parent.
 *   - A letter moves to the next shown item whose label starts with it.
 *   - Shift+F10 and the ContextMenu key open the focused item's menu, as its "..." button does.
 *   - A click selects an item. A click on its chevron, or a double click, opens or closes it.
 *     With data-chevron="icon" on the tree, the chevron is in the icon's place (tree.css).
 *   - Once wired, the tree has data-animate, so rows it shows grow in and rows it hides shrink away.
 *
 * The keys are tree-keys.ts's. Moving focus never selects: selecting shows something, such as a page, so it waits for a click or
 * a key. It works on static markup, where it sets the attributes itself. A component that holds the
 * state passes onSelect and onExpand, and sets them from its own. The spec is the docs site's Tree page.
 */

import { createTreeKeys } from "./tree-keys.ts";

const itemSelector = ':scope > [role="treeitem"]';

export type WireTreeOptions = {
  /** An item was picked. Without it, the tree moves aria-selected itself. */
  onSelect?: (item: HTMLElement) => void;
  /** An item is to open or close. Without it, the tree sets aria-expanded and hides the children itself. */
  onExpand?: (item: HTMLElement, open: boolean) => void;
  /** Opens an item's menu from the keyboard. Without it, the tree clicks the item's "..." button. */
  onMenu?: (item: HTMLElement) => void;
  /**
   * false: the tree leaves right-click, Shift+F10 and the ContextMenu key alone, for a context menu
   * region (context-menu.tsx) on the same element to open the menu. The Solid Tree passes it.
   */
  menus?: boolean;
  /**
   * false: the tree leaves the arrow keys, Enter, Space, * and type-ahead alone, for a component
   * that renders only the rows in view and so moves through its own data (tree-keys.ts).
   */
  keys?: boolean;
};

/** An item's depth, from 1. */
export const levelOf = (item: Element) => Number(item.getAttribute("aria-level")) || 1;

/** An item's label: its beautiful-tree-label's text, without the end. */
export const treeItemLabel = (item: Element) =>
  (item.querySelector("beautiful-tree-label") ?? item).textContent?.replace(/\s+/g, " ").trim() ?? "";

/** Hides the children of every closed item, and shows the rest. */
export function showOpenItems(tree: HTMLElement) {
  let closedAt = Infinity;
  for (const item of tree.querySelectorAll<HTMLElement>(itemSelector)) {
    const level = levelOf(item);
    if (level <= closedAt) closedAt = Infinity;
    const hidden = level > closedAt;
    item.hidden = hidden;
    if (!hidden && item.getAttribute("aria-expanded") === "false") closedAt = level;
  }
}

/** Wires one tree. Returns a function that removes everything it added. */
export function wireTree(tree: HTMLElement, options: WireTreeOptions = {}): () => void {
  const doc = tree.ownerDocument;
  const treeKey = createTreeKeys();

  const all = () => [...tree.querySelectorAll<HTMLElement>(itemSelector)];
  const shown = () => all().filter((item) => !item.hidden);
  const itemOf = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>('[role="treeitem"]') : null;
  const isOpen = (item: HTMLElement) => item.getAttribute("aria-expanded") === "true";
  const isParent = (item: HTMLElement) => item.hasAttribute("aria-expanded");

  /** Moves the one Tab stop to this item and focuses it. */
  function focus(item: HTMLElement | undefined) {
    if (!item) return;
    for (const other of all()) other.tabIndex = other === item ? 0 : -1;
    item.focus();
  }

  function select(item: HTMLElement) {
    if (item.getAttribute("aria-disabled") === "true") return;
    if (options.onSelect) return options.onSelect(item);
    for (const other of all()) {
      if (other === item) other.setAttribute("aria-selected", "true");
      else other.removeAttribute("aria-selected");
    }
  }

  function expand(item: HTMLElement, open: boolean) {
    if (!isParent(item) || isOpen(item) === open) return;
    if (options.onExpand) options.onExpand(item, open);
    else {
      item.setAttribute("aria-expanded", String(open));
      showOpenItems(tree);
    }
  }

  function openMenu(item: HTMLElement) {
    if (options.onMenu) return options.onMenu(item);
    item.querySelector<HTMLElement>(":scope > [data-tree-actions]")?.click();
  }

  function onKey(event: KeyboardEvent) {
    const item = itemOf(event.target);
    if (!item || event.target !== item) return;
    if (options.menus !== false && ((event.key === "F10" && event.shiftKey) || event.key === "ContextMenu")) {
      event.preventDefault();
      return openMenu(item);
    }
    if (options.keys === false) return;
    const list = shown();
    // The label is read only by type-ahead, so the arrow keys don't read every row's text.
    const entries = list.map((other) => ({
      level: levelOf(other),
      open: isParent(other) ? isOpen(other) : undefined,
      get label() {
        return treeItemLabel(other);
      },
    }));
    const intent = treeKey(event, entries, list.indexOf(item));
    if (!intent) return;
    if ("focus" in intent) focus(list[intent.focus]);
    else if ("expand" in intent) expand(list[intent.expand]!, intent.open);
    else if ("select" in intent) select(list[intent.select]!);
    else for (const index of intent.expandAll) expand(list[index]!, true);
  }

  /**
   * Whether a click landed on the item's chevron: its ::before, just before the first child, with
   * the gap after it. The indent before it is the row's, and a click there selects.
   */
  function onChevron(item: HTMLElement, event: MouseEvent) {
    const first = item.firstElementChild?.getBoundingClientRect();
    if (!first) return false;
    // With chevron="icon", the chevron sits over the icon, the first child.
    if (getComputedStyle(item, "::before").position === "absolute") {
      return event.clientX >= first.left && event.clientX <= first.right;
    }
    const style = getComputedStyle(item);
    const reach = parseFloat(getComputedStyle(item, "::before").width) + (parseFloat(style.columnGap) || 0);
    if (style.direction === "rtl") return event.clientX > first.right && event.clientX <= first.right + reach;
    return event.clientX < first.left && event.clientX >= first.left - reach;
  }

  function onClick(event: MouseEvent) {
    const item = itemOf(event.target);
    if (!item) return;
    const actions = (event.target as Element).closest("[data-tree-actions]");
    if (actions) {
      // A component that opens the menu itself, as the Solid Tree does, marks the row itself too.
      if (options.menus !== false) markMenuOpen(item, actions as HTMLElement);
      return;
    }
    focus(item);
    if (isParent(item) && onChevron(item, event)) return expand(item, !isOpen(item));
    select(item);
  }

  function onDoubleClick(event: MouseEvent) {
    const item = itemOf(event.target);
    if (!item || (event.target as Element).closest("[data-tree-actions]")) return;
    if (isParent(item) && !onChevron(item, event)) expand(item, !isOpen(item));
  }

  /** The "..." button keeps focus on its row, so the menu hands focus back to the row when it closes. */
  function onPointerDown(event: PointerEvent) {
    if ((event.target as Element).closest("[data-tree-actions]")) event.preventDefault();
  }

  /** Lights the row while its menu is open, until the menu closes. */
  function markMenuOpen(item: HTMLElement, button: HTMLElement) {
    const id = button.getAttribute("commandfor");
    const menu = id ? doc.getElementById(id) : null;
    if (!menu) return;
    for (const other of all()) other.removeAttribute("data-menu-open");
    item.setAttribute("data-menu-open", "");
    const closed = (event: Event) => {
      if ((event as ToggleEvent).newState !== "closed") return;
      item.removeAttribute("data-menu-open");
      menu.removeEventListener("toggle", closed);
    };
    menu.addEventListener("toggle", closed);
  }

  /** Right-click on an item opens its menu, as its "..." button does. */
  function onContextMenu(event: MouseEvent) {
    if (event.shiftKey || options.menus === false) return;
    const item = itemOf(event.target);
    if (!item || (!item.querySelector(":scope > [data-tree-actions]") && !options.onMenu)) return;
    event.preventDefault();
    focus(item);
    openMenu(item);
  }

  const listeners: [string, (event: never) => void][] = [
    ["keydown", onKey],
    ["click", onClick],
    ["dblclick", onDoubleClick],
    ["pointerdown", onPointerDown],
    ["contextmenu", onContextMenu],
  ];
  for (const [type, listener] of listeners) tree.addEventListener(type, listener as EventListener);
  // Rows shown from here on grow in. The ones already on the page don't, as the page loads.
  const frame = requestAnimationFrame(() => tree.setAttribute("data-animate", ""));
  return () => {
    cancelAnimationFrame(frame);
    tree.removeAttribute("data-animate");
    for (const [type, listener] of listeners) tree.removeEventListener(type, listener as EventListener);
  };
}
