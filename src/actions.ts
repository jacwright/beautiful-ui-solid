/**
 * Actions: one definition of what a person can do to a thing, rendered wherever it's offered. The
 * same list fills a "…" action menu, a right-click context menu, an editor's slash menu or toolbar,
 * and binds its keyboard shortcuts (shortcuts.ts). The spec is the docs site's Context menu page.
 *
 * A list is plain data, usually made once at module level, and generic over the context it acts
 * on: a Tree's node, an editor's state and view. Each surface hands the list its context when it
 * shows it, so enabled, active, hidden and run are functions of that context, asked each time the
 * list is shown, never cached.
 */

import type { JSX } from "@solidjs/web";
import { actionKeys } from "./shortcut-settings.ts";

export type Action<C = void> = {
  /** Stable and unique in its list, such as "rename". A surface keys on it, and a test finds it by it. */
  id: string;
  /** What it does, as a verb: "Rename", "Turn into". */
  label: string;
  /** Draws a fresh icon each time, since one list shows in several places at once. An <svg>. */
  icon?: () => JSX.Element;
  /** A line under the label in a menu. */
  description?: string;
  /** More words a search finds it by, such as a slash menu's: ["h1", "title"] for Heading 1. */
  keywords?: string[];
  /**
   * An app-wide key, as aria-keyshortcuts writes it, with Mod for ⌘ on Apple and Ctrl elsewhere:
   * "Mod+B", "Shift+Mod+Z", "F2", "Delete". Shown at the item's end as ⌘B or Ctrl+B, and run by
   * runActionKey wherever the surface passes its keys to it. A person can set their own or turn them
   * off (shortcut-settings.ts), so a surface reads them through actionKeys(action), never this.
   */
  keys?: string;
  /**
   * Its keys run in a text box too, from a scope around the box. Left out, a text box keeps its own
   * keys: what's typed (a letter, ?, Delete) and its editing keys (⌘Z, ⌘C, ⌘A). A list or tree
   * keeps the letters it picks items by.
   */
  typing?: boolean;
  /** One letter that picks it while its menu is open, as DropdownItem's shortcut. */
  shortcut?: string;
  /** For an action that destroys something. */
  color?: "danger";
  /** Left out of every surface when it returns true. Left out, the action always shows. */
  hidden?: (context: C) => boolean;
  /** Shown faded and skipped when it returns false. Left out, it's always enabled. */
  enabled?: (context: C) => boolean;
  /**
   * Whether it's on now, such as Bold in a bold selection. Given, a menu shows it as a checkbox
   * item, or as a radio item inside a group with select: "one", and a toolbar as a pressed button.
   */
  active?: (context: C) => boolean;
  /** Does it. A menu closes first, then runs it, so focus is back where it was. */
  run?: (context: C) => void;
  /** Makes it a link: a menu item becomes an <a href>. In place of run. */
  href?: (context: C) => string;
  /** Makes it a submenu, such as Turn into › Heading 1. In place of run and href. */
  actions?: ActionList<C>;
};

/** Actions that belong together. A menu draws a line between groups, and a heading names one that has it. */
export type ActionGroup<C = void> = {
  /** Names the group in a menu, as DropdownHeading does. Left out, the group is set off by lines only. */
  heading?: string;
  /** "one": its actions are a set of which one is on, such as a block's type. Their active marks it. */
  select?: "one";
  actions: Action<C>[];
};

/** What a surface shows: actions and groups of them, in order. */
export type ActionList<C = void> = (Action<C> | ActionGroup<C>)[];

/** A group, rather than an action: it has no id. */
export function isActionGroup<C>(entry: Action<C> | ActionGroup<C>): entry is ActionGroup<C> {
  return !("id" in entry);
}

/**
 * The list as a surface shows it for this context: hidden actions left out, then submenus and groups
 * left with nothing in them. For a toolbar or a slash menu that draws the actions itself.
 */
