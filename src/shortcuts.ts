/**
 * Shortcuts: one keyboard shortcut system for a whole app, on the action model (actions.ts). The spec
 * is the docs site's Shortcuts page.
 *
 * Any element can be a scope: the app's root, a Tree, an editor, an open dialog. A scope is an action
 * list, the same list its menus show, so a key, its menu item and its tooltip can't disagree. Each
 * scope's element listens for the key presses that bubble up to it, so the innermost scope with a
 * shown action for those keys runs it, and the scopes further out find the press handled. An open
 * modal dialog or a menu is a wall: no scope outside it runs. A component inside a scope that handles
 * a key itself, and stops its default, runs first, since its listener is further in.
 */

import { untrack } from "solid-js";
import { type Action, type ActionList, ariaKeys, eachAction, isApple, keyAction, keyLabel, shownActions } from "./actions.ts";
import { actionKeys, isSingleKey, shortcutSettings } from "./shortcut-settings.ts";

export type ShortcutOptions = {
  /** Names the scope where its shortcuts are listed, such as a ? sheet's "Editor" section. */
  label?: string;
  /**
   * false: a text box inside the scope keeps every key, not only what's typed, as a row's rename box
   * keeps F2 and ⌘D from the row it renames. Context menu regions pass it.
   */
  inTextBoxes?: boolean;
};

type Scope = {
  list: () => ActionList<any>;
  contextOf?: (target: Element) => unknown;
  label?: string;
  inTextBoxes: boolean;
};

const scopes = new WeakMap<Element, Scope[]>();
/**
 * Each scope element's own listener, which knows its element. Not event.currentTarget: Solid's
 * delegated events redefine it on the event as they pass, and leave it pointing at their own node.
 */
const listeners = new WeakMap<Element, (event: Event) => void>();

/** Keys the browser keeps for its own tabs and windows. A page never gets them reliably, so none is bound. */
export const reservedKeys = ["Mod+W", "Shift+Mod+W", "Mod+T", "Shift+Mod+T", "Mod+N", "Shift+Mod+N", "Mod+L", "Mod+Q", "Control+Tab", "Shift+Control+Tab"];

/** A text box's own editing keys, which it keeps from every scope around it. */
const editingKeys = ["Mod+Z", "Shift+Mod+Z", "Mod+Y", "Mod+A", "Mod+C", "Mod+X", "Mod+V", "Shift+Mod+V", "Mod+Backspace", "Mod+Delete", "Alt+Backspace", "Alt+Delete"];

/** The keys in one spelling, so "Shift+Mod+Z" and "Mod+Shift+z" compare equal. */
function normal(keys: string, apple: boolean) {
  const all = ariaKeys(keys, apple).split("+");
  const key = (all.pop() ?? "").toLowerCase();
  return [...all.sort(), key].join("+");
}

/** Each fixed set of keys in its one spelling, made once per platform. */
const spelled = new Map<string, Set<string>>();
function inSet(name: "reserved" | "editing", keys: string, apple: boolean) {
  const id = `${name}:${apple}`;
  let set = spelled.get(id);
  if (!set) spelled.set(id, (set = new Set((name === "reserved" ? reservedKeys : editingKeys).map((each) => normal(each, apple)))));
  return set.has(normal(keys, apple));
}

/**
 * What's wrong with a list's keys, as sentences: two actions with the same keys, which can't both
 * run, and keys the browser keeps. Checked for Apple and for everything else, since Mod differs.
 * Empty when it's fine. A scope warns with these in development, and tests assert there are none.
 */
export function shortcutProblems(list: ActionList<any>): string[] {
  const problems = new Set<string>();
  for (const apple of [true, false]) {
    const seen = new Map<string, Action<any>>();
    for (const action of eachAction(list)) {
      if (!action.keys) continue;
      if (inSet("reserved", action.keys, apple)) problems.add(`"${action.id}" uses ${action.keys}, which the browser keeps.`);
      const key = normal(action.keys, apple);
      const other = seen.get(key);
      if (other) problems.add(`"${other.id}" and "${action.id}" both use ${action.keys}.`);
      else seen.set(key, action);
    }
  }
  return [...problems];
}

const dev = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

/** What's typed into: a text input, a textarea, a select, editable content. */
const textBoxes = 'input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"], [type="image"]), textarea, select, [contenteditable]:not([contenteditable="false"])';
/** Widgets that pick an item by the letter typed (typeahead), so they keep single characters. */
const typeaheads = '[role="listbox"], [role="combobox"], [role="tree"], [role="grid"], [role="treegrid"]';

/** Whether this element is, or is in, something typed into. Context menu asks it too. */
export const inTextBox = (el: Element) => !!el.closest(textBoxes);

