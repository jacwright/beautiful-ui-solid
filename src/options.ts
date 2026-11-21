/**
 * A list of options to choose from: the keys and pointer of a role="listbox", what Listbox adds
 * that the platform lacks. Combobox reuses wireOptions with its input in place of the listbox.
 *
 * Focus stays on one element, the owner, and aria-activedescendant on it names the option the keys
 * are on, which also has data-active for the CSS. For a Listbox the owner is the listbox itself.
 * For a Combobox it is the input, so typing goes on while the arrows move. Options are any
 * elements with role="option", aria-selected, and aria-disabled="true" or hidden to skip one.
 *
 * wireListbox wires a Listbox's static markup: the listbox in a popover, opened by a button with
 * commandfor, command="toggle-popover" and aria-haspopup="listbox". The browser opens and closes
 * the popover, closes it on Escape and a click outside, and returns focus to the button.
 *
 * From the APG listbox and select-only combobox patterns, and Headless UI's Listbox. The spec is
 * the docs site's Listbox page.
 */

import { itemLabel } from "./menu.ts";
import { createTypeahead, isTypeaheadKey } from "./typeahead.ts";

const optionSelector = '[role="option"]';

const enabled = (option: Element) => option.getAttribute("aria-disabled") !== "true";

/** An option the keys and pointer can reach: not disabled, and not hidden by a Combobox's filter. */
const reachable = (option: HTMLElement) => enabled(option) && !option.hidden;

export type OptionList = {
  /** The options the keys and pointer can reach, in order: every one not disabled or hidden. */
  options(): HTMLElement[];
  /** The option the keys are on. */
  active(): HTMLElement | undefined;
  /** Puts the keys on an option, or on none, and scrolls it into view, to its nearest edge or the middle. */
  setActive(option: HTMLElement | undefined, reveal?: "nearest" | "center"): void;
  /** Handles ↓ ↑ Home End Page Down Page Up and type-ahead. Returns whether the key was one of them. */
  move(event: KeyboardEvent): boolean;
  /** Whether a type-ahead search is under way, so a space is part of it. */
  searching(event: KeyboardEvent): boolean;
  /** Removes the listeners and the active option. */
  unwire(): void;
};

/**
 * Wires a listbox's options. `owner` is the element that keeps focus; `pick` runs when an option
 * is clicked. The keys are the caller's to listen for: it passes them to move(), and picks the
 * active option on Enter.
 */