export function shownActions<C>(list: ActionList<C>, context: C): ActionList<C> {
  const shown = (action: Action<C>): Action<C> | undefined => {
    if (action.hidden?.(context)) return undefined;
    if (!action.actions) return action;
    const actions = shownActions(action.actions, context);
    return actions.length ? { ...action, actions } : undefined;
  };
  const out: ActionList<C> = [];
  for (const entry of list) {
    if (isActionGroup(entry)) {
      const actions = entry.actions.flatMap((action) => shown(action) ?? []);
      if (actions.length) out.push({ ...entry, actions });
    } else {
      const action = shown(entry);
      if (action) out.push(action);
    }
  }
  return out;
}

/** Every action in the list, through its groups and submenus, in order. */
export function eachAction<C>(list: ActionList<C>): Action<C>[] {
  return list.flatMap((entry) => {
    const actions = isActionGroup(entry) ? entry.actions : [entry];
    return actions.flatMap((action) => [action, ...(action.actions ? eachAction(action.actions) : [])]);
  });
}

/** Whether this device writes ⌘ for Mod. */
export function isApple() {
  if (typeof navigator === "undefined") return false;
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

const parts = (keys: string) => keys.split("+").map((part) => part.trim());

/** The keys as aria-keyshortcuts writes them: Mod becomes Meta on Apple and Control elsewhere. */
export function ariaKeys(keys: string, apple = isApple()) {
  return parts(keys)
    .map((part) => (part === "Mod" ? (apple ? "Meta" : "Control") : part))
    .join("+");
}

const appleSymbols: Record<string, string> = { Control: "⌃", Alt: "⌥", Shift: "⇧", Meta: "⌘" };
const keySymbols: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Enter: "↵",
  Escape: "Esc",
  Backspace: "⌫",
  Delete: "Del",
};
const otherNames: Record<string, string> = { Control: "Ctrl", Meta: "Win" };

/** The keys as a person reads them: ⇧⌘Z on Apple, in Apple's order, and Ctrl+Shift+Z elsewhere. */
export function keyLabel(keys: string, apple = isApple()) {
  const all = parts(ariaKeys(keys, apple));
  const key = all.pop() ?? "";
  const shown = key.length === 1 ? key.toUpperCase() : (apple && key === "Delete" ? "⌦" : keySymbols[key]) ?? key;
  if (apple) {
    const order = ["Control", "Alt", "Shift", "Meta"];
    return order.filter((mod) => all.includes(mod)).map((mod) => appleSymbols[mod]).join("") + shown;
  }
  const order = ["Control", "Meta", "Alt", "Shift"];
  return [...order.filter((mod) => all.includes(mod)).map((mod) => otherNames[mod] ?? mod), shown].join("+");
}

/** Whether a key press is these keys: the same key, and exactly these modifiers. */
export function matchesKeys(event: KeyboardEvent, keys: string, apple = isApple()) {
  const all = parts(ariaKeys(keys, apple));
  const key = all.pop() ?? "";
  // Shift and macOS's Option change the character a key types, so a letter or digit also matches by the key itself.
  const code = /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : /^\d$/.test(key) ? `Digit${key}` : undefined;
  // Only where the typed character isn't a letter or digit, so a layout that moves letters (AZERTY) still goes by what's typed.
  const typedPlain = /^[a-z0-9]$/i.test(event.key);
  const pressed =
    key.length === 1
      ? event.key.toLowerCase() === key.toLowerCase() || (!typedPlain && code !== undefined && event.code === code)
      : event.key === key;
  return (
    pressed &&
    event.ctrlKey === all.includes("Control") &&
    event.metaKey === all.includes("Meta") &&
    event.altKey === all.includes("Alt") &&
    // A sign such as ? or + is typed with Shift on some layouts and without it on others, so keys
    // that are the sign alone, with no modifier, match it either way.
    (event.shiftKey === all.includes("Shift") || (all.length === 0 && key.length === 1 && !/^[a-z0-9]$/i.test(key)))
  );
}

/** Keys that only say which keys go with the next one. */
const modifierKeys = new Set(["Shift", "Control", "Alt", "Meta", "AltGraph", "CapsLock", "Fn", "FnLock", "Hyper", "Super", "OS"]);