/** Whether the element with focus keeps these keys from a scope outside it, by the keys alone. */
function keeps(owner: "text" | "typeahead" | "all", keys: string, apple: boolean) {
  if (owner === "all") return true;
  const all = ariaKeys(keys, apple).split("+");
  const key = all.pop() ?? "";
  const plain = !all.some((mod) => mod === "Control" || mod === "Meta" || mod === "Alt");
  if (owner === "typeahead") return plain && key.length === 1;
  if (plain) return key !== "Escape" && !/^F\d+$/.test(key);
  if (/^(Arrow|Home$|End$|Page)/.test(key)) return true;
  return inSet("editing", keys, apple);
}

/** Who keeps keys from this scope's element: the text box or list with focus, when it's further in. */
function ownerFor(scope: Scope, el: Element, target: Element): "text" | "typeahead" | "all" | undefined {
  const text = target.closest(textBoxes);
  // A scope inside the text box, or on it, is the box's own, as an editor's: it gets every key.
  if (text && !text.contains(el)) return scope.inTextBoxes ? "text" : "all";
  const typeahead = text ? undefined : target.closest(typeaheads);
  if (typeahead && !typeahead.contains(el)) return "typeahead";
  return undefined;
}

/** The topmost open modal dialog, which nothing outside of runs while it's open, but for one passed over. */
function topModal(doc: Document, over?: Element) {
  const modals = [...doc.querySelectorAll("dialog:modal")].filter((each) => each !== over);
  return modals[modals.length - 1];
}

const isWall = (el: Element) => el.matches('dialog:modal, [aria-modal="true"], [role="menu"]');

/** Whether a key press from target reaches the scopes on el: no wall stands between them. */
function reaches(target: Element, el: Element, over?: Element) {
  const modal = topModal(target.ownerDocument, over);
  if (modal && !modal.contains(target)) return false;
  for (let at: Element | null = target; at && at !== el; at = at.parentElement) if (isWall(at)) return false;
  return true;
}

/** The scope's context for this target, or nothing when contextOf has none, so the scope sits this press out. */
function contextFor(scope: Scope, target: Element): { context: unknown } | undefined {
  if (!scope.contextOf) return { context: undefined };
  const context = scope.contextOf(target);
  return context === undefined ? undefined : { context };
}

function onKey(event: KeyboardEvent, el: Element) {
  if (event.defaultPrevented || event.isComposing) return;
  const target = event.target instanceof Element ? event.target : el;
  // A letter held down types it again and again; it runs its action once.
  if (event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) return;
  if (!reaches(target, el)) return;
  const apple = isApple();
  for (const scope of scopes.get(el) ?? []) {
    const found = contextFor(scope, target);
    if (!found) continue;
    const owner = ownerFor(scope, el, target);
    const action = keyAction(scope.list(), event, found.context, (each, keys) => {
      if (inSet("reserved", keys, apple)) return false;
      return !owner || (each.typing === true && owner !== "all") || !keeps(owner, keys, apple);
    });
    if (!action) continue;
    event.preventDefault();
    if (action.enabled?.(found.context) !== false) action.run?.(found.context);
    return;
  }
}

/**
 * Makes an element a shortcut scope for this list, and returns what undoes it. For a scope that
 * isn't a JSX element, such as document.body for an app's own keys. In JSX, use the shortcuts ref.
 * contextOf works as contextMenu's: what the key press acts on, from the element with focus; when
 * it returns undefined, this scope sits the press out and the next one out gets it.
 */
export function addShortcuts<C>(
  el: Element,
  list: ActionList<C> | (() => ActionList<C>),
  contextOf?: (target: Element) => C | undefined,
  options: ShortcutOptions = {},
): () => void {
  const scope: Scope = {
    list: typeof list === "function" ? list : () => list,
    contextOf,
    label: options.label,
    inTextBoxes: options.inTextBoxes !== false,
  };
  // Read once to check it, outside any tracking scope, as a ref runs inside one.
  if (dev) for (const problem of untrack(() => shortcutProblems(scope.list()))) console.warn(`Shortcuts: ${problem}`);
  const had = scopes.get(el);
  scopes.set(el, [...(had ?? []), scope]);
  if (!had) {
    const listener = (event: Event) => onKey(event as KeyboardEvent, el);
    listeners.set(el, listener);
    el.addEventListener("keydown", listener);
  }
  (el as HTMLElement).dataset.shortcuts = "";
  return () => {
    const left = (scopes.get(el) ?? []).filter((each) => each !== scope);
    if (left.length) return void scopes.set(el, left);
    scopes.delete(el);
    const listener = listeners.get(el);
    if (listener) el.removeEventListener("keydown", listener);
    listeners.delete(el);
    delete (el as HTMLElement).dataset.shortcuts;
  };
}

