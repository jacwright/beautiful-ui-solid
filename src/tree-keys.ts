/**
 * A Tree's keys as data: what a key does, given the shown items, not their elements. wireTree
 * (tree.ts) reads the entries off static markup, and the Solid Tree (tree.tsx) off its rows, so a
 * tree that renders only the rows in view still moves through every shown item.
 *
 *   - ↓ ↑ move to the next or previous shown item. Home and End go to the first and last.
 *   - → opens a closed item, and on an open one moves to its first child.
 *   - ← closes an open item, and on any other moves to its parent.
 *   - Enter and Space select the focused item. * opens every item at its level under its parent.
 *   - A letter moves to the next shown item whose label starts with it.
 *
 * Menu keys aren't here: the tree or its context menu region opens the menu.
 */

import { createTypeahead, isTypeaheadKey } from "./typeahead.ts";

/** One shown item: its depth from 1, whether it's open (undefined on an item with no children), and its label. */
export type TreeKeyEntry = { level: number; open?: boolean; label: string };

/** What a key does, by index into the shown entries. */
export type TreeKeyIntent =
  | { focus: number }
  | { expand: number; open: boolean }
  | { select: number }
  | { expandAll: number[] };

const moveKeys = new Set(["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"]);

/** The parent of the entry at index `at`: the nearest one before it with a lower level. */
function parentIndex(list: readonly TreeKeyEntry[], at: number) {
  const level = list[at]!.level;
  for (let i = at - 1; i >= 0; i--) if (list[i]!.level < level) return i;
  return -1;
}

/**
 * Makes one tree's key handler, with its own type-ahead. It returns what a key does to the entry
 * at index `at` and prevents the key's default when it does something, or returns undefined.
 */
export function createTreeKeys() {
  const search = createTypeahead<TreeKeyEntry>((entry) => entry.label);

  return function treeKey(event: KeyboardEvent, list: readonly TreeKeyEntry[], at: number): TreeKeyIntent | undefined {
    const entry = list[at];
    if (!entry || event.altKey || event.ctrlKey || event.metaKey) return;
    const searching = search.searching(event);
    // A key that moves ends a search, so the next letter starts a new one.
    if (moveKeys.has(event.key)) {
      search.reset();
      event.preventDefault();
    }
    const focus = (index: number) => (index >= 0 && index < list.length ? { focus: index } : undefined);
    switch (event.key) {
      case "ArrowDown":
        return focus(at + 1);
      case "ArrowUp":
        return focus(at - 1);
      case "Home":
        return focus(0);
      case "End":
        return focus(list.length - 1);
      case "ArrowRight":
        if (entry.open === undefined) return;
        if (!entry.open) return { expand: at, open: true };
        // Its first child, if it has one shown.
        return (list[at + 1]?.level ?? 0) > entry.level ? { focus: at + 1 } : undefined;
      case "ArrowLeft":
        if (entry.open) return { expand: at, open: false };
        return focus(parentIndex(list, at));
      case "Enter":
        event.preventDefault();
        return { select: at };
      case " ":
        // A space within a search is part of it, as in "spring launch".
        if (searching) break;
        event.preventDefault();
        return { select: at };
      case "*": {
        event.preventDefault();
        // The siblings: from the parent on, the closed items at this level, until the parent's level ends.
        const indexes: number[] = [];
        for (let i = parentIndex(list, at) + 1; i < list.length; i++) {
          const other = list[i]!;
          if (other.level < entry.level) break;
          if (other.level === entry.level && other.open === false) indexes.push(i);
        }
        return { expandAll: indexes };
      }
    }
    if (!isTypeaheadKey(event)) return;
    event.preventDefault();
    const found = search.find(event, [...list], at);
    return found ? { focus: list.indexOf(found) } : undefined;
  };
}
