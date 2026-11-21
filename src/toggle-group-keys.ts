/**
 * The keys of a Toggle group: what it adds that the platform lacks. The markup
 * (styles/elements/toggle-group.css) is a <beautiful-toggle-group> of <button type="button">s,
 * in one of two kinds:
 *
 *   - One choice, a segmented control: role="radiogroup" around <button role="radio"
 *     aria-checked>, from the APG radio group pattern. The arrows move to the next button and
 *     check it, as on radios. A click or Space checks one, and a checked one stays checked.
 *   - Several at once: role="group" around <button aria-pressed>, Toggle buttons, from the APG
 *     toolbar pattern. The arrows only move focus, and a click, Enter or Space flips one.
 *
 * Either way the group is one Tab stop (a roving tabindex): Tab lands on the checked button, or
 * the first enabled one, and leaves the group. → ← ↓ ↑ move, wrapping at the ends and passing over
 * disabled buttons, and Home and End go to the first and last. In a right-to-left page, ← is the
 * next one.
 *
 * Each button's value attribute names it. wireToggleGroup wires static markup, and fires
 * "togglechange" on the group with the values that are on as its detail. The Solid ToggleGroup
 * holds its own state and moves with toggleFor and rove. The spec is the docs site's Toggle group
 * page.
 */

/** The group's buttons, in order. */
export const buttonsOf = (group: HTMLElement) => [...group.querySelectorAll<HTMLButtonElement>(":scope > button")];

/** Whether the group holds one choice: a radiogroup. */
export const isSingle = (group: HTMLElement) => group.getAttribute("role") === "radiogroup";

/** Whether a button is on: checked in a radiogroup, pressed in a group. */
export const isOn = (button: HTMLButtonElement) =>
  button.getAttribute("aria-checked") === "true" || button.getAttribute("aria-pressed") === "true";

/** The button a key moves to, or nothing when the key isn't one of the group's. */
export function toggleFor(event: KeyboardEvent, group: HTMLElement): HTMLButtonElement | undefined {
  if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const button = (event.target as Element).closest("button");
  if (!button || button.parentElement !== group) return;
  const rtl = getComputedStyle(group).direction === "rtl";
  const next = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");
  const order = buttonsOf(group).filter((each) => !each.disabled);
  const at = order.indexOf(button as HTMLButtonElement);
  if (event.key === "Home") return order[0];
  if (event.key === "End") return order.at(-1);
  if (next) return order[(at + 1) % order.length];
  return order[at <= 0 ? order.length - 1 : at - 1];
}

/**
 * Puts the group's one Tab stop on a button: the one given, or else the first enabled button that
 * is on, or else the first enabled one.
 */
export function rove(group: HTMLElement, to?: HTMLButtonElement) {
  const all = buttonsOf(group);
  const enabled = all.filter((each) => !each.disabled);
  const stop = to && !to.disabled ? to : (enabled.find(isOn) ?? enabled[0]);
  for (const each of all) each.tabIndex = each === stop ? 0 : -1;
}

/** Wires one <beautiful-toggle-group> of static markup. Returns a function that removes what it added. */
export function wireToggleGroup(group: HTMLElement): () => void {
  rove(group);

  function report() {
    const on = buttonsOf(group).filter(isOn).map((each) => each.value);
    group.dispatchEvent(new CustomEvent("togglechange", { detail: on, bubbles: true }));
  }

  /** Checks one button in a radiogroup and unchecks the rest, or flips one in a group. */
  function choose(button: HTMLButtonElement) {
    if (isSingle(group)) {
      if (isOn(button)) return;
      for (const each of buttonsOf(group)) each.setAttribute("aria-checked", String(each === button));
    } else {
      button.setAttribute("aria-pressed", String(!isOn(button)));
    }
    report();
  }

  function onKey(event: KeyboardEvent) {
    // Page script can keep a key from the group with preventDefault.
    if (event.defaultPrevented) return;
    const to = toggleFor(event, group);
    if (!to) return;
    event.preventDefault();
    rove(group, to);
    to.focus();
    if (isSingle(group)) choose(to);
  }

  function onClick(event: MouseEvent) {
    const button = (event.target as Element).closest("button");
    if (!button || button.parentElement !== group || button.disabled || event.defaultPrevented) return;
    rove(group, button);
    choose(button);
  }

  group.addEventListener("keydown", onKey);
  group.addEventListener("click", onClick);
  return () => {
    group.removeEventListener("keydown", onKey);
    group.removeEventListener("click", onClick);
  };
}