/**
 * A ref that makes an element a shortcut scope: ref={shortcuts(actions)}. The scope lasts as long
 * as the element: once it leaves the page, no key press reaches it.
 */
export function shortcuts<C>(
  list: ActionList<C> | (() => ActionList<C>),
  contextOf?: (target: Element) => C | undefined,
  options?: ShortcutOptions,
) {
  return (el: Element) => void addShortcuts(el, list, contextOf, options);
}

export type ReachableShortcut = {
  action: Action<any>;
  /** What the action acts on, from its scope's contextOf: pass it to run, enabled and active. */
  context: unknown;
  /** The scope's label, from its options. */
  scope?: string;
  /** Its keys: the ones the person set, or its own (actionKeys). None when it has none, or they're off. */
  keys?: string;
  /**
   * Its keys don't run from here: a scope further in binds the same keys, the text box or list with
   * focus keeps them, or the browser does. It still runs from a palette.
   */
  shadowed: boolean;
  /** Whether it runs for its context now. A palette shows it faded when it doesn't; a sheet leaves it out. */
  enabled: boolean;
};

/** One scope's part of what's reachable, as a palette or a ? sheet shows it under a heading. */
export type ShortcutSection = { scope?: string; shortcuts: ReachableShortcut[] };

/**
 * What's reachable, in sections by scope, innermost first, keeping that order: each run of entries
 * with the same scope label is one section. A scope with no label has a section with no heading.
 */
export function shortcutSections(reached: ReachableShortcut[]): ShortcutSection[] {
  const sections: ShortcutSection[] = [];
  for (const each of reached) {
    const last = sections.at(-1);
    if (last && last.scope === each.scope) last.shortcuts.push(each);
    else sections.push({ scope: each.scope, shortcuts: [each] });
  }
  return sections;
}

/**
 * Every action a person can reach from this element, innermost scope first: what a ⌘K command
 * palette lists, and a ? sheet of shortcuts. The actions that show for their context and do
 * something; a submenu's actions are listed in its place. From the element with focus by default:
 * an action that opens a palette or a sheet asks before it moves focus, so the list is what was
 * reachable from where the person was. over is a modal dialog to see past, as the sheet itself, which
 * lists what's reachable again while it's open, when the person changes keys. Once the palette has closed and focus is back, run one with
 * entry.action.run?.(entry.context), or follow entry.action.href?.(entry.context) for a link.
 */
export function reachableShortcuts(from: Element = document.activeElement ?? document.body, over?: Element): ReachableShortcut[] {
  const out: ReachableShortcut[] = [];
  const taken = new Set<string>();
  const apple = isApple();
  for (let el: Element | null = from; el; el = el.parentElement) {
    if (!reaches(from, el, over)) break;
    for (const scope of scopes.get(el) ?? []) {
      const found = contextFor(scope, from);
      if (!found) continue;
      const owner = ownerFor(scope, el, from);
      for (const action of eachAction(shownActions(scope.list(), found.context))) {
        if (action.actions || !(action.run || action.href)) continue;
        const keys = actionKeys(action);
        const works =
          !!keys && !!action.run && !inSet("reserved", keys, apple) &&
          (!owner || (action.typing === true && owner !== "all") || !keeps(owner, keys, apple));
        const key = keys ? normal(keys, apple) : undefined;
        out.push({
          action,
          keys,
          context: found.context,
          scope: scope.label,
          shadowed: !!keys && (!works || taken.has(key!)),
          enabled: action.enabled?.(found.context) !== false,
        });
        if (works) taken.add(key!);
      }
    }
  }
  return out;
}

/**
 * Why a person can't give an action these keys, as a sentence, or undefined when they can: the ones
 * shortcutProblems refuses in an app's own list. Keys the browser keeps, and keys another action that
 * reaches from here already has (reached, from reachableShortcuts), since only one of them would run.
 * A single character too, while single-character keys are off.
 */
export function keysProblem(action: Pick<Action<any>, "id">, keys: string, reached: ReachableShortcut[]): string | undefined {
  const label = keyLabel(keys);
  for (const apple of [true, false]) {
    if (inSet("reserved", keys, apple)) return `${label} is the browser's.`;
  }
  if (!shortcutSettings().singleKeys && isSingleKey(keys)) return `Single-key shortcuts are off. Add ${isApple() ? "⌘, ⌃ or ⌥" : "Ctrl or Alt"}.`;
  const apple = isApple();
  const other = reached.find((each) => each.action.id !== action.id && each.keys && normal(each.keys, apple) === normal(keys, apple));
  return other ? `${other.action.label} already uses ${label}.` : undefined;
}