/**
 * The keys a press is, written as an action's keys are: "Shift+Mod+K", "Alt+E", "?". Undefined for a
 * modifier on its own, which is the start of a press, not one.
 */
export function pressedKeys(event: KeyboardEvent, apple = isApple()): string | undefined {
  if (modifierKeys.has(event.key)) return undefined;
  let key = event.key;
  // Option on a Mac and Shift change the character typed (⌥E is ´), so a letter or digit goes by the key itself.
  if (/^Key[A-Z]$/.test(event.code) && (event.altKey || !/^[a-z]$/i.test(key))) key = event.code.slice(3);
  else if (/^Digit\d$/.test(event.code) && (event.altKey || event.shiftKey)) key = event.code.slice(5);
  if (key.length === 1) key = key.toUpperCase();
  const mods: string[] = [];
  if (apple ? event.ctrlKey : false) mods.push("Control");
  if (event.altKey) mods.push("Alt");
  // A sign alone, such as ?, is typed with Shift on some layouts and not on others, so it's written
  // without it, as matchesKeys takes it either way. With another modifier, Shift is matched as pressed.
  const sign = key.length === 1 && !/^[A-Z0-9]$/.test(key);
  const others = event.altKey || event.ctrlKey || event.metaKey;
  if (event.shiftKey && (!sign || others)) mods.push("Shift");
  if (apple ? event.metaKey : event.ctrlKey) mods.push("Mod");
  if (!apple && event.metaKey) mods.push("Meta");
  return [...mods, key].join("+");
}

/**
 * The action that shows for this context, runs, and has the keys pressed, of those allow lets through.
 * Its keys are the ones the person set, if they set some (actionKeys).
 */
export function keyAction<C>(list: ActionList<C>, event: KeyboardEvent, context: C, allow?: (action: Action<C>, keys: string) => boolean) {
  return eachAction(shownActions(list, context)).find((each) => {
    const keys = actionKeys(each);
    return !!keys && !!each.run && matchesKeys(event, keys) && (!allow || allow(each, keys));
  });
}

/**
 * How well an action fits what's typed into a search, as a slash menu or a command palette filters
 * by: its label starts with it (4), a word of its label does (3), a word of a keyword does (2), or
 * it's somewhere in them (1). 0 is no match, and an empty search fits everything (1).
 */
export function actionScore(action: Pick<Action<any>, "label" | "keywords">, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const label = action.label.toLowerCase();
  const keywords = (action.keywords ?? []).map((k) => k.toLowerCase());
  if (label.startsWith(q)) return 4;
  if (label.split(/\s+/).some((w) => w.startsWith(q))) return 3;
  if (keywords.some((k) => k.split(/\s+/).some((w) => w.startsWith(q)))) return 2;
  return [label, ...keywords].some((w) => w.includes(q)) ? 1 : 0;
}

type Searched = Pick<Action<any>, "label" | "keywords">;

/**
 * The items whose action fits the search, best first, and in their own order where they tie. The
 * items are actions, or actionOf finds each one's, as a palette's entries hold theirs.
 */
export function findActions<T extends Searched>(items: T[], query: string): T[];
export function findActions<T>(items: T[], query: string, actionOf: (item: T) => Searched): T[];
export function findActions<T>(items: T[], query: string, actionOf = (item: T) => item as unknown as Searched): T[] {
  return items
    .map((item, order) => ({ item, order, score: actionScore(actionOf(item), query) }))
    .filter((each) => each.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((each) => each.item);
}

/**
 * Runs the action whose keys were pressed, when it shows and is enabled for this context, and stops
 * the browser doing its own thing with them. Returns whether one ran. A shortcut scope (shortcuts.ts)
 * calls it for you; an editor calls it from its own key handling, as ProseMirror's handleKeyDown.
 */
export function runActionKey<C>(list: ActionList<C>, event: KeyboardEvent, context: C): boolean {
  if (event.defaultPrevented || event.isComposing) return false;
  const action = keyAction(list, event, context);
  if (!action) return false;
  event.preventDefault();
  if (action.enabled?.(context) !== false) action.run?.(context);
  return true;
}