export function wireOptions(listbox: HTMLElement, owner: HTMLElement, pick: (option: HTMLElement) => void): OptionList {
  const search = createTypeahead<HTMLElement>(itemLabel);
  let current: HTMLElement | undefined;
  /** Where the pointer last moved, so a list scrolling under a still pointer doesn't move the keys. */
  let pointerAt = "";

  const options = () => [...listbox.querySelectorAll<HTMLElement>(optionSelector)].filter(reachable);

  function setActive(option: HTMLElement | undefined, reveal?: "nearest" | "center") {
    if (current && current !== option) current.removeAttribute("data-active");
    current = option;
    if (!option) return owner.removeAttribute("aria-activedescendant");
    option.setAttribute("data-active", "");
    owner.setAttribute("aria-activedescendant", option.id);
    if (reveal) scrollTo(option, reveal);
  }

  /** Scrolls the listbox, not the page, so the option shows. Offsets, so the panel's opening scale doesn't skew them. */
  function scrollTo(option: HTMLElement, reveal: "nearest" | "center") {
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    const pad = parseFloat(getComputedStyle(listbox).paddingBlockStart) || 0;
    if (reveal === "center") listbox.scrollTop = top - (listbox.clientHeight - option.offsetHeight) / 2;
    else if (top - pad < listbox.scrollTop) listbox.scrollTop = top - pad;
    else if (bottom + pad > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = bottom + pad - listbox.clientHeight;
  }

  /** How many options fit in the listbox's height: the step of Page Down and Page Up. */
  function pageSize(list: HTMLElement[]) {
    const height = (current ?? list[0])?.offsetHeight || 1;
    return Math.max(1, Math.floor(listbox.clientHeight / height) - 1);
  }

  function move(event: KeyboardEvent) {
    const list = options();
    if (!list.length) return false;
    const at = current ? list.indexOf(current) : -1;
    const last = list.length - 1;
    let to: number;
    switch (event.key) {
      case "ArrowDown":
        to = at < 0 ? 0 : Math.min(at + 1, last);
        break;
      case "ArrowUp":
        to = at < 0 ? last : Math.max(at - 1, 0);
        break;
      case "Home":
        to = 0;
        break;
      case "End":
        to = last;
        break;
      case "PageDown":
        to = Math.min(Math.max(at, 0) + pageSize(list), last);
        break;
      case "PageUp":
        to = Math.max((at < 0 ? last : at) - pageSize(list), 0);
        break;
      default: {
        // A space starts no search: it picks. Within a search it is part of it, as in "New York".
        if (!isTypeaheadKey(event) || (event.key === " " && !search.searching(event))) return false;
        event.preventDefault();
        const found = search.find(event, list, at);
        if (found) setActive(found, "nearest");
        return true;
      }
    }
    event.preventDefault();
    search.reset();
    setActive(list[to], "nearest");
    return true;
  }

  function onPointerMove(event: PointerEvent) {
    const at = `${event.screenX},${event.screenY}`;
    if (at === pointerAt) return;
    pointerAt = at;
    const option = (event.target as Element).closest<HTMLElement>(optionSelector);
    if (option && enabled(option) && option !== current) setActive(option);
  }

  function onPointerLeave() {
    pointerAt = "";
    setActive(undefined);
  }

  function onClick(event: MouseEvent) {
    const option = (event.target as Element).closest<HTMLElement>(optionSelector);
    if (option && enabled(option)) pick(option);
  }

  listbox.addEventListener("pointermove", onPointerMove);
  listbox.addEventListener("pointerleave", onPointerLeave);
  listbox.addEventListener("click", onClick);

  return {
    options,
    active: () => current,
    setActive,
    move,
    searching: (event) => search.searching(event),
    unwire() {
      listbox.removeEventListener("pointermove", onPointerMove);
      listbox.removeEventListener("pointerleave", onPointerLeave);
      listbox.removeEventListener("click", onClick);
      setActive(undefined);
    },
  };
}

/**
 * Wires a Listbox: its listbox, in a popover, and the button that opens it. `pick` chooses an
 * option. Left out, it is pickInMarkup, which marks the option selected and shows it on the button,
 * for static markup. Picking closes a single-choice list. Returns a function that removes
 * everything it added.
 *
 *   - Enter, Space or ↓ on the button opens the list on the selected option, or the first. ↑ opens
 *     it on the selected option, or the last. A click opens it on the selected option, or none.
 *   - A letter on the button opens the list on the first option it starts.
 *   - In the list, ↓ ↑ move without wrapping, Home End and Page Down Page Up jump, a letter
 *     searches, and Enter or Space picks. A click picks too, and the pointer lights what it's over.
 *   - Escape closes and keeps the value. Tab closes, keeps the value, and moves on.
 */
export function wireListbox(listbox: HTMLElement, pick: (option: HTMLElement) => void = pickInMarkup): () => void {
  const doc = listbox.ownerDocument;
  const popup = listbox.closest<HTMLElement>("[popover]");
  if (!popup) return () => {};
  const button = doc.querySelector<HTMLElement>(`[commandfor="${CSS.escape(popup.id)}"][command="toggle-popover"]`);
  const multiple = () => listbox.getAttribute("aria-multiselectable") === "true";
  const list = wireOptions(listbox, listbox, choose);
  /** Which option the keys start on when the list next opens. */
  let opening: "first" | "last" | "pointer" = "pointer";
  /** The letter that opened the list, to search with once it's open. */
  let typed: KeyboardEvent | undefined;

  const selected = () =>
    [...listbox.querySelectorAll<HTMLElement>(`${optionSelector}[aria-selected="true"]`)].find(enabled);

  function choose(option: HTMLElement) {
    if (!enabled(option)) return;
    pick(option);
    list.setActive(option);
    if (!multiple()) popup!.hidePopover();
  }

  function open(from: typeof opening) {
    opening = from;
    popup!.showPopover({ source: button ?? undefined });
  }

  function onButtonKey(event: KeyboardEvent) {
    if (popup!.matches(":popover-open")) {
      // A key that comes before focus has moved into the list, from a quick typist, goes to the list.
      listbox.focus({ preventScroll: true });
      return onListKey(event);
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open(event.key === "ArrowDown" ? "first" : "last");
    } else if (isTypeaheadKey(event) && event.key !== " ") {
      event.preventDefault();
      typed = event;
      open("first");
    }
  }

  // A click from Enter or Space has no pointer, so its detail is 0. It runs before the button's command.
  function onButtonClick(event: MouseEvent) {
    opening = event.detail === 0 ? "first" : "pointer";
  }

  // Before the list shows, so a key that comes before the toggle event finds the keys on their start.
  function onBeforeToggle(event: Event) {
    const from = opening;
    const letter = typed;
    opening = "pointer";
    typed = undefined;
    if ((event as ToggleEvent).newState !== "open") return;
    const options = list.options();
    // A letter searches from the chosen option, or from before the first, so the first can match.
    if (letter) {
      list.setActive(selected());
      list.move(letter);
    } else list.setActive(selected() ?? (from === "first" ? options[0] : from === "last" ? options.at(-1) : undefined));
  }

  // Once the list shows: focus moves into it, and the lit option scrolls to its middle.
  function onToggle(event: Event) {
    if ((event as ToggleEvent).newState !== "open") return list.setActive(undefined);
    if (!popup!.contains(doc.activeElement)) listbox.focus({ preventScroll: true });
    list.setActive(list.active(), "center");
  }

  function onListKey(event: KeyboardEvent) {
    if (list.move(event)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const active = list.active();
    if (active) choose(active);
  }

  function onFocusOut(event: FocusEvent) {
    const to = event.relatedTarget;
    // No relatedTarget: focus left the page, or a click landed on nothing focusable, which light dismiss handles.
    if (!(to instanceof Node) || popup!.contains(to) || button?.contains(to)) return;
    if (popup!.matches(":popover-open")) popup!.hidePopover();
  }

  // A click on the field's label focuses the button, as a native select's does, and doesn't open the list.
  function onLabelClick(event: MouseEvent) {
    const label = (event.target as Element).closest("label");
    if (!label || !button || label.htmlFor !== button.id) return;
    event.preventDefault();
    button.focus();
  }

  const listeners: [EventTarget | null, string, (event: never) => void][] = [
    [button, "keydown", onButtonKey],
    [button, "click", onButtonClick],
    [button, "focusout", onFocusOut],
    [popup, "beforetoggle", onBeforeToggle],
    [popup, "toggle", onToggle],
    [popup, "focusout", onFocusOut],
    [listbox, "keydown", onListKey],
    [doc, "click", onLabelClick],
  ];
  for (const [target, type, listener] of listeners) target?.addEventListener(type, listener as EventListener);
  return () => {
    for (const [target, type, listener] of listeners) target?.removeEventListener(type, listener as EventListener);
    list.unwire();
  };
}

/** The placeholder each value element showed before anything was picked. */
const placeholders = new WeakMap<Element, string>();

/**
 * Picks an option in static markup: marks it selected, and shows the choice on the button. A
 * single-choice list selects only it. A multiple-choice list (aria-multiselectable) turns it on or
 * off. The button's value is its <beautiful-listbox-value>: the option's icon and label, or for several, their labels
 * with commas, or the placeholder again when none is left.
 */
export function pickInMarkup(option: HTMLElement) {
  const listbox = option.closest<HTMLElement>('[role="listbox"]');
  if (!listbox) return;
  const options = [...listbox.querySelectorAll<HTMLElement>(optionSelector)];
  if (listbox.getAttribute("aria-multiselectable") === "true") {
    option.setAttribute("aria-selected", String(option.getAttribute("aria-selected") !== "true"));
  } else {
    for (const other of options) other.setAttribute("aria-selected", String(other === option));
  }

  const popup = listbox.closest("[popover]");
  const doc = listbox.ownerDocument;
  const value = popup && doc.querySelector(`[commandfor="${CSS.escape(popup.id)}"] > beautiful-listbox-value`);
  if (!value) return;
  if (value.hasAttribute("data-placeholder") && !placeholders.has(value)) placeholders.set(value, value.textContent ?? "");
  const chosen = options.filter((other) => other.getAttribute("aria-selected") === "true");
  value.toggleAttribute("data-placeholder", chosen.length === 0);
  if (chosen.length === 0) value.textContent = placeholders.get(value) ?? "";
  else if (chosen.length > 1 || listbox.getAttribute("aria-multiselectable") === "true") {
    value.textContent = chosen.map(itemLabel).join(", ");
  } else {
    value.replaceChildren(...[...chosen[0]!.childNodes].filter((node) => !(node instanceof Element && node.matches("small"))).map((node) => node.cloneNode(true)));
  }
}
