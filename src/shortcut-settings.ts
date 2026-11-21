/**
 * Shortcut settings: a person's own keys, kept in their browser and applied wherever keys are read.
 * WCAG 2.1.4 (Character Key Shortcuts) asks that a person can turn off shortcuts that are a single
 * character, or change them: a speech user who says a word types its letters, and each one would
 * run something. The Shortcut sheet is where a person sets them; the spec is its docs page.
 *
 * Every surface reads an action's keys through actionKeys(), never action.keys: shortcut scopes
 * match by it, and menus, tooltips, the sheet and the palette show it, so a key a person set shows
 * everywhere it runs. It reads a signal, so what shows them follows a change at once.
 */

import { createSignal } from "solid-js";
import type { Action } from "./actions.ts";

export type ShortcutSettings = {
  /** Whether keys that are one character with no ⌘, Ctrl or Alt, such as ? or T, run. On by default. */
  singleKeys: boolean;
  /** The keys a person set for an action, by its id, in place of its own. null turns its keys off. */
  keys: Record<string, string | null>;
};

/** Where they're kept: one entry for every app on the origin. */
export const shortcutSettingsKey = "beautiful:shortcuts";

const defaults: ShortcutSettings = { singleKeys: true, keys: {} };

function stored(): ShortcutSettings {
  try {
    const raw = globalThis.localStorage?.getItem(shortcutSettingsKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<ShortcutSettings>;
    const keys: Record<string, string | null> = {};
    for (const [id, value] of Object.entries(parsed.keys ?? {})) if (typeof value === "string" || value === null) keys[id] = value;
    return { singleKeys: parsed.singleKeys !== false, keys };
  } catch {
    // Storage that's blocked, or an entry that isn't ours, leaves the keys as the app set them.
    return defaults;
  }
}

const [settings, setSettings] = createSignal<ShortcutSettings>(stored(), { ownedWrite: true });

// A change in another tab of the same app applies here too.
globalThis.addEventListener?.("storage", (event: StorageEvent) => {
  if (event.key === shortcutSettingsKey) setSettings(stored());
});

/** The person's settings now. Reading it in a memo or JSX tracks it. */
export function shortcutSettings(): ShortcutSettings {
  return settings();
}

/** Replaces the person's settings and keeps them, so they last through a reload. */
export function setShortcutSettings(next: ShortcutSettings) {
  setSettings(next);
  try {
    const plain = next.singleKeys && !Object.keys(next.keys).length;
    if (plain) globalThis.localStorage?.removeItem(shortcutSettingsKey);
    else globalThis.localStorage?.setItem(shortcutSettingsKey, JSON.stringify(next));
  } catch {
    // Blocked storage: the change holds until the page reloads.
  }
}

/** Sets one action's keys: a string, null for none, or undefined to go back to the action's own. */
export function setActionKeys(id: string, keys: string | null | undefined) {
  const now = settings();
  const { [id]: _, ...others } = now.keys;
  setShortcutSettings({ ...now, keys: keys === undefined ? others : { ...others, [id]: keys } });
}

/** Turns single-character keys on or off. */
export function setSingleKeys(on: boolean) {
  setShortcutSettings({ ...settings(), singleKeys: on });
}

/** Whether these keys are one character with no ⌘, Ctrl or Alt, as ?, T or Shift+T: WCAG's character key shortcut. */
export function isSingleKey(keys: string) {
  const all = keys.split("+").map((part) => part.trim());
  const key = all.pop() ?? "";
  return key.length === 1 && all.every((mod) => mod === "Shift");
}

/** Whether the person set this action's keys, or turned them off, in place of its own. */
export function hasOwnKeys(action: Pick<Action<any>, "id">) {
  return action.id in settings().keys;
}

/**
 * The keys that run this action and show beside it: the ones the person set, or its own; none when
 * they turned them off, or when they're a single character and single-character keys are off.
 */
export function actionKeys(action: Pick<Action<any>, "id" | "keys">): string | undefined {
  const now = settings();
  const keys = action.id in now.keys ? now.keys[action.id] : action.keys;
  if (!keys) return undefined;
  if (!now.singleKeys && isSingleKey(keys)) return undefined;
  return keys;
}
