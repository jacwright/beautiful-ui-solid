/**
 * The docs site's theme and mode toggles. index.html applies the stored values before first paint.
 * Each setting has a few values. Its toggle button steps to the next, round to the first, and its key does
 * the same from anywhere.
 */
export const settings = {
  theme: { key: "ui-docs:theme", label: "Theme", values: ["modern", "glass", "classic"], shortcut: "t" },
  mode: { key: "ui-docs:mode", label: "Mode", values: ["light", "dark"], shortcut: "m" },
} as const;

export type Setting = keyof typeof settings;

export function current(setting: Setting): string {
  return document.documentElement.dataset[setting] ?? settings[setting].values[0];
}

export function apply(setting: Setting, value: string) {
  document.documentElement.dataset[setting] = value;
  try {
    localStorage.setItem(settings[setting].key, value);
  } catch {
    // Storage can be blocked. The toggle still works for this visit.
  }
}

/** The setting's value after this one, round to the first after the last. */
export function other(setting: Setting, value: string): string {
  const values: readonly string[] = settings[setting].values;
  return values[(values.indexOf(value) + 1) % values.length]!;
}

/** Switches a setting to its other value and returns it. */
export function toggle(setting: Setting): string {
  const next = other(setting, current(setting));
  apply(setting, next);
  return next;
}
